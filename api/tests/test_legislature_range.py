"""CS-76: a janela da legislatura e derivada da data, nao hardcoded.

Legislatura no Brasil dura 4 anos e comeca em 1o de fevereiro do ano seguinte
a eleicao geral: 2015, 2019, 2023, 2027... O mes de janeiro e a pegadinha —
ele ainda pertence a legislatura ANTERIOR, porque a posse e em fevereiro.

Sem esses testes, a virada de fev/2027 passaria despercebida ate alguem notar
que o card estava somando duas legislaturas.
"""

from __future__ import annotations

from datetime import date

import pytest

from api.routers.projects import _current_legislature_range


@pytest.mark.parametrize(
    "hoje, ano_inicio_esperado",
    [
        # 57a legislatura, a vigente
        (date(2023, 2, 1), 2023),
        (date(2026, 9, 3), 2023),
        (date(2027, 1, 31), 2023),
        # Janeiro pertence a legislatura anterior — a posse e em 1o de fevereiro
        (date(2023, 1, 15), 2019),
        (date(2023, 1, 31), 2019),
        (date(2019, 1, 31), 2015),
        # Virada para a 58a
        (date(2027, 2, 1), 2027),
        (date(2028, 6, 10), 2027),
        # Legislaturas anteriores continuam resolvendo certo
        (date(2021, 6, 10), 2019),
    ],
)
def test_janela_da_legislatura_por_data(hoje: date, ano_inicio_esperado: int) -> None:
    inicio, _ = _current_legislature_range(hoje)
    assert inicio == date(ano_inicio_esperado, 2, 1)


def test_janela_nao_avanca_para_o_futuro() -> None:
    """O fim da janela e cortado em hoje.

    Sem o corte, a legislatura vigente teria um recorte ate 2027 enquanto as
    outras metricas param em hoje — os numeros ficariam incomparaveis.
    """
    hoje = date(2026, 9, 3)
    _, fim = _current_legislature_range(hoje)
    assert fim == hoje


def test_legislatura_encerrada_vai_ate_o_fim_dela() -> None:
    hoje = date(2028, 6, 10)
    inicio, fim = _current_legislature_range(hoje)
    assert inicio == date(2027, 2, 1)
    assert fim == hoje
