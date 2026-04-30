"""Rotas relacionadas a projetos e seus favoritos."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import List, Optional
from zoneinfo import ZoneInfo
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.routers.projects).
    from ..db.models.parliamentarian import Parliamentarian
    from ..db.models.authors_proposition import AuthorsProposition
    from ..db.models.committee_attendance import CommitteeAttendance
    from ..db.models.plenary_attendance import PlenaryAttendance
    from ..db.models.proposition import Proposition
    from ..db.models.project import Projetos, ProjetosParliamentarian
    from ..db.models.roll_call_votes import RollCallVote
    from ..db.models.speeches_transcripts import SpeechesTranscript
    from ..dependencies import get_db
except (ImportError, ValueError):  # pragma: no cover - caminho alternativo
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.models.parliamentarian import Parliamentarian
    from db.models.authors_proposition import AuthorsProposition
    from db.models.committee_attendance import CommitteeAttendance
    from db.models.plenary_attendance import PlenaryAttendance
    from db.models.proposition import Proposition
    from db.models.project import Projetos, ProjetosParliamentarian
    from db.models.roll_call_votes import RollCallVote
    from db.models.speeches_transcripts import SpeechesTranscript
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


class ProjectDashboardStatsOut(BaseModel):
    """Estatísticas semanais do dashboard do projeto autenticado."""

    propositions_this_week: int
    attendance_avg_percent: Optional[int] = None
    recent_votes_count: int
    speeches_count: int


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return normalized.lower().strip()


def _is_present_status(value: Optional[str]) -> bool:
    normalized = _normalize_text(value)
    if "presen" not in normalized:
        return False
    if "nao" in normalized or "não" in normalized:
        return False
    return True


def _current_week_range_sao_paulo() -> tuple[date, date, datetime, datetime]:
    tz = ZoneInfo("America/Sao_Paulo")
    now_local = datetime.now(tz)
    week_start_date = (now_local - timedelta(days=now_local.weekday())).date()
    week_end_date = week_start_date + timedelta(days=6)
    week_start_dt = datetime.combine(week_start_date, time.min, tzinfo=tz)
    week_end_dt_exclusive = datetime.combine(
        week_end_date + timedelta(days=1),
        time.min,
        tzinfo=tz,
    )
    return week_start_date, week_end_date, week_start_dt, week_end_dt_exclusive


def _get_project_favorite_ids(db: Session, project_id: int) -> List[int]:
    stmt = select(ProjetosParliamentarian.parliamentarian_id).where(
        ProjetosParliamentarian.projeto_id == project_id
    )
    return [int(item) for item in db.execute(stmt).scalars().all()]


def _count_propositions_this_week(
    db: Session, parliamentarian_ids: List[int], week_start: date, week_end: date
) -> int:
    stmt = (
        select(func.count(func.distinct(Proposition.id)))
        .select_from(AuthorsProposition)
        .join(Proposition, Proposition.id == AuthorsProposition.proposition_id)
        .where(AuthorsProposition.parliamentarian_id.in_(parliamentarian_ids))
        .where(Proposition.presentation_date.is_not(None))
        .where(Proposition.presentation_date >= week_start)
        .where(Proposition.presentation_date <= week_end)
    )
    return int(db.execute(stmt).scalar_one() or 0)


def _count_recent_votes(
    db: Session,
    parliamentarian_ids: List[int],
    week_start_dt: datetime,
    week_end_dt_exclusive: datetime,
) -> int:
    stmt = select(func.count(RollCallVote.id)).where(
        RollCallVote.parliamentarian_id.in_(parliamentarian_ids),
        RollCallVote.created_at >= week_start_dt,
        RollCallVote.created_at < week_end_dt_exclusive,
    )
    return int(db.execute(stmt).scalar_one() or 0)


def _count_speeches_this_week(
    db: Session, parliamentarian_ids: List[int], week_start: date, week_end: date
) -> int:
    stmt = select(func.count(SpeechesTranscript.id)).where(
        SpeechesTranscript.parliamentarian_id.in_(parliamentarian_ids),
        SpeechesTranscript.date.is_not(None),
        SpeechesTranscript.date >= week_start,
        SpeechesTranscript.date <= week_end,
    )
    return int(db.execute(stmt).scalar_one() or 0)


def _calculate_attendance_avg_percent(
    db: Session, parliamentarian_ids: List[int], week_start: date, week_end: date
) -> Optional[int]:
    plenary_stmt = select(
        PlenaryAttendance.session_attendance,
        PlenaryAttendance.daily_attendance_justification,
    ).where(
        PlenaryAttendance.parliamentarian_id.in_(parliamentarian_ids),
        PlenaryAttendance.date.is_not(None),
        PlenaryAttendance.date >= week_start,
        PlenaryAttendance.date <= week_end,
    )
    committee_stmt = select(CommitteeAttendance.frequency).where(
        CommitteeAttendance.parliamentarian_id.in_(parliamentarian_ids),
        CommitteeAttendance.date.is_not(None),
        CommitteeAttendance.date >= week_start,
        CommitteeAttendance.date <= week_end,
    )

    presence_scores: List[int] = []
    for session_attendance, daily_justification in db.execute(plenary_stmt).all():
        status_value = session_attendance or daily_justification
        presence_scores.append(1 if _is_present_status(status_value) else 0)

    for (frequency,) in db.execute(committee_stmt).all():
        presence_scores.append(1 if _is_present_status(frequency) else 0)

    if not presence_scores:
        return None
    avg_ratio = sum(presence_scores) / len(presence_scores)
    return int(round(avg_ratio * 100))


def _ensure_active_project(db: Session, project_id: int) -> Projetos:
    project = db.get(Projetos, project_id)
    if project is None or getattr(project, "deleted_at", None) is not None:
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    return project


def _get_project_from_token_email(request: Request, db: Session) -> Projetos:
    token_email = getattr(request.state, "token_email", None)
    if not token_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem e-mail (sub) para identificar o projeto.",
        )

    stmt = select(Projetos).where(
        Projetos.email == token_email,
        Projetos.deleted_at.is_(None),
    )
    project = db.execute(stmt).scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado para o e-mail autenticado.",
        )

    return project


def _ensure_parliamentarian_exists(db: Session, parliamentarian_id: int) -> Parliamentarian:
    parliamentarian = db.get(Parliamentarian, parliamentarian_id)
    if parliamentarian is None:
        raise HTTPException(status_code=404, detail="Parlamentar não encontrado.")
    return parliamentarian


def _create_project_favorite(
    db: Session,
    project_id: int,
    parliamentarian_id: int,
) -> ProjetosParliamentarian:
    _ensure_active_project(db, project_id)
    _ensure_parliamentarian_exists(db, parliamentarian_id)

    existing_stmt = select(ProjetosParliamentarian).where(
        ProjetosParliamentarian.projeto_id == project_id,
        ProjetosParliamentarian.parliamentarian_id == parliamentarian_id,
    )
    existing = db.execute(existing_stmt).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Parlamentar já está favoritado neste projeto.",
        )

    favorite = ProjetosParliamentarian(
        projeto_id=project_id,
        parliamentarian_id=parliamentarian_id,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


def _delete_project_favorite(db: Session, project_id: int, parliamentarian_id: int) -> None:
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


@router.get(
    "/me/favorites",
    response_model=List[ProjectFavoriteOut],
    summary="Lista favoritos do projeto do usuário autenticado",
)
def list_my_project_favorites(
    request: Request,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
) -> List[ProjetosParliamentarian]:
    """Retorna os favoritos do projeto identificado pelo e-mail do token JWT."""
    project = _get_project_from_token_email(request, db)
    stmt = (
        select(ProjetosParliamentarian)
        .where(ProjetosParliamentarian.projeto_id == project.id)
        .offset(offset)
        .limit(limit)
    )
    favorites = db.execute(stmt)
    return favorites.scalars().all()


@router.post(
    "/me/favorites",
    response_model=ProjectFavoriteOut,
    status_code=status.HTTP_201_CREATED,
    summary="Adiciona favorito ao projeto do usuário autenticado",
)
def add_my_project_favorite(
    request: Request,
    payload: ProjectFavoriteCreate,
    db: Session = Depends(get_db),
) -> ProjetosParliamentarian:
    """Cria favorito usando o projeto identificado pelo e-mail do token JWT."""
    project = _get_project_from_token_email(request, db)
    return _create_project_favorite(db, project.id, payload.parliamentarian_id)


@router.delete(
    "/me/favorites/{parliamentarian_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove favorito do projeto do usuário autenticado",
)
def remove_my_project_favorite(
    request: Request,
    parliamentarian_id: int,
    db: Session = Depends(get_db),
) -> Response:
    """Remove favorito usando o projeto identificado pelo e-mail do token JWT."""
    project = _get_project_from_token_email(request, db)
    _delete_project_favorite(db, project.id, parliamentarian_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/{project_id}/favorites",
    response_model=List[ProjectFavoriteOut],
    summary="Lista favoritos de um projeto",
)
def list_project_favorites(
    project_id: int,
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
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
    return _create_project_favorite(db, project_id, payload.parliamentarian_id)


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
    _delete_project_favorite(db, project_id, parliamentarian_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me/dashboard-stats",
    response_model=ProjectDashboardStatsOut,
    summary="Estatísticas semanais do dashboard do projeto autenticado",
)
def get_my_dashboard_stats(
    request: Request,
    db: Session = Depends(get_db),
) -> ProjectDashboardStatsOut:
    """Retorna estatísticas da semana atual para parlamentares favoritados no projeto."""
    project = _get_project_from_token_email(request, db)
    parliamentarian_ids = _get_project_favorite_ids(db, project.id)
    if not parliamentarian_ids:
        return ProjectDashboardStatsOut(
            propositions_this_week=0,
            attendance_avg_percent=None,
            recent_votes_count=0,
            speeches_count=0,
        )

    week_start, week_end, week_start_dt, week_end_dt_exclusive = (
        _current_week_range_sao_paulo()
    )
    return ProjectDashboardStatsOut(
        propositions_this_week=_count_propositions_this_week(
            db,
            parliamentarian_ids,
            week_start,
            week_end,
        ),
        attendance_avg_percent=_calculate_attendance_avg_percent(
            db,
            parliamentarian_ids,
            week_start,
            week_end,
        ),
        recent_votes_count=_count_recent_votes(
            db,
            parliamentarian_ids,
            week_start_dt,
            week_end_dt_exclusive,
        ),
        speeches_count=_count_speeches_this_week(
            db,
            parliamentarian_ids,
            week_start,
            week_end,
        ),
    )


__all__ = ["router"]

