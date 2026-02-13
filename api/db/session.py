"""Utilitários de sessão e context managers para o SQLAlchemy."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

from sqlalchemy.orm import Session

from .engine import SessionLocal


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    """Fornece um escopo transacional reutilizável."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Session:
    """Retorna uma instância de sessão que deve ser finalizada manualmente."""
    return SessionLocal()


__all__ = ["session_scope", "get_session"]

