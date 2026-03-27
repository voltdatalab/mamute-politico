"""add analysis_type column to speech analysis tables

Revision ID: df2d3f4c8a56
Revises: f3b0b7f2c4d1
Create Date: 2026-03-11 15:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "df2d3f4c8a56"
down_revision: Union[str, None] = "f3b0b7f2c4d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "speeches_transcripts_keywords",
        sa.Column(
            "analysis_type",
            sa.Text(),
            nullable=False,
            server_default=sa.text("'spacy'"),
        ),
    )
    op.add_column(
        "speeches_transcripts_entities",
        sa.Column(
            "analysis_type",
            sa.Text(),
            nullable=False,
            server_default=sa.text("'spacy'"),
        ),
    )

    # Remove server default after data backfill to keep explicit values.
    op.alter_column(
        "speeches_transcripts_keywords",
        "analysis_type",
        server_default=None,
    )
    op.alter_column(
        "speeches_transcripts_entities",
        "analysis_type",
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column("speeches_transcripts_entities", "analysis_type")
    op.drop_column("speeches_transcripts_keywords", "analysis_type")
