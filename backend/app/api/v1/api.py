"""
API v1 router configuration
"""
from fastapi import APIRouter
from app.api.v1 import mocks, simulate, health, ai

router = APIRouter()

# Include all route modules
router.include_router(health.router)
router.include_router(mocks.router)
router.include_router(simulate.router)
router.include_router(ai.router)
