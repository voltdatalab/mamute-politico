"""Rotas relacionadas à autoria de proposições."""

from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.authors_proposition).
    from ..db.models.authors_proposition import AuthorsProposition
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.authors_proposition import AuthorsProposition
    from dependencies import get_db

router = APIRouter(prefix="/authors-proposition", tags=["authors_proposition"])


class AuthorsPropositionOut(BaseModel):
    """Representação serializada da autoria de uma proposição."""

    id: int
    parliamentarian_id: int
    proposition_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[AuthorsPropositionOut])
def list_authors_propositions(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    proposition_id: Optional[int] = Query(
        None, description="Filtra por proposição relacionada."
    ),
    parliamentarian_id: Optional[int] = Query(
        None, description="Filtra pelo parlamentar autor."
    ),
    created_from: Optional[datetime] = Query(
        None,
        description="Filtra por registros criados a partir deste instante (inclusive).",
    ),
    created_to: Optional[datetime] = Query(
        None,
        description="Filtra por registros criados até este instante (inclusive).",
    ),
    updated_from: Optional[datetime] = Query(
        None,
        description="Filtra por registros atualizados a partir deste instante (inclusive).",
    ),
    updated_to: Optional[datetime] = Query(
        None,
        description="Filtra por registros atualizados até este instante (inclusive).",
    ),
    sort_by: Literal[
        "created_at",
        "updated_at",
        "id",
        "parliamentarian_id",
        "proposition_id",
    ] = Query(default="created_at", description="Campo usado para ordenação."),
    sort_order: Literal["asc", "desc"] = Query(
        default="desc",
        description="Direção da ordenação.",
    ),
) -> List[AuthorsProposition]:
    """Retorna uma lista paginada de autorias de proposições."""
    stmt = select(AuthorsProposition).offset(offset).limit(limit)

    if proposition_id is not None:
        stmt = stmt.where(AuthorsProposition.proposition_id == proposition_id)
    if parliamentarian_id is not None:
        stmt = stmt.where(AuthorsProposition.parliamentarian_id == parliamentarian_id)
    if created_from is not None:
        stmt = stmt.where(AuthorsProposition.created_at >= created_from)
    if created_to is not None:
        stmt = stmt.where(AuthorsProposition.created_at <= created_to)
    if updated_from is not None:
        stmt = stmt.where(AuthorsProposition.updated_at >= updated_from)
    if updated_to is not None:
        stmt = stmt.where(AuthorsProposition.updated_at <= updated_to)

    sortable_columns = {
        "created_at": AuthorsProposition.created_at,
        "updated_at": AuthorsProposition.updated_at,
        "id": AuthorsProposition.id,
        "parliamentarian_id": AuthorsProposition.parliamentarian_id,
        "proposition_id": AuthorsProposition.proposition_id,
    }
    sort_column = sortable_columns[sort_by]
    stmt = stmt.order_by(asc(sort_column) if sort_order == "asc" else desc(sort_column))

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{authorship_id}", response_model=AuthorsPropositionOut)
def get_authors_proposition(
    authorship_id: int,
    db: Session = Depends(get_db),
) -> AuthorsProposition:
    """Busca uma autoria específica pelo identificador."""
    stmt = select(AuthorsProposition).where(AuthorsProposition.id == authorship_id)
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(status_code=404, detail="Autoria não encontrada.")

    return result


__all__ = ["router"]
