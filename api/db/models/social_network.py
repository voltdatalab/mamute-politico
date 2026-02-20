"""Modelos de redes sociais e vinculação com parlamentares."""

from __future__ import annotations

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..base import Base


class SocialNetwork(Base):
    __tablename__ = "social_network"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(Text)
    url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    parliamentarian_links = relationship(
        "ParliamentarianSocialNetwork",
        back_populates="social_network",
        cascade="all, delete-orphan",
    )


class ParliamentarianSocialNetwork(Base):
    __tablename__ = "parliamentarian_social_network"

    id = Column(BigInteger, primary_key=True, index=True)
    parliamentarian_id = Column(
        BigInteger,
        ForeignKey("parliamentarian.id", ondelete="CASCADE"),
        nullable=False,
    )
    social_network_id = Column(
        BigInteger,
        ForeignKey("social_network.id", ondelete="CASCADE"),
        nullable=False,
    )
    profile_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    parliamentarian = relationship("Parliamentarian", back_populates="social_networks")
    social_network = relationship("SocialNetwork", back_populates="parliamentarian_links")


__all__ = ["SocialNetwork", "ParliamentarianSocialNetwork"]

