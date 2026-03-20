"""Script utilitário para indexar notas taquigráficas no pgvector."""

from __future__ import annotations

import argparse
import math
from typing import Iterable

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import text

from chatbot_backend.app.core.database import get_session
from chatbot_backend.app.services.ingestion import build_documents, create_splitter
from chatbot_backend.app.services.vector_store import get_vector_store


def _fetch_total_count() -> int:
    with get_session() as session:
        return session.execute(
            text("SELECT COUNT(*) FROM speeches_transcripts")
        ).scalar_one()


def _fetch_batch(offset: int, limit: int) -> Iterable[dict]:
    query = text(
        """
        SELECT
            st.id,
            st.date,
            st.summary,
            st.speech_text,
            st.session_number,
            st.type,
            p.name AS parliamentarian_name
        FROM speeches_transcripts st
        LEFT JOIN parliamentarian p ON p.id = st.parliamentarian_id
        ORDER BY st.updated_at ASC NULLS LAST, st.id ASC
        OFFSET :offset
        LIMIT :limit
        """
    )
    with get_session() as session:
        rows = session.execute(query, {"offset": offset, "limit": limit}).mappings()
        for row in rows:
            yield dict(row)


def run(batch_size: int, max_batches: int | None) -> None:
    total = _fetch_total_count()
    splitter = create_splitter()

    vector_store = get_vector_store()

    batches = math.ceil(total / batch_size)
    if max_batches is not None:
        batches = min(batches, max_batches)

    processed = 0
    for batch_index in range(batches):
        offset = batch_index * batch_size
        for row in _fetch_batch(offset, batch_size):
            documents = build_documents(row, splitter)
            if not documents:
                continue
            chunk_ids = [
                doc.metadata.get("chunk_id") for doc in documents if doc.metadata
            ]
            vector_store.add_documents(
                documents,
                ids=[chunk_id for chunk_id in chunk_ids if isinstance(chunk_id, str)],
            )
            processed += len(documents)
            print(
                f"Discurso {row.get('id')} => {len(documents)} chunk(s) "
                f"(acumulado: {processed})"
            )

    print("Processo concluído com sucesso.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Indexa notas taquigráficas no vetor PGVector."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Quantidade de discursos carregados por rodada (default=200).",
    )
    parser.add_argument(
        "--max-batches",
        type=int,
        default=None,
        help="Limita o total de lotes processados (default=todo).",
    )

    args = parser.parse_args()
    run(batch_size=args.batch_size, max_batches=args.max_batches)


if __name__ == "__main__":
    main()
