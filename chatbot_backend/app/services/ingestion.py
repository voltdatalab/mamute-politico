"""Funções utilitárias para criação de documentos a partir das notas taquigráficas."""

from __future__ import annotations

from typing import Mapping, Sequence

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

DEFAULT_CHUNK_SIZE = 1200
DEFAULT_CHUNK_OVERLAP = 150
DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", " "]


def create_splitter() -> RecursiveCharacterTextSplitter:
    """Retorna o splitter padrão utilizado na indexação."""

    return RecursiveCharacterTextSplitter(
        chunk_size=DEFAULT_CHUNK_SIZE,
        chunk_overlap=DEFAULT_CHUNK_OVERLAP,
        separators=DEFAULT_SEPARATORS,
    )


def build_documents(
    row: Mapping[str, object],
    splitter: RecursiveCharacterTextSplitter,
) -> list[Document]:
    """Constrói documentos chunkados prontos para inserção no vetor."""

    summary = (row.get("summary") or "").strip()
    speech_text = (row.get("speech_text") or "").strip()

    if not summary and not speech_text:
        return []

    segments: list[str] = []
    if summary:
        segments.append(f"Resumo:\n{summary}")
    if speech_text:
        segments.append(f"Discurso completo:\n{speech_text}")

    merged_content = "\n\n---\n\n".join(segments)

    row_id = row.get("id")
    source = f"speeches_transcripts:{row_id}"
    metadata = {
        "source": source,
        "date": _format_date(row.get("date")),
        "session_number": row.get("session_number"),
        "type": row.get("type"),
        "parliamentarian": row.get("parliamentarian_name"),
    }

    documents = splitter.create_documents(
        texts=[merged_content],
        metadatas=[metadata],
    )

    for index, document in enumerate(documents):
        document.metadata["chunk_index"] = index
        document.metadata["chunk_id"] = f"{source}:{index}"

    return documents


def _format_date(value: object) -> str | None:
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


__all__ = ["create_splitter", "build_documents"]
