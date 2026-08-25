"""
Trust scoring + scam detection.

--- Point values: rescaled from the original spec, here's why ---
The original spec's positive-signal values (+30/+20/+15/+10/+5) sum to a
maximum of 60 points in the best possible case — meaning "Good" (60-79)
was only reachable at the exact ceiling, and "Trusted" (80-100) was
mathematically impossible no matter how clean a listing was. That's a
property of the numbers themselves, not a scoring bug.

Rescaled below so all five tiers are genuinely reachable, keeping the
*relative* weighting identical (official domain still worth more than an
ATS domain, etc.) and leaving every penalty untouched — the penalties
already worked correctly as strong deterrents and didn't need adjusting:

                            original -> rescaled
  Official company domain    +30    ->  +45
  Greenhouse/Lever domain    +20    ->  +30
  Company website exists     +15    ->  +25
  Posted within 2 days       +10    ->  +10   (unchanged)
  Salary listed               +5    ->   +5   (unchanged)
  Gmail/Yahoo recruiter      -25    ->  -25   (unchanged)
  No company website         -40    ->  -40   (unchanged)
  Registration/training fee -100    -> -100   (unchanged)

New ceiling: 45+25+10+5 = 85 (official domain path, reaches Trusted).
ATS ceiling: 30+25+10+5 = 70 (Greenhouse/Lever path, reaches Good) —
intentionally below the official-domain ceiling, same as the original
design's relative ordering.

Score still starts at 0, not a neutral baseline — an unverified listing
with no positive signals stays low on purpose.

--- Tiers (Step 18 rewrite) ---
Originally, any score under 40 was labeled "Suspicious" — but with real
scraped data, that badly mislabeled legitimate jobs. Most of this
scraper's volume comes from sources (RemoteOK, WeWorkRemotely, Remotive,
Jobicy) whose apply_url points at their own hosted page, not the
company's — so those jobs can *never* earn the two biggest positive
signals (+45/+30 for a company/ATS domain) no matter how real the
listing is. A real job from one of those sources with no salary listed
and posted more than 2 days ago scores 0 — not because anything is
wrong with it, just because nothing was verifiable either way. Labeling
that "Suspicious" (a word implying active red flags) was misleading.

Fixed by separating "no data" from "bad data": a job only lands in
Suspicious if an actual negative signal fired — a Gmail/Yahoo recruiter
email, a confirmed-missing company website, a registration/training fee
mention, or a scam-keyword match (see is_suspicious() below). A low
score with none of those just means "not enough to verify," which is
Unverified, not Suspicious — a meaningfully different, much less
alarming claim.

  score >= 70                          -> Trusted
  50 <= score < 70                     -> Unverified
  score < 50, negative signal found    -> Suspicious
  score < 50, no negative signal       -> Unverified

compute_trust_score() now also returns "has_negative_signal": bool, so
main.py can combine it with is_suspicious()'s keyword check when calling
compute_trust_tier() below.

--- Transparency ---
compute_trust_score() returns {"score": int, "reasons": [str, ...]} so
every point adjustment is auditable per job, instead of a single number
you have to trust blindly.
"""
import re
from datetime import datetime, timezone

from config import SCAM_KEYWORDS

JOB_BOARD_DOMAINS = (
    "remoteok.com",
    "weworkremotely.com",
    "wellfound.com",
    "angel.co",
    "indeed.com",
    "linkedin.com",
    "ziprecruiter.com",
    "glassdoor.com",
    "remotive.com",
    "jobicy.com",
    "arbeitnow.com",  # Step 19 — apply_url points to Arbeitnow's own page, not the company's
    "himalayas.app",  # Step 19 — same; applicationLink points to Himalayas' own page
)

ATS_DOMAINS = ("greenhouse.io", "lever.co")

SALARY_PATTERN = re.compile(
    r"\$\s?\d{2,3}(,\d{3})?(k)?\s*(-|–|to)\s*\$?\s?\d{2,3}(,\d{3})?(k)?|\bsalary\b",
    re.IGNORECASE,
)
FREE_EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@(gmail|yahoo)\.com", re.IGNORECASE)

