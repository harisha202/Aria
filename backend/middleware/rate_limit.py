import threading
import time
from collections import defaultdict
import config

from fastapi import HTTPException, Request, status

try:
    import redis.asyncio as redis
except ImportError:
    redis = None

redis_client = None
if redis and getattr(config, "REDIS_URL", None):
    redis_client = redis.from_url(config.REDIS_URL, decode_responses=True)

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

async def is_allowed_redis(key: str, limit: int, window_seconds: int) -> bool:
    if not redis_client:
        return False
    now = time.time()
    cutoff = now - window_seconds
    async with redis_client.pipeline(transaction=True) as pipe:
        # zremrangebyscore to remove old requests
        await pipe.zremrangebyscore(key, 0, cutoff)
        # zcard to get count
        await pipe.zcard(key)
        # zadd to add new request
        await pipe.zadd(key, {str(now): now})
        # expire to clean up whole key eventually
        await pipe.expire(key, window_seconds)
        results = await pipe.execute()
        count = results[1]
        return count < limit

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
        if getattr(config, "DEBUG", False):
            return

        key = _get_key(request)
        
        allowed = True
        if redis_client:
            redis_key = f"rate_limit:{key}"
            allowed = await is_allowed_redis(redis_key, limit, window_seconds)
        else:
            allowed = _window.is_allowed(key, limit, window_seconds)

        if not allowed:
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
