"""CS-74: indices por parliamentarian_id nas tabelas de atividade

As quatro tabelas que respondem "o que este parlamentar fez" nao tinham
indice pela coluna que sempre aparece no WHERE. Consultar a atividade de uma
pessoa custava seq scan da tabela inteira:

    authors_proposition   520k linhas   ~76 ms por parlamentar
    roll_call_votes       300k linhas  ~105 ms
    plenary_attendance    188k linhas   ~53 ms
    speeches_transcripts  123k linhas  ~130 ms

Medido em producao em 03/09/2026: a ficha de 3 parlamentares (contagem por
tipo de dado) levava 2,2 s. E o custo aparece em todo lugar que pergunta por
uma pessoa — ficha do chatbot (CS-74), card de estatisticas, API de projetos.

`speeches_transcripts` ja tinha `parliamentarian_id` como primeira coluna de
`uq_speeches_transcripts_nolink_natural`, mas aquele indice e PARCIAL
(`WHERE speech_link IS NULL`), entao o planner nao pode usa-lo para uma
consulta que nao repete o mesmo predicado.

CONCURRENTLY para nao travar escrita das tabelas grandes durante o deploy —
exige rodar fora de transacao, dai o autocommit_block. IF NOT EXISTS porque
a fila de deploy ja travou uma vez com migration nao-idempotente.

Revision ID: cs74a1b2c3d4
Revises: cs69a1b2c3d4
"""

from alembic import op

revision = "cs74a1b2c3d4"
down_revision = "cs69a1b2c3d4"
branch_labels = None
depends_on = None

INDEXES = (
    ("ix_authors_proposition_parliamentarian_id", "authors_proposition"),
    ("ix_roll_call_votes_parliamentarian_id", "roll_call_votes"),
    ("ix_plenary_attendance_parliamentarian_id", "plenary_attendance"),
    ("ix_speeches_transcripts_parliamentarian_id", "speeches_transcripts"),
)


def upgrade() -> None:
    with op.get_context().autocommit_block():
        for index_name, table in INDEXES:
            op.execute(
                f"CREATE INDEX CONCURRENTLY IF NOT EXISTS {index_name} "
                f"ON {table} (parliamentarian_id)"
            )


def downgrade() -> None:
    with op.get_context().autocommit_block():
        for index_name, _table in INDEXES:
            op.execute(f"DROP INDEX CONCURRENTLY IF EXISTS {index_name}")
