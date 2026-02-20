"""Rotas para discursos e notas taquigráficas."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
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
    date: Optional[date] = None
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
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    parliamentarian_id: Optional[int] = Query(
        None, description="Filtra pelo parlamentar responsável pelo discurso."
    ),
    date_from: Optional[date] = Query(
        None, description="Filtra discursos ocorridos a partir desta data (inclusive)."
    ),
    date_to: Optional[date] = Query(
        None, description="Filtra discursos ocorridos até esta data (inclusive)."
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
