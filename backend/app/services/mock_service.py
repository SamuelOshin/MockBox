"""
Mock service - Business logic for mock management
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID, uuid4
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.core.database import DatabaseManager
from app.models.models import Mock, MockStats, HTTPMethod, MockStatus, MockTemplate
from app.schemas.schemas import MockCreate, MockUpdate, PaginationParams


class MockService:
    """Service for mock operations"""

    def __init__(self, db: DatabaseManager, user_token: Optional[str] = None):
        self.db = db
        self.user_token = user_token
        # Use authenticated client if token is provided
        if user_token:
            self.client = db.get_client_with_auth(user_token)
        else:
            self.client = db.supabase.client

    async def create_mock(self, user_id: UUID, mock_data: MockCreate) -> Mock:
        """Create a new mock"""
        try:
            # Check for duplicate endpoint for user
            existing = await self._get_mock_by_endpoint(
                user_id, mock_data.endpoint, mock_data.method
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Mock with endpoint '{mock_data.endpoint}' and method '{mock_data.method}' already exists",
                )

            # Create mock record
            mock_id = uuid4()
            now = datetime.utcnow()
            mock_dict = {
                "id": str(mock_id),
                "user_id": str(user_id),
                "name": mock_data.name,
                "description": mock_data.description,
                "endpoint": mock_data.endpoint,
                "method": mock_data.method.value,
                "response": mock_data.response,
                "headers": mock_data.headers if mock_data.headers else {},
                "status_code": mock_data.status_code,
                "delay_ms": mock_data.delay_ms,
                "status": MockStatus.ACTIVE.value,
                "is_public": mock_data.is_public,
                "tags": mock_data.tags,
                "access_count": 0,
                "last_accessed": None,
                "created_at": now.isoformat(),
                "updated_at": None,
            }
            # Insert into database using authenticated client
            try:
                # Insert the mock into the database
                result = self.client.table("mocks").insert(mock_dict).execute()
            except Exception as e:
                # Handle database insertion errors
                error_message = str(e)
                if (
                    "mocks_user_id_fkey" in error_message
                    or "violates foreign key constraint" in error_message
                ):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found in authentication system. Please ensure you're properly authenticated through Supabase.",
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to create mock: {error_message}",
                    )

            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create mock",
                )

            # Create associated stats record
            await self._create_mock_stats(mock_id, user_id)

            return Mock(**result.data[0])

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating mock: {str(e)}",
            )

    async def get_mock(
        self, mock_id: UUID, user_id: Optional[UUID] = None
    ) -> Optional[Mock]:
        """Get mock by ID"""
        try:
            query = self.client.table("mocks").select("*").eq("id", str(mock_id))

            # If user_id provided, ensure user owns mock or it's public
            if user_id:
                query = query.or_(f"user_id.eq.{user_id},is_public.eq.true")
            else:
                # Public access only
                query = query.eq("is_public", True)

            result = query.execute()

            if not result.data:
                return None

            return Mock(**result.data[0])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching mock: {str(e)}",
            )

    async def list_mocks(
        self,
        user_id: UUID,
        pagination: PaginationParams,
        status_filter: Optional[MockStatus] = None,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Tuple[List[Mock], int]:
        """List user's mocks with filtering and pagination"""
        try:
            # Build query
            query = self.client.table("mocks").select("*", count="exact")
            query = query.eq("user_id", str(user_id))

            # Apply filters
            if status_filter:
                query = query.eq("status", status_filter.value)

            if search:
                search_term = f"%{search}%"
                query = query.or_(
                    f"name.ilike.{search_term},"
                    f"description.ilike.{search_term},"
                    f"endpoint.ilike.{search_term}"
                )

            if tags:
                # Filter by tags (PostgreSQL array contains)
                for tag in tags:
                    query = query.contains("tags", [tag])

            # Apply pagination and ordering
            query = query.order("created_at", desc=True)
            query = query.range(
                pagination.offset, pagination.offset + pagination.limit - 1
            )

            result = query.execute()

            mocks = [Mock(**row) for row in result.data]
            total = result.count if result.count is not None else 0

            return mocks, total

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing mocks: {str(e)}",
            )

    async def update_mock(
        self, mock_id: UUID, user_id: UUID, update_data: MockUpdate
    ) -> Mock:
        """Update mock"""
        try:
            # Check mock exists and user owns it
            existing_mock = await self.get_mock(mock_id, user_id)
            if not existing_mock or existing_mock.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Mock not found or access denied",
                )

            # Prepare update data
            update_dict = {}
            for field, value in update_data.dict(exclude_unset=True).items():
                if value is not None:
                    if field == "method" and hasattr(value, "value"):
                        update_dict[field] = value.value
                    elif field == "status" and hasattr(value, "value"):
                        update_dict[field] = value.value
                    else:
                        update_dict[field] = value

            if update_dict:
                update_dict["updated_at"] = datetime.utcnow().isoformat()
            # Update in database
            result = (
                self.client.table("mocks")
                .update(update_dict)
                .eq("id", str(mock_id))
                .execute()
            )

            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update mock",
                )

            return Mock(**result.data[0])

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating mock: {str(e)}",
            )

    async def delete_mock(self, mock_id: UUID, user_id: UUID) -> bool:
        """Delete mock"""
        try:
            # Check mock exists and user owns it
            existing_mock = await self.get_mock(mock_id, user_id)
            if not existing_mock or existing_mock.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Mock not found or access denied",
                )
            # Delete mock stats first (foreign key constraint)
            self.client.table("mock_stats").delete().eq(
                "mock_id", str(mock_id)
            ).execute()

            # Delete mock
            result = (
                self.client.table("mocks").delete().eq("id", str(mock_id)).execute()
            )

            return len(result.data) > 0

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting mock: {str(e)}",
            )

    async def simulate_mock(
        self, mock_id: UUID, request_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Simulate mock response"""
        start_time = time.time()

        try:
            # Get mock (allow public access)
            mock = await self.get_mock(mock_id)
            if not mock:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Mock not found or not accessible",
                )

            if mock.status != MockStatus.ACTIVE:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Mock is not active",
                )

            # Apply delay if specified
            if mock.delay_ms > 0:
                await asyncio.sleep(mock.delay_ms / 1000.0)

            # Log access
            execution_time = (time.time() - start_time) * 1000
            await self._log_mock_access(
                mock_id, mock.user_id, request_data, execution_time, mock.status_code
            )

            # Prepare response
            response_data = {
                "mock_id": mock_id,
                "response_data": mock.response,
                "headers": mock.headers,
                "status_code": mock.status_code,
                "simulated_delay_ms": mock.delay_ms,
                "execution_time_ms": round(execution_time, 2),
            }

            return response_data

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error simulating mock: {str(e)}",
            )

    async def get_mock_by_endpoint(
        self, endpoint: str, method: HTTPMethod
    ) -> Optional[Mock]:
        """Get mock by endpoint and method (public access)"""
        try:
            result = (
                self.client.table("mocks")
                .select("*")
                .eq("endpoint", endpoint)
                .eq("method", method.value)
                .eq("status", MockStatus.ACTIVE.value)
                .eq("is_public", True)
                .execute()
            )

            if not result.data:
                return None

            return Mock(**result.data[0])

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching mock by endpoint: {str(e)}",
            )

    async def _get_mock_by_endpoint(
        self, user_id: UUID, endpoint: str, method: HTTPMethod
    ) -> Optional[Mock]:
        """Get mock by endpoint and method for specific user"""
        try:
            result = (
                self.client.table("mocks")
                .select("*")
                .eq("user_id", str(user_id))
                .eq("endpoint", endpoint)
                .eq("method", method.value)
                .execute()
            )

            if not result.data:
                return None

            return Mock(**result.data[0])

        except Exception:
            return None

    async def _create_mock_stats(self, mock_id: UUID, user_id: UUID):
        """Create initial stats record for mock"""
        try:
            stats_dict = {
                "id": str(uuid4()),
                "mock_id": str(mock_id),
                "user_id": str(user_id),
                "access_logs": [],
                "daily_stats": {},
                "monthly_stats": {},
                "avg_response_time": 0.0,
                "total_requests": 0,
                "error_count": 0,
                "last_error": None,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": None,
            }

            self.client.table("mock_stats").insert(stats_dict).execute()

        except Exception:
            # Non-critical, log but don't fail
            pass

    async def _log_mock_access(
        self,
        mock_id: UUID,
        user_id: UUID,
        request_data: Dict[str, Any],
        response_time: float,
        status_code: int,
    ):
        """Log mock access for analytics"""
        try:
            now = datetime.utcnow()
            # Update mock access count and last accessed
            self.client.table("mocks").update(
                {"access_count": "access_count + 1", "last_accessed": now.isoformat()}
            ).eq("id", str(mock_id)).execute()

            # Update stats
            access_log = {
                "timestamp": now.isoformat(),
                "ip_address": request_data.get("ip", "unknown"),
                "user_agent": request_data.get("user_agent"),
                "response_time_ms": response_time,
                "status_code": status_code,
            }

            # This would typically be done via a background task or queue
            # For now, we'll do a simple update

        except Exception:
            # Non-critical, log but don't fail the request
            pass

    async def list_public_mocks(
        self, pagination: PaginationParams, search: Optional[str] = None
    ) -> Tuple[List[Mock], int]:
        """List public mocks (no authentication required)"""
        try:
            # Build query for public mocks only
            query = self.client.table("mocks").select("*", count="exact")
            query = query.eq("is_public", True)
            query = query.eq("status", MockStatus.ACTIVE.value)

            # Apply search filter if provided
            if search:
                search_term = f"%{search}%"
                query = query.or_(
                    f"name.ilike.{search_term},"
                    f"description.ilike.{search_term},"
                    f"endpoint.ilike.{search_term}"
                )

            # Apply pagination and ordering
            query = query.order("created_at", desc=True)
            query = query.range(
                pagination.offset, pagination.offset + pagination.limit - 1
            )

            result = query.execute()

            mocks = [Mock(**row) for row in result.data]
            total = result.count if result.count is not None else 0

            return mocks, total

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing public mocks: {str(e)}",
            )

    async def list_mock_templates(
        self,
        pagination: PaginationParams,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None,
        category: Optional[str] = None,
        public_only: bool = True,
    ) -> Tuple[List[MockTemplate], int]:
        """List mock templates with filtering and pagination"""
        try:
            query = self.client.table("mock_templates").select("*", count="exact")
            if public_only:
                query = query.eq("is_public", True)
            if category:
                query = query.eq("category", category)
            if search:
                search_term = f"%{search}%"
                query = query.or_(
                    f"name.ilike.{search_term},description.ilike.{search_term},category.ilike.{search_term}"
                )
            if tags:
                for tag in tags:
                    query = query.contains("tags", [tag])
            query = query.order("created_at", desc=True)
            query = query.range(pagination.offset, pagination.offset + pagination.limit - 1)
            result = query.execute()
            templates = [MockTemplate(**row) for row in result.data]
            total = result.count if result.count is not None else 0
            return templates, total
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing mock templates: {str(e)}",
            )

    async def get_mock_template(self, template_id: UUID) -> Optional[MockTemplate]:
        """Get a mock template by ID"""
        try:
            result = self.client.table("mock_templates").select("*").eq("id", str(template_id)).single().execute()
            if not result.data:
                return None
            return MockTemplate(**result.data)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching mock template: {str(e)}",
            )
