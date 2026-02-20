"""Rotas para associação entre discursos e proposições."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
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
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    proposition_id: Optional[int] = Query(
        None, description="Filtra pelo identificador da proposição relacionada."
    ),
    speeches_transcripts_id: Optional[int] = Query(
        None, description="Filtra pelo discurso relacionado."
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
