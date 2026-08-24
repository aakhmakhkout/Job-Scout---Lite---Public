"""
Jobicy — https://jobicy.com/api/v2/remote-jobs is their official public
API. Free, no auth required, explicitly documented for third-party use
(only ask is attributing back to Jobicy, which apply_url does
naturally). Covers diverse industries beyond tech — marketing, sales,
supporting/ops roles, etc.

Rate limit note: Jobicy's docs mention they may throttle aggressive
polling (observed informally as roughly once/hour elsewhere). A single
request per 6-hour scraper run is nowhere near that, so no special
handling needed here — just noting it so nobody "helpfully" adds a
tighter polling loop later.
"""
import logging

import requests

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS
from html_clean import clean_html, normalize_location

logger = logging.getLogger("scraper.jobicy")

API_URL = "https://jobicy.com/api/v2/remote-jobs"


def fetch_jobs():
    jobs = []
    try:
        resp = requests.get(
            API_URL, params={"count": 50}, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"fetch failed: {e}")
        return jobs

    for item in data.get("jobs", []):
        try:
            jobs.append(
                {
                    "title": (item.get("jobTitle") or "").strip(),
                    "company": (item.get("companyName") or "").strip(),
                    "location": normalize_location(item.get("jobGeo")),
                    "source": "Jobicy",
                    "apply_url": item.get("url", ""),
                    "summary": clean_html(
                        item.get("jobDescription") or item.get("jobExcerpt"), MAX_SUMMARY_CHARS
                    ),
                    "posted_at": item.get("pubDate"),
                    "company_website": None,
                }
            )
        except Exception as e:
            logger.warning(f"skipped one malformed listing: {e}")

    logger.info(f"fetched {len(jobs)} jobs")
    return jobs
