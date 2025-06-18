"""
Database configuration and Supabase integration
"""
import asyncio
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from postgrest import APIResponse
import httpx
from app.core.config import settings


class SupabaseClient:
    """Supabase client wrapper with connection management"""
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._http_client: Optional[httpx.AsyncClient] = None
    
    @property
    def client(self) -> Client:
        """Get Supabase client instance"""
        if self._client is None:
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
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
                    "Content-Type": "application/json"
                },
                timeout=30.0
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
                settings.supabase_url, 
                settings.supabase_key
            )            # Create authenticated client with user JWT token
            
            # Set authentication headers directly on the client components
            # This is the most reliable way to ensure JWT is used for RLS
            auth_headers = {
                "Authorization": f"Bearer {token}",
                "apikey": settings.supabase_key,
                # Add these headers to ensure proper JWT processing
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Update headers on PostgREST client (used for database operations)
            if hasattr(client, 'postgrest') and hasattr(client.postgrest, 'headers'):
                client.postgrest.headers.update(auth_headers)
            # Update headers on REST session (used for API calls)
            if hasattr(client, 'rest') and hasattr(client.rest, 'session') and hasattr(client.rest.session, 'headers'):
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
    
    async def execute_query(self, query: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Execute raw SQL query"""
        try:
            # Use Supabase RPC for complex queries
            result = self.supabase.client.rpc('execute_sql', {
                'query': query,
                'params': params or {}
            }).execute()
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
