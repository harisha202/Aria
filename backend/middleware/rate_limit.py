"""
ARIA in-memory sliding-window rate limiter.
No external dependencies — stores state in process memory.
"""

import threading
import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class _SlidingWindow:
    """Thread-safe per-key request counter over a rolling time window."""

    def __init__(self):
        self._lock = threading.Lock()
        # {key: [(timestamp, count), ...]}
        self._buckets: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, key: str, limit: int, window_seconds: int) -> bool:
        now = time.monotonic()
        cutoff = now - window_seconds
        with self._lock:
            hits = self._buckets[key]
            # Drop expired timestamps
            self._buckets[key] = [t for t in hits if t > cutoff]
            if len(self._buckets[key]) >= limit:
                return False
            self._buckets[key].append(now)
            return True


_window = _SlidingWindow()


def rate_limit(limit: int, window_seconds: int, key_fn=None):
    """
    FastAPI dependency factory.

    Usage::

        @router.post("/login")
        async def login(request: Request, _=Depends(rate_limit(5, 3600))):
            ...

    Args:
        limit:          Maximum number of allowed requests.
        window_seconds: Rolling window duration in seconds.
        key_fn:         Optional callable(request) -> str for custom key.
                        Defaults to client IP.
    """

    def _get_key(request: Request) -> str:
        if key_fn:
            return key_fn(request)
        # Use forwarded IP when behind a proxy, fall back to direct client
        forwarded = request.headers.get("X-Forwarded-For")
        ip = (forwarded.split(",")[0].strip() if forwarded else None) or (
            request.client.host if request.client else "unknown"
        )
        return f"{request.url.path}:{ip}"

    async def _dependency(request: Request):
        key = _get_key(request)
        if not _window.is_allowed(key, limit, window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Allowed {limit} per {window_seconds}s.",
                headers={"Retry-After": str(window_seconds)},
            )

    return _dependency


# -------------------------------------------------------------------
# Pre-built limits (import and use directly)
# -------------------------------------------------------------------
signup_limit = rate_limit(3, 3600)          # 3 signups / hour per IP
login_limit = rate_limit(5, 3600)           # 5 logins / hour per IP
otp_resend_limit = rate_limit(3, 3600)      # 3 OTP resends / hour per IP
chat_minute_limit = rate_limit(30, 60)      # 30 messages / minute per IP
