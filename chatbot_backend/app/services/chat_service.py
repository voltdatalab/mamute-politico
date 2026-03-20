"""Serviço central do chatbot."""

from __future__ import annotations

import asyncio
from typing import Any, AsyncIterator, Dict, Iterable, List, Sequence

from langchain.callbacks.base import AsyncCallbackHandler
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.runnables import RunnableLambda, RunnableParallel, RunnableSequence
from langchain_openai import ChatOpenAI

from ..core.config import get_settings
from .prompts import build_prompt
from .reranker import LLMReranker
from .sql_context import fetch_sql_context
from .vector_store import get_retriever

settings = get_settings()


class JSONTokenStreamingHandler(AsyncCallbackHandler):
    """Callback customizado para formar eventos JSON."""

    def __init__(self, iterator_handler: AsyncIteratorCallbackHandler) -> None:
        self.iterator_handler = iterator_handler

    async def on_llm_new_token(
        self,
        token: str,
        *,
        run_id: str,
        parent_run_id: str | None = None,
        **kwargs: Any,
    ) -> None:
        await self.iterator_handler.on_llm_new_token(token, run_id=run_id, **kwargs)


class ChatbotService:
    """Encapsula a criação do chain LangChain e o streaming de respostas."""

    def __init__(self) -> None:
        self.prompt = build_prompt()
        self.retriever = get_retriever()
        self.reranker = LLMReranker()

    @staticmethod
    def _convert_history(raw_history: Sequence[dict[str, str]]) -> List[BaseMessage]:
        """Converte histórico simples em mensagens do LangChain."""

        messages: List[BaseMessage] = []
        for item in raw_history:
            role = item.get("role")
            content = (item.get("content") or "").strip()
            if not content:
                continue
            if role == "assistant":
                messages.append(AIMessage(content=content))
            else:
                messages.append(HumanMessage(content=content))
        return messages

    @staticmethod
    def _format_documents(docs: Iterable[Document]) -> str:
        """Une documentos recuperados com metadados básicos."""

        chunks: List[str] = []
        for doc in docs:
            metadata = doc.metadata or {}
            source = metadata.get("source") or metadata.get("id") or "desconhecido"
            heading = f"Fonte: {source}"
            if "date" in metadata:
                heading += f" • Data: {metadata['date']}"
            body = doc.page_content.strip()
            chunks.append(f"{heading}\n{body}")
        return "\n\n".join(chunks)

    async def _retrieve_and_rerank(self, inputs: Dict[str, Any]) -> str:
        """Recupera documentos, executa reranking e prepara o contexto."""

        question = inputs["question"]
        documents = await self.retriever.ainvoke(question)
        reranked = await self.reranker.arerank(
            question, documents, settings.rerank_top_k
        )
        return self._format_documents(reranked)

    def _build_chain(self) -> RunnableSequence:
        """Monta o pipeline de execução."""

        llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=settings.openai_temperature,
            max_tokens=settings.openai_max_tokens,
            streaming=True,
            api_key=settings.openai_api_key.get_secret_value(),
        )

        retriever_chain = RunnableLambda(self._retrieve_and_rerank)

        sql_chain = RunnableLambda(lambda x: fetch_sql_context(x["question"]))

        history_chain = RunnableLambda(
            lambda x: self._convert_history(x.get("history", []))
        )

        assembler = RunnableParallel(
            question=RunnableLambda(lambda x: x["question"]),
            history=history_chain,
            context=retriever_chain,
            sql_context=sql_chain,
        )

        return assembler | self.prompt | llm

    async def stream_response(
        self, inputs: Dict[str, Any]
    ) -> AsyncIterator[Dict[str, Any]]:
        """Executa o chain e produz eventos incrementais."""

        iterator_handler = AsyncIteratorCallbackHandler()
        json_handler = JSONTokenStreamingHandler(iterator_handler)
        chain = self._build_chain()

        task = asyncio.create_task(
            chain.ainvoke(
                inputs,
                config={
                    "callbacks": [json_handler],
                },
            )
        )

        try:
            async for token in iterator_handler.aiter():
                yield {"type": "token", "value": token}
        except asyncio.CancelledError:
            task.cancel()
            raise
        finally:
            await task

        yield {"type": "end"}

    async def invoke(self, inputs: Dict[str, Any]) -> str:
        """Executa o chain de forma síncrona (sem streaming)."""

        chain = self._build_chain()
        result = await chain.ainvoke(inputs)
        if isinstance(result, str):
            return result
        if isinstance(result, BaseMessage):
            return str(result.content)
        return str(result)


__all__ = ["ChatbotService"]
