"""
Wikipedia lookup service for ARIA.

Uses the public Wikipedia REST/action API (no API key required) so users can
ask ARIA to look something up and get a grounded, sourced answer instead of a
pure model guess.

Flow:
  1. `list=search` finds the best-matching page title for a free-text query.
  2. `prop=extracts&explaintext=1` fetches the plain-text article body for
     that title.
  3. The extract is trimmed to MAX_CHARACTERS (9000) at a sentence/word
     boundary so responses stay voice-friendly and don't blow up token/TTS
     limits, while still crediting the source with a canonical article URL.
"""

import json
import urllib.parse
import urllib.request
from typing import Optional, Tuple
from urllib.error import URLError, HTTPError

from utils.logger import get_logger

logger = get_logger(__name__)

WIKI_API_URL = "https://en.wikipedia.org/w/api.php"
MAX_CHARACTERS = 9000
REQUEST_TIMEOUT = 8  # seconds
USER_AGENT = "ARIA-Assistant/1.0 (https://github.com/harisha202/Aira)"


def _request(params: dict) -> dict:
    query_string = urllib.parse.urlencode(params)
    url = f"{WIKI_API_URL}?{query_string}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


def _find_best_title(query: str) -> Optional[str]:
    data = _request(
        {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "srlimit": 1,
            "format": "json",
        }
    )
    results = data.get("query", {}).get("search", [])
    if not results:
        return None
    return results[0]["title"]


def _fetch_extract(title: str) -> str:
    data = _request(
        {
            "action": "query",
            "prop": "extracts",
            "explaintext": 1,
            "redirects": 1,
            "titles": title,
            "format": "json",
        }
    )
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        return page.get("extract", "") or ""
    return ""


def _truncate(text: str, limit: int = MAX_CHARACTERS) -> Tuple[str, bool]:
    """Trim to `limit` characters at the last full sentence (falls back to
    the last full word) so we never cut off mid-word. Returns (text, was_truncated)."""
    if len(text) <= limit:
        return text, False

    window = text[:limit]
    cutoff = max(window.rfind(". "), window.rfind(".\n"))
    if cutoff > limit * 0.5:  # only trust the sentence boundary if it's not too early
        return window[: cutoff + 1].strip(), True

    cutoff = window.rfind(" ")
    if cutoff > 0:
        return window[:cutoff].strip() + "…", True

    return window.strip() + "…", True


def search_wikipedia(query: str) -> dict:
    """
    Look up `query` on Wikipedia.

    Returns:
        {
          "found": bool,
          "title": str | None,
          "extract": str,          # plain text, <= 9000 characters
          "truncated": bool,
          "url": str | None,
          "character_count": int,
        }
    """
    query = (query or "").strip()
    if not query:
        return {
            "found": False,
            "title": None,
            "extract": "",
            "truncated": False,
            "url": None,
            "character_count": 0,
            "error": "Query is required",
        }

    try:
        title = _find_best_title(query)
        if not title:
            return {
                "found": False,
                "title": None,
                "extract": "",
                "truncated": False,
                "url": None,
                "character_count": 0,
            }

        raw_extract = _fetch_extract(title)
        extract, truncated = _truncate(raw_extract, MAX_CHARACTERS)
        page_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"

        return {
            "found": bool(extract),
            "title": title,
            "extract": extract,
            "truncated": truncated,
            "url": page_url,
            "character_count": len(extract),
        }
    except (URLError, HTTPError) as exc:
        logger.warning("Wikipedia lookup network error for %r: %s", query, exc)
        return {
            "found": False,
            "title": None,
            "extract": "",
            "truncated": False,
            "url": None,
            "character_count": 0,
            "error": "Could not reach Wikipedia. Please try again.",
        }
    except Exception as exc:  # noqa: BLE001 - surface as a clean lookup failure
        logger.error("Wikipedia lookup failed for %r: %s", query, exc, exc_info=True)
        return {
            "found": False,
            "title": None,
            "extract": "",
            "truncated": False,
            "url": None,
            "character_count": 0,
            "error": "Wikipedia lookup failed.",
        }


wikipedia_service = search_wikipedia
