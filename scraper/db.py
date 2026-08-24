"""
SQLite access layer for the job cache. Kept deliberately simple — this is
the entire "database" for job listings; no ORM, no migrations system.
"""
import sqlite3
from contextlib import contextmanager

from config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  company TEXT,
  location TEXT,
  source TEXT,
  apply_url TEXT UNIQUE,
  summary TEXT,
  posted_at TEXT,
  trust_score INTEGER,
  is_suspicious INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""


def _migrate(conn):
    """Lightweight, idempotent migrations for anyone with an existing
    jobs.db from before a given column existed. CREATE TABLE IF NOT
    EXISTS above only applies on a fresh database — it won't add columns
    to a table that already exists, so new columns need to be added here
    explicitly."""
    existing_columns = {row[1] for row in conn.execute("PRAGMA table_info(jobs)").fetchall()}
    if "trust_reasons" not in existing_columns:
        conn.execute("ALTER TABLE jobs ADD COLUMN trust_reasons TEXT DEFAULT '[]'")
    if "job_type" not in existing_columns:
        conn.execute("ALTER TABLE jobs ADD COLUMN job_type TEXT DEFAULT 'Job'")
    if "trust_tier" not in existing_columns:
        # Step 18 — see trust_scoring.py's module docstring for why this
        # exists (Suspicious now means "a real red flag fired," not just
        # "low score"). Existing rows default to 'Unverified' until the
        # next scraper run recomputes them for real.
        conn.execute("ALTER TABLE jobs ADD COLUMN trust_tier TEXT DEFAULT 'Unverified'")


@contextmanager
def get_connection(db_path=None):
    conn = sqlite3.connect(db_path or DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db(db_path=None):
    with get_connection(db_path) as conn:
        conn.execute(SCHEMA)
        _migrate(conn)


def upsert_job(conn, job):
    """Insert a job, or update it in place if apply_url already exists.
    apply_url is the dedupe key across the whole scraper run and across
    runs — a job scraped again on the next 6-hour cycle updates its
    existing row instead of creating a duplicate."""
    conn.execute(
        """
        INSERT INTO jobs
          (title, company, location, source, apply_url, summary, posted_at, trust_score, is_suspicious, trust_reasons, job_type, trust_tier)
        VALUES
          (:title, :company, :location, :source, :apply_url, :summary, :posted_at, :trust_score, :is_suspicious, :trust_reasons, :job_type, :trust_tier)
        ON CONFLICT(apply_url) DO UPDATE SET
          title=excluded.title,
          company=excluded.company,
          location=excluded.location,
          source=excluded.source,
          summary=excluded.summary,
          posted_at=excluded.posted_at,
          trust_score=excluded.trust_score,
          is_suspicious=excluded.is_suspicious,
          trust_reasons=excluded.trust_reasons,
          job_type=excluded.job_type,
          trust_tier=excluded.trust_tier
        """,
        job,
    )


def purge_old_jobs(conn, retention_days):
    """Deletes anything posted before the retention window — this is what
    keeps the SQLite file (and the generated cache/jobs.json) small
    forever, regardless of how long the scraper has been running."""
    cur = conn.execute(
        "DELETE FROM jobs WHERE posted_at < datetime('now', ?)",
        (f"-{retention_days} days",),
    )
    return cur.rowcount


def fetch_recent_jobs(conn):
    cur = conn.execute("SELECT * FROM jobs ORDER BY posted_at DESC")
    return [dict(row) for row in cur.fetchall()]
