"""Rotas para votações nominais (roll call votes)."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

try:
    # Execução como pacote (api.routers.roll_call_votes).
    from ..db.models.proposition import Proposition
    from ..db.models.roll_call_votes import RollCallVote
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.proposition import Proposition
    from db.models.roll_call_votes import RollCallVote
    from dependencies import get_db

router = APIRouter(prefix="/roll-call-votes", tags=["roll_call_votes"])


class RollCallVoteOut(BaseModel):
    """Representação serializada de uma votação nominal."""

    id: int
    parliamentarian_id: int
    proposition_id: int
    proposition_title: Optional[str] = None
    vote: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    proposition_votes_link: Optional[str] = None
    date_vote: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


def _extract_date_vote(proposition: Optional[Proposition]) -> Optional[date]:
    if proposition is None or not isinstance(proposition.details, dict):
        return None

    decision = (
        proposition.details.get("decisao_destino", {})
        .get("Decisao", {})
    )
    raw_date = decision.get("Data")
    if not isinstance(raw_date, str) or not raw_date:
        return None

    try:
        return date.fromisoformat(raw_date)
    except ValueError:
        return None


def _serialize_roll_call_vote(vote: RollCallVote) -> RollCallVoteOut:
    proposition_votes_link: Optional[str] = None
    if vote.proposition and isinstance(vote.proposition.link, str) and vote.proposition.link:
        proposition_votes_link = f"{vote.proposition.link.rstrip('/')}/votacoes"

    return RollCallVoteOut(
        id=vote.id,
        parliamentarian_id=vote.parliamentarian_id,
        proposition_id=vote.proposition_id,
        proposition_title=vote.proposition.title if vote.proposition else None,
        vote=vote.vote,
        description=vote.description,
        link=vote.link,
        proposition_votes_link=proposition_votes_link,
        date_vote=_extract_date_vote(vote.proposition),
        created_at=vote.created_at,
        updated_at=vote.updated_at,
    )


@router.get("/", response_model=List[RollCallVoteOut])
@router.get("/votacoes", response_model=List[RollCallVoteOut])
def list_roll_call_votes(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    proposition_id: Optional[int] = Query(
        None, description="Filtra pela proposição relacionada."
    ),
    parliamentarian_id: Optional[int] = Query(
        None, description="Filtra pelo parlamentar que votou."
    ),
) -> List[RollCallVoteOut]:
    """Retorna uma lista paginada de votações nominais."""
    stmt = (
        select(RollCallVote)
        .options(selectinload(RollCallVote.proposition))
        .offset(offset)
        .limit(limit)
    )
    if proposition_id is not None:
        stmt = stmt.where(RollCallVote.proposition_id == proposition_id)
    if parliamentarian_id is not None:
        stmt = stmt.where(RollCallVote.parliamentarian_id == parliamentarian_id)

    result = db.execute(stmt)
    votes = result.scalars().all()
    return [_serialize_roll_call_vote(vote) for vote in votes]


@router.get("/{vote_id}", response_model=RollCallVoteOut)
@router.get("/votacoes/{vote_id}", response_model=RollCallVoteOut)
def get_roll_call_vote(
    vote_id: int,
    db: Session = Depends(get_db),
) -> RollCallVoteOut:
    """Busca uma votação nominal pelo identificador."""
    stmt = (
        select(RollCallVote)
        .options(selectinload(RollCallVote.proposition))
        .where(RollCallVote.id == vote_id)
    )
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(status_code=404, detail="Votação não encontrada.")

    return _serialize_roll_call_vote(result)


__all__ = ["router"]
