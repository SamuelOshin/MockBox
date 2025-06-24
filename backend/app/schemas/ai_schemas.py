"""
Pydantic schemas for AI-powered features
"""

from datetime import datetime
from typing import Dict, Any, Optional, List
from uuid import UUID
from pydantic import BaseModel, Field
from enum import Enum

# Import HTTPMethod from models
from app.models.models import HTTPMethod


class AIProvider(str, Enum):
    """AI provider options"""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"


class ResponseFormat(str, Enum):
    """Response format options"""

    JSON = "json"
    XML = "xml"
    TEXT = "text"
    HTML = "html"


class MockGenerationRequest(BaseModel):
    """Request schema for AI mock generation"""

    method: HTTPMethod = Field(..., description="HTTP method (GET, POST, etc.)")
    endpoint: str = Field(..., description="API endpoint path")
    description: Optional[str] = Field(
        None, description="Description of what the API should do"
    )
    response_format: ResponseFormat = Field(
        ResponseFormat.JSON, description="Expected response format"
    )
    schema_hint: Optional[str] = Field(
        None, description="Expected response schema or structure"
    )
    examples: Optional[List[Dict[str, Any]]] = Field(
        None, description="Example responses for reference"
    )
    complexity: str = Field(
        "medium", description="Complexity level: simple, medium, complex"
    )
    status_code: int = Field(
        200, description="Expected HTTP status code", ge=100, le=599
    )
    include_headers: bool = Field(
        True, description="Whether to generate response headers"
    )
    realistic_data: bool = Field(
        True, description="Generate realistic vs placeholder data"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "method": "GET",
                "endpoint": "/api/users/123",
                "description": "Get user profile information with avatar and preferences",
                "response_format": "json",
                "schema_hint": "User object with id, name, email, avatar, created_at, preferences",
                "complexity": "medium",
                "status_code": 200,
                "include_headers": True,
                "realistic_data": True,
            }
        }


class MockGenerationResponse(BaseModel):
    """Response schema for AI mock generation"""

    response_data: Dict[str, Any] = Field(
        ..., description="Generated mock response data"
    )
    status_code: int = Field(200, description="HTTP status code")
    headers: Dict[str, str] = Field(
        default_factory=dict, description="Response headers"
    )
    explanation: str = Field(..., description="Explanation of the generated data")
    provider: AIProvider = Field(..., description="AI provider used")
    model: str = Field(..., description="AI model used")
    generation_time: float = Field(
        ..., description="Time taken for generation in seconds"
    )
    tokens_used: Optional[int] = Field(None, description="Number of tokens used")

    class Config:
        json_schema_extra = {
            "example": {
                "response_data": {
                    "id": "usr_123",
                    "name": "Alex Johnson",
                    "email": "alex.johnson@example.com",
                    "avatar": "https://api.example.com/avatars/alex.jpg",
                    "created_at": "2024-01-15T10:30:00Z",
                    "preferences": {
                        "theme": "dark",
                        "notifications": True,
                        "language": "en",
                    },
                },
                "status_code": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-cache",
                    "X-API-Version": "1.0",
                },
                "explanation": "Generated a realistic user profile with common user attributes and preferences",
                "provider": "openai",
                "model": "gpt-4o-mini",
                "generation_time": 1.25,
                "tokens_used": 156,
            }
        }


class AIUsageStats(BaseModel):
    """AI usage statistics"""

    user_id: UUID
    requests_today: int = 0
    requests_this_month: int = 0
    tokens_used_today: int = 0
    tokens_used_this_month: int = 0
    last_request: Optional[datetime] = None
    rate_limit_exceeded: bool = False


class AIErrorResponse(BaseModel):
    """AI error response schema"""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(
        None, description="Additional error details"
    )
    retry_after: Optional[int] = Field(
        None, description="Seconds to wait before retrying"
    )
    provider: Optional[str] = Field(None, description="AI provider that failed")
