"""Configuração do ambiente de migrações do Alembic."""

from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context

# Garante que o pacote mamute_scrappers seja importável mesmo executando o Alembic
# dentro do diretório do pacote.
BASE_DIR = Path(__file__).resolve().parents[2]
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from dotenv import load_dotenv

load_dotenv(BASE_DIR / ".env", override=False)

from mamute_scrappers.db import models  # noqa: F401,E402  # garante o registro dos modelos
from mamute_scrappers.db.base import Base  # noqa: E402
from mamute_scrappers.db.engine import get_engine  # noqa: E402

from alembic.autogenerate import renderers
from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import JSONB

# Esta é a configuração interpretada pelo Alembic a partir do alembic.ini.
config = context.config

# Configura logging via arquivo de configuração, se disponível.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadados alvo usados no autogenerate.
target_metadata = Base.metadata


@renderers.dispatch_for(JSONB)
def _render_jsonb(type_, autogen_context):
    autogen_context.imports.add("from sqlalchemy import Text")
    autogen_context.imports.add("from sqlalchemy.dialects import postgresql")
    return "postgresql.JSONB(astext_type=Text())"


def _get_url() -> str:
    """Retorna a URL de conexão do banco."""
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url
    return config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Executa migrações em modo offline."""
    url = _get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa migrações em modo online."""
    connectable = get_engine(_get_url())

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
