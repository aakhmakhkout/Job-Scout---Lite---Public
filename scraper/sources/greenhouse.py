"""
Greenhouse's public job board API is JSON, documented, and meant for
exactly this — no HTML scraping needed. There's no "search all
companies" endpoint though, so this hits one endpoint per company listed
in GREENHOUSE_BOARD_TOKENS (config.py). Add a company by finding its
public board at https://boards.greenhouse.io/<token> and copying <token>.
"""
import logging

import requests

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS, GREENHOUSE_BOARD_TOKENS
from html_clean import clean_html, normalize_location

logger = logging.getLogger("scraper.greenhouse")


def _clean_html(html):
    return clean_html(html, MAX_SUMMARY_CHARS)


def fetch_jobs():
    jobs = []
    boards_succeeded = 0
    for token in GREENHOUSE_BOARD_TOKENS:
        url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true"
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            logger.error(f"failed for board '{token}': {e}")
            continue

        boards_succeeded += 1
        for posting in data.get("jobs", []):
            try:
                jobs.append(
                    {
                        "title": (posting.get("title") or "").strip(),
                        "company": token,
                        "location": normalize_location((posting.get("location") or {}).get("name")),
                        "source": "Greenhouse",
                        "apply_url": posting.get("absolute_url", ""),
                        "summary": _clean_html(posting.get("content")),
                        "posted_at": posting.get("updated_at") or posting.get("first_published"),
                        # A live public Greenhouse board is itself a
                        # reasonably strong legitimacy signal.
                        "company_website": True,
                    }
                )
            except Exception as e:
                logger.warning(f"skipped one malformed posting for '{token}': {e}")

    logger.info(
        f"fetched {len(jobs)} jobs across {boards_succeeded}/{len(GREENHOUSE_BOARD_TOKENS)} boards"
    )
    return jobs
