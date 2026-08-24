"""
We Work Remotely — they publish RSS feeds per job category on their
public site. Parsing those is far more stable than scraping the HTML
listing pages, which change markup from time to time.
"""
import logging

import requests
from bs4 import BeautifulSoup

from config import USER_AGENT, REQUEST_TIMEOUT, MAX_SUMMARY_CHARS
from html_clean import clean_html

logger = logging.getLogger("scraper.weworkremotely")

FEEDS = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-design-jobs.rss",
    "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
    "https://weworkremotely.com/categories/remote-marketing-jobs.rss",
]


def _clean_html(html):
    return clean_html(html, MAX_SUMMARY_CHARS)


def fetch_jobs():
    jobs = []
    for feed_url in FEEDS:
        try:
            resp = requests.get(feed_url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
        except Exception as e:
            logger.error(f"failed to fetch {feed_url}: {e}")
            continue

        try:
            soup = BeautifulSoup(resp.content, "xml")
        except Exception:
            # Falls back if lxml's xml parser isn't available for some reason.
            soup = BeautifulSoup(resp.content, "html.parser")

        items = soup.find_all("item")
        for item in items:
            try:
                title_tag = item.find("title")
                link_tag = item.find("link")
                date_tag = item.find("pubdate") or item.find("pubDate")
                desc_tag = item.find("description")

                title_full = title_tag.get_text(strip=True) if title_tag else ""
                # WWR RSS titles are formatted "Company: Job Title".
                if ":" in title_full:
                    company, _, title = title_full.partition(":")
                else:
                    company, title = "", title_full

                jobs.append(
                    {
                        "title": title.strip(),
                        "company": company.strip(),
                        "location": "Remote",
                        "source": "WeWorkRemotely",
                        "apply_url": link_tag.get_text(strip=True) if link_tag else "",
                        "summary": _clean_html(desc_tag.get_text() if desc_tag else ""),
                        # RFC 822 format — normalized to ISO8601 in main.py
                        "posted_at": date_tag.get_text(strip=True) if date_tag else None,
                        "company_website": None,
                    }
                )
            except Exception as e:
                logger.warning(f"skipped one malformed item: {e}")

    logger.info(f"fetched {len(jobs)} jobs across {len(FEEDS)} feeds")
    return jobs
