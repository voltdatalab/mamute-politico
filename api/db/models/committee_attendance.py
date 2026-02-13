"""Modelo de registros de presença em comissões."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class CommitteeAttendance(Base):
    __tablename__ = "committee_attendance"

    id = Column(BigInteger, primary_key=True, index=True)
    parliamentarian_id = Column(
        BigInteger,
        ForeignKey("parliamentarian.id", ondelete="CASCADE"),
        nullable=False,
    )
    committee_id = Column(
        BigInteger,
        ForeignKey("committee.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date)
    description = Column(Text)
    type = Column(Text)
    link = Column(Text)
    frequency = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    parliamentarian = relationship("Parliamentarian", back_populates="committee_attendances")
    committee = relationship("Committee", back_populates="attendances")


__all__ = ["CommitteeAttendance"]

