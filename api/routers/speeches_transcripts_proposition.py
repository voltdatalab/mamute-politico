"""Rotas para associação entre discursos e proposições."""

from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.speeches_transcripts_proposition).
    from ..db.models.speeches_transcripts_proposition import (
        SpeechesTranscriptsProposition,
    )
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.speeches_transcripts_proposition import (
        SpeechesTranscriptsProposition,
    )
    from dependencies import get_db

router = APIRouter(
    prefix="/speeches-transcripts-proposition",
    tags=["speeches_transcripts_proposition"],
)


class SpeechesTranscriptsPropositionOut(BaseModel):
    """Representação serializada do vínculo entre discurso e proposição."""

    id: int
    speeches_transcripts_id: int
    proposition_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[SpeechesTranscriptsPropositionOut])
def list_speeches_transcripts_propositions(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    proposition_id: Optional[int] = Query(
        None, description="Filtra pelo identificador da proposição relacionada."
    ),
    speeches_transcripts_id: Optional[int] = Query(
        None, description="Filtra pelo discurso relacionado."
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
        "proposition_id",
        "speeches_transcripts_id",
    ] = Query(default="created_at", description="Campo usado para ordenação."),
    sort_order: Literal["asc", "desc"] = Query(
        default="desc",
        description="Direção da ordenação.",
    ),
) -> List[SpeechesTranscriptsProposition]:
    """Retorna uma lista paginada de vínculos entre discursos e proposições."""
    stmt = select(SpeechesTranscriptsProposition).offset(offset).limit(limit)

    if proposition_id is not None:
        stmt = stmt.where(SpeechesTranscriptsProposition.proposition_id == proposition_id)
    if speeches_transcripts_id is not None:
        stmt = stmt.where(
            SpeechesTranscriptsProposition.speeches_transcripts_id
            == speeches_transcripts_id
        )
    if created_from is not None:
        stmt = stmt.where(SpeechesTranscriptsProposition.created_at >= created_from)
    if created_to is not None:
        stmt = stmt.where(SpeechesTranscriptsProposition.created_at <= created_to)
    if updated_from is not None:
        stmt = stmt.where(SpeechesTranscriptsProposition.updated_at >= updated_from)
    if updated_to is not None:
        stmt = stmt.where(SpeechesTranscriptsProposition.updated_at <= updated_to)

    sortable_columns = {
        "created_at": SpeechesTranscriptsProposition.created_at,
        "updated_at": SpeechesTranscriptsProposition.updated_at,
        "id": SpeechesTranscriptsProposition.id,
        "proposition_id": SpeechesTranscriptsProposition.proposition_id,
        "speeches_transcripts_id": SpeechesTranscriptsProposition.speeches_transcripts_id,
    }
    sort_column = sortable_columns[sort_by]
    stmt = stmt.order_by(asc(sort_column) if sort_order == "asc" else desc(sort_column))

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{link_id}", response_model=SpeechesTranscriptsPropositionOut)
def get_speeches_transcripts_proposition(
    link_id: int,
    db: Session = Depends(get_db),
) -> SpeechesTranscriptsProposition:
    """Busca um vínculo entre discurso e proposição pelo identificador."""
    stmt = select(SpeechesTranscriptsProposition).where(
        SpeechesTranscriptsProposition.id == link_id
    )
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(
            status_code=404, detail="Vínculo discurso-proposição não encontrado."
        )

    return result


__all__ = ["router"]
