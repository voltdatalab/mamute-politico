"""Scrapers para a Câmara dos Deputados."""

from .parliamentarian import parliamentarian
from .proposition import proposition
from .agency import agency
from .speeches_transcripts import speeches_transcripts

__all__ = ["parliamentarian", "proposition", "agency", "speeches_transcripts"]