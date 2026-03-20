"""Configuração da conexão com o banco relacional utilizado nas consultas SQL."""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings

_settings = get_settings()

_connect_args: dict[str, str] = {}
if _settings.database_url.startswith("postgresql"):
    _connect_args["application_name"] = _settings.application_name

engine: Engine = create_engine(
    _settings.database_url,
    pool_pre_ping=True,
    future=True,
    connect_args=_connect_args or None,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    future=True,
)


@contextmanager
def get_session() -> Generator[Session, None, None]:
    """Gera uma sessão SQLAlchemy garantindo o fechamento apropriado."""

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


__all__ = ["engine", "SessionLocal", "get_session"]
