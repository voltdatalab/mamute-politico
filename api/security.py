"""Regras de autenticação integradas com o Ghost Members."""

from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import Any, Dict
from urllib.parse import urljoin

import jwt
import requests
from dotenv import load_dotenv
from fastapi import Header, HTTPException, Request
from jwt.algorithms import RSAAlgorithm
from jwt.exceptions import ExpiredSignatureError, InvalidSignatureError, InvalidTokenError
from requests import RequestException

load_dotenv()

# Algoritmo utilizado pelo Ghost para assinar os tokens.
JWT_ALGORITHM = "RS512"


def _normalize_base_url(value: str) -> str:
    value = value.strip()
    if not value.endswith("/"):
        value += "/"
    return value


@lru_cache(maxsize=1)
def get_ghost_settings() -> Dict[str, str]:
    """Carrega as variáveis necessárias para autenticação."""
    base_url = os.getenv("GHOST_BASE_URL") or os.getenv("PREFIX_URL")
    if not base_url:
        raise RuntimeError(
            "Defina a variável de ambiente GHOST_BASE_URL (ou PREFIX_URL) para usar a autenticação Ghost."
        )

    base_url = _normalize_base_url(base_url)
    audience = os.getenv("GHOST_MEMBERS_API_AUDIENCE") or urljoin(base_url, "members/api")
    issuer = os.getenv("GHOST_MEMBERS_API_ISSUER") or audience
    jwks_path = os.getenv("GHOST_JWKS_PATH") or "members/.well-known/jwks.json"
    jwks_url = urljoin(base_url, jwks_path)

    return {
        "base_url": base_url,
        "audience": audience,
        "issuer": issuer,
        "jwks_url": jwks_url,
    }


@lru_cache(maxsize=1)
def get_public_key() -> Any:
    """Obtém e mantém em cache a chave pública utilizada pelo Ghost Members."""
    settings = get_ghost_settings()

    try:
        response = requests.get(settings["jwks_url"], timeout=5)
        response.raise_for_status()
    except RequestException as exc:
        raise HTTPException(
            status_code=503,
            detail="Falha ao obter a chave pública do Ghost Members.",
        ) from exc

    jwk_data = response.json()
    keys = jwk_data.get("keys")
    if not keys:
        raise HTTPException(
            status_code=500,
            detail="Formato inesperado recebido ao buscar a chave pública do Ghost Members.",
        )

    return RSAAlgorithm.from_jwk(json.dumps(keys[0]))


def _extract_token(authorization_header: str) -> str:
    parts = authorization_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Cabeçalho Authorization inválido.")
    return parts[1]


def verify_token(request: Request, authorization: str = Header(...)) -> Dict[str, Any]:
    """Valida o JWT emitido pelo Ghost Members."""
    settings = get_ghost_settings()
    token = _extract_token(authorization)
    public_key = get_public_key()

    try:
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=[JWT_ALGORITHM],
            audience=settings["audience"],
            issuer=settings["issuer"],
        )
    except InvalidSignatureError:
        # Possível rotação de chave: limpa o cache e tenta novamente uma vez.
        get_public_key.cache_clear()  # type: ignore[attr-defined]
        public_key = get_public_key()
        decoded_token = jwt.decode(
            token,
            public_key,
            algorithms=[JWT_ALGORITHM],
            audience=settings["audience"],
            issuer=settings["issuer"],
        )
    except ExpiredSignatureError as exc:
        raise HTTPException(status_code=401, detail="O token expirou.") from exc
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="O token é inválido.") from exc

    # Armazena informações úteis para acesso nas rotas.
    request.state.token_payload = decoded_token
    request.state.token_email = decoded_token.get("sub")

    return decoded_token


__all__ = ["verify_token", "get_ghost_settings", "get_public_key"]
