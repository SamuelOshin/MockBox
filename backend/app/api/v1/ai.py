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
    db: DatabaseManager = Depends(get_database),
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

        # Fetch user plan and quota
        plan_info = await db.get_user_plan_and_quota(UUID(user_id))
        if not plan_info:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No plan assigned or plan not found for user.",
            )
        daily_quota = plan_info.get("daily_request_quota", 0)
        monthly_quota = plan_info.get("monthly_token_quota", 0)

        # Fetch current usage
        from app.core.database import get_usage_stats_for_user
        usage = await get_usage_stats_for_user(UUID(user_id))
        requests_today = usage.get("requests_today", 0)
        tokens_used_this_month = usage.get("tokens_used_this_month", 0)

        # Enforce quota
        if requests_today >= daily_quota:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "DAILY_QUOTA_EXCEEDED",
                    "message": f"You have reached your daily request quota ({daily_quota}).",
                },
            )
        if tokens_used_this_month >= monthly_quota:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "MONTHLY_TOKEN_QUOTA_EXCEEDED",
                    "message": f"You have reached your monthly token quota ({monthly_quota}).",
                },
            )

        # Generate mock data using AI
        result = await ai_service.generate_mock_data(request, UUID(user_id))

        # Upsert usage stats for the user (production ready)
        from app.core.database import upsert_usage_stats_for_user

        await upsert_usage_stats_for_user(UUID(user_id), increment={"requests_today": 1})

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

        # Fetch user plan and quota
        plan_info = await db.get_user_plan_and_quota(UUID(user_id))
        if not plan_info:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No plan assigned or plan not found for user.",
            )
        daily_quota = plan_info.get("daily_request_quota", 0)
        monthly_quota = plan_info.get("monthly_token_quota", 0)

        # Fetch current usage
        from app.core.database import get_usage_stats_for_user
        usage = await get_usage_stats_for_user(UUID(user_id))
        requests_today = usage.get("requests_today", 0)
        tokens_used_this_month = usage.get("tokens_used_this_month", 0)

        # Enforce quota
        if requests_today >= daily_quota:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "DAILY_QUOTA_EXCEEDED",
                    "message": f"You have reached your daily request quota ({daily_quota}).",
                },
            )
        if tokens_used_this_month >= monthly_quota:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "MONTHLY_TOKEN_QUOTA_EXCEEDED",
                    "message": f"You have reached your monthly token quota ({monthly_quota}).",
                },
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
async def get_ai_usage(
    user_id: UUID, 
    current_user: dict = Depends(get_current_user), 
    db: DatabaseManager = Depends(get_database)
):
    """
    Get AI usage statistics for a user with robust error handling and fallbacks.
    """
    # Verify user can access this data
    request_user_id = current_user.get("sub") or current_user.get("id")
    if str(user_id) != request_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: can only view your own usage statistics",
        )

    try:
        from datetime import datetime, timedelta
        from app.core.database import get_usage_stats_for_user

        # Get usage stats with proper error handling
        try:
            usage = await get_usage_stats_for_user(user_id)
        except Exception as db_exc:
            logger.error(f"Database error fetching usage for user {user_id}: {db_exc}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve usage statistics from database",
            )

        # Get plan info with comprehensive fallback strategy
        plan_info = await _get_user_plan_with_fallback(db, user_id)
        
        # Extract plan details with validation
        plan_name = plan_info.get("plan_name", "free")
        daily_request_quota = plan_info.get("daily_request_quota")
        monthly_token_quota = plan_info.get("monthly_token_quota")
        
        # Validate quota values
        if daily_request_quota is None or daily_request_quota < 0:
            logger.warning(f"Invalid daily quota for user {user_id}, using free plan default")
            daily_request_quota = 10
            
        if monthly_token_quota is None or monthly_token_quota < 0:
            logger.warning(f"Invalid monthly quota for user {user_id}, using free plan default")
            monthly_token_quota = 10000

        # Calculate rate_limit_remaining with safety checks
        requests_today = max(0, usage.get("requests_today", 0))
        rate_limit_remaining = max(0, daily_request_quota - requests_today)
        
        # Calculate rate limit reset time (next midnight UTC)
        now = datetime.utcnow()
        next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        rate_limit_reset = next_midnight.isoformat() + "Z"

        usage_stats = {
            "user_id": str(user_id),
            "requests_today": requests_today,
            "requests_this_month": max(0, usage.get("requests_this_month", 0)),
            "tokens_used_today": max(0, usage.get("tokens_used_today", 0)),
            "tokens_used_this_month": max(0, usage.get("tokens_used_this_month", 0)),
            "rate_limit_remaining": rate_limit_remaining,
            "rate_limit_reset": rate_limit_reset,
            "last_request": usage.get("last_request"),
            "plan_name": plan_name,
            "daily_request_quota": daily_request_quota,
            "monthly_token_quota": monthly_token_quota,
            "quota_percentage_used": round((requests_today / daily_request_quota) * 100, 2) if daily_request_quota > 0 else 0,
        }

        # Log successful retrieval for monitoring
        logger.info(f"Usage stats retrieved for user {user_id}: {rate_limit_remaining}/{daily_request_quota} remaining")
        
        return usage_stats

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error retrieving usage for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve usage statistics",
        )


async def _get_user_plan_with_fallback(db: DatabaseManager, user_id: UUID) -> dict:
    """
    Get user plan with simplified fallback logic.
    
    Since database trigger handles new users and get_user_plan_and_quota() 
    returns sensible defaults, we don't need complex fallback logic anymore.
    """
    try:
        # get_user_plan_and_quota now handles all fallback logic internally
        plan_info = await db.get_user_plan_and_quota(user_id)
        
        if plan_info and _is_valid_plan(plan_info):
            return plan_info
        else:
            # This should rarely happen since get_user_plan_and_quota returns defaults
            logger.warning(f"Invalid plan data returned for user {user_id}, using defaults")
            return _get_free_plan_defaults()
            
    except Exception as e:
        logger.error(f"Error getting plan for user {user_id}: {e}")
        return _get_free_plan_defaults()


def _is_valid_plan(plan_info: dict) -> bool:
    """Validate that plan info contains required fields with valid values."""
    required_fields = ["plan_name", "daily_request_quota", "monthly_token_quota"]
    
    if not all(field in plan_info for field in required_fields):
        return False
        
    if not isinstance(plan_info.get("daily_request_quota"), int) or plan_info["daily_request_quota"] < 0:
        return False
        
    if not isinstance(plan_info.get("monthly_token_quota"), int) or plan_info["monthly_token_quota"] < 0:
        return False
        
    return True


def _get_free_plan_defaults() -> dict:
    """Return hardcoded free plan defaults as absolute fallback."""
    return {
        "plan_name": "Free",  # Use "Free" to match database
        "daily_request_quota": 10,
        "monthly_token_quota": 10000,
    }
