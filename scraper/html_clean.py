"""
Shared HTML-stripping helper for all scraper sources.

Bug this fixes: Greenhouse's `content` field (and possibly other ATS
APIs) comes back HTML-escaped an *extra* time — e.g. the string literally
contains "&lt;h2&gt;Who we are&lt;/h2&gt;" rather than "<h2>Who we
are</h2>". A single BeautifulSoup pass only un-escapes those entities
(turning "&lt;h2&gt;" into the literal text "<h2>"), which then shows up
as raw tag text in the UI instead of being stripped, since by the time
the parser sees the *real* tags they've already been "consumed" as an
entity, not parsed as markup.

Running a second pass fixes this: pass 1 reveals the real tags (if the
source double-encoded), pass 2 strips them. For normally-encoded sources
(RemoteOK, WWR, Lever), pass 1 already produces clean plain text, and
running that same clean text through pass 2 again is a no-op — so this
is safe to apply universally rather than needing to know which sources
are affected.
"""
from bs4 import BeautifulSoup


def clean_html(raw, max_chars=500):
    text = raw or ""
    for _ in range(2):
        text = BeautifulSoup(text, "html.parser").get_text(" ", strip=True)
    return text[:max_chars]


def normalize_location(location):
    """Some sources (seen so far: Greenhouse) literally return the string
    "N/A" as a location name rather than leaving it blank. Treat that the
    same as "we don't know" -> default to "Remote", consistent with how
    every other missing-location case is handled."""
    if not location or str(location).strip().upper() in ("N/A", "NA", ""):
        return "Remote"
    return location
