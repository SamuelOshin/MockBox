"""
Rate limiting middleware for MockBox
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.rate_limiting import rate_limiter, RATE_LIMITS
from app.services.monitoring import RateLimitMonitor
import time
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced rate limiting middleware with intelligent endpoint detection"""

    def __init__(self, app):
        super().__init__(app)
        self.monitor = RateLimitMonitor()

    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting"""
        endpoint_type, config = self._get_endpoint_config(request)

        if not config:
            # No rate limiting for this endpoint
            return await call_next(request)

        # Generate rate limit key
        key = await rate_limiter.get_rate_limit_key(request, endpoint_type)

        # Check rate limit
        allowed = await rate_limiter.check_rate_limit(
            key, config["limit"], config["window"]
        )

        if not allowed:
            # Rate limit exceeded
            await self._log_rate_limit_violation(request, endpoint_type, key)

            # Get rate limit info for headers
            limit_info = await rate_limiter.get_rate_limit_info(
                key, config["limit"], config["window"]
            )

            return JSONResponse(
                status_code=429,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"{endpoint_type.replace('_', ' ').title()} rate limit exceeded. Please try again later.",
                    "limit": limit_info["limit"],
                    "window_seconds": config["window"],
                    "retry_after": limit_info["retry_after"],
                    "reset_at": limit_info["reset"],
                },
                headers={
                    "X-RateLimit-Limit": str(limit_info["limit"]),
                    "X-RateLimit-Remaining": str(limit_info["remaining"]),
                    "X-RateLimit-Reset": str(limit_info["reset"]),
                    "Retry-After": str(limit_info["retry_after"]),
                },
            )

        # Process request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Add rate limiting headers to successful responses
        if response.status_code < 400:
            limit_info = await rate_limiter.get_rate_limit_info(
                key, config["limit"], config["window"]
            )

            response.headers["X-RateLimit-Limit"] = str(limit_info["limit"])
            response.headers["X-RateLimit-Remaining"] = str(limit_info["remaining"])
            response.headers["X-RateLimit-Reset"] = str(limit_info["reset"])
            response.headers["X-RateLimit-Type"] = endpoint_type

        # Add performance headers
        response.headers["X-Process-Time"] = str(process_time)

        return response

    def _get_endpoint_config(self, request: Request) -> tuple:
        """Determine endpoint type and rate limiting configuration"""
        path = request.url.path.lower()
        method = request.method.upper()

        # AI endpoints - highest priority and strictest limits
        if any(keyword in path for keyword in ["/ai/", "/generate"]):
            return "ai", RATE_LIMITS["ai"]

        # Simulation endpoints - moderate limits for public use
        elif "/simulate/" in path:
            return "simulation", RATE_LIMITS["simulation"]

        # Public API endpoints - moderate limits
        elif "/mocks/public" in path:
            return "public_api", RATE_LIMITS["public_api"]

        # Protected API endpoints - check authentication
        elif path.startswith("/api/v1/"):
            # Check if user is authenticated (set by auth middleware)
            user_id = getattr(request.state, "user_id", None)
            if user_id:
                return "authenticated", RATE_LIMITS["authenticated"]
            else:
                return "anonymous", RATE_LIMITS["anonymous"]

        # Health and root endpoints - minimal rate limiting
        elif path in ["/health", "/", "/docs", "/redoc"]:
            return "public_api", {"limit": 300, "window": 60}  # 5 requests per second

        # No rate limiting for other endpoints
        return None, None

    async def _log_rate_limit_violation(
        self, request: Request, endpoint_type: str, key: str
    ):
        """Log rate limit violations for monitoring"""
        try:
            user_id = getattr(request.state, "user_id", None)
            ip_address = request.client.host if request.client else "unknown"

            await self.monitor.log_rate_limit_violation(
                endpoint=request.url.path,
                user_id=user_id,
                ip_address=ip_address,
                violation_type=endpoint_type,
                metadata={
                    "method": request.method,
                    "user_agent": request.headers.get("user-agent", "unknown"),
                    "key": key,
                    "timestamp": time.time(),
                },
            )

            logger.warning(
                f"Rate limit exceeded: {endpoint_type} on {request.url.path}",
                extra={
                    "user_id": user_id,
                    "ip_address": ip_address,
                    "endpoint": request.url.path,
                    "method": request.method,
                    "rate_limit_key": key,
                },
            )

        except Exception as e:
            logger.error(f"Failed to log rate limit violation: {e}")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=()"
        )

        # Add HSTS for HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response
