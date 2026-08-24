"""
Remotive — https://remotive.com/api/remote-jobs is their official public
API (the old remotive.io endpoint was retired, moved to remotive.com).
Free, no auth required, explicitly meant for exactly this use case per
their own developer docs — the only requirement is attributing jobs
back to Remotive, which the apply_url naturally does since it points to
their own listing page. Covers far more than software roles: design,
marketing, sales, customer support, and more.
"""
import logging

import requests

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS
from html_clean import clean_html, normalize_location

logger = logging.getLogger("scraper.remotive")

API_URL = "https://remotive.com/api/remote-jobs"


def fetch_jobs():
    jobs = []
    try:
        resp = requests.get(API_URL, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"fetch failed: {e}")
        return jobs

    for item in data.get("jobs", []):
        try:
            jobs.append(
                {
                    "title": (item.get("title") or "").strip(),
                    "company": (item.get("company_name") or "").strip(),
                    "location": normalize_location(item.get("candidate_required_location")),
                    "source": "Remotive",
                    # Remotive's own hosted listing page, not a direct
                    # external link — see the JOB_BOARD_DOMAINS note in
                    # trust_scoring.py for why this matters for scoring.
                    "apply_url": item.get("url", ""),
                    "summary": clean_html(item.get("description"), MAX_SUMMARY_CHARS),
                    "posted_at": item.get("publication_date"),
                    "company_website": None,
                }
            )
        except Exception as e:
            logger.warning(f"skipped one malformed listing: {e}")

    logger.info(f"fetched {len(jobs)} jobs")
    return jobs
