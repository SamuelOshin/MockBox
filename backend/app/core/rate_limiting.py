"""
Advanced rate limiting configuration for MockBox
"""

import redis.asyncio as redis
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Optional, Dict, List
from fastapi import Request
import time
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CustomRateLimiter:
    """Advanced rate limiter with Redis backend and custom logic"""

    def __init__(self, redis_url: Optional[str] = None):
        self.redis_client = None
        self.memory_cache: Dict[str, List[float]] = {}

        if redis_url:
            try:
                self.redis_client = redis.from_url(
                    redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                logger.info("Redis rate limiting backend initialized")
            except Exception as e:
                logger.warning(f"Redis connection failed, using memory cache: {e}")

    async def get_rate_limit_key(
        self, request: Request, endpoint_type: str = "default"
    ) -> str:
        """Generate rate limit key based on user context"""
        # Check for authenticated user
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"rate_limit:{endpoint_type}:user:{user_id}"

        # Fall back to IP-based limiting
        ip = get_remote_address(request)
        return f"rate_limit:{endpoint_type}:ip:{ip}"

    async def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        """Check if request is within rate limit"""
        current_time = time.time()
        window_start = current_time - window

        try:
            if self.redis_client:
                # Redis sliding window log implementation
                async with self.redis_client.pipeline() as pipe:
                    # Remove expired entries
                    await pipe.zremrangebyscore(key, 0, window_start)
                    # Count current entries
                    await pipe.zcard(key)
                    # Add current request
                    await pipe.zadd(key, {str(current_time): current_time})
                    # Set expiration
                    await pipe.expire(key, window)
                    results = await pipe.execute()

                    current_count = results[1]
                    return current_count < limit
            else:
                # Memory cache fallback
                if key not in self.memory_cache:
                    self.memory_cache[key] = []

                # Clean old entries
                self.memory_cache[key] = [
                    timestamp
                    for timestamp in self.memory_cache[key]
                    if timestamp > window_start
                ]

                if len(self.memory_cache[key]) >= limit:
                    return False

                self.memory_cache[key].append(current_time)
                return True

        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            # On error, allow the request to prevent service disruption
            return True

    async def get_rate_limit_info(self, key: str, limit: int, window: int) -> Dict:
        """Get rate limit information for response headers"""
        current_time = time.time()
        window_start = current_time - window

        try:
            if self.redis_client:
                count = await self.redis_client.zcount(key, window_start, current_time)
                remaining = max(0, limit - count)
                reset_time = int(current_time + window)
            else:
                if key in self.memory_cache:
                    # Clean old entries
                    self.memory_cache[key] = [
                        timestamp
                        for timestamp in self.memory_cache[key]
                        if timestamp > window_start
                    ]
                    count = len(self.memory_cache[key])
                else:
                    count = 0

                remaining = max(0, limit - count)
                reset_time = int(current_time + window)

            return {
                "limit": limit,
                "remaining": remaining,
                "reset": reset_time,
                "retry_after": window if remaining == 0 else 0,
            }
        except Exception as e:
            logger.error(f"Rate limit info error: {e}")
            return {
                "limit": limit,
                "remaining": limit,
                "reset": int(current_time + window),
                "retry_after": 0,
            }

    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache keys matching pattern"""
        try:
            if self.redis_client:
                keys = await self.redis_client.keys(pattern)
                if keys:
                    return await self.redis_client.delete(*keys)
                return 0
            else:
                # Memory cache pattern matching
                keys_to_delete = [
                    key
                    for key in self.memory_cache.keys()
                    if self._match_pattern(key, pattern)
                ]
                for key in keys_to_delete:
                    del self.memory_cache[key]
                return len(keys_to_delete)
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return 0

    def _match_pattern(self, key: str, pattern: str) -> bool:
        """Simple pattern matching for memory cache"""
        return pattern.replace("*", "") in key

    async def cleanup_expired_keys(self):
        """Cleanup expired keys (for memory cache)"""
        if not self.redis_client:
            current_time = time.time()
            for key in list(self.memory_cache.keys()):
                # Keep only entries from last 24 hours
                self.memory_cache[key] = [
                    timestamp
                    for timestamp in self.memory_cache[key]
                    if timestamp > current_time - 86400
                ]
                if not self.memory_cache[key]:
                    del self.memory_cache[key]


# Rate limiting configurations
RATE_LIMITS = {
    "ai": {"limit": 10, "window": 60},  # 10 requests per minute for AI
    "public_api": {
        "limit": 100,
        "window": 60,
    },  # 100 requests per minute for public API
    "authenticated": {
        "limit": 1000,
        "window": 60,
    },  # 1000 requests per minute for authenticated users
    "anonymous": {
        "limit": 60,
        "window": 60,
    },  # 60 requests per minute for anonymous users
    "simulation": {"limit": 200, "window": 60},  # 200 simulations per minute
}


# Global rate limiter instance
rate_limiter = CustomRateLimiter()


def ai_rate_limit(limit: str = "10/minute"):
    """Rate limiter decorator for AI endpoints"""

    def decorator(func):
        func._rate_limit_type = "ai"
        func._rate_limit = limit
        return func

    return decorator


def public_api_rate_limit(limit: str = "100/minute"):
    """Rate limiter decorator for public API endpoints"""

    def decorator(func):
        func._rate_limit_type = "public_api"
        func._rate_limit = limit
        return func

    return decorator


def simulation_rate_limit(limit: str = "200/minute"):
    """Rate limiter decorator for simulation endpoints"""

    def decorator(func):
        func._rate_limit_type = "simulation"
        func._rate_limit = limit
        return func

    return decorator
