#!/usr/bin/env bash
set -euo pipefail

python - <<'PY'
import os
import re
from pathlib import Path

# Materializa em /app/.env as variaveis que chegaram pelo ambiente do processo,
# para o cron — que roda sem herdar o env do PID 1 — conseguir le-las.
#
# CUIDADO (incidente de 03/09/2026): este bloco ja sobrescreveu o arquivo
# inteiro com `write_text`. Enquanto nenhuma variavel casava com os filtros a
# lista saia vazia e o arquivo ficava intocado, entao o estrago ficou latente
# por meses. No dia em que o compose passou a injetar DATABASE_URL,
# OPENAI_API_KEY e MAMUTE_ADMIN_EMAILS (CS-33), o bloco disparou e apagou 14
# chaves do .env montado — PORTAL_TRANSPARENCIA_API_KEY, SES_*, SMTP_*,
# MAIL_PROVIDER, GHOST_API — que so existiam naquele arquivo.
#
# Agora o merge e aditivo: as chaves vindas do ambiente sao atualizadas ou
# acrescentadas, e TUDO o mais que ja estava no arquivo e preservado.
dotenv_path = Path("/app/.env")
env_prefixes = ("BACKFILL_", "GHOST_", "MAMUTE_", "OPENAI_")
env_names = {
    "APPLICATION_NAME",
    "DATABASE_URL",
    "SQLALCHEMY_ECHO",
    # O cron NAO herda o ambiente do PID 1 — e por isso que este bloco existe.
    # Toda variavel que o docker-compose injeta para este servico precisa
    # aparecer aqui (ou casar com um prefixo), senao os jobs agendados nao a
    # enxergam. MAILGUN_SMTP_USER passou a vir do compose na CS-33 e nao casa
    # com nenhum prefixo.
    "MAILGUN_SMTP_USER",
}

KEY_RE = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=")


def dotenv_quote(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
    )
    return f'"{escaped}"'


gerenciadas = {
    key: os.environ[key]
    for key in sorted(os.environ)
    if (key in env_names or key.startswith(env_prefixes))
    and os.environ.get(key) is not None
}

if gerenciadas:
    existentes = []
    if dotenv_path.exists():
        existentes = dotenv_path.read_text(encoding="utf-8").splitlines()

    saida = []
    vistas = set()
    for linha in existentes:
        m = KEY_RE.match(linha)
        chave = m.group(1) if m else None
        if chave in gerenciadas:
            # Sobrescreve so esta chave, no lugar dela, preservando a ordem.
            saida.append(f"{chave}={dotenv_quote(gerenciadas[chave])}")
            vistas.add(chave)
        else:
            # Comentario, linha em branco ou chave que o ambiente nao gerencia:
            # preserva como esta. E aqui que moram PORTAL_TRANSPARENCIA_API_KEY,
            # SES_*, SMTP_* e companhia.
            saida.append(linha)

    novas = [k for k in gerenciadas if k not in vistas]
    if novas:
        saida.append("")
        saida.append("# Injetadas pelo ambiente do container (docker-compose).")
        saida.extend(f"{k}={dotenv_quote(gerenciadas[k])}" for k in novas)

    dotenv_path.write_text("\n".join(saida) + "\n", encoding="utf-8")
    dotenv_path.chmod(0o600)
PY

if [ ! -f "/app/.env" ]; then
  echo "Warning: /app/.env not found; scheduler jobs may fail due to missing env vars."
fi

CRON_FILE="/app/mamute_scrappers/docker/scrappers.cron"

if [ ! -f "$CRON_FILE" ]; then
  echo "Error: $CRON_FILE not found."
  exit 1
fi

chmod 0644 "$CRON_FILE"
crontab "$CRON_FILE"

echo "Installed scrappers cron schedule:"
crontab -l

if [ "${MAMUTE_GHOST_RECONCILE_ON_STARTUP:-true}" = "true" ]; then
  echo "Running startup Ghost tier/member reconciliation..."
  /app/mamute_scrappers/docker/run-cron-job.sh ghost-tiers-startup -- \
    /usr/local/bin/python -m mamute_scrappers.scripts.ghost_tiers_sync \
    || echo "Warning: startup ghost_tiers_sync failed; continuing."
  /app/mamute_scrappers/docker/run-cron-job.sh ghost-members-startup -- \
    /usr/local/bin/python -m mamute_scrappers.scripts.create_users \
    || echo "Warning: startup create_users failed; continuing."
else
  echo "Startup Ghost tier/member reconciliation disabled."
fi

echo "Starting cron in foreground..."
exec cron -f
