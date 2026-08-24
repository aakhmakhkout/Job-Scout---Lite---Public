import json
import logging
from datetime import datetime, timezone

from config import CACHE_PATH

logger = logging.getLogger("scraper.cache_writer")


def write_cache(jobs, cache_path=None):
    path = cache_path or CACHE_PATH
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(jobs),
        "jobs": jobs,
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, default=str)
    logger.info(f"cache written: {len(jobs)} jobs -> {path}")
