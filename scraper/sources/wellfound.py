"""
Wellfound (formerly AngelList Talent) renders its listings with
client-side JavaScript and doesn't expose a documented public JSON API
the way Greenhouse/Lever do. A plain requests+BeautifulSoup GET on their
search pages often returns a mostly-empty HTML shell rather than the
actual listings, and their markup/anti-bot measures change without
notice — this is the one source in the spec that a lightweight
requests-only scraper genuinely struggles with.

This function is written defensively on purpose: if the selectors below
don't match (likely, since they're a best-effort guess this scraper
couldn't verify against the live site from this environment), it logs a
warning and returns an empty list rather than crashing the whole run.
Treat Wellfound as "best effort, may return zero results" — RemoteOK,
WeWorkRemotely, Greenhouse, and Lever are the reliable sources.

If you want real Wellfound coverage, the practical fix is a headless
browser (e.g. Playwright) instead of requests+BeautifulSoup — a bigger
dependency than this free-tier setup currently pulls in, and worth
treating as its own future step rather than bolting on here.
"""
import logging

import requests
from bs4 import BeautifulSoup

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS

logger = logging.getLogger("scraper.wellfound")

SEARCH_URL = "https://wellfound.com/role/r/software-engineer"


def fetch_jobs():
    jobs = []
    try:
        resp = requests.get(SEARCH_URL, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"fetch failed: {e}")
        return jobs

    soup = BeautifulSoup(resp.text, "html.parser")
    cards = soup.select("[data-test='StartupResult'], .job-listing")

    if not cards:
        logger.warning(
            "no listings found in returned HTML — page likely requires JS "
            "rendering, or selectors are stale. Returning 0 jobs from this source."
        )
        return jobs

    for card in cards:
        try:
            title_el = card.select_one("h2, .job-title")
            company_el = card.select_one(".startup-name, .company-name")
            link_el = card.select_one("a[href]")
            if not (title_el and link_el):
                continue

            jobs.append(
                {
                    "title": title_el.get_text(strip=True),
                    "company": company_el.get_text(strip=True) if company_el else "Unknown",
                    "location": "Remote",
                    "source": "Wellfound",
                    "apply_url": requests.compat.urljoin("https://wellfound.com", link_el["href"]),
                    "summary": card.get_text(" ", strip=True)[:MAX_SUMMARY_CHARS],
                    "posted_at": None,
                    "company_website": None,
                }
            )
        except Exception as e:
            logger.warning(f"skipped one malformed card: {e}")

    logger.info(f"fetched {len(jobs)} jobs")
    return jobs
