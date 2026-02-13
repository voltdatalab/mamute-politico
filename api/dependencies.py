"""Dependências reutilizáveis para a aplicação FastAPI."""

from typing import Iterator

from sqlalchemy.orm import Session

try:
    # Execução como pacote (api.dependencies).
    from .db.engine import SessionLocal
except (ImportError, ValueError):
    # Execução local dentro de api/ sem reconhecimento de pacote.
    from db.engine import SessionLocal


def get_db() -> Iterator[Session]:
    """Fornece uma sessão de banco de dados para cada requisição."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


__all__ = ["get_db"]

