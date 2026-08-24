"""
Classifies each scraped listing as "Job" or "Internship".

Keyword-based, checking the title primarily (most reliable — internship
postings almost always say so in the title) with a fallback check of the
first part of the summary. Uses word-boundary regex so "intern" doesn't
false-positive match inside "international" or "internet".
"""
import re

from config import INTERNSHIP_KEYWORDS

_PATTERN = re.compile(r"\b(" + "|".join(INTERNSHIP_KEYWORDS) + r")\b", re.IGNORECASE)


def classify_job_type(job):
    title = job.get("title") or ""
    if _PATTERN.search(title):
        return "Internship"

    # Fallback: some postings only mention it in the body, not the title.
    summary_start = (job.get("summary") or "")[:200]
    if _PATTERN.search(summary_start):
        return "Internship"

    return "Job"
