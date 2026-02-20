"""Tipos de proposições legislativas."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class PropositionType(Base):
    __tablename__ = "proposition_type"

    id = Column(BigInteger, primary_key=True, index=True)
    type = Column(Text)
    proposition_type_code = Column(Text)
    acronym = Column(Text)
    name = Column(Text)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    propositions = relationship("Proposition", back_populates="proposition_type")


__all__ = ["PropositionType"]

