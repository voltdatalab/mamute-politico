"""Dependências reutilizáveis para a aplicação FastAPI."""

from collections.abc import Iterator

from sqlalchemy.orm import Session

from mamute_scrappers.db.engine import SessionLocal


def get_db() -> Iterator[Session]:
    """Fornece uma sessão de banco de dados para cada requisição."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


__all__ = ["get_db"]

