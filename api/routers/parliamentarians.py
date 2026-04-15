"""Rotas relacionadas a parlamentares."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.parliamentarians).
    from ..db.models.parliamentarian import Parliamentarian
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.parliamentarian import Parliamentarian
    from dependencies import get_db

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
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[ParliamentarianOut])
def list_parliamentarians(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    party: Optional[str] = Query(default=None, description="Filtrar por partido"),
    type: Optional[List[Literal["deputado", "senado"]]] = Query(
        default=None,
        description="Filtrar por tipo de parlamentar: deputado, senado (pode repetir para ambos).",
    ),
) -> List[Parliamentarian]:
    """Retorna uma lista paginada de parlamentares."""
    stmt = select(Parliamentarian).offset(offset).limit(limit)

    if party:
        stmt = stmt.where(Parliamentarian.party.ilike(f"%{party}%"))

    if type:
        normalized_types = set(type)
        type_filters = []
        if "deputado" in normalized_types:
            type_filters.append(Parliamentarian.type.ilike("%Deput%"))
        if "senado" in normalized_types:
            # Banco pode armazenar "senador" ou "senado".
            type_filters.append(Parliamentarian.type.ilike("%Senad%"))
        if type_filters:
            stmt = stmt.where(or_(*type_filters))

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

