"""Órgãos e agências responsáveis por proposições."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class Agency(Base):
    __tablename__ = "agency"

    id = Column(BigInteger, primary_key=True, index=True)
    agency_code = Column(BigInteger)
    agency_type_code = Column(Text)
    agency_type = Column(Text)
    acronym = Column(Text)
    name = Column(Text)
    alias = Column(Text)
    publication_name = Column(Text)
    short_name = Column(Text)
    uri = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    propositions = relationship("Proposition", back_populates="agency")


__all__ = ["Agency"]

