"""Modelo de comissões legislativas."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class Committee(Base):
    __tablename__ = "committee"

    id = Column(BigInteger, primary_key=True, index=True)
    committee_code = Column(Text)
    name = Column(Text)
    acronym = Column(Text)
    summary = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    attendances = relationship(
        "CommitteeAttendance",
        back_populates="committee",
        cascade="all, delete-orphan",
    )


__all__ = ["Committee"]

