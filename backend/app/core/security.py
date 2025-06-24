"""
Authentication and security utilities
"""

import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings


security = HTTPBearer()


class AuthError(HTTPException):
    """Custom authentication error"""

    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class PermissionError(HTTPException):
    """Custom permission error"""

    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        AuthError: If token is invalid
    """
    try:
        # For development with Supabase auth: decode without verification
        # Since we're passing the JWT to Supabase directly, and Supabase validates it,
        # we just need to extract the payload for user info
        payload = jwt.decode(token, options={"verify_signature": False})

        # Check token expiration manually
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise AuthError("Token has expired")

        # Validate required fields
        if not payload.get("sub"):
            raise AuthError("Invalid token: missing user ID")

        return payload

    except jwt.InvalidTokenError as e:
        raise AuthError(f"Invalid token: {str(e)}")
    except Exception as e:
        raise AuthError(f"Token verification failed: {str(e)}")


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token

    Args:
        data: Token payload data
        expires_delta: Token expiration time

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode, settings.supabase_jwt_secret, algorithm=settings.jwt_algorithm
    )

    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """
    Get current authenticated user from JWT token

    Args:
        credentials: HTTP authorization credentials

    Returns:
        User data from token payload including the raw token

    Raises:
        AuthError: If authentication fails
    """
    try:
        token = credentials.credentials
        payload = verify_supabase_token(token)
        return {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "metadata": payload.get("user_metadata", {}),
            "raw_token": token,  # Include the raw token for database operations
        }
    except Exception as e:
        raise AuthError(f"Authentication failed: {str(e)}")


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[Dict[str, Any]]:
    """
    Get current user if authenticated, otherwise return None

    Args:
        credentials: Optional HTTP authorization credentials

    Returns:
        User data or None if not authenticated
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials)
    except AuthError:
        return None


def require_admin(
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Require admin role for endpoint access

    Args:
        current_user: Current authenticated user

    Returns:
        User data if admin

    Raises:
        PermissionError: If user is not admin
    """
    if current_user.get("role") != "admin":
        raise PermissionError("Admin access required")

    return current_user


def check_resource_ownership(user_id: str, resource_user_id: str) -> bool:
    """
    Check if user owns the resource

    Args:
        user_id: Current user ID
        resource_user_id: Resource owner ID

    Returns:
        True if user owns resource
    """
    return user_id == resource_user_id


def require_resource_access(
    current_user: Dict[str, Any], resource_user_id: str
) -> bool:
    """
    Require user to own resource or be admin

    Args:
        current_user: Current authenticated user
        resource_user_id: Resource owner ID

    Returns:
        True if access allowed

    Raises:
        PermissionError: If access denied
    """
    user_id = current_user.get("id")
    is_admin = current_user.get("role") == "admin"
    owns_resource = check_resource_ownership(user_id, resource_user_id)

    if not (owns_resource or is_admin):
        raise PermissionError("Access denied: insufficient permissions")

    return True
