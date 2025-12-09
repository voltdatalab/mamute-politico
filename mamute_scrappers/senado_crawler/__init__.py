"""Coleção de tarefas de raspagem do Senado."""

from .parliamentarian import parliamentarian
from .proposition import proposition
from .proposition_status import proposition_status
from .proposition_type import proposition_type

__all__ = ["parliamentarian", "proposition", "proposition_status", "proposition_type"]


