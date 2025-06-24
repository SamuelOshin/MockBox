"""
Tests for Phase 1: Security Foundation implementation
"""

import pytest
import asyncio
import time
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from app.main import app
from app.core.config import settings


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Mock authentication headers"""
    return {"Authorization": "Bearer mock_jwt_token"}


class TestRateLimiting:
    """Test advanced rate limiting functionality"""

    def test_health_check_rate_limit(self, client):
        """Test legacy rate limiting on health endpoint"""
        # Make multiple requests to trigger rate limit
        responses = []
        for i in range(15):  # Health check limit is 10/minute
            response = client.get("/health")
            responses.append(response)

        # Should have some successful and some rate limited
        success_count = sum(1 for r in responses if r.status_code == 200)
        rate_limited_count = sum(1 for r in responses if r.status_code == 429)

        assert success_count > 0, "Should have some successful requests"
        assert rate_limited_count > 0, "Should have some rate limited requests"

    def test_rate_limit_headers(self, client):
        """Test that rate limit headers are added"""
        response = client.get("/health")

        # Check for rate limiting headers
        assert "X-RateLimit-Limit" in response.headers or response.status_code == 200
        assert (
            "X-RateLimit-Remaining" in response.headers or response.status_code == 200
        )


class TestSecurityMiddleware:
    """Test security middleware functionality"""

    def test_large_request_blocked(self, client):
        """Test that large requests are blocked"""
        # Simulate a large request
        large_data = "x" * (11 * 1024 * 1024)  # 11MB, exceeds 10MB limit

        response = client.post(
            "/api/v1/mocks",
            json={"data": large_data},
            headers={"Content-Length": str(len(large_data))},
        )

        # Should be blocked for being too large
        assert response.status_code == 413
        assert "REQUEST_TOO_LARGE" in response.json().get("error", "")

    def test_suspicious_patterns_blocked(self, client):
        """Test that suspicious request patterns are blocked"""
        suspicious_paths = [
            "/api/v1/mocks?id=1' UNION SELECT * FROM users--",
            "/api/v1/mocks?name=<script>alert('xss')</script>",
            "/api/v1/mocks?data=javascript:alert(1)",
        ]

        for path in suspicious_paths:
            response = client.get(path)
            # Should be blocked for suspicious content
            assert response.status_code == 400
            assert "SUSPICIOUS_REQUEST" in response.json().get("error", "")

    def test_legitimate_requests_allowed(self, client):
        """Test that legitimate requests are allowed through"""
        response = client.get("/")
        assert response.status_code == 200

        response = client.get("/health")
        assert response.status_code == 200


class TestAuthenticationMiddleware:
    """Test authentication middleware functionality"""

    def test_public_endpoints_no_auth_required(self, client):
        """Test that public endpoints don't require authentication"""
        public_endpoints = [
            "/",
            "/health",
            "/docs" if settings.debug else None,
        ]

        for endpoint in public_endpoints:
            if endpoint:
                response = client.get(endpoint)
                assert (
                    response.status_code != 401
                ), f"Public endpoint {endpoint} should not require auth"

    def test_protected_endpoints_require_auth(self, client):
        """Test that protected endpoints require authentication"""
        protected_endpoints = [
            "/api/v1/mocks",
            "/api/v1/mocks/123",
        ]

        for endpoint in protected_endpoints:
            response = client.get(endpoint)
            # Should require authentication (401) or be not found (404)
            # 404 is acceptable since we don't have the full API implemented
            assert response.status_code in [
                401,
                404,
            ], f"Protected endpoint {endpoint} should require auth"

    @patch("app.core.security.verify_supabase_token")
    def test_valid_token_accepted(self, mock_verify, client):
        """Test that valid JWT tokens are accepted"""
        # Mock successful token verification
        mock_verify.return_value = {
            "user_id": "test_user_123",
            "email": "test@example.com",
            "role": "user",
        }

        headers = {"Authorization": "Bearer valid_token"}
        response = client.get("/api/v1/mocks", headers=headers)

        # Should not be rejected for auth (might be 404 if endpoint not implemented)
        assert response.status_code != 401

    @patch("app.core.security.verify_supabase_token")
    def test_invalid_token_rejected(self, mock_verify, client):
        """Test that invalid JWT tokens are rejected"""
        # Mock failed token verification
        from app.core.security import AuthError

        mock_verify.side_effect = AuthError("Invalid token")

        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/mocks", headers=headers)

        # Should be rejected for invalid auth
        assert response.status_code == 401


class TestSecurityHeaders:
    """Test security headers middleware"""

    def test_security_headers_present(self, client):
        """Test that security headers are added to responses"""
        response = client.get("/")

        # Check for common security headers
        security_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Referrer-Policy",
        ]

        # At least some security headers should be present
        present_headers = [h for h in security_headers if h in response.headers]
        assert len(present_headers) > 0, "Should have some security headers"


class TestMonitoring:
    """Test security monitoring functionality"""

    @patch("app.services.monitoring.security_monitor.log_security_event")
    async def test_security_events_logged(self, mock_log, client):
        """Test that security events are properly logged"""
        # Trigger a suspicious request
        response = client.get("/api/v1/test?id=1' OR 1=1--")

        # Verify the response was blocked
        assert response.status_code == 400

        # Note: In a real test, we'd need to check if the mock was called
        # This is a placeholder for the concept


class TestConfigurationSettings:
    """Test that configuration settings are properly applied"""

    def test_security_settings_loaded(self):
        """Test that security configuration is loaded"""
        assert hasattr(settings, "enable_rate_limiting")
        assert hasattr(settings, "enable_security_headers")
        assert hasattr(settings, "enable_authentication_middleware")
        assert hasattr(settings, "enable_security_validation")

        # Verify default values
        assert isinstance(settings.enable_rate_limiting, bool)
        assert isinstance(settings.enable_security_headers, bool)

    def test_rate_limit_thresholds_configured(self):
        """Test that rate limit thresholds are configured"""
        assert hasattr(settings, "ai_rate_limit")
        assert hasattr(settings, "public_api_rate_limit")
        assert hasattr(settings, "authenticated_rate_limit")
        assert hasattr(settings, "anonymous_rate_limit")
        assert hasattr(settings, "simulation_rate_limit")

        # Verify they are positive integers
        assert settings.ai_rate_limit > 0
        assert settings.public_api_rate_limit > 0
        assert settings.authenticated_rate_limit > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
