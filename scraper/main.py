#!/usr/bin/env python3
"""
JobScout Lite — scraper entry point.

Run manually:
    cd scraper && python main.py

Run on a schedule (see PROGRESS.md / README.md for the exact cron line):
    0 */6 * * * /home/ubuntu/jobscout/venv/bin/python /home/ubuntu/jobscout/scraper/main.py
"""
import logging
import os
import sys
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import json

from config import RETENTION_DAYS, REQUEST_DELAY_SECONDS, LOG_PATH
from db import init_db, get_connection, upsert_job, purge_old_jobs, fetch_recent_jobs
from trust_scoring import compute_trust_score, compute_trust_tier, is_suspicious
from job_classify import classify_job_type
from cache_writer import write_cache
from sources import remoteok, weworkremotely, greenhouse, lever, wellfound, remotive, jobicy, arbeitnow, himalayas

os.makedirs(os.path.dirname(LOG_PATH), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.FileHandler(LOG_PATH), logging.StreamHandler()],
)
logger = logging.getLogger("scraper.main")

SOURCES = [
    ("RemoteOK", remoteok.fetch_jobs),
    ("WeWorkRemotely", weworkremotely.fetch_jobs),
    ("Greenhouse", greenhouse.fetch_jobs),
    ("Lever", lever.fetch_jobs),
    ("Wellfound", wellfound.fetch_jobs),
    ("Remotive", remotive.fetch_jobs),
    ("Jobicy", jobicy.fetch_jobs),
    ("Arbeitnow", arbeitnow.fetch_jobs),
    ("Himalayas", himalayas.fetch_jobs),
]


def normalize_posted_at(value):
    """Sources hand back dates in different formats (RemoteOK: ISO8601,
    WWR: RFC822 from RSS, Lever: already converted, Greenhouse: ISO8601).
    Normalizing everything to one ISO8601 UTC string here is what lets
    trust scoring and the 4-day retention purge both just work, instead
    of each needing to know every source's date format."""
    if not value:
        return datetime.now(timezone.utc).isoformat()

    try:
        return (
            datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            .astimezone(timezone.utc)
            .isoformat()
        )
    except ValueError:
        pass

    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError):
        pass

    logger.warning(f"could not parse posted_at value '{value}' — using current time instead")
    return datetime.now(timezone.utc).isoformat()


def run():
    started = time.time()
    logger.info("=== JobScout Lite scraper run starting ===")
    init_db()

    all_jobs = []
    for name, fetch_fn in SOURCES:
        try:
            jobs = fetch_fn()
            all_jobs.extend(jobs)
        except Exception as e:
            # One source failing (site down, layout/API changed, etc.)
            # should never take down the whole scrape run.
            logger.error(f"{name}: unhandled error, skipping source entirely: {e}")
        time.sleep(REQUEST_DELAY_SECONDS)

    logger.info(f"collected {len(all_jobs)} raw listings across all sources")

    seen_urls = set()
    deduped = []
    for job in all_jobs:
        url = (job.get("apply_url") or "").strip()
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        deduped.append(job)

    logger.info(f"{len(deduped)} unique listings after deduping by apply_url")

    with get_connection() as conn:
        for job in deduped:
            job["posted_at"] = normalize_posted_at(job.get("posted_at"))
            scoring = compute_trust_score(job)
            job["trust_score"] = scoring["score"]
            job["trust_reasons"] = scoring["reasons"]
            scam_flagged = is_suspicious(job)
            job["is_suspicious"] = 1 if scam_flagged else 0
            # Step 18: tier needs BOTH compute_trust_score()'s own
            # negative-signal tracking (Gmail/Yahoo, no site, fee scam)
            # AND is_suspicious()'s keyword match — either one alone is
            # real evidence, so tier assignment ORs them together.
            job["trust_tier"] = compute_trust_tier(
                job["trust_score"], scoring["has_negative_signal"] or scam_flagged
            )
            job["job_type"] = classify_job_type(job)

            upsert_job(
                conn,
                {
                    "title": (job.get("title") or "")[:300],
                    "company": (job.get("company") or "")[:200],
                    "location": (job.get("location") or "Remote")[:200],
                    "source": job.get("source", "Unknown"),
                    "apply_url": job["apply_url"],
                    "summary": (job.get("summary") or "")[:500],
                    "posted_at": job["posted_at"],
                    "trust_score": job["trust_score"],
                    "is_suspicious": job["is_suspicious"],
                    "trust_reasons": json.dumps(job["trust_reasons"]),
                    "job_type": job["job_type"],
                    "trust_tier": job["trust_tier"],
                },
            )

        purged = purge_old_jobs(conn, RETENTION_DAYS)
        logger.info(f"purged {purged} jobs older than {RETENTION_DAYS} days")

        recent = fetch_recent_jobs(conn)

    # Shape exactly to what the frontend/API route expects — drop the
    # internal-only created_at column, decode trust_reasons back to a
    # real array (stored as a JSON string in SQLite).
    cache_jobs = [
        {
            "id": r["id"],
            "title": r["title"],
            "company": r["company"],
            "location": r["location"],
            "source": r["source"],
            "apply_url": r["apply_url"],
            "summary": r["summary"],
            "posted_at": r["posted_at"],
            "trust_score": r["trust_score"],
            "is_suspicious": r["is_suspicious"],
            "trust_reasons": json.loads(r["trust_reasons"] or "[]"),
            "job_type": r["job_type"] or "Job",
            "trust_tier": r["trust_tier"] or "Unverified",
        }
        for r in recent
    ]
    write_cache(cache_jobs)

    # Breakdown by job_type — added specifically so "internships tab is
    # empty" can be diagnosed from this log line alone, without needing
    # to inspect the database or cache file by hand.
    job_type_counts = {}
    for j in cache_jobs:
        t = j.get("job_type", "Job")
        job_type_counts[t] = job_type_counts.get(t, 0) + 1
    breakdown = ", ".join(f"{count} {jtype}" for jtype, count in sorted(job_type_counts.items()))
    logger.info(f"job type breakdown: {breakdown or 'no jobs in cache'}")

    elapsed = time.time() - started
    logger.info(f"=== scraper run complete in {elapsed:.1f}s — {len(cache_jobs)} jobs in cache ===")


if __name__ == "__main__":
    try:
        run()
    except Exception:
        # A fatal, unexpected error anywhere in run() (DB corruption, disk
        # full, etc.) should still leave a clear, timestamped trace in the
        # log file rather than only a bare traceback on stderr — important
        # once this runs unattended on a cron rather than in front of you.
        logger.exception("scraper run failed with an unhandled exception")
        sys.exit(1)
