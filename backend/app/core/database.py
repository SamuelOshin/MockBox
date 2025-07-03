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
import logging

# Set up a module-level logger
logger = logging.getLogger(__name__)


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
        # Admin client for operations that require service role
        self.admin_client = create_client(
            settings.supabase_url, 
            settings.supabase_service_role_key
        )

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

    async def _create_usage_stats_fallback(self, user_id: UUID):
        """
        Simple fallback to create usage stats for legacy users.
        New users are handled by the database trigger automatically.
        """
        try:
            # Use admin client to create usage stats
            self.admin_client.table("ai_usage_stats")\
                .insert({
                    "user_id": str(user_id),
                    "rate_limit_remaining": 10  # Free plan default
                })\
                .execute()
            
            logger.info(f"Created fallback usage stats for legacy user {user_id}")
            
        except Exception as e:
            # If it already exists, that's fine
            if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
                logger.debug(f"Usage stats already exist for user {user_id}")
            else:
                logger.error(f"Failed to create fallback usage stats for user {user_id}: {e}")

    async def get_user_plan_and_quota(self, user_id: UUID) -> Dict[str, Any]:
        """
        Get user plan information and quotas.
        
        With database trigger in place, all users should have profiles automatically.
        Returns default Free plan values if profile is missing (legacy users).
        """
        try:
            # Use admin client for reliable data access
            response = self.admin_client.table("profiles")\
                .select("plan_id, user_plans(name, daily_request_quota, monthly_token_quota)")\
                .eq("user_id", str(user_id))\
                .execute()
            
            if response.data and len(response.data) > 0:
                profile = response.data[0]
                plan = profile.get("user_plans")
                
                if plan:
                    return {
                        "plan_name": plan.get("name"),
                        "daily_request_quota": plan.get("daily_request_quota"),
                        "monthly_token_quota": plan.get("monthly_token_quota"),
                    }
                else:
                    logger.warning(f"Profile exists but no plan found for user {user_id}")
            else:
                logger.warning(f"No profile found for user {user_id}. Trigger should handle this for new users.")
        
            # Return default Free plan values for legacy users or missing profiles
            return {
                "plan_name": "Free",
                "daily_request_quota": 10,
                "monthly_token_quota": 10000,
            }
            
        except Exception as e:
            logger.error(f"Error fetching user plan for {user_id}: {e}")
            # Return default Free plan as last resort
            return {
                "plan_name": "Free",
                "daily_request_quota": 10,
                "monthly_token_quota": 10000,
            }




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


