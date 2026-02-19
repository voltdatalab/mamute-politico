"""Sincroniza órgãos da Câmara dos Deputados."""

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

CAMARA_API_BASE_URL = "https://dadosabertos.camara.leg.br/api/v2"
CAMARA_ORGAOS_ENDPOINT = f"{CAMARA_API_BASE_URL}/orgaos"

if TYPE_CHECKING:  # pragma: no cover
    from mamute_scrappers.db.models import Agency as AgencyModel
    from mamute_scrappers.db.session import session_scope as session_scope_type

    SessionScopeCallable = Callable[[], ContextManager["Session"]]
else:
    AgencyModel = Any
    SessionScopeCallable = Callable[[], ContextManager[Session]]

Agency: Any = None
_SESSION_SCOPE: Optional[SessionScopeCallable] = None


class AgencyPayload(TypedDict, total=False):
    agency_code: int
    agency_type_code: Optional[str]
    agency_type: Optional[str]
    acronym: Optional[str]
    name: Optional[str]
    alias: Optional[str]
    publication_name: Optional[str]
    short_name: Optional[str]
    uri: Optional[str]


AGENCY_MUTABLE_FIELDS = [
    "agency_code",
    "agency_type_code",
    "agency_type",
    "acronym",
    "name",
    "alias",
    "publication_name",
    "short_name",
    "uri",
]


def _ensure_db_dependencies() -> None:
    global Agency, _SESSION_SCOPE
    if _SESSION_SCOPE is not None:
        return

    try:
        from mamute_scrappers.db.models import Agency as AgencyModelRuntime
        from mamute_scrappers.db.session import session_scope as session_scope_runtime
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError("Não foi possível carregar dependências de banco.") from exc

    Agency = AgencyModelRuntime
    _SESSION_SCOPE = session_scope_runtime


def _normalize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = " ".join(value.split())
    return cleaned or None


def _coerce_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        return _normalize_text(value)
    return _normalize_text(str(value))


def _parse_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def _request_json(url: str, *, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    headers = {"Accept": "application/json"}
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error("Falha ao consultar %s: %s", url, exc)
        return None

    try:
        data = response.json()
    except ValueError as exc:
        logger.error("Erro ao parsear JSON da Câmara (%s): %s", url, exc)
        return None

    if not isinstance(data, dict):
        logger.error("Resposta JSON inesperada da Câmara (%s): tipo %s", url, type(data))
        return None

    return data


def _normalize_item(item: Any) -> Optional[AgencyPayload]:
    if not isinstance(item, dict):
        return None

    agency_id = _parse_int(item.get("id"))
    if agency_id is None:
        return None

    agency_type_code_raw = item.get("codTipoOrgao")
    agency_type_code = None
    if isinstance(agency_type_code_raw, int):
        agency_type_code = str(agency_type_code_raw)
    elif isinstance(agency_type_code_raw, str) and agency_type_code_raw.strip():
        agency_type_code = agency_type_code_raw.strip()

    payload: AgencyPayload = {
        "agency_code": agency_id,
        "agency_type_code": agency_type_code,
        "agency_type": _coerce_text(item.get("tipoOrgao")),
        "acronym": _coerce_text(item.get("sigla")),
        "name": _coerce_text(item.get("nome")),
        "alias": _coerce_text(item.get("apelido")),
        "publication_name": _coerce_text(item.get("nomePublicacao")),
        "short_name": _coerce_text(item.get("nomeResumido")),
        "uri": _coerce_text(item.get("uri")),
    }

    return payload


def _iter_agencies_paginated() -> Iterable[AgencyPayload]:
    """Itera sobre todos os órgãos usando paginação."""
    page = 1
    total_fetched = 0

    while True:
        params = {
            "itens": 100,
            "pagina": page,
            "ordem": "ASC",
            "ordenarPor": "id",
        }

        logger.debug("Buscando página %s de órgãos", page)
        data = _request_json(CAMARA_ORGAOS_ENDPOINT, params=params)

        if data is None:
            logger.warning("Falha ao buscar página %s de órgãos", page)
            break

        dados = data.get("dados")
        if not isinstance(dados, list) or not dados:
            logger.debug("Página %s sem dados, encerrando paginação", page)
            break

        page_count = 0
        for item in dados:
            payload = _normalize_item(item)
            if payload is not None:
                page_count += 1
                total_fetched += 1
                yield payload

        logger.info("Página %s processada (%s órgãos)", page, page_count)

        # Verificar se tem próxima página
        links = data.get("links", [])
        has_next = any(
            isinstance(link, dict) and link.get("rel") == "next"
            for link in links
        )

        if not has_next:
            logger.debug("Última página alcançada (página %s)", page)
            break

        page += 1

    logger.info("Total de órgãos obtidos: %s", total_fetched)


def _debug_print(payload: AgencyPayload) -> None:
    debug_repr = json.dumps(payload, ensure_ascii=False, indent=2, default=str)
    print(debug_repr)


def _upsert_agency(session: Session, payload: AgencyPayload) -> Any:
    agency_code = payload.get("agency_code")
    if agency_code is None:
        raise ValueError("Payload sem 'agency_code'.")

    if Agency is None:
        raise RuntimeError("Dependências de banco não carregadas.")

    record = session.query(Agency).filter_by(agency_code=agency_code).one_or_none()
    if record is None:
        record = Agency(agency_code=agency_code)
        session.add(record)

    for field in AGENCY_MUTABLE_FIELDS:
        if field in payload:
            setattr(record, field, payload[field])

    logger.debug("Órgão %s (%s) sincronizado.", payload.get("acronym"), agency_code)
    return record


def agency(*, persist: bool = True, interactive: bool = False) -> None:
    """Sincroniza os órgãos fornecidos pela Câmara dos Deputados."""
    logger.info("Iniciando sincronização de órgãos (Câmara).")

    _ensure_db_dependencies()
    if _SESSION_SCOPE is None:
        raise RuntimeError("Função de sessão do banco não carregada.")

    processed = 0

    try:
        with _SESSION_SCOPE() as session:
            for payload in _iter_agencies_paginated():
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
                    _upsert_agency(session, payload)
    except KeyboardInterrupt:
        logger.info("Execução interrompida pelo usuário após %s registros.", processed)
        return

    if processed == 0:
        logger.warning("Nenhum órgão retornado pela Câmara.")
    elif persist:
        logger.info("Sincronização de órgãos concluída (%s registros).", processed)
    else:
        logger.info("Execução em modo dry-run concluída (%s registros).", processed)


if __name__ == "__main__":
    import argparse

    logging.basicConfig(level=logging.INFO)

    parser = argparse.ArgumentParser(description="Sincroniza órgãos da Câmara dos Deputados.")
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

    agency(persist=not args.dry_run, interactive=args.interactive)
