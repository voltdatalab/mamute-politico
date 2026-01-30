"""Rotas relacionadas a parlamentares."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from mamute_scrappers.db.models.parliamentarian import Parliamentarian

from ..dependencies import get_db

router = APIRouter(prefix="/parliamentarians", tags=["parliamentarians"])


class ParliamentarianOut(BaseModel):
    """Representação serializada de um parlamentar."""

    id: int
    type: Optional[str] = None
    parliamentarian_code: Optional[int] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    cpf: Optional[str] = None
    status: Optional[str] = None
    party: Optional[str] = None
    state_of_birth: Optional[str] = None
    city_of_birth: Optional[str] = None
    state_elected: Optional[str] = None
    site: Optional[str] = None
    education: Optional[str] = None
    office_name: Optional[str] = None
    office_building: Optional[str] = None
    office_number: Optional[str] = None
    office_floor: Optional[str] = None
    office_email: Optional[str] = None
    biography_link: Optional[str] = None
    biography_text: Optional[str] = None
    details: Optional[dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=list[ParliamentarianOut])
def list_parliamentarians(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    party: Optional[str] = Query(default=None, description="Filtrar por partido"),
) -> list[Parliamentarian]:
    """Retorna uma lista paginada de parlamentares."""
    stmt = select(Parliamentarian).offset(offset).limit(limit)

    if party:
        stmt = stmt.where(Parliamentarian.party.ilike(f"%{party}%"))

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{parliamentarian_id}", response_model=ParliamentarianOut)
def get_parliamentarian(
    parliamentarian_id: int,
    db: Session = Depends(get_db),
) -> Parliamentarian:
    """Busca um parlamentar específico pelo identificador."""
    stmt = select(Parliamentarian).where(Parliamentarian.id == parliamentarian_id)
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(status_code=404, detail="Parlamentar não encontrado.")

    return result


__all__ = ["router"]

