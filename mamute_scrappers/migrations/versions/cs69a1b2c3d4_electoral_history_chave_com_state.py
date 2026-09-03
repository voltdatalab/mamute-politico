"""CS-69: chave natural de electoral_history passa a incluir state

Ate 2008 o TSE usava ids de candidato sequenciais curtos, unicos apenas
dentro de (ano, unidade eleitoral). A chave antiga
`uq_electoral_history_year_tse_id (election_year, tse_candidate_id)` fazia
duas disputas de pessoas diferentes colidirem numa linha so — em 2006 o id
10354 pertence ao Flavio Bolsonaro no RJ e ao Manoel do Carmo no AC.

A tabela `candidacy` ja usava a chave correta
(`uq_candidacy_election_state_tse_id`); a `electoral_history` ficou sem o
`state`.

Idempotente de proposito: a fila de deploy ja travou uma vez com migration
nao-idempotente. Usa IF EXISTS / IF NOT EXISTS nos dois sentidos.

NULLS NOT DISTINCT porque `state` e nullable — sem isso duas linhas com
state nulo escapariam da unicidade. Exige Postgres >= 15 (producao roda 16).

Revision ID: cs69a1b2c3d4
Revises: cs62f7a8b9c0
"""

from alembic import op

revision = "cs69a1b2c3d4"
down_revision = "cs62f7a8b9c0"
branch_labels = None
depends_on = None

OLD_NAME = "uq_electoral_history_year_tse_id"
NEW_NAME = "uq_electoral_history_year_state_tse_id"


def upgrade() -> None:
    # A chave antiga pode existir como constraint (criada via UniqueConstraint)
    # ou como indice solto, dependendo de como o ambiente foi provisionado.
    op.execute(
        f"ALTER TABLE electoral_history DROP CONSTRAINT IF EXISTS {OLD_NAME}"
    )
    op.execute(f"DROP INDEX IF EXISTS {OLD_NAME}")

    # A nova chave e mais permissiva que a antiga (mais colunas => menos
    # colisoes), entao nao ha risco de conflito com as linhas ja gravadas.
    op.execute(
        f"""
        CREATE UNIQUE INDEX IF NOT EXISTS {NEW_NAME}
        ON electoral_history (election_year, state, tse_candidate_id)
        NULLS NOT DISTINCT
        """
    )


def downgrade() -> None:
    op.execute(f"DROP INDEX IF EXISTS {NEW_NAME}")
    # A chave antiga so volta se os dados couberem nela. Depois do reseed da
    # CS-69 existem linhas que colidem em (ano, tse_id) — por isso o
    # ON CONFLICT nao e possivel aqui e a recriacao pode falhar de proposito:
    # voltar atras exige decidir qual disputa descartar.
    op.execute(
        f"""
        CREATE UNIQUE INDEX IF NOT EXISTS {OLD_NAME}
        ON electoral_history (election_year, tse_candidate_id)
        """
    )
