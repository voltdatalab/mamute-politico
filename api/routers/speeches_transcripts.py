"""Rotas para discursos e notas taquigráficas."""

from __future__ import annotations

from datetime import date as date_type, datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import asc, desc, select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.speeches_transcripts).
    from ..db.models.speeches_transcripts import SpeechesTranscript
    from ..dependencies import get_db
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.speeches_transcripts import SpeechesTranscript
    from dependencies import get_db

router = APIRouter(prefix="/speeches-transcripts", tags=["speeches_transcripts"])


class SpeechesTranscriptOut(BaseModel):
    """Representação serializada de um discurso."""

    id: int
    parliamentarian_id: int
    date: Optional[date_type] = None
    session_number: Optional[str] = None
    type: Optional[str] = None  # noqa: A003 - manter nome da coluna
    speech_link: Optional[str] = None
    speech_text: Optional[str] = None
    summary: Optional[str] = None
    hour_minute: Optional[str] = None
    publication_link: Optional[str] = None
    publication_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("/", response_model=List[SpeechesTranscriptOut])
def list_speeches_transcripts(
    *,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    parliamentarian_id: Optional[int] = Query(
        None, description="Filtra pelo parlamentar responsável pelo discurso."
    ),
    date_from: Optional[date_type] = Query(
        None, description="Filtra discursos ocorridos a partir desta data (inclusive)."
    ),
    date_to: Optional[date_type] = Query(
        None, description="Filtra discursos ocorridos até esta data (inclusive)."
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
        "date",
        "id",
        "parliamentarian_id",
    ] = Query(default="date", description="Campo usado para ordenação."),
    sort_order: Literal["asc", "desc"] = Query(
        default="desc",
        description="Direção da ordenação.",
    ),
) -> List[SpeechesTranscript]:
    """Retorna uma lista paginada de discursos."""
    stmt = select(SpeechesTranscript).offset(offset).limit(limit)

    if parliamentarian_id is not None:
        stmt = stmt.where(SpeechesTranscript.parliamentarian_id == parliamentarian_id)
    if date_from is not None:
        stmt = stmt.where(SpeechesTranscript.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(SpeechesTranscript.date <= date_to)
    if created_from is not None:
        stmt = stmt.where(SpeechesTranscript.created_at >= created_from)
    if created_to is not None:
        stmt = stmt.where(SpeechesTranscript.created_at <= created_to)
    if updated_from is not None:
        stmt = stmt.where(SpeechesTranscript.updated_at >= updated_from)
    if updated_to is not None:
        stmt = stmt.where(SpeechesTranscript.updated_at <= updated_to)

    sortable_columns = {
        "created_at": SpeechesTranscript.created_at,
        "updated_at": SpeechesTranscript.updated_at,
        "date": SpeechesTranscript.date,
        "id": SpeechesTranscript.id,
        "parliamentarian_id": SpeechesTranscript.parliamentarian_id,
    }
    sort_column = sortable_columns[sort_by]
    stmt = stmt.order_by(asc(sort_column) if sort_order == "asc" else desc(sort_column))

    result = db.execute(stmt)
    return result.scalars().all()


@router.get("/{speech_id}", response_model=SpeechesTranscriptOut)
def get_speeches_transcript(
    speech_id: int,
    db: Session = Depends(get_db),
) -> SpeechesTranscript:
    """Busca um discurso específico pelo identificador."""
    stmt = select(SpeechesTranscript).where(SpeechesTranscript.id == speech_id)
    result = db.execute(stmt).scalar_one_or_none()

    if result is None:
        raise HTTPException(status_code=404, detail="Discurso não encontrado.")

    return result


__all__ = ["router"]
