"""
Configuration management for MockBox Backend
"""

import os
from functools import lru_cache
from typing import Optional, List
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # App settings
    app_name: str = "MockBox API"
    app_version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"

    # API settings
    api_v1_prefix: str = "/api/v1"
    host: str = "0.0.0.0"
    port: int = 8000

    # Supabase settings
    supabase_url: str
    supabase_key: str
    supabase_jwt_secret: str
    supabase_service_role_key: Optional[str] = None

    # CORS settings (stored as strings, converted to lists via properties)
    _cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000", alias="cors_origins"
    )
    cors_allow_credentials: bool = True
    _cors_allow_methods: str = Field(default="*", alias="cors_allow_methods")
    _cors_allow_headers: str = Field(default="*", alias="cors_allow_headers")

    # JWT settings
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Rate limiting
    rate_limit_per_minute: int = 100

    # Mock simulation settings
    max_response_size_mb: int = 10
    max_delay_seconds: int = 30
    default_timeout_seconds: int = 30

    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as list"""
        return [origin.strip() for origin in self._cors_origins.split(",")]

    @property
    def cors_allow_methods(self) -> List[str]:
        """Get CORS methods as list"""
        if self._cors_allow_methods == "*":
            return ["*"]
        return [method.strip() for method in self._cors_allow_methods.split(",")]

    @property
    def cors_allow_headers(self) -> List[str]:
        """Get CORS headers as list"""
        if self._cors_allow_headers == "*":
            return ["*"]
        return [header.strip() for header in self._cors_allow_headers.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
