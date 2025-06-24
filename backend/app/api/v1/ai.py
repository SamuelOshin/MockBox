"""
AI-powered mock generation API endpoints
"""

import logging
from typing import Optional, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.core.security import get_current_user
from app.core.database import get_database, DatabaseManager
from app.services.ai_service import get_ai_service, AIService
from app.services.mock_service import MockService
from app.schemas.ai_schemas import (
    MockGenerationRequest,
    MockGenerationResponse,
    AIErrorResponse,
)
from app.schemas.schemas import MockCreate, MockResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai-generation"])


@router.post(
    "/generate",
    response_model=MockGenerationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_mock_data(
    request: MockGenerationRequest,
    current_user: dict = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    """
    Generate mock data using AI

    This endpoint uses AI to generate realistic mock data based on the provided
    endpoint description and parameters. The AI analyzes the endpoint pattern
    and generates appropriate response data.

    **Rate Limits:**
    - 10 requests per minute for authenticated users
    - 100 requests per hour for authenticated users

    **Supported Features:**
    - Multiple response formats (JSON, XML, HTML, Text)
    - Realistic data generation
    - Custom schema hints
    - Variable complexity levels
    - Automatic header generation
    """
    try:
        # Extract user ID
        user_id = current_user.get("sub") or current_user.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        # Generate mock data using AI
        result = await ai_service.generate_mock_data(request, UUID(user_id))

        logger.info(f"AI mock generated for user {user_id}: {request.endpoint}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in AI generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=AIErrorResponse(
                error="AI_GENERATION_ERROR",
                message="Failed to generate mock data. Please try again.",
            ).dict(),
        )


@router.post(
    "/generate-and-save",
    response_model=MockResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_and_save_mock(
    request: MockGenerationRequest,
    http_request: Request,
    name: Optional[str] = Query(None),
    description: Optional[str] = Query(None),
    is_public: bool = Query(False),
    tags: Optional[List[str]] = Query(None),
    current_user: dict = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
    db: DatabaseManager = Depends(get_database),
):
    """
    Generate mock data with AI and save it as a mock endpoint

    This endpoint combines AI generation with mock creation, allowing users
    to generate realistic mock data and immediately save it as a reusable
    mock endpoint.

    **Benefits:**
    - One-step mock creation with AI
    - Automatic realistic data generation
    - Immediate deployment readiness
    - Customizable mock metadata
    """
    try:
        # Extract user ID
        user_id = current_user.get("sub") or current_user.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        # Generate mock data using AI
        ai_result = await ai_service.generate_mock_data(request, UUID(user_id))
        # Create mock data object with proper tag handling
        final_tags = []
        if tags:
            final_tags.extend(tags)
        if "ai-generated" not in final_tags:
            final_tags.append("ai-generated")
        if ai_result.provider.value not in final_tags:
            final_tags.append(ai_result.provider.value)

        mock_data = MockCreate(
            name=name or f"AI Generated - {request.endpoint}",
            description=description
            or f"AI generated mock for {request.endpoint}. {ai_result.explanation}",
            endpoint=request.endpoint,
            method=request.method,
            response=ai_result.response_data,
            headers=ai_result.headers,
            status_code=ai_result.status_code,
            delay_ms=0,  # No delay for AI-generated mocks by default
            is_public=is_public,
            tags=final_tags,
        )

        # Extract JWT token from request headers for RLS
        auth_header = http_request.headers.get("authorization", "")
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

        # Save the mock using MockService
        mock_service = MockService(db, user_token=user_token)
        saved_mock = await mock_service.create_mock(UUID(user_id), mock_data)

        logger.info(f"AI-generated mock saved for user {user_id}: {request.endpoint}")
        return MockResponse(**saved_mock.dict())

    except ValidationError as e:
        logger.error(f"Validation error in AI generation: {e}")
        error_details = [
            {"field": error["loc"][-1], "message": error["msg"]} for error in e.errors()
        ]
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "VALIDATION_ERROR",
                "message": "Invalid request data",
                "details": error_details,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in AI generation and save: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=AIErrorResponse(
                error="AI_SAVE_ERROR",
                message="Failed to generate and save mock. Please try again.",
            ).dict(),
        )


@router.get("/health")
async def ai_health_check(ai_service: AIService = Depends(get_ai_service)):
    """
    Check AI service health and availability

    Returns the status of AI providers and current configuration.
    Useful for monitoring and debugging AI integration.
    """
    try:
        # Check which providers are available
        providers_status = {
            "openai": bool(ai_service.openai_api_key),
            "anthropic": bool(ai_service.anthropic_api_key),
            "fallback": True,  # Always available
        }

        # Determine active provider
        active_provider = await ai_service._select_provider()

        return {
            "status": "healthy",
            "providers": providers_status,
            "active_provider": active_provider.value,
            "default_provider": ai_service.default_provider,
            "timeout": ai_service.generation_timeout,
            "timestamp": "2024-01-15T10:30:00Z",
        }

    except Exception as e:
        logger.error(f"AI health check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": "2024-01-15T10:30:00Z",
            },
        )


@router.get("/usage/{user_id}")
async def get_ai_usage(user_id: UUID, current_user: dict = Depends(get_current_user)):
    """
    Get AI usage statistics for a user

    Returns current usage statistics including request counts,
    token usage, and rate limit status.

    **Note:** Users can only view their own usage statistics.
    """
    # Verify user can access this data
    request_user_id = current_user.get("sub") or current_user.get("id")
    if str(user_id) != request_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: can only view your own usage statistics",
        )

    try:
        # In production, this would query actual usage from database
        # For Phase 2, returning mock usage data
        usage_stats = {
            "user_id": str(user_id),
            "requests_today": 5,
            "requests_this_month": 42,
            "tokens_used_today": 1250,
            "tokens_used_this_month": 15600,
            "rate_limit_remaining": 5,
            "rate_limit_reset": "2024-01-15T11:00:00Z",
            "last_request": "2024-01-15T10:25:00Z",
        }

        return usage_stats

    except Exception as e:
        logger.error(f"Failed to get AI usage for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve usage statistics",
        )
