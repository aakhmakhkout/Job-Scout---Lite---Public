"""
JobScout Lite scraper — shared configuration.

Edit GREENHOUSE_BOARD_TOKENS / LEVER_COMPANY_SLUGS to add or remove the
companies you want tracked on those two ATS platforms (see the note on
each list below for how to find a company's token/slug).
"""
import os

SCRAPER_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRAPER_DIR)

DB_PATH = os.path.join(SCRAPER_DIR, "jobs.db")
CACHE_PATH = os.path.join(PROJECT_ROOT, "cache", "jobs.json")
LOG_PATH = os.path.join(SCRAPER_DIR, "logs", "scraper.log")

RETENTION_DAYS = 4
REQUEST_TIMEOUT = 25  # bumped from 15s — one Greenhouse board timed out at 15s on a real run
REQUEST_DELAY_SECONDS = 1.5  # be polite between requests to each source
MAX_SUMMARY_CHARS = 500

USER_AGENT = "JobScoutLiteBot/1.0 (personal project; low-volume, free-tier)"

# Greenhouse and Lever don't have a generic "search all companies" page —
# each company has its own public board. Add the company's board token
# (the slug in https://boards.greenhouse.io/<token>) here to track it.
# Each of these was verified live via web search before adding (learned
# the hard way — see updates.md — that guessing slugs leads to dead
# entries that silently return nothing).
GREENHOUSE_BOARD_TOKENS = [
    "stripe",
    "airbnb",
    "coinbase",
    "razorpaysoftwareprivatelimited",  # Razorpay — Indian fintech, tech + non-tech roles
    "postman",  # Postman — founded in Bangalore, India-based roles including non-tech
]

# Lever's board slug is the part after lever.co/ or api.lever.co/v0/postings/
# in https://jobs.lever.co/<slug>
#
# Empty for now, deliberately. Two different verified-at-the-time slugs
# (originally "netflix"/"figma", then "attentive" after re-verifying)
# both went dead within days — a single company's ATS choice is too
# fragile to rely on here. Add one back if you verify a currently-live
# board at jobs.lever.co/<slug> yourself.
LEVER_COMPANY_SLUGS = []

# Exact phrases the spec calls out — flags a listing as suspicious.
SCAM_KEYWORDS = [
    "registration fee",
    "training fee",
    "security deposit",
    "earn money fast",
    "typing job",
    "captcha job",
    "investment required",
    "data entry work from home",
]

# Keyword-based classification only — this does NOT mean the scraper
# pulls from internship-specific platforms (Internshala, LinkedIn's
# internship filter, university boards, etc). Those are separate, harder
# sources with the same ToS/JS-rendering issues already flagged for
# LinkedIn/Indeed/big-company career pages. This just tags whichever
# listings *already* came back from the existing sources (RemoteOK, WWR,
# Greenhouse, Lever) as "Internship" if their title says so, so the two
# categories can be shown separately instead of mixed together.
INTERNSHIP_KEYWORDS = ["intern", "internship", "internships", "co-op", "coop", "trainee", "apprentice", "apprenticeship"]
