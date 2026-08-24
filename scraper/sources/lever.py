"""
Lever's public postings API, same idea as Greenhouse — JSON, documented,
one endpoint per company. Add a company by finding its board at
https://jobs.lever.co/<slug> and copying <slug> into LEVER_COMPANY_SLUGS
(config.py).
"""
import logging
from datetime import datetime, timezone

import requests

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS, LEVER_COMPANY_SLUGS
from html_clean import clean_html, normalize_location

logger = logging.getLogger("scraper.lever")


def _clean_html(html):
    return clean_html(html, MAX_SUMMARY_CHARS)


def fetch_jobs():
    jobs = []
    companies_succeeded = 0
    for slug in LEVER_COMPANY_SLUGS:
        url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            postings = resp.json()
        except Exception as e:
            logger.error(f"failed for company '{slug}': {e}")
            continue

        companies_succeeded += 1
        for posting in postings:
            try:
                categories = posting.get("categories") or {}
                posted_at = None
                created_ms = posting.get("createdAt")
                if created_ms:
                    posted_at = datetime.fromtimestamp(created_ms / 1000, tz=timezone.utc).isoformat()

                jobs.append(
                    {
                        "title": (posting.get("text") or "").strip(),
                        "company": slug,
                        "location": normalize_location(categories.get("location")),
                        "source": "Lever",
                        "apply_url": posting.get("hostedUrl", ""),
                        "summary": _clean_html(posting.get("descriptionPlain") or posting.get("description")),
                        "posted_at": posted_at,
                        "company_website": True,
                    }
                )
            except Exception as e:
                logger.warning(f"skipped one malformed posting for '{slug}': {e}")

    logger.info(
        f"fetched {len(jobs)} jobs across {companies_succeeded}/{len(LEVER_COMPANY_SLUGS)} companies"
    )
    return jobs
