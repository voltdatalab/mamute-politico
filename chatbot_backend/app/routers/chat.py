"""Rotas relacionadas ao chatbot."""

from __future__ import annotations

import asyncio
import json
from typing import AsyncIterator, Dict

from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse

from ..schemas import ChatRequest, ChatResponse
from ..services.chat_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

service = ChatbotService()


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
        inputs = {"question": request.question, "history": [msg.model_dump() for msg in request.history]}
        try:
            async for chunk in service.stream_response(inputs):
                yield _sse_event_stream(chunk)
        except asyncio.CancelledError:
            yield _sse_event_stream({"type": "cancel"})
            raise
        except Exception as exc:  # pragma: no cover - logado externamente
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

    answer = await service.invoke(
        {"question": request.question, "history": [msg.model_dump() for msg in request.history]}
    )
    return ChatResponse(answer=answer)
