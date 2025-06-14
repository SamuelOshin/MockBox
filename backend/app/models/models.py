"""
Pydantic models for the application
"""
from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class HTTPMethod(str, Enum):
    """HTTP methods enum"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class MockStatus(str, Enum):
    """Mock status enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"


class BaseEntity(BaseModel):
    """Base entity with common fields"""    
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        use_enum_values = True


class User(BaseEntity):
    """User model"""
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "authenticated"
    metadata: Dict[str, Any] = {}
    last_login: Optional[datetime] = None


class Mock(BaseEntity):
    """Mock API endpoint model"""
    user_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    endpoint: str = Field(..., min_length=1, max_length=500)
    method: HTTPMethod
    response: Dict[str, Any] = Field(default_factory=dict)
    headers: Dict[str, str] = Field(default_factory=dict)
    status_code: int = Field(default=200, ge=100, le=599)
    delay_ms: int = Field(default=0, ge=0, le=30000)
    status: MockStatus = MockStatus.ACTIVE
    is_public: bool = False
    tags: List[str] = Field(default_factory=list)
    
    # Analytics
    access_count: int = 0
    last_accessed: Optional[datetime] = None
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
    
    @field_validator("response")
    @classmethod
    def validate_response_size(cls, v):
        """Validate response size"""
        import json
        response_str = json.dumps(v)
        max_size = 10 * 1024 * 1024  # 10MB
        if len(response_str.encode('utf-8')) > max_size:
            raise ValueError("Response size exceeds 10MB limit")
        return v


class MockStats(BaseEntity):
    """Mock usage statistics"""
    mock_id: UUID
    user_id: UUID
    access_logs: List[Dict[str, Any]] = Field(default_factory=list)
    daily_stats: Dict[str, int] = Field(default_factory=dict)
    monthly_stats: Dict[str, int] = Field(default_factory=dict)
    
    # Performance metrics
    avg_response_time: float = 0.0
    total_requests: int = 0
    error_count: int = 0
    last_error: Optional[str] = None


class MockTemplate(BaseEntity):
    """Mock template model"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    category: str = Field(..., min_length=1, max_length=100)
    template_data: Dict[str, Any] = Field(default_factory=dict)
    is_public: bool = True    
    usage_count: int = 0
    created_by: Optional[UUID] = None
    tags: List[str] = Field(default_factory=list)
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        """Validate tags"""
        return [tag.strip().lower() for tag in v if tag.strip()]


class AccessLog(BaseModel):
    """Access log entry"""
    timestamp: datetime
    ip_address: str
    user_agent: Optional[str] = None
    response_time_ms: float
    status_code: int
    error_message: Optional[str] = None
    
    class Config:
        use_enum_values = True


class MockCollection(BaseEntity):
    """Collection of related mocks"""
    user_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    mock_ids: List[UUID] = Field(default_factory=list)
    is_public: bool = False    
    tags: List[str] = Field(default_factory=list)
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v):
        """Validate tags"""
        return [tag.strip().lower() for tag in v if tag.strip()]
