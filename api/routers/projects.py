"""Rotas relacionadas a projetos e seus favoritos."""

from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.projects).
    from ..db.models.parliamentarian import Parliamentarian
    from ..db.models.project import Projetos, ProjetosParliamentarian
    from ..dependencies import get_db
except (ImportError, ValueError):  # pragma: no cover - caminho alternativo
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.parliamentarian import Parliamentarian
    from db.models.project import Projetos, ProjetosParliamentarian
    from dependencies import get_db


router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectFavoriteOut(BaseModel):
    """Representação serializada do vínculo de favorito entre projeto e parlamentar."""

    id: int
    projeto_id: int
    parliamentarian_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectFavoriteCreate(BaseModel):
    """Dados necessários para criar um novo favorito de projeto."""

    parliamentarian_id: int


def _ensure_active_project(db: Session, project_id: int) -> Projetos:
    project = db.get(Projetos, project_id)
    if project is None or getattr(project, "deleted_at", None) is not None:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    return project


def _ensure_parliamentarian_exists(db: Session, parliamentarian_id: int) -> Parliamentarian:
    parliamentarian = db.get(Parliamentarian, parliamentarian_id)
    if parliamentarian is None:
        raise HTTPException(status_code=404, detail="Parlamentar não encontrado.")
    return parliamentarian


@router.get(
    "/{project_id}/favorites",
    response_model=List[ProjectFavoriteOut],
    summary="Lista favoritos de um projeto",
)
def list_project_favorites(
    project_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> List[ProjetosParliamentarian]:
    """Retorna os parlamentares marcados como favoritos por um projeto específico."""
    _ensure_active_project(db, project_id)

    stmt = (
        select(ProjetosParliamentarian)
        .where(ProjetosParliamentarian.projeto_id == project_id)
        .offset(offset)
        .limit(limit)
    )
    favorites = db.execute(stmt)
    return favorites.scalars().all()


@router.post(
    "/{project_id}/favorites",
    response_model=ProjectFavoriteOut,
    status_code=status.HTTP_201_CREATED,
    summary="Adiciona um parlamentar aos favoritos do projeto",
)
def add_project_favorite(
    project_id: int,
    payload: ProjectFavoriteCreate,
    db: Session = Depends(get_db),
) -> ProjetosParliamentarian:
    """Cria o vínculo de favorito entre um projeto e um parlamentar."""
    _ensure_active_project(db, project_id)
    _ensure_parliamentarian_exists(db, payload.parliamentarian_id)

    existing_stmt = select(ProjetosParliamentarian).where(
        ProjetosParliamentarian.projeto_id == project_id,
        ProjetosParliamentarian.parliamentarian_id == payload.parliamentarian_id,
    )
    existing = db.execute(existing_stmt).scalar_one_or_none()

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Parlamentar já está favoritado neste projeto.",
        )

    favorite = ProjetosParliamentarian(
        projeto_id=project_id,
        parliamentarian_id=payload.parliamentarian_id,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite


@router.delete(
    "/{project_id}/favorites/{parliamentarian_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um parlamentar dos favoritos do projeto",
)
def remove_project_favorite(
    project_id: int,
    parliamentarian_id: int,
    db: Session = Depends(get_db),
) -> Response:
    """Remove o vínculo de favorito entre um projeto e um parlamentar."""
    _ensure_active_project(db, project_id)
    stmt = select(ProjetosParliamentarian).where(
        ProjetosParliamentarian.projeto_id == project_id,
        ProjetosParliamentarian.parliamentarian_id == parliamentarian_id,
    )
    favorite = db.execute(stmt).scalar_one_or_none()

    if favorite is None:
        raise HTTPException(
            status_code=404,
            detail="Favorito não encontrado para o projeto informado.",
        )

    db.delete(favorite)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


__all__ = ["router"]

