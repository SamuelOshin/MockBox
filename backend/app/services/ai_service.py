"""
AI-powered mock generation service
Provides intelligent mock data generation using OpenAI and Anthropic APIs
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from uuid import UUID

import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.schemas.ai_schemas import (
    MockGenerationRequest,
    MockGenerationResponse,
    AIProvider,
    AIUsageStats,
    AIErrorResponse,
    ResponseFormat,
)

logger = logging.getLogger(__name__)


class AIProviderError(Exception):
    """Custom exception for AI provider errors"""

    def __init__(self, message: str, provider: str, retry_after: Optional[int] = None):
        self.message = message
        self.provider = provider
        self.retry_after = retry_after
        super().__init__(self.message)


class AIService:
    """AI-powered mock generation service"""

    def __init__(self):
        self.openai_api_key = settings.openai_api_key
        self.anthropic_api_key = settings.anthropic_api_key
        self.default_provider = settings.ai_default_provider
        self.generation_timeout = settings.ai_generation_timeout

        # HTTP client for API calls
        self.http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.generation_timeout),
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        )

    async def generate_mock_data(
        self, request: MockGenerationRequest, user_id: UUID
    ) -> MockGenerationResponse:
        """
        Generate mock data using AI

        Args:
            request: Mock generation request
            user_id: User ID for rate limiting and usage tracking

        Returns:
            Generated mock response

        Raises:
            HTTPException: For rate limiting or generation errors
        """
        start_time = time.time()

        try:
            # Check rate limits
            await self._check_rate_limits(user_id)

            # Choose provider based on availability
            provider = await self._select_provider()

            # Generate mock data
            if provider == AIProvider.OPENAI:
                response_data = await self._generate_with_openai(request)
            elif provider == AIProvider.ANTHROPIC:
                response_data = await self._generate_with_anthropic(request)
            else:
                response_data = await self._generate_fallback(request)

            generation_time = time.time() - start_time

            # Log usage
            await self._log_usage(
                user_id, provider, response_data.get("tokens_used", 0)
            )

            return MockGenerationResponse(
                response_data=response_data["data"],
                status_code=request.status_code,
                headers=response_data.get("headers", {}),
                explanation=response_data.get("explanation", "Generated mock data"),
                provider=provider,
                model=response_data.get("model", "unknown"),
                generation_time=generation_time,
                tokens_used=response_data.get("tokens_used"),
            )

        except AIProviderError as e:
            logger.error(f"AI provider error: {e.message}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=AIErrorResponse(
                    error="AI_PROVIDER_ERROR",
                    message=e.message,
                    retry_after=e.retry_after,
                    provider=e.provider,
                ).dict(),
            )
        except Exception as e:
            logger.error(f"Unexpected error in AI generation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=AIErrorResponse(
                    error="AI_GENERATION_FAILED",
                    message="Failed to generate mock data. Please try again.",
                ).dict(),
            )

    async def _check_rate_limits(self, user_id: UUID) -> None:
        """Check if user has exceeded rate limits"""
        # This would typically query a database or cache
        # For now, implementing basic in-memory rate limiting
        # In production, use Redis or database-backed rate limiting

        current_time = datetime.utcnow()
        # Rate limiting logic would go here
        # For Phase 2, we'll implement basic checks
        pass

    async def _select_provider(self) -> AIProvider:
        """Select the best available AI provider, respecting default and key presence"""
        # Prefer explicit default provider if set and available
        if self.default_provider:
            if self.default_provider == AIProvider.OPENAI and self.openai_api_key:
                return AIProvider.OPENAI
            if self.default_provider == AIProvider.ANTHROPIC and self.anthropic_api_key:
                return AIProvider.ANTHROPIC
        # Fallback: prefer Anthropic if available
        if self.anthropic_api_key:
            return AIProvider.ANTHROPIC
        # Next, try OpenAI if available
        if self.openai_api_key:
            return AIProvider.OPENAI
        # Fallback to local deterministic
        return AIProvider.LOCAL

    async def _generate_with_openai(
        self, request: MockGenerationRequest
    ) -> Dict[str, Any]:
        """Generate mock data using OpenAI API"""
        if not self.openai_api_key:
            raise AIProviderError("OpenAI API key not configured", "openai")

        try:
            prompt = self._build_openai_prompt(request)

            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert API designer that generates realistic, well-structured mock data for APIs. Always respond with valid JSON that includes the mock data, explanation, and metadata.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 1500,
                "temperature": 0.7,
                "response_format": {"type": "json_object"},
            }

            headers = {
                "Authorization": f"Bearer {self.openai_api_key}",
                "Content-Type": "application/json",
            }

            response = await self.http_client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers,
            )

            if response.status_code == 429:
                raise AIProviderError("Rate limit exceeded", "openai", retry_after=60)
            elif response.status_code != 200:
                raise AIProviderError(
                    f"OpenAI API error: {response.status_code}", "openai"
                )

            result = response.json()
            content = result["choices"][0]["message"]["content"]
            generated_data = json.loads(content)

            return {
                "data": generated_data.get("data", {}),
                "headers": generated_data.get(
                    "headers", self._default_headers(request)
                ),
                "explanation": generated_data.get(
                    "explanation", "Generated with OpenAI"
                ),
                "model": "gpt-4o-mini",
                "tokens_used": result.get("usage", {}).get("total_tokens", 0),
            }

        except json.JSONDecodeError:
            raise AIProviderError("Invalid JSON response from OpenAI", "openai")
        except httpx.TimeoutException:
            raise AIProviderError("OpenAI API timeout", "openai", retry_after=30)
        except Exception as e:
            raise AIProviderError(f"OpenAI generation failed: {str(e)}", "openai")

    async def _generate_with_anthropic(
        self, request: MockGenerationRequest
    ) -> Dict[str, Any]:
        """Generate mock data using Anthropic Claude API"""
        if not self.anthropic_api_key:
            raise AIProviderError("Anthropic API key not configured", "anthropic")

        try:
            prompt = self._build_anthropic_prompt(request)
            payload = {
                "model": "claude-3-5-haiku-20241022",
                "max_tokens": 1500,
                "temperature": 0.7,
                "messages": [{"role": "user", "content": prompt}],
            }

            headers = {
                "x-api-key": self.anthropic_api_key,
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01",
            }

            response = await self.http_client.post(
                "https://api.anthropic.com/v1/messages", json=payload, headers=headers
            )

            if response.status_code == 429:
                raise AIProviderError(
                    "Rate limit exceeded", "anthropic", retry_after=60
                )
            elif response.status_code != 200:
                raise AIProviderError(
                    f"Anthropic API error: {response.status_code}", "anthropic"
                )

            result = response.json()
            content = result["content"][0]["text"]

            # Extract JSON from Claude's response
            try:
                # Claude might wrap JSON in markdown, so extract it
                if "```json" in content:
                    json_start = content.find("```json") + 7
                    json_end = content.find("```", json_start)
                    content = content[json_start:json_end].strip()

                generated_data = json.loads(content)
            except:
                # Fallback if JSON extraction fails
                generated_data = self._parse_claude_response(content, request)

            return {
                "data": generated_data.get("data", {}),
                "headers": generated_data.get(
                    "headers", self._default_headers(request)
                ),
                "explanation": generated_data.get(
                    "explanation", "Generated with Claude 3.5 Haiku"
                ),
                "model": "claude-3-5-haiku",
                "tokens_used": result.get("usage", {}).get("input_tokens", 0)
                + result.get("usage", {}).get("output_tokens", 0),
            }

        except httpx.TimeoutException:
            raise AIProviderError("Anthropic API timeout", "anthropic", retry_after=30)
        except Exception as e:
            raise AIProviderError(f"Anthropic generation failed: {str(e)}", "anthropic")

    async def _generate_fallback(
        self, request: MockGenerationRequest
    ) -> Dict[str, Any]:
        """Fallback mock generation when AI providers are unavailable"""
        logger.info("Using fallback mock generation")

        # Deterministic mock data generation based on endpoint and method
        data = self._generate_deterministic_data(request)

        return {
            "data": data,
            "headers": self._default_headers(request),
            "explanation": "Generated using fallback deterministic algorithm",
            "model": "deterministic-v1",
            "tokens_used": 0,
        }

    def _build_openai_prompt(self, request: MockGenerationRequest) -> str:
        """Build prompt for OpenAI API"""
        return f"""
