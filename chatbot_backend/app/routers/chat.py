"""Rotas relacionadas ao chatbot."""

from __future__ import annotations

import asyncio
import json
import logging
from time import perf_counter
from typing import AsyncIterator, Dict
from uuid import uuid4

from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse

from ..schemas import ChatRequest, ChatResponse
from ..services.chat_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

service = ChatbotService()
logger = logging.getLogger(__name__)


def _sse_event_stream(payload: Dict[str, object]) -> str:
    """Formatador padrão de eventos Server-Sent Events."""

    data = json.dumps(payload, ensure_ascii=False)
    return f"data: {data}\n\n"


@router.post(
    "/stream",
    status_code=status.HTTP_200_OK,
    response_class=StreamingResponse,
    summary="Obtém resposta do chatbot em modo streaming",
)
async def stream_chat(request: ChatRequest) -> StreamingResponse:
    """Expõe o fluxo de tokens gerados pelo LLM."""

    async def event_generator() -> AsyncIterator[str]:
        request_id = str(uuid4())
        started_at = perf_counter()
        filters = request.filters.model_dump(exclude_none=True) if request.filters else None
        inputs = {"question": request.question, "history": [msg.model_dump() for msg in request.history]}
        if filters:
            inputs["filters"] = filters
        logger.info(
            "📨 Stream request received | request_id=%s | question_chars=%s | history_messages=%s | has_filters=%s",
            request_id,
            len(request.question or ""),
            len(request.history),
            bool(filters),
        )
        try:
            async for chunk in service.stream_response(inputs, request_id=request_id):
                yield _sse_event_stream(chunk)
            elapsed = perf_counter() - started_at
            logger.info(
                "✅ Stream request completed | request_id=%s | elapsed_ms=%.2f",
                request_id,
                elapsed * 1000,
            )
        except asyncio.CancelledError:
            elapsed = perf_counter() - started_at
            logger.warning(
                "⚠️ Stream request cancelled | request_id=%s | elapsed_ms=%.2f",
                request_id,
                elapsed * 1000,
            )
            yield _sse_event_stream({"type": "cancel"})
            raise
        except Exception as exc:  # pragma: no cover - logado externamente
            elapsed = perf_counter() - started_at
            logger.exception(
                "❌ Stream request failed | request_id=%s | elapsed_ms=%.2f | error=%s",
                request_id,
                elapsed * 1000,
                exc,
            )
            yield _sse_event_stream(
                {"type": "error", "message": str(exc)}
            )
            raise

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.post(
    "/query",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtém resposta completa do chatbot (sem streaming)",
)
async def query_chat(request: ChatRequest) -> ChatResponse:
    """Executa o fluxo normal sem streaming."""

    request_id = str(uuid4())
    started_at = perf_counter()
    payload = {
        "question": request.question,
        "history": [msg.model_dump() for msg in request.history],
    }
    if request.filters:
        payload["filters"] = request.filters.model_dump(exclude_none=True)
    logger.info(
        "📨 Query request received | request_id=%s | question_chars=%s | history_messages=%s | has_filters=%s",
        request_id,
        len(request.question or ""),
        len(request.history),
        bool(request.filters),
    )

    try:
        answer = await service.invoke(payload, request_id=request_id)
    except Exception as exc:
        elapsed = perf_counter() - started_at
        logger.exception(
            "❌ Query request failed | request_id=%s | elapsed_ms=%.2f | error=%s",
            request_id,
            elapsed * 1000,
            exc,
        )
        raise
    elapsed = perf_counter() - started_at
    logger.info(
        "✅ Query request completed | request_id=%s | elapsed_ms=%.2f | answer_chars=%s",
        request_id,
        elapsed * 1000,
        len(answer),
    )
    return ChatResponse(answer=answer)
