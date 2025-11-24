"""Configuração da engine e da fábrica de sessões."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

# Garante leitura do arquivo .env mesmo quando o comando é executado de subpastas.
BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env", override=False)

APPLICATION_NAME = os.getenv("APPLICATION_NAME", "MAMUTE_POLITICO_CRAWLER")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mamute.db")


def _str_to_bool(value: Optional[str], default: bool = False) -> bool:
    """Converte strings típicas de variáveis de ambiente em booleanos."""
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "t", "yes", "y", "on"}


SQLALCHEMY_ECHO = _str_to_bool(os.getenv("SQLALCHEMY_ECHO"))

CONNECT_ARGS: dict[str, str] = {}
if DATABASE_URL.startswith("postgresql"):
    CONNECT_ARGS["application_name"] = APPLICATION_NAME

engine: Engine = create_engine(
    DATABASE_URL,
    echo=SQLALCHEMY_ECHO,
    future=True,
    connect_args=CONNECT_ARGS or None,
)

SessionLocal: sessionmaker[Session] = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    future=True,
)


@lru_cache
def get_engine(url: Optional[str] = None) -> Engine:
    """Permite obter uma engine reaproveitando a configuração padrão."""
    if url and url != str(engine.url):
        return create_engine(url, echo=engine.echo, future=True)
    return engine


__all__ = [
    "APPLICATION_NAME",
    "DATABASE_URL",
    "SQLALCHEMY_ECHO",
    "engine",
    "SessionLocal",
    "get_engine",
]