async def get_usage_stats_for_user(
    user_id: UUID, use_service_key: bool = True, user_token: Optional[str] = None
) -> dict:
    """
    Fetch AI usage statistics for a user from Supabase (production-ready).
    
    With database trigger in place, usage stats should exist for all users.
    If use_service_key is True (default), uses the service key (admin privileges, for backend writes/updates).
    If use_service_key is False, uses the user's JWT (for user-facing SELECTs, RLS enforced).
    """
    from datetime import datetime, timedelta

    try:
        if use_service_key:
            # Use admin client for better reliability
            client = db_manager.admin_client
        else:
            db_with_auth = DatabaseManager(user_token=user_token)
            client = db_with_auth.get_client_with_auth()
            
        # Query usage stats for the user
        response = (
            client.table("ai_usage_stats")
            .select("*")
            .eq("user_id", str(user_id))
            .single()
            .execute()
        )
        
        if response.data:
            usage = response.data
            now = datetime.utcnow()
            rate_limit_reset = (
                (now + timedelta(hours=1)).replace(microsecond=0).isoformat() + "Z"
            )
            return {
                "requests_today": usage.get("requests_today", 0),
                "requests_this_month": usage.get("requests_this_month", 0),
                "tokens_used_today": usage.get("tokens_used_today", 0),
                "tokens_used_this_month": usage.get("tokens_used_this_month", 0),
                "rate_limit_remaining": usage.get("rate_limit_remaining", 10),  # Default for Free plan
                "rate_limit_reset": usage.get("rate_limit_reset", rate_limit_reset),
                "last_request": usage.get("last_request", None),
            }
        else:
            # If no usage stats found, create them as fallback for legacy users
            logger.warning(f"No usage stats found for user {user_id}. Creating as fallback for legacy user.")
            await db_manager._create_usage_stats_fallback(user_id)
            
            # Return default values
            return {
                "requests_today": 0,
                "requests_this_month": 0,
                "tokens_used_today": 0,
                "tokens_used_this_month": 0,
                "rate_limit_remaining": 10,  # Free plan default
                "rate_limit_reset": (
                    datetime.utcnow() + timedelta(hours=1)
                ).replace(microsecond=0).isoformat() + "Z",
                "last_request": None,
            }
    except Exception as e:
        logger = logging.getLogger(__name__)
        
        # Handle Supabase PGRST116 error (no rows found for .single()) gracefully
        if hasattr(e, 'args') and len(e.args) > 0 and isinstance(e.args[0], dict):
            error_dict = e.args[0]
            if error_dict.get("code") == "PGRST116":
                logger.warning(f"No usage stats record found for user {user_id}. Creating as fallback for legacy user.")
                try:
                    await db_manager._create_usage_stats_fallback(user_id)
                    # Return default values after creating
                    return {
                        "requests_today": 0,
                        "requests_this_month": 0,
                        "tokens_used_today": 0,
                        "tokens_used_this_month": 0,
                        "rate_limit_remaining": 10,  # Free plan default
                        "rate_limit_reset": (
                            datetime.utcnow() + timedelta(hours=1)
                        ).replace(microsecond=0).isoformat() + "Z",
                        "last_request": None,
                    }
                except Exception as create_error:
                    logger.error(f"Failed to create usage stats for user {user_id}: {create_error}")
                    # Return defaults even if creation fails
                    return {
                        "requests_today": 0,
                        "requests_this_month": 0,
                        "tokens_used_today": 0,
                        "tokens_used_this_month": 0,
                        "rate_limit_remaining": 10,  # Free plan default
                        "rate_limit_reset": (
                            datetime.utcnow() + timedelta(hours=1)
                        ).replace(microsecond=0).isoformat() + "Z",
                        "last_request": None,
                    }
        
        logger.error(f"Failed to fetch usage stats for user {user_id}: {e}")
        # Return default values as last resort instead of raising
        return {
            "requests_today": 0,
            "requests_this_month": 0,
            "tokens_used_today": 0,
            "tokens_used_this_month": 0,
            "rate_limit_remaining": 10,  # Free plan default
            "rate_limit_reset": (
                datetime.utcnow() + timedelta(hours=1)
            ).replace(microsecond=0).isoformat() + "Z",
            "last_request": None,
        }


async def upsert_usage_stats_for_user(user_id: UUID, increment: dict = None) -> None:
    """
    Upsert (insert or update) AI usage statistics for a user in Supabase.
    - If the user does not have a row, create it with initial values.
    - If the user has a row, increment the provided fields atomically.
    - Uses the admin client (service key) to bypass RLS for writes.
    
    With database trigger in place, this should mainly be used for updates.
    
    Args:
        user_id: UUID of the user
        increment: dict of fields to increment (e.g., {"requests_today": 1, "tokens_used_today": 100})
    """
    from datetime import datetime
    import logging

    logger = logging.getLogger(__name__)

    try:
        # Use admin client for reliable writes
        client = db_manager.admin_client
        now = datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
        
        # Prepare the upsert payload
        payload = {"user_id": str(user_id), "updated_at": now}
        if increment:
            payload.update(increment)
            
        # Upsert: if row exists, update; else, insert
        response = (
            client.table("ai_usage_stats")
            .upsert(payload, on_conflict=["user_id"])
            .execute()
        )
        
        # Check for errors (Supabase client doesn't have .error attribute)
        if hasattr(response, 'error') and response.error:
            raise Exception(response.error)
            
        logger.debug(f"Updated usage stats for user {user_id}: {increment}")
        
    except Exception as e:
        logger.error(f"Failed to upsert usage stats for user {user_id}: {e}")
        raise