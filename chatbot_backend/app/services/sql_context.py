"""Serviço auxiliar para coletar contexto via SQL."""

from __future__ import annotations

import re
from typing import Dict, List, Mapping, Sequence

from sqlalchemy import text

from ..core.config import get_settings
from ..core.database import get_session

settings = get_settings()

_word_pattern = re.compile(r"[A-Za-zÀ-ÿ]{2,}")

_BASE_FROM = """
    FROM speeches_transcripts st
    JOIN parliamentarian p ON p.id = st.parliamentarian_id
"""

_CONTEXT_SELECT = """
    SELECT
        p.name AS parliamentarian_name,
        st.date AS speech_date,
        COALESCE(st.summary, st.speech_text) AS content
""" + _BASE_FROM

_FREQUENCY_SELECT = """
    SELECT
        p.name AS parliamentarian_name,
        COUNT(*)::int AS total
""" + _BASE_FROM


def _extract_keywords(question: str) -> List[str]:
    """Gera palavras-chave básicas a partir da pergunta."""

    tokens = {token.lower() for token in _word_pattern.findall(question)}
    filtered = [
        token
        for token in tokens
        if len(token) >= settings.sql_min_keyword_length
        and token not in settings.sql_keyword_stopwords
    ]
    return sorted(filtered)[:5]


def _build_filters(keywords: List[str]) -> tuple[List[str], Dict[str, str]]:
    """Transforma palavras-chave em filtros SQL."""

    clauses: List[str] = []
    params: Dict[str, str] = {}
    for index, keyword in enumerate(keywords):
        param_key = f"pattern_{index}"
        clauses.append(
            f"(st.speech_text ILIKE :{param_key} OR st.summary ILIKE :{param_key})"
        )
        params[param_key] = f"%{keyword}%"
    return clauses, params


def _format_rows(rows: Sequence[Mapping[str, object]]) -> str:
    """Transforma os resultados em texto legível."""

    if not rows:
        return ""

    formatted_chunks: List[str] = []
    for row in rows:
        data = dict(row)
        name = data.get("parliamentarian_name") or "Parlamentar não informado"
        date_value = data.get("speech_date")
        if hasattr(date_value, "isoformat"):
            date_str = date_value.isoformat()
        else:
            date_str = str(date_value) if date_value else "Data não informada"

        summary_text = (data.get("content") or "").strip()
        preview = summary_text[:600]
        if summary_text and len(summary_text) > 600:
            preview += "..."
        formatted_chunks.append(f"- {date_str} • {name}: {preview}")

    header = "Notas relevantes:\n"
    return header + "\n".join(formatted_chunks)


def _format_frequency_rows(rows: Sequence[Mapping[str, object]]) -> str:
    """Agrupa resultados analíticos."""

    if not rows:
        return ""

    lines = ["Frequência por parlamentar:"]
    for row in rows:
        data = dict(row)
        name = data.get("parliamentarian_name") or "Parlamentar não informado"
        total = int(data.get("total") or 0)
        lines.append(f"- {name}: {total} discurso(s) relacionados")
    return "\n".join(lines)


def _execute_query(query: str, params: Dict[str, object]) -> List[Mapping[str, object]]:
    with get_session() as session:
        return session.execute(text(query), params).mappings().all()


def fetch_sql_context(question: str) -> str:
    """Executa consultas simples para enriquecer o contexto do LLM."""

    keywords = _extract_keywords(question)
    filters, pattern_params = _build_filters(keywords)

    where_clause: str
    if filters:
        where_clause = " WHERE " + " OR ".join(filters)
    else:
        where_clause = " WHERE st.summary IS NOT NULL"

    context_query = (
        _CONTEXT_SELECT
        + where_clause
        + "\nORDER BY st.date DESC NULLS LAST, st.id DESC\nLIMIT :limit"
    )
    context_params: Dict[str, object] = {"limit": settings.sql_context_limit, **pattern_params}
    context_rows = _execute_query(context_query, context_params)

    if not context_rows and keywords:
        fallback_query = (
            _CONTEXT_SELECT
            + "\nORDER BY st.date DESC NULLS LAST, st.id DESC\nLIMIT :limit"
        )
        context_rows = _execute_query(
            fallback_query, {"limit": settings.sql_context_limit}
        )

    frequency_rows: List[Mapping[str, object]] = []
    if filters:
        frequency_query = (
            _FREQUENCY_SELECT
            + " WHERE "
            + " OR ".join(filters)
            + "\nGROUP BY p.name\nORDER BY total DESC\nLIMIT :freq_limit"
        )
        frequency_params: Dict[str, object] = {
            **pattern_params,
            "freq_limit": settings.sql_frequency_limit,
        }
        frequency_rows = _execute_query(frequency_query, frequency_params)

    sections = []
    context_text = _format_rows(context_rows)
    if context_text:
        sections.append(context_text)

    frequency_text = _format_frequency_rows(frequency_rows)
    if frequency_text:
        sections.append(frequency_text)

    return "\n\n".join(sections).strip()


__all__ = ["fetch_sql_context"]
