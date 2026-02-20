"""Rotas para votações nominais (roll call votes)."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.roll_call_votes).
    from ..db.models.roll_call_votes import RollCallVote
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.roll_call_votes import RollCallVote
    from dependencies import get_db

router = APIRouter(prefix="/roll-call-votes", tags=["roll_call_votes"])


class RollCallVoteOut(BaseModel):
    """Representação serializada de uma votação nominal."""

    id: int
    parliamentarian_id: int
    proposition_id: int
    vote: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[RollCallVoteOut])
def list_roll_call_votes(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    proposition_id: Optional[int] = Query(
        None, description="Filtra pela proposição relacionada."
    ),
    parliamentarian_id: Optional[int] = Query(
        None, description="Filtra pelo parlamentar que votou."
    ),
) -> List[RollCallVote]:
    """Retorna uma lista paginada de votações nominais."""
    stmt = select(RollCallVote).offset(offset).limit(limit)

    if proposition_id is not None:
        stmt = stmt.where(RollCallVote.proposition_id == proposition_id)
    if parliamentarian_id is not None:
        stmt = stmt.where(RollCallVote.parliamentarian_id == parliamentarian_id)

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{vote_id}", response_model=RollCallVoteOut)
def get_roll_call_vote(
    vote_id: int,
    db: Session = Depends(get_db),
) -> RollCallVote:
    """Busca uma votação nominal pelo identificador."""
    stmt = select(RollCallVote).where(RollCallVote.id == vote_id)
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(status_code=404, detail="Votação não encontrada.")

    return result


__all__ = ["router"]
