"""Coleção de tarefas de raspagem do Senado."""

from .parliamentarian import parliamentarian
from .proposition import proposition
from .roll_call_votes import roll_call_votes
from .proposition_status import proposition_status
from .proposition_type import proposition_type
from .speechs_transcipts import speechs_transcipts

__all__ = ["parliamentarian", "proposition", "proposition_status", "proposition_type", "roll_call_votes", "speechs_transcipts"]


