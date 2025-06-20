"""
Configuration management for MockBox Backend
"""
import os
from functools import lru_cache
from typing import Optional, List, Any
from pydantic import field_validator, Field, ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    # App settings
    app_name: str = "MockBox API"
    app_version: str = "1.0.0"
    debug: bool = False    
    environment: str = "development"
    
    # API settings
    api_v1_prefix: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8001
      # Supabase settings
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str
    supabase_service_role_key: Optional[str] = None
    
    # AI Integration settings
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    ai_default_provider: str = "openai"
    ai_rate_limit_per_minute: int = 10
    ai_rate_limit_per_hour: int = 100
    ai_generation_timeout: int = 30  # seconds
    
    # CORS settings - using string fields that get converted to lists
    cors_origins_str: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS"
    )
    cors_allow_credentials: bool = True
    cors_allow_methods_str: str = Field(
        default="*",
        alias="CORS_ALLOW_METHODS"
    )
    cors_allow_headers_str: str = Field(
        default="*",
        alias="CORS_ALLOW_HEADERS"
    )
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]
    
    @property
    def cors_allow_methods(self) -> List[str]:
        """Get CORS methods as list"""
        if self.cors_allow_methods_str.strip() == "*":
            return ["*"]
        return [method.strip() for method in self.cors_allow_methods_str.split(",") if method.strip()]
    
    @property
    def cors_allow_headers(self) -> List[str]:
        """Get CORS headers as list"""
        if self.cors_allow_headers_str.strip() == "*":
            return ["*"]        
        return [header.strip() for header in self.cors_allow_headers_str.split(",") if header.strip()]
    
    # JWT settings
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Rate limiting
    rate_limit_per_minute: int = 100
    
    # Advanced Rate Limiting Configuration
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    enable_rate_limiting: bool = Field(default=True, env="ENABLE_RATE_LIMITING")
    
    # Rate limiting thresholds
    ai_rate_limit: int = Field(default=10, env="AI_RATE_LIMIT")  # per minute
    public_api_rate_limit: int = Field(default=100, env="PUBLIC_API_RATE_LIMIT")  # per minute
    authenticated_rate_limit: int = Field(default=1000, env="AUTHENTICATED_RATE_LIMIT")  # per minute
    anonymous_rate_limit: int = Field(default=60, env="ANONYMOUS_RATE_LIMIT")  # per minute
    simulation_rate_limit: int = Field(default=200, env="SIMULATION_RATE_LIMIT")  # per minute
      # Security settings
    enable_security_headers: bool = Field(default=True, env="ENABLE_SECURITY_HEADERS")
    enable_authentication_middleware: bool = Field(default=True, env="ENABLE_AUTHENTICATION_MIDDLEWARE")
    enable_security_validation: bool = Field(default=True, env="ENABLE_SECURITY_VALIDATION")
    suspicious_activity_threshold: int = Field(default=50, env="SUSPICIOUS_ACTIVITY_THRESHOLD")  # violations per hour

    # Mock simulation settings
    max_response_size_mb: int = 10
    max_delay_seconds: int = 30
    default_timeout_seconds: int = 30


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()