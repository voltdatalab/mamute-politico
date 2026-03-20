"""Fábrica de repositórios vetoriais utilizando pgvector."""

from __future__ import annotations

from functools import lru_cache
from typing import Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from langchain_community.vectorstores.pgvector import PGVector
from langchain_core.vectorstores import VectorStoreRetriever
from langchain_openai import OpenAIEmbeddings

from ..core.config import get_settings

settings = get_settings()


def _with_application_name(url: str) -> str:
    """Garante que o connection string tenha application_name definido."""

    parsed = urlparse(url)
    query_params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    query_params.setdefault("application_name", settings.application_name)
    new_query = urlencode(query_params, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


@lru_cache
def get_embeddings() -> OpenAIEmbeddings:
    """Retorna o objeto de embeddings configurado."""

    return OpenAIEmbeddings(
        api_key=settings.openai_api_key.get_secret_value(),
        model=settings.openai_embeddings_model,
    )


@lru_cache
def get_vector_store() -> PGVector:
    """Cria (ou reutiliza) a conexão com o índice vetorial."""

    return PGVector(
        connection_string=_with_application_name(settings.pgvector_connection),
        embedding_function=get_embeddings(),
        collection_name=settings.pgvector_collection_name,
        use_jsonb=True,
    )


def get_retriever(
    search_kwargs: Optional[dict[str, int | float]] = None,
) -> VectorStoreRetriever:
    """Expõe um retriever com parâmetros padrão."""

    kwargs: dict[str, int | float] = {"k": settings.retriever_k}
    if search_kwargs:
        kwargs.update(search_kwargs)

    if settings.retriever_score_threshold is not None:
        kwargs.setdefault("score_threshold", settings.retriever_score_threshold)
        search_type = "similarity_score_threshold"
    else:
        search_type = "similarity"

    return get_vector_store().as_retriever(
        search_type=search_type,
        search_kwargs=kwargs,
    )


__all__ = ["get_embeddings", "get_vector_store", "get_retriever"]
