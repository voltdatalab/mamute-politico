"""Aplicação FastAPI para exposição dos dados coletados."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import parliamentarians, propositions


def create_app() -> FastAPI:
    """Cria e configura a aplicação FastAPI."""
    app = FastAPI(
        title="Mamute Político API",
        description="API para consulta das tabelas do projeto Mamute Político.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(parliamentarians.router)
    app.include_router(propositions.router)

    return app


app = create_app()


__all__ = ["app", "create_app"]

