"""Definição do objeto Base para os modelos declarativos."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

__all__ = ["Base"]