# Rescaled weights — see module docstring.
POINTS_OFFICIAL_DOMAIN = 45
POINTS_ATS_DOMAIN = 30
POINTS_COMPANY_WEBSITE = 25
POINTS_RECENT = 10
POINTS_SALARY = 5
POINTS_FREE_EMAIL = -25
POINTS_NO_WEBSITE = -40
POINTS_FEE_SCAM = -100


def _domain(url):
    if not url:
        return ""
    match = re.search(r"https?://([^/]+)", url)
    return (match.group(1).lower() if match else "").replace("www.", "")


def contains_scam_keywords(text):
    if not text:
        return False
    lowered = text.lower()
    return any(keyword in lowered for keyword in SCAM_KEYWORDS)


def is_suspicious(job):
    text = f"{job.get('title', '')} {job.get('summary', '')}"
    return contains_scam_keywords(text)


def compute_trust_score(job):
    """
    job needs: title, summary, apply_url, posted_at (ISO8601 string).
    Optional: company_website — True (known to exist), False (known to
    NOT exist), or None/absent (unknown — neither +/- applies).

    Returns {"score": int (0-100), "reasons": [str, ...],
    "has_negative_signal": bool}. has_negative_signal is True only when
    an actual negative signal fired (not just "no positive signals") —
    see compute_trust_tier() below for why that distinction matters.
    """
    score = 0
    reasons = []
    has_negative_signal = False
    domain = _domain(job.get("apply_url"))

    if any(ats in domain for ats in ATS_DOMAINS):
        score += POINTS_ATS_DOMAIN
        reasons.append(f"+{POINTS_ATS_DOMAIN}: hosted on a Greenhouse/Lever domain")
    elif domain and domain not in JOB_BOARD_DOMAINS:
        score += POINTS_OFFICIAL_DOMAIN
        reasons.append(f"+{POINTS_OFFICIAL_DOMAIN}: apply link is on the company's own domain")

    company_website = job.get("company_website")
    if company_website is True:
        score += POINTS_COMPANY_WEBSITE
        reasons.append(f"+{POINTS_COMPANY_WEBSITE}: company has a known website")
    elif company_website is False:
        score += POINTS_NO_WEBSITE
        reasons.append(f"{POINTS_NO_WEBSITE}: no company website found")
        has_negative_signal = True

    posted_at = job.get("posted_at")
    if posted_at:
        try:
            posted_dt = datetime.fromisoformat(str(posted_at).replace("Z", "+00:00"))
            if posted_dt.tzinfo is None:
                posted_dt = posted_dt.replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - posted_dt).total_seconds() / 86400
            if age_days <= 2:
                score += POINTS_RECENT
                reasons.append(f"+{POINTS_RECENT}: posted within the last 2 days")
        except (ValueError, TypeError):
            pass

    text = f"{job.get('title', '')} {job.get('summary', '')}"
    if SALARY_PATTERN.search(text):
        score += POINTS_SALARY
        reasons.append(f"+{POINTS_SALARY}: salary/compensation mentioned")

    if FREE_EMAIL_PATTERN.search(text):
        score += POINTS_FREE_EMAIL
        reasons.append(f"{POINTS_FREE_EMAIL}: contact email is Gmail/Yahoo")
        has_negative_signal = True

    lowered = text.lower()
    if "registration fee" in lowered or "training fee" in lowered:
        score += POINTS_FEE_SCAM
        reasons.append(f"{POINTS_FEE_SCAM}: mentions a registration/training fee")
        has_negative_signal = True

    if not reasons:
        reasons.append("0: no verifiable positive or negative signals found")

    return {
        "score": max(0, min(100, score)),
        "reasons": reasons,
        "has_negative_signal": has_negative_signal,
    }


def compute_trust_tier(score, has_negative_signal):
    """
    See the module docstring's "Tiers" section for the reasoning. This
    is deliberately a separate function from compute_trust_score() —
    tier assignment needs is_suspicious()'s keyword-match result too
    (main.py combines both), which compute_trust_score() alone doesn't
    have access to.
    """
    if score >= 70:
        return "Trusted"
    if score >= 50:
        return "Unverified"
    return "Suspicious" if has_negative_signal else "Unverified"
