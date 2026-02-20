"""Rotas relacionadas a proposições legislativas."""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.propositions).
    from ..db.models.proposition import Proposition
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.proposition import Proposition
    from dependencies import get_db

router = APIRouter(prefix="/propositions", tags=["propositions"])


class PropositionOut(BaseModel):
    """Representação serializada de uma proposição."""

    id: int
    proposition_code: Optional[int] = None
    title: Optional[str] = None
    link: Optional[str] = None
    proposition_acronym: Optional[str] = None
    proposition_number: Optional[int] = None
    presentation_year: Optional[int] = None
    agency_id: Optional[int] = None
    proposition_type_id: Optional[int] = None
    proposition_status_id: Optional[int] = None
    current_status: Optional[str] = None
    proposition_description: Optional[str] = None
    presentation_date: Optional[date] = None
    presentation_month: Optional[int] = None
    summary: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[PropositionOut])
def list_propositions(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    year: Optional[int] = Query(None, description="Filtra pelo ano de apresentação."),
    acronym: Optional[str] = Query(
        None, description="Filtra pela sigla da proposição (ex: PEC, PL, etc)."
    ),
) -> List[Proposition]:
    """Retorna uma lista paginada de proposições."""
    stmt = select(Proposition).offset(offset).limit(limit)

    if year is not None:
        stmt = stmt.where(Proposition.presentation_year == year)
    if acronym:
        stmt = stmt.where(Proposition.proposition_acronym.ilike(f"%{acronym}%"))

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{proposition_id}", response_model=PropositionOut)
def get_proposition(
    proposition_id: int,
    db: Session = Depends(get_db),
) -> Proposition:
    """Recupera detalhes de uma proposição específica."""
    stmt = select(Proposition).where(Proposition.id == proposition_id)
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:

        # print(result)
        print(f"Proposição não encontrada: {proposition_id}")
        input('asdasda testando breakpoint')
        raise HTTPException(status_code=404, detail="Proposição não encontrada.")

    return result


__all__ = ["router"]

