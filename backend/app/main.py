"""
Main FastAPI application
"""
import time
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import init_database, close_database
from app.api.v1.api import router as api_v1_router
from app.middleware.rate_limit_middleware import RateLimitMiddleware, SecurityHeadersMiddleware
from app.middleware.security_middleware import AuthenticationMiddleware, SecurityValidationMiddleware
from app.core.rate_limiting import rate_limiter, RATE_LIMITS
from app.services.monitoring import cleanup_monitoring_data


# Rate limiter (legacy - for health check)
limiter = Limiter(key_func=get_remote_address)

# Background task for monitoring cleanup
cleanup_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    global cleanup_task
    
    # Startup
    print("🚀 Starting MockBox Backend...")
    await init_database()
    
    # Initialize rate limiter with Redis if configured
    if settings.redis_url:
        from app.core.rate_limiting import rate_limiter as rl
        rl.__init__(settings.redis_url)
        print(f"✅ Rate limiting initialized with Redis: {settings.redis_url}")
    else:
        print("⚠️  Rate limiting using memory cache (Redis not configured)")
    
    # Start background monitoring cleanup task
    cleanup_task = asyncio.create_task(cleanup_monitoring_data())
    print("✅ Monitoring cleanup task started")
    
    print("✅ Backend startup complete")
    
    yield
    
    # Shutdown
    print("🔄 Shutting down MockBox Backend...")
    
    # Cancel background task
    if cleanup_task:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass
    
    await close_database()
    print("✅ Backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="MockBox - Professional API Mocking Service",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)

# Add rate limiter (legacy for health check)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add security validation middleware (only if enabled)
if settings.enable_security_validation:
    app.add_middleware(SecurityValidationMiddleware)
    print("✅ Security validation middleware enabled")

# Add authentication middleware (only if enabled)
if settings.enable_authentication_middleware:
    app.add_middleware(AuthenticationMiddleware)
    print("✅ Authentication middleware enabled")

# Add advanced rate limiting middleware (only if enabled)
if settings.enable_rate_limiting:
    app.add_middleware(RateLimitMiddleware)
    print("✅ Advanced rate limiting middleware enabled")

# Add security headers middleware (only if enabled)
if settings.enable_security_headers:
    app.add_middleware(SecurityHeadersMiddleware)
    print("✅ Security headers middleware enabled")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.debug else ["localhost", "127.0.0.1"]
)


# Custom middleware for request timing and logging
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add request processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
            "timestamp": time.time()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler"""
    if settings.debug:
        error_detail = str(exc)
    else:
        error_detail = "Internal server error"
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": error_detail,
            "error_code": "INTERNAL_ERROR",
            "timestamp": time.time()
        }
    )


# Health check endpoint
@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    """Health check endpoint"""
    from app.core.database import db_manager
    
    db_healthy = await db_manager.health_check()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "version": settings.app_version,
        "timestamp": time.time(),
        "database": db_healthy,
        "environment": settings.environment
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to MockBox API",
        "version": settings.app_version,
        "docs": "/docs" if settings.debug else "Documentation disabled in production"
    }


# Include API routers
app.include_router(api_v1_router, prefix=settings.api_v1_prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
