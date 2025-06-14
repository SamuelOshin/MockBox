"""
API request and response schemas
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, field_validator
from app.models.models import HTTPMethod, MockStatus


class ExportFormat(str, Enum):
    """Export format enum"""
    JSON = "json"
    POSTMAN = "postman"
    OPENAPI = "openapi"
    INSOMNIA = "insomnia"


class BaseResponse(BaseModel):
    """Base response schema"""
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseResponse):
    """Error response schema"""
    success: bool = False
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseResponse):
    """Paginated response schema"""
    data: List[Any] = []
    pagination: Dict[str, Any] = {}
    
    @classmethod
    def create(
        cls,
        data: List[Any],
        total: int,
        page: int,
        limit: int,
        message: Optional[str] = None
    ):
        """Create paginated response"""
        total_pages = (total + limit - 1) // limit
        return cls(
            data=data,
            message=message,
            pagination={
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        )


# Mock Schemas
class MockCreate(BaseModel):
    """Create mock request schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    endpoint: str = Field(..., min_length=1, max_length=500)
    method: HTTPMethod
    response: Dict[str, Any] = Field(default_factory=dict)
    headers: Dict[str, str] = Field(default_factory=dict)
    status_code: int = Field(default=200, ge=100, le=599)
    delay_ms: int = Field(default=0, ge=0, le=30000)
    is_public: bool = False    
    tags: List[str] = Field(default_factory=list)
    
    @field_validator("endpoint")
    @classmethod
    def validate_endpoint(cls, v):
        """Validate endpoint format"""
        if not v.startswith("/"):
            v = "/" + v
        return v
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        """Validate tags"""
        return [tag.strip().lower() for tag in v if tag.strip()]


class MockUpdate(BaseModel):
    """Update mock request schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    endpoint: Optional[str] = Field(None, min_length=1, max_length=500)
    method: Optional[HTTPMethod] = None
    response: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, str]] = None
    status_code: Optional[int] = Field(None, ge=100, le=599)
    delay_ms: Optional[int] = Field(None, ge=0, le=30000)
    status: Optional[MockStatus] = None
    is_public: Optional[bool] = None    
    tags: Optional[List[str]] = None
    
    @field_validator("endpoint")
    @classmethod
    def validate_endpoint(cls, v):
        """Validate endpoint format"""
        if v and not v.startswith("/"):
            v = "/" + v
        return v
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        """Validate tags"""
        if v is not None:
            return [tag.strip().lower() for tag in v if tag.strip()]
        return v


class MockResponse(BaseModel):
    """Mock response schema"""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str]
    endpoint: str
    method: HTTPMethod
    response: Dict[str, Any]
    headers: Dict[str, str]
    status_code: int
    delay_ms: int
    status: MockStatus
    is_public: bool
    tags: List[str]
    access_count: int
    last_accessed: Optional[datetime]
    created_at: datetime    
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class MockListResponse(PaginatedResponse):
    """Mock list response schema"""
    data: List[MockResponse] = []


class MockSimulateResponse(BaseModel):
    """Mock simulation response schema"""
    mock_id: UUID
    response_data: Any
    headers: Dict[str, str]
    status_code: int
    simulated_delay_ms: int
    execution_time_ms: float


# Template Schemas
class TemplateCreate(BaseModel):
    """Create template request schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: str = Field(..., min_length=1, max_length=100)
    template_data: Dict[str, Any] = Field(default_factory=dict)
    is_public: bool = True    
    tags: List[str] = Field(default_factory=list)
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        """Validate tags"""
        return [tag.strip().lower() for tag in v if tag.strip()]


class TemplateResponse(BaseModel):
    """Template response schema"""
    id: UUID
    name: str
    description: Optional[str]
    category: str
    template_data: Dict[str, Any]
    is_public: bool
    usage_count: int
    created_by: Optional[UUID]
    tags: List[str]
    created_at: datetime   
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TemplateListResponse(PaginatedResponse):
    """Template list response schema"""
    data: List[TemplateResponse] = []


# Analytics Schemas
class AnalyticsQuery(BaseModel):
    """Analytics query parameters"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    mock_ids: Optional[List[UUID]] = None
    group_by: Optional[str] = Field(None, pattern="^(day|week|month)$")


class AnalyticsResponse(BaseModel):
    """Analytics response schema"""
    total_requests: int
    unique_mocks: int
    avg_response_time: float
    error_rate: float
    timeline_data: List[Dict[str, Any]]
    top_mocks: List[Dict[str, Any]]    
    status_code_distribution: Dict[str, int]
    
    class Config:
        from_attributes = True


# Export Schemas
class ExportRequest(BaseModel):
    """Export request schema"""
    mock_ids: List[UUID]
    format: ExportFormat
    include_stats: bool = False
    include_headers: bool = True


class ExportResponse(BaseModel):
    """Export response schema"""
    format: ExportFormat
    data: Dict[str, Any]
    exported_count: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Health Check Schema
class HealthResponse(BaseModel):
    """Health check response schema"""
    status: str = "healthy"
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database: bool = True
    uptime_seconds: float
