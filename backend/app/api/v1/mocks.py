"""
Mock management API endpoints
"""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
import time

from app.core.security import get_current_user, get_optional_user
from app.core.database import get_database, DatabaseManager
from app.services.mock_service import MockService
from app.models.models import MockStatus, HTTPMethod
from app.schemas.schemas import (
    MockCreate,
    MockUpdate,
    MockResponse,
    MockListResponse,
    MockSimulateResponse,
    PaginationParams,
    BaseResponse,
    ErrorResponse,
)

router = APIRouter(prefix="/mocks", tags=["mocks"])


@router.post("/", response_model=MockResponse, status_code=status.HTTP_201_CREATED)
async def create_mock(
    mock_data: MockCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Create a new mock endpoint"""
    # Extract user ID
    user_id = current_user.get("sub") or current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
        )

    # Extract JWT token from request headers
    auth_header = request.headers.get("authorization", "")
    user_token = (
        auth_header.replace("Bearer ", "")
        if auth_header.startswith("Bearer ")
        else None
    )

    if not user_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
        )
    # Create service with user's JWT token for RLS
    service = MockService(db, user_token=user_token)

    mock = await service.create_mock(UUID(user_id), mock_data)
    return MockResponse(**mock.dict())


@router.get("/", response_model=MockListResponse)
async def list_mocks(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[MockStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(
        None, description="Search in name, description, endpoint"
    ),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """List user's mocks with filtering and pagination"""
    # Extract JWT token from request headers for authenticated access
    auth_header = request.headers.get("authorization", "")
    user_token = (
        auth_header.replace("Bearer ", "")
        if auth_header.startswith("Bearer ")
        else None
    )

    service = MockService(db, user_token=user_token)
    pagination = PaginationParams(page=page, limit=limit)

    user_id = current_user.get("sub") or current_user.get("id")
    mocks, total = await service.list_mocks(
        UUID(user_id), pagination, status_filter, search, tags
    )

    mock_responses = [MockResponse(**mock.dict()) for mock in mocks]

    return MockListResponse.create(
        data=mock_responses,
        total=total,
        page=page,
        limit=limit,
        message=f"Found {total} mocks",
    )


@router.get("/{mock_id}", response_model=MockResponse)
async def get_mock(
    mock_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Get mock by ID"""
    service = MockService(db)
    user_id = current_user.get("sub") or current_user.get("id")
    mock = await service.get_mock(mock_id, UUID(user_id))

    if not mock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mock not found"
        )

    return MockResponse(**mock.dict())


@router.put("/{mock_id}", response_model=MockResponse)
async def update_mock(
    mock_id: UUID,
    update_data: MockUpdate,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Update mock by ID"""
    service = MockService(db)
    user_id = current_user.get("sub") or current_user.get("id")
    mock = await service.update_mock(mock_id, UUID(user_id), update_data)
    return MockResponse(**mock.dict())


@router.delete("/{mock_id}", response_model=BaseResponse)
async def delete_mock(
    mock_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Delete mock by ID"""
    service = MockService(db)
    user_id = current_user.get("sub") or current_user.get("id")
    success = await service.delete_mock(mock_id, UUID(user_id))

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete mock",
        )

    return BaseResponse(message="Mock deleted successfully")


@router.post("/{mock_id}/simulate", response_model=MockSimulateResponse)
async def simulate_mock(
    mock_id: UUID,
    request: Request,
    current_user: dict = Depends(get_optional_user),
    db: DatabaseManager = Depends(get_database),
):
    """Simulate mock response"""
    service = MockService(db)

    # Prepare request data for logging
    user_id = None
    if current_user:
        user_id = current_user.get("sub") or current_user.get("id")

    request_data = {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent"),
        "method": request.method,
        "user_id": user_id,
    }

    result = await service.simulate_mock(mock_id, request_data)

    # Return actual mock response with proper status code and headers
    return JSONResponse(
        content=result["response_data"],
        status_code=result["status_code"],
        headers=result["headers"],
    )


@router.post("/{mock_id}/toggle-status", response_model=MockResponse)
async def toggle_mock_status(
    mock_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Toggle mock status between active and inactive"""
    service = MockService(db)

    user_id = current_user.get("sub") or current_user.get("id")
    # Get current mock
    mock = await service.get_mock(mock_id, UUID(user_id))
    if not mock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mock not found"
        )

    # Toggle status
    new_status = (
        MockStatus.INACTIVE if mock.status == MockStatus.ACTIVE else MockStatus.ACTIVE
    )
    update_data = MockUpdate(status=new_status)

    updated_mock = await service.update_mock(mock_id, UUID(user_id), update_data)
    return MockResponse(**updated_mock.dict())


@router.post("/{mock_id}/duplicate", response_model=MockResponse)
async def duplicate_mock(
    mock_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: DatabaseManager = Depends(get_database),
):
    """Duplicate an existing mock"""
    service = MockService(db)

    user_id = current_user.get("sub") or current_user.get("id")
    # Get original mock
    original_mock = await service.get_mock(mock_id, UUID(user_id))
    if not original_mock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mock not found"
        )

    # Create duplicate with modified name and endpoint
    duplicate_data = MockCreate(
        name=f"{original_mock.name} (Copy)",
        description=original_mock.description,
        endpoint=f"{original_mock.endpoint}-copy",
        method=original_mock.method,
        response=original_mock.response,
        headers=original_mock.headers,
        status_code=original_mock.status_code,
        delay_ms=original_mock.delay_ms,
        is_public=original_mock.is_public,
        tags=original_mock.tags,
    )

    duplicate_mock = await service.create_mock(UUID(user_id), duplicate_data)
    return MockResponse(**duplicate_mock.dict())


@router.post(
    "/public/test", response_model=MockResponse, status_code=status.HTTP_201_CREATED
)
async def create_test_mock(
    mock_data: MockCreate, db: DatabaseManager = Depends(get_database)
):
    """Create a test mock (public endpoint for development testing)"""
    service = MockService(db)

    # Use a default test user ID for public testing
    # In production, this endpoint should be removed or properly secured
    from uuid import uuid4

    test_user_id = uuid4()  # Generate a temporary user ID for testing

    mock = await service.create_mock(test_user_id, mock_data)
    return MockResponse(**mock.dict())


@router.get("/public", response_model=MockListResponse)
async def list_public_mocks(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: DatabaseManager = Depends(get_database),
):
    """List public mocks (no authentication required)"""
    service = MockService(db)
    pagination = PaginationParams(page=page, limit=limit)

    # Get public mocks only
    mocks, total = await service.list_public_mocks(pagination)

    return MockListResponse(
        success=True,
        message="Public mocks retrieved successfully",
        data=mocks,
        total=total,
        page=pagination.page,
        limit=pagination.limit,
        has_next=total > pagination.page * pagination.limit,
    )


@router.get("/test")
async def test_endpoint():
    """Simple test endpoint (no authentication required)"""
    return {
        "message": "MockBox API is working!",
        "timestamp": time.time(),
        "status": "success",
    }