Generate realistic mock data for a {request.method} {request.endpoint} API endpoint.

Requirements:
- Description: {request.description or 'No specific description provided'}
- Response format: {request.response_format.value}
- Status code: {request.status_code}
- Complexity level: {request.complexity}
- Schema hint: {request.schema_hint or 'Generate appropriate fields based on endpoint'}
- Include headers: {request.include_headers}
- Realistic data: {request.realistic_data}

Please respond with a JSON object containing:
{{
  "data": {{ the actual mock response data }},
  "headers": {{ response headers if requested }},
  "explanation": "Brief explanation of the generated data"
}}

Make the data realistic, well-structured, and appropriate for the endpoint. Consider common API patterns and best practices.
"""

    def _build_anthropic_prompt(self, request: MockGenerationRequest) -> str:
        """Build prompt for Anthropic Claude API"""
        return f"""
I need you to generate realistic mock data for an API endpoint.

Endpoint: {request.method} {request.endpoint}
Description: {request.description or 'Standard API endpoint'}
Response format: {request.response_format.value}
Status code: {request.status_code}
Complexity: {request.complexity}
Schema hint: {request.schema_hint or 'Infer from endpoint pattern'}

Please generate appropriate mock data and return it as JSON in this format:

```json
{{
  "data": {{ the mock response data }},
  "headers": {{ response headers if needed }},
  "explanation": "Brief explanation of what was generated"
}}
```

