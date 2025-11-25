"""Raspador de parlamentares do Senado.

Este módulo fornece ganchos para buscar dados dos parlamentares na API do Senado
e persistir as informações nas tabelas relacionadas (`Parliamentarian`,
`SocialNetwork`, `ParliamentarianSocialNetwork`). A função pública
`parliamentarian()` apenas orquestra o fluxo; adapte as funções privadas para
integrar com o endpoint desejado.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Iterable, List, Optional, TypedDict

import requests
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from mamute_scrappers.db.models import (
    Parliamentarian,
    ParliamentarianSocialNetwork,
    SocialNetwork,
)
from mamute_scrappers.db.session import session_scope

logger = logging.getLogger(__name__)

SENADO_API_BASE_URL = "https://legis.senado.leg.br/dadosabertos"  # ajuste se necessário


class SocialNetworkPayload(TypedDict, total=False):
    name: str
    url: Optional[str]
    profile_url: Optional[str]


class ParliamentarianPayload(TypedDict, total=False):
    id: int
    type: Optional[str]
    parliamentarian_code: Optional[int]
    name: Optional[str]
    full_name: Optional[str]
    email: Optional[str]
    telephone: Optional[str]
    cpf: Optional[str]
    status: Optional[str]
    party: Optional[str]
    state_of_birth: Optional[str]
    city_of_birth: Optional[str]
    state_elected: Optional[str]
    site: Optional[str]
    education: Optional[str]
    office_name: Optional[str]
    office_building: Optional[str]
    office_number: Optional[str]
    office_floor: Optional[str]
    office_email: Optional[str]
    biography_link: Optional[str]
    biography_text: Optional[str]
    details: Optional[dict]
    social_networks: List[SocialNetworkPayload]


PARLIAMENTARIAN_MUTABLE_FIELDS = [
    "type",
    "parliamentarian_code",
    "name",
    "full_name",
    "email",
    "telephone",
    "cpf",
    "status",
    "party",
    "state_of_birth",
    "city_of_birth",
    "state_elected",
    "site",
    "education",
    "office_name",
    "office_building",
    "office_number",
    "office_floor",
    "office_email",
    "biography_link",
    "biography_text",
    "details",
]


def parliamentarian() -> None:
    """Busca parlamentares do Senado e salva/atualiza no banco."""
    logger.info("Iniciando sincronização de parlamentares do Senado")
    payloads = list(_fetch_parliamentarians())
    if not payloads:
        logger.warning("Nenhum parlamentar retornado pela API do Senado")
        return

    with session_scope() as session:
        for payload in payloads:
            _upsert_parliamentarian(session, payload)
    logger.info("Sincronização de parlamentares concluída com sucesso")


def _fetch_parliamentarians() -> Iterable[ParliamentarianPayload]:
    """Orienta como consultar o endpoint oficial.

    Substitua a chamada abaixo pelo endpoint real do Senado. O exemplo usa
    `requests` apenas como guia; adapte a estrutura do payload conforme a resposta.
    """
    url = f"{SENADO_API_BASE_URL}/senador/lista/atual.json"  # placeholder
    logger.debug("Consultando API do Senado em %s", url)

    response = requests.get(url, timeout=30)
    response.raise_for_status()
    data = response.json()

    # TODO: Ajuste o parsing de `data` conforme o formato real retornado.
    senadores = data.get("ListaParlamentarEmExercicio", {}).get("Parlamentares", [])
    for item in senadores:
        identificacao = item.get("IdentificacaoParlamentar", {})
        redes = item.get("RedesSociais", [])
        yield ParliamentarianPayload(
            id=int(identificacao.get("CodigoParlamentar")),
            name=identificacao.get("NomeParlamentar"),
            full_name=identificacao.get("NomeCompletoParlamentar"),
            email=identificacao.get("EmailParlamentar"),
            party=identificacao.get("SiglaPartidoParlamentar"),
            state_elected=identificacao.get("UfParlamentar"),
            site=identificacao.get("UrlPaginaParlamentar"),
            biography_text=item.get("Informacoes", {}).get("ResumoBiografia"),
            social_networks=[
                SocialNetworkPayload(name=rede.get("redeSocial"), profile_url=rede.get("url"))
                for rede in redes
            ],
            details=item,
        )


def _upsert_parliamentarian(session: Session, payload: ParliamentarianPayload) -> Parliamentarian:
    """Atualiza ou cria um parlamentar conforme o payload informado."""
    if "id" not in payload:
        raise ValueError("Payload de parlamentar sem 'id'.")

    record: Parliamentarian | None = session.get(Parliamentarian, payload["id"])
    if record is None:
        record = Parliamentarian(id=payload["id"])
        session.add(record)

    for field in PARLIAMENTARIAN_MUTABLE_FIELDS:
        if field in payload:
            setattr(record, field, payload[field])

    _sync_social_networks(session, record, payload.get("social_networks", []))
    logger.debug("Parlamentar %s sincronizado", record.id)
    return record


def _sync_social_networks(
    session: Session,
    parliamentarian: Parliamentarian,
    socials: Iterable[SocialNetworkPayload],
) -> None:
    """Sincroniza redes sociais associadas ao parlamentar."""
    existing_links = {link.social_network.name: link for link in parliamentarian.social_networks}
    handled = set()

    for social in socials:
        name = social.get("name")
        if not name:
            continue
        handled.add(name)

        network = session.query(SocialNetwork).filter_by(name=name).one_or_none()
        if network is None:
            network = SocialNetwork(name=name, url=social.get("url"))
            session.add(network)

        link = existing_links.get(name)
        if link is None:
            link = ParliamentarianSocialNetwork(
                parliamentarian=parliamentarian,
                social_network=network,
            )
            session.add(link)

        link.profile_url = social.get("profile_url")

    # Remove vínculos de redes que não estão mais presentes
    for name, link in existing_links.items():
        if name not in handled:
            session.delete(link)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    parliamentarian()


