"""Registros de vídeos e áudios da Câmara."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class VideoAudio(Base):
    __tablename__ = "videos_audios"

    id = Column(BigInteger, primary_key=True, index=True)
    type = Column(Text)
    title = Column(Text)
    url = Column(Text)
    parliamentarian_id = Column(
        BigInteger,
        ForeignKey("parliamentarian.id", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date)
    hour_minute = Column(Text)
    place = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    parliamentarian = relationship("Parliamentarian", back_populates="videos_audios")


__all__ = ["VideoAudio"]

