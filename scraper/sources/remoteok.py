"""
RemoteOK — https://remoteok.com/api is the public JSON feed their own
frontend uses. Reading that directly is far more stable than scraping
their rendered HTML, which changes layout periodically.
"""
import logging

import requests

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS
from html_clean import clean_html, normalize_location
from html_clean import clean_html

logger = logging.getLogger("scraper.remoteok")

API_URL = "https://remoteok.com/api"


def _clean_summary(html):
    return clean_html(html, MAX_SUMMARY_CHARS)


def fetch_jobs():
    jobs = []
    try:
        resp = requests.get(API_URL, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"fetch failed: {e}")
        return jobs

    # The API's first element is a legend/metadata object, not a job —
    # anything without an "id" isn't a real listing.
    for item in data:
        if not isinstance(item, dict) or "id" not in item:
            continue
        try:
            apply_url = item.get("url") or f"https://remoteok.com/remote-jobs/{item['id']}"
            jobs.append(
                {
                    "title": (item.get("position") or "").strip(),
                    "company": (item.get("company") or "").strip(),
                    "location": normalize_location(item.get("location")),
                    "source": "RemoteOK",
                    "apply_url": apply_url,
                    "summary": _clean_summary(item.get("description")),
                    "posted_at": item.get("date"),
                    # RemoteOK doesn't expose a separate company-website
                    # field — a logo being present is a weak signal at
                    # best, so we leave this as "unknown" rather than
                    # guessing either direction.
                    "company_website": None,
                }
            )
        except Exception as e:
            logger.warning(f"skipped one malformed listing: {e}")

    logger.info(f"fetched {len(jobs)} jobs")
    return jobs
