"""Scrapers para a Câmara dos Deputados."""

from .parliamentarian import parliamentarian
from .proposition import proposition
from .proposition_status import proposition_status
from .agency import agency
from .speeches_transcripts import speeches_transcripts

__all__ = ["parliamentarian", "proposition", "proposition_status", "agency", "speeches_transcripts"]