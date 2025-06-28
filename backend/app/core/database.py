"""
Database configuration and Supabase integration
"""

import asyncio
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from postgrest import APIResponse
import httpx
from app.core.config import settings
from uuid import UUID


class SupabaseClient:
    """Supabase client wrapper with connection management"""

    def __init__(self):
        self._client: Optional[Client] = None
        self._http_client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> Client:
        """Get Supabase client instance"""
        if self._client is None:
            self._client = create_client(settings.supabase_url, settings.supabase_key)
        return self._client

    @property
    def http_client(self) -> httpx.AsyncClient:
        """Get async HTTP client for direct API calls"""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(
                base_url=settings.supabase_url,
                headers={
                    "apikey": settings.supabase_key,
                    "Authorization": f"Bearer {settings.supabase_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._http_client

    async def close(self):
        """Close async connections"""
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None


class DatabaseManager:
    """Database operations manager"""

    def __init__(self, user_token: Optional[str] = None):
        self.supabase = SupabaseClient()
        self.user_token = user_token

    def get_client_with_auth(self, user_token: Optional[str] = None) -> Client:
        """Get Supabase client with user authentication"""
        token = user_token or self.user_token
        if token:
            # Create a new client instance for user-authenticated requests
            client = create_client(
                settings.supabase_url, settings.supabase_key
            )  # Create authenticated client with user JWT token

            # Set authentication headers directly on the client components
            # This is the most reliable way to ensure JWT is used for RLS
            auth_headers = {
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_key,
                # Add these headers to ensure proper JWT processing
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            # Update headers on PostgREST client (used for database operations)
            if hasattr(client, "postgrest") and hasattr(client.postgrest, "headers"):
                client.postgrest.headers.update(auth_headers)
            # Update headers on REST session (used for API calls)
            if (
                hasattr(client, "rest")
                and hasattr(client.rest, "session")
                and hasattr(client.rest.session, "headers")
            ):
                client.rest.session.headers.update(auth_headers)

            # Authentication headers configured successfully
            return client
        else:
            # Fall back to default client (anon key)
            return self.supabase.client

    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            response = await self.supabase.http_client.get("/rest/v1/")
            return response.status_code == 200
        except Exception:
            return False

    async def execute_query(
        self, query: str, params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Execute raw SQL query"""
        try:
            # Use Supabase RPC for complex queries
            result = self.supabase.client.rpc(
                "execute_sql", {"query": query, "params": params or {}}
            ).execute()
            return {"success": True, "data": result.data}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def close(self):
        """Close database connections"""
        await self.supabase.close()


# Global database manager instance
db_manager = DatabaseManager()


async def get_database() -> DatabaseManager:
    """Dependency for getting database manager"""
    return db_manager


async def get_database_with_auth(user_token: str) -> DatabaseManager:
    """Dependency for getting database manager with user authentication"""
    return DatabaseManager(user_token=user_token)


async def init_database():
    """Initialize database connections"""
    # Test connection
    is_healthy = await db_manager.health_check()
    if not is_healthy:
        raise Exception("Failed to connect to Supabase database")
    print("✅ Database connection established")


async def close_database():
    """Close database connections"""
    await db_manager.close()
    print("✅ Database connections closed")


async def get_usage_stats_for_user(user_id: UUID, use_service_key: bool = True, user_token: Optional[str] = None) -> dict:
    """
    Fetch AI usage statistics for a user from Supabase (production-ready).
    If use_service_key is True (default), uses the service key (admin privileges, for backend writes/updates).
    If use_service_key is False, uses the user's JWT (for user-facing SELECTs, RLS enforced).
    """
    from datetime import datetime, timedelta
    try:
        if use_service_key:
            client = db_manager.supabase.client
        else:
            db_with_auth = DatabaseManager(user_token=user_token)
            client = db_with_auth.get_client_with_auth()
        # Query usage stats for the user
        response = client.table("ai_usage_stats").select("*").eq("user_id", str(user_id)).single().execute()
        if response.data:
            usage = response.data
            now = datetime.utcnow()
            rate_limit_reset = (now + timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z"
            return {
                "requests_today": usage.get("requests_today", 0),
                "requests_this_month": usage.get("requests_this_month", 0),
                "tokens_used_today": usage.get("tokens_used_today", 0),
                "tokens_used_this_month": usage.get("tokens_used_this_month", 0),
                "rate_limit_remaining": usage.get("rate_limit_remaining", 0),
                "rate_limit_reset": usage.get("rate_limit_reset", rate_limit_reset),
                "last_request": usage.get("last_request", None),
            }
        else:
            return {
                "requests_today": 0,
                "requests_this_month": 0,
                "tokens_used_today": 0,
                "tokens_used_this_month": 0,
                "rate_limit_remaining": 0,
                "rate_limit_reset": (datetime.utcnow() + timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z",
                "last_request": None,
            }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        # Handle Supabase PGRST116 error (no rows found for .single()) gracefully
        if isinstance(e, dict) and e.get("code") == "PGRST116":
            return {
                "requests_today": 0,
                "requests_this_month": 0,
                "tokens_used_today": 0,
                "tokens_used_this_month": 0,
                "rate_limit_remaining": 0,
                "rate_limit_reset": (datetime.utcnow() + timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z",
                "last_request": None,
            }
        logger.error(f"Failed to fetch usage stats for user {user_id}: {e}")
        raise


async def upsert_usage_stats_for_user(user_id: UUID, increment: dict = None) -> None:
    """
    Upsert (insert or update) AI usage statistics for a user in Supabase.
    - If the user does not have a row, create it with initial values.
    - If the user has a row, increment the provided fields atomically.
    - Uses the service key (admin privileges) to bypass RLS for writes.
    Args:
        user_id: UUID of the user
        increment: dict of fields to increment (e.g., {"requests_today": 1, "tokens_used_today": 100})
    """
    from datetime import datetime
    try:
        client = db_manager.supabase.client
        now = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        # Prepare the upsert payload
        payload = {"user_id": str(user_id), "updated_at": now}
        if increment:
            payload.update(increment)
        # Upsert: if row exists, update; else, insert
        response = client.table("ai_usage_stats").upsert(payload, on_conflict=["user_id"]).execute()
        if response.error:
            raise Exception(response.error)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to upsert usage stats for user {user_id}: {e}")
        raise