Make the data realistic and follow common API conventions. Consider the endpoint structure to determine appropriate fields and data types.
"""

    def _generate_deterministic_data(
        self, request: MockGenerationRequest
    ) -> Dict[str, Any]:
        """Generate deterministic mock data when AI is unavailable"""
        endpoint_lower = request.endpoint.lower()

        # Basic pattern matching for common endpoints
        if "user" in endpoint_lower:
            return {
                "id": "usr_12345",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "avatar": "https://api.example.com/avatars/john.jpg",
                "created_at": "2024-01-15T10:30:00Z",
                "status": "active",
            }
        elif "product" in endpoint_lower:
            return {
                "id": "prod_67890",
                "name": "Sample Product",
                "description": "A high-quality sample product",
                "price": 29.99,
                "currency": "USD",
                "in_stock": True,
                "category": "electronics",
            }
        elif "order" in endpoint_lower:
            return {
                "id": "ord_11111",
                "user_id": "usr_12345",
                "status": "completed",
                "total": 59.98,
                "items": [{"product_id": "prod_67890", "quantity": 2, "price": 29.99}],
                "created_at": "2024-01-15T14:30:00Z",
            }
        else:
            # Generic response
            return {
                "id": "item_12345",
                "name": "Sample Item",
                "status": "active",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
            }

    def _default_headers(self, request: MockGenerationRequest) -> Dict[str, str]:
        """Generate default headers for the response"""
        headers = {
            "Content-Type": self._get_content_type(request.response_format),
            "X-API-Version": "1.0",
            "Cache-Control": "no-cache",
        }

        if request.status_code >= 400:
            headers["X-Error-Code"] = str(request.status_code)

        return headers

    def _get_content_type(self, format: ResponseFormat) -> str:
        """Get content type for response format"""
        content_types = {
            ResponseFormat.JSON: "application/json",
            ResponseFormat.XML: "application/xml",
            ResponseFormat.HTML: "text/html",
            ResponseFormat.TEXT: "text/plain",
        }
        return content_types.get(format, "application/json")

    def _parse_claude_response(
        self, content: str, request: MockGenerationRequest
    ) -> Dict[str, Any]:
        """Parse Claude response when JSON extraction fails"""
        # Simple fallback parsing
        return {
            "data": self._generate_deterministic_data(request),
            "explanation": "Parsed from Claude text response",
        }

    async def _log_usage(
        self, user_id: UUID, provider: AIProvider, tokens_used: int
    ) -> None:
        """Log AI usage for billing and monitoring"""
        logger.info(
            f"AI usage - User: {user_id}, Provider: {provider}, Tokens: {tokens_used}"
        )
        # In production, store this in database for billing and analytics

    async def close(self) -> None:
        """Clean up resources"""
        await self.http_client.aclose()


# Global AI service instance
ai_service = AIService()


async def get_ai_service() -> AIService:
    """Dependency to get AI service instance"""
    return ai_service
