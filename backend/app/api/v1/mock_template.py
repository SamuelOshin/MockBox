from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_database, DatabaseManager
from app.services.mock_service import MockService
from app.schemas.schemas import TemplateListResponse, TemplateResponse, PaginationParams

router = APIRouter(prefix="/mocks/templates", tags=["mock-templates"])

@router.get("", response_model=TemplateListResponse)
async def get_mock_templates(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    tags: Optional[List[str]] = Query(None),
    category: Optional[str] = Query(None),
    db: DatabaseManager = Depends(get_database),
):
    """Get a paginated list of public mock templates (no auth required)"""
    pagination = PaginationParams(page=page, limit=limit)
    service = MockService(db)
    templates, total = await service.list_mock_templates(
        pagination=pagination,
        search=search,
        tags=tags,
        category=category,
        public_only=True,
    )
    return TemplateListResponse.create(
        data=templates,
        total=total,
        page=page,
        limit=limit,
        message="Mock templates fetched successfully."
    )

@router.get("/{template_id}", response_model=TemplateResponse)
async def get_mock_template(
    template_id: UUID,
    db: DatabaseManager = Depends(get_database),
):
    """Get a mock template by ID (no auth required)"""
    service = MockService(db)
    template = await service.get_mock_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Mock template not found")
    return TemplateResponse(**template.dict())
