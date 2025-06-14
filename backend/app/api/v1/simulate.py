"""
Public simulation API endpoints
"""
from typing import Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse

from app.core.database import get_database, DatabaseManager
from app.services.mock_service import MockService
from app.models.models import HTTPMethod

router = APIRouter(prefix="/simulate", tags=["simulation"])


@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"])
async def simulate_endpoint(
    path: str,
    request: Request,
    db: DatabaseManager = Depends(get_database)
):
    """
    Simulate any endpoint - this is the main simulation route
    Matches endpoint path and HTTP method to find corresponding mock
    """
    service = MockService(db)
    
    # Normalize path
    endpoint = f"/{path}" if not path.startswith("/") else path
    method = HTTPMethod(request.method)
    
    # Find mock by endpoint and method
    mock = await service.get_mock_by_endpoint(endpoint, method)
    
    if not mock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active mock found for {method.value} {endpoint}"
        )
    
    # Prepare request data for logging
    request_data = {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent"),
        "method": request.method,
        "endpoint": endpoint,
        "user_id": None  # Public access
    }
    
    # Simulate the mock
    result = await service.simulate_mock(mock.id, request_data)
    
    # Return the mock response with proper status code and headers
    return JSONResponse(
        content=result["response_data"],
        status_code=result["status_code"],
        headers=result["headers"]
    )


@router.get("/{mock_id}")
async def simulate_by_id(
    mock_id: UUID,
    request: Request,
    db: DatabaseManager = Depends(get_database)
):
    """Simulate mock by ID (alternative endpoint)"""
    service = MockService(db)
    
    # Prepare request data for logging
    request_data = {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent"),
        "method": request.method,
        "user_id": None  # Public access
    }
    
    result = await service.simulate_mock(mock_id, request_data)
    
    # Return the mock response
    return JSONResponse(
        content=result["response_data"],
        status_code=result["status_code"],
        headers=result["headers"]
    )
