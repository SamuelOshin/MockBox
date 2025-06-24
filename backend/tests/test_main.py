"""
Basic tests for the MockBox backend
"""

import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from app.main import app

# Test client
client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_async_client():
    """Test async client functionality"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200


# Mock API tests would require authentication setup
# These are basic structure tests to ensure the app starts correctly
