"""
Health check and system status endpoints
"""
import time
from datetime import datetime
from fastapi import APIRouter, Depends
from app.core.config import settings
from app.core.database import DatabaseManager, get_database
from app.schemas.schemas import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])

# Track application start time
start_time = time.time()


@router.get("/", response_model=HealthResponse)
async def health_check(db: DatabaseManager = Depends(get_database)):
    """
    Health check endpoint
    Returns application status and basic system information
    """
    # Check database connectivity
    db_healthy = await db.health_check()
    
    # Calculate uptime
    uptime = time.time() - start_time
    
    return HealthResponse(
        status="healthy" if db_healthy else "unhealthy",
        version=settings.app_version,
        timestamp=datetime.utcnow(),
        database=db_healthy,
        uptime_seconds=round(uptime, 2)
    )


@router.get("/ready")
async def readiness_check(db: DatabaseManager = Depends(get_database)):
    """
    Readiness check for Kubernetes/Docker health checks
    """
    db_healthy = await db.health_check()
    
    if db_healthy:
        return {"status": "ready"}
    else:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not ready"
        )


@router.get("/live")
async def liveness_check():
    """
    Liveness check for Kubernetes/Docker health checks
    """
    return {"status": "alive"}
