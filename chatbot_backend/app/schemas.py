"""Esquemas Pydantic utilizados nos endpoints do chatbot."""

from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatFilters(BaseModel):
    parliamentarian_ids: Optional[List[int]] = None
    parties: Optional[List[str]] = None
    states: Optional[List[str]] = None
    roles: Optional[List[str]] = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=3)
    history: List[ChatMessage] = Field(default_factory=list)
    filters: Optional[ChatFilters] = None


class ChatResponse(BaseModel):
    answer: str


class HealthcheckResponse(BaseModel):
    status: str = "ok"
    environment: Optional[str] = None


__all__ = [
    "ChatMessage",
    "ChatFilters",
    "ChatRequest",
    "ChatResponse",
    "HealthcheckResponse",
]
