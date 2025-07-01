"""
Enhanced security middleware that integrates with authentication
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import verify_supabase_token, AuthError
from app.services.monitoring import security_monitor
import time
import logging

logger = logging.getLogger(__name__)


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Enhanced authentication middleware with rate limiting integration"""

    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        """Process authentication and set user context for rate limiting"""

        # Skip authentication for public endpoints
        if self._is_public_endpoint(request):
            return await call_next(request)

        # Try to extract and verify JWT token
        user_context = await self._extract_user_context(request)

        if user_context:
            # Set user context for rate limiting
            request.state.user_id = user_context.get("user_id")
            request.state.user_email = user_context.get("email")
            request.state.user_role = user_context.get("role", "user")

            # Log successful authentication
            logger.debug(
                f"Authenticated user: {user_context.get('user_id')} for {request.url.path}"
            )
        else:
            # For protected endpoints, require authentication
            if self._requires_authentication(request):
                await security_monitor.log_security_event(
                    event_type="unauthorized_access_attempt",
                    severity="medium",
                    description=f"Unauthorized access attempt to {request.url.path}",
                    ip_address=request.client.host if request.client else "unknown",
                    metadata={
                        "endpoint": request.url.path,
                        "method": request.method,
                        "user_agent": request.headers.get("user-agent", "unknown"),
                    },
                )

                return JSONResponse(
                    status_code=401,
                    content={
                        "error": "AUTHENTICATION_REQUIRED",
                        "message": "Authentication required for this endpoint",
                        "details": "Please provide a valid Bearer token in the Authorization header",
                    },
                )

        # Process request
        response = await call_next(request)

        return response

    async def _extract_user_context(self, request: Request) -> dict:
        """Extract user context from JWT token"""
        try:
            # Get Authorization header
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return None

            # Extract token
            token = auth_header.split(" ")[1]

            # Verify token
            user_context = verify_supabase_token(token)
            return user_context

        except AuthError as e:
            logger.warning(f"Authentication failed: {e}")

            # Log suspicious authentication attempts
            await security_monitor.log_security_event(
                event_type="invalid_token",
                severity="medium",
                description=f"Invalid token provided: {str(e)}",
                ip_address=request.client.host if request.client else "unknown",
                metadata={
                    "endpoint": request.url.path,
                    "method": request.method,
                    "error": str(e),
                },
            )
            return None

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None

    def _is_public_endpoint(self, request: Request) -> bool:
        """Check if endpoint is public (no authentication required)"""
        path = request.url.path.lower()

        # Public endpoints that never require authentication
        public_paths = [
            "/",
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/favicon.ico",
        ]

        if path in public_paths:
            return True

        # Simulation endpoints are public
        if "/simulate/" in path:
            return True

        # Public mocks endpoint
        if "/mocks/public" in path and request.method == "GET":
            return True

        # Print for debug: always outputs
        if path.startswith("/api/v1/mocks/templates") and request.method == "GET":
            print(f"[DEBUG] Public endpoint allowed: {path}")
            return True

        return False

    def _requires_authentication(self, request: Request) -> bool:
        """Check if endpoint requires authentication"""
        path = request.url.path.lower()

        # All API endpoints require authentication except public ones
        if path.startswith("/api/v1/"):
            return not self._is_public_endpoint(request)

        return False


class SecurityValidationMiddleware(BaseHTTPMiddleware):
    """Additional security validations and threat detection"""

    def __init__(self, app):
        super().__init__(app)
        self.max_request_size = 10 * 1024 * 1024  # 10MB
        self.suspicious_patterns = [
            "union select",
            "drop table",
            "delete from",
            "insert into",
            "update set",
            "<script",
            "javascript:",
            "vbscript:",
            "onload=",
            "onerror=",
        ]

    async def dispatch(self, request: Request, call_next):
        """Validate request for security threats"""

        # Check request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_request_size:
            await security_monitor.log_security_event(
                event_type="large_request",
                severity="medium",
                description=f"Request size {content_length} exceeds limit",
                ip_address=request.client.host if request.client else "unknown",
                metadata={"endpoint": request.url.path, "size": content_length},
            )

            return JSONResponse(
                status_code=413,
                content={
                    "error": "REQUEST_TOO_LARGE",
                    "message": "Request size exceeds maximum allowed limit",
                },
            )

        # Check for suspicious patterns in URL
        suspicious_found = []
        path_and_query = str(request.url)

        for pattern in self.suspicious_patterns:
            if pattern in path_and_query.lower():
                suspicious_found.append(pattern)

        if suspicious_found:
            await security_monitor.log_security_event(
                event_type="suspicious_request",
                severity="high",
                description=f"Suspicious patterns detected: {', '.join(suspicious_found)}",
                ip_address=request.client.host if request.client else "unknown",
                metadata={
                    "endpoint": request.url.path,
                    "patterns": suspicious_found,
                    "full_url": str(request.url),
                },
            )

            return JSONResponse(
                status_code=400,
                content={
                    "error": "SUSPICIOUS_REQUEST",
                    "message": "Request contains potentially malicious content",
                },
            )

        # Check User-Agent for suspicious patterns
        user_agent = request.headers.get("user-agent", "").lower()
        if not user_agent or any(
            bot in user_agent for bot in ["bot", "crawler", "spider", "scraper"]
        ):
            # Log but don't block (could be legitimate)
            await security_monitor.log_security_event(
                event_type="suspicious_user_agent",
                severity="low",
                description=f"Suspicious or missing user agent: {user_agent}",
                ip_address=request.client.host if request.client else "unknown",
                metadata={"endpoint": request.url.path, "user_agent": user_agent},
            )

        response = await call_next(request)
        return response
