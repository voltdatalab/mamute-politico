"""Aplicação FastAPI dedicada ao chatbot Mamute Político."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import get_settings
from .routers import chat
from .schemas import HealthcheckResponse


def create_app() -> FastAPI:
    """Inicializa a aplicação FastAPI."""

    settings = get_settings()

    app = FastAPI(
        title="Mamute Político Chatbot",
        description=(
            "Serviço de conversação baseado em LangChain, combinando vetores no "
            "PostgreSQL (pgvector) e consultas SQL diretas às notas taquigráficas."
        ),
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(chat.router, prefix="/chat")

    @app.get("/chat/health", response_model=HealthcheckResponse, tags=["infra"])
    async def healthcheck() -> HealthcheckResponse:
        """Verifica o status básico da aplicação."""

        return HealthcheckResponse(status="ok", environment=settings.environment)

    return app


app = create_app()

__all__ = ["app", "create_app"]
