import time
from collections import defaultdict
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class SimpleRateLimiter:
    """
    Sliding-window IP rate limiter tracking client requests per minute.
    """

    def __init__(self, requests_per_minute: int = 120):
        self.requests_per_minute = requests_per_minute
        self.history = defaultdict(list)

    def is_allowed(self, client_ip: str) -> tuple[bool, int]:
        now = time.time()
        window_start = now - 60.0

        # Filter out timestamps older than 60 seconds
        self.history[client_ip] = [t for t in self.history[client_ip] if t > window_start]

        if len(self.history[client_ip]) >= self.requests_per_minute:
            oldest = self.history[client_ip][0]
            retry_after = int(60.0 - (now - oldest)) + 1
            return False, max(1, retry_after)

        self.history[client_ip].append(now)
        return True, 0


# Global Rate Limiters
auth_limiter = SimpleRateLimiter(requests_per_minute=5)
general_limiter = SimpleRateLimiter(requests_per_minute=120)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    FastAPI Middleware enforcing global sliding-window rate limits per IP address.
    """

    async def dispatch(self, request: Request, call_next):
        # Exclude static assets and OPTIONS preflight
        if request.method == "OPTIONS" or request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        path = request.url.path

        # Stricter Rate Limiting for Auth routes (/auth/login, /auth/register)
        if "/auth/login" in path or "/auth/register" in path:
            allowed, retry_after = auth_limiter.is_allowed(client_ip)
            if not allowed:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": f"Too many authentication attempts. Please retry after {retry_after} seconds."
                    },
                    headers={"Retry-After": str(retry_after)}
                )
        else:
            allowed, retry_after = general_limiter.is_allowed(client_ip)
            if not allowed:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": f"Rate limit exceeded. Maximum {general_limiter.requests_per_minute} requests per minute allowed."
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        return await call_next(request)
