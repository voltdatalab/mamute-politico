"""acompanhamento de candidaturas pelo assinante (projetos_candidacy)

Revision ID: cs62f7a8b9c0
Revises: e1f2a3b4c5d6
Create Date: 2026-08-23

O botao "+" da tela Buscar Candidaturas ficava inerte para quase todos os
candidatos: monitoramento era so por parlamentar, e a maioria das candidaturas
de 2026 nao tem vinculo na base. Esta tabela registra a escolha do assinante
POR CANDIDATURA — e nada mais: nenhuma feature consome o vinculo ainda
(decisao de produto em 2026-08-23); o dado existe para a apuracao poder contar
"voce acompanhou N, M foram eleitos". Sem cota e sem soft-delete.
"""

from alembic import op
import sqlalchemy as sa

revision = "cs62f7a8b9c0"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "projetos_candidacy",
        sa.Column("id", sa.BigInteger(), primary_key=True),
        sa.Column(
            "projeto_id",
            sa.BigInteger(),
            sa.ForeignKey("projetos.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "candidacy_id",
            sa.BigInteger(),
            sa.ForeignKey("candidacy.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "projeto_id", "candidacy_id", name="uq_projetos_candidacy_unique"
        ),
    )
    op.create_index(
        "ix_projetos_candidacy_projeto", "projetos_candidacy", ["projeto_id"]
    )
    op.create_index(
        "ix_projetos_candidacy_candidacy", "projetos_candidacy", ["candidacy_id"]
    )


def downgrade() -> None:
    op.drop_index("ix_projetos_candidacy_candidacy", table_name="projetos_candidacy")
    op.drop_index("ix_projetos_candidacy_projeto", table_name="projetos_candidacy")
    op.drop_table("projetos_candidacy")
