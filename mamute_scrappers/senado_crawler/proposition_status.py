"""Sincroniza situações de proposições do Senado Federal."""

from __future__ import annotations

import json
import logging
import sys
from pathlib import Path
from typing import Any, Callable, ContextManager, Dict, Iterable, List, Optional, TYPE_CHECKING, TypedDict

import requests
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logger = logging.getLogger(__name__)

SENADO_API_BASE_URL = "https://legis.senado.leg.br/dadosabertos"
SENADO_STATUS_ENDPOINT = f"{SENADO_API_BASE_URL}/processo/tipos-situacao"

if TYPE_CHECKING:  # pragma: no cover
    from mamute_scrappers.db.models import PropositionStatus as PropositionStatusModel
    from mamute_scrappers.db.session import session_scope as session_scope_type

    SessionScopeCallable = Callable[[], ContextManager["Session"]]
else:
    PropositionStatusModel = Any
    SessionScopeCallable = Callable[[], ContextManager[Session]]

PropositionStatus: Any = None
_SESSION_SCOPE: Optional[SessionScopeCallable] = None


class PropositionStatusPayload(TypedDict, total=False):
    proposition_status_code: str
    acronym: Optional[str]
    description: Optional[str]
    name: Optional[str]


PROPOSITION_STATUS_MUTABLE_FIELDS = ["proposition_status_code", "acronym", "description", "name"]


def _ensure_db_dependencies() -> None:
    global PropositionStatus, _SESSION_SCOPE
    if _SESSION_SCOPE is not None:
        return

    try:
        from mamute_scrappers.db.models import PropositionStatus as PropositionStatusModelRuntime
        from mamute_scrappers.db.session import session_scope as session_scope_runtime
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("Não foi possível carregar dependências de banco.") from exc

    PropositionStatus = PropositionStatusModelRuntime
    _SESSION_SCOPE = session_scope_runtime


def _request_json(url: str) -> Optional[Any]:
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Falha ao consultar %s: %s", url, exc)
        return None

    try:
        return response.json()
    except ValueError as exc:
        logger.error("Erro ao parsear JSON do Senado (%s): %s", url, exc)
        return None


def _normalize_item(item: Any) -> Optional[PropositionStatusPayload]:
    if not isinstance(item, dict):
        return None

    code_raw = item.get("id") or item.get("Id")
    if isinstance(code_raw, int):
        code = str(code_raw)
    elif isinstance(code_raw, str) and code_raw.strip():
        code = code_raw.strip()
    else:
        return None

    acronym_raw = item.get("sigla") or item.get("Sigla")
    acronym = acronym_raw.strip() if isinstance(acronym_raw, str) else None

    description_raw = item.get("descricao") or item.get("Descricao")
    description = description_raw.strip() if isinstance(description_raw, str) else None

    payload: PropositionStatusPayload = {
        "proposition_status_code": code,
        "acronym": acronym,
        "description": description,
        "name": description or acronym,
    }
    return payload


def _iter_payloads(data: Any) -> Iterable[PropositionStatusPayload]:
    if isinstance(data, list):
        for item in data:
            payload = _normalize_item(item)
            if payload:
                yield payload
        return

    if isinstance(data, dict):
        for value in data.values():
            if isinstance(value, list):
                for item in value:
                    payload = _normalize_item(item)
                    if payload:
                        yield payload


def _debug_print(payload: PropositionStatusPayload) -> None:
    debug_repr = json.dumps(payload, ensure_ascii=False, indent=2, default=str)
    print(debug_repr)


def _upsert_proposition_status(session: Session, payload: PropositionStatusPayload) -> Any:
    code = payload.get("proposition_status_code")
    if not code:
        raise ValueError("Payload sem 'proposition_status_code'.")

    if PropositionStatus is None:
        raise RuntimeError("Dependências de banco não carregadas.")

    record = session.query(PropositionStatus).filter_by(proposition_status_code=code).one_or_none()
    if record is None:
        record = PropositionStatus(proposition_status_code=code)
        session.add(record)

    for field in PROPOSITION_STATUS_MUTABLE_FIELDS:
        if field in payload:
            setattr(record, field, payload[field])

    logger.debug("Situação %s sincronizada.", code)
    return record


def proposition_status(*, persist: bool = True, interactive: bool = False) -> None:
    """Sincroniza as situações de proposições fornecidas pelo Senado."""
    logger.info("Iniciando sincronização de situações de proposição (Senado).")

    data = _request_json(SENADO_STATUS_ENDPOINT)
    if data is None:
        logger.warning("Resposta vazia da API de situações de proposição.")
        return

    _ensure_db_dependencies()
    if _SESSION_SCOPE is None:
        raise RuntimeError("Função de sessão do banco não carregada.")

    payloads = list(_iter_payloads(data))
    if not payloads:
        logger.warning("Nenhuma situação retornada pelo Senado.")
        return

    processed = 0

    with _SESSION_SCOPE() as session:
        for payload in payloads:
            processed += 1
            if interactive or not persist:
                _debug_print(payload)
                if interactive:
                    try:
                        input("Pressione ENTER para continuar; Ctrl+C para sair.")
                    except (KeyboardInterrupt, EOFError):
                        logger.info("Execução interrompida pelo usuário.")
                        return
            if persist:
                _upsert_proposition_status(session, payload)

    if persist:
        logger.info("Sincronização de situações concluída (%s registros).", processed)
    else:
        logger.info("Execução em modo dry-run concluída (%s registros).", processed)


if __name__ == "__main__":
    import argparse

    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description="Sincroniza situações de proposição do Senado.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Não persiste no banco; apenas exibe os registros.",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Pausa entre cada registro para inspeção manual.",
    )

    args = parser.parse_args()

    proposition_status(persist=not args.dry_run, interactive=args.interactive)


