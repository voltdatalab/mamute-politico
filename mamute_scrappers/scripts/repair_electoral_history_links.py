"""CS-69: realinha o vinculo de electoral_history com a candidatura de origem.

Contexto
--------
A chave natural antiga (`election_year`, `tse_candidate_id`) nao incluia a
unidade eleitoral. Ate 2008 os ids do TSE eram sequenciais curtos, unicos so
dentro de (ano, UE), entao duas disputas de pessoas diferentes colidiam numa
linha so.

Quando isso acontecia, `_DISPUTE_FIELDS` sobrescrevia cargo/UF/partido/nome
com os do segundo candidato, mas `_LINK_FIELDS` nao: ele so escreve vinculo
quando o payload traz valor nao-nulo, justamente para nao apagar um vinculo ja
resolvido. O efeito colateral e que o `parliamentarian_id` do primeiro ficava
grudado numa linha que passou a ser de outra pessoa.

A migration cs69a1b2c3d4 corrige a chave, e o reseed recria as disputas que
foram perdidas. Mas as linhas ja corrompidas nao se consertam sozinhas: o
reseed nao limpa vinculo. Este script faz esse passo.

O que faz
---------
Para toda linha que veio de uma candidatura (`candidacy_id` nao nulo), forca
`electoral_history.parliamentarian_id` a ser igual ao `parliamentarian_id`
daquela candidatura — inclusive para NULL, quando a candidatura esta
`unmatched`.

Linhas com `candidacy_id` nulo NAO sao tocadas: sao as da fase 2
(`seed_missing_parliamentarians`), que resolve o vinculo por nome sem passar
por `candidacy`, e onde divergir do candidacy e o estado normal.

Uso
---
    python -m mamute_scrappers.scripts.repair_electoral_history_links --dry-run
    python -m mamute_scrappers.scripts.repair_electoral_history_links

Idempotente: rodar duas vezes nao muda nada na segunda.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from sqlalchemy import text

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

logger = logging.getLogger(__name__)

# Linhas divergentes, com um retrato de quem elas dizem ser hoje. Serve tanto
# para o dry-run quanto para o log do que foi alterado.
SELECT_DIVERGENTES = text(
    """
    SELECT eh.id,
           eh.election_year,
           eh.state,
           eh.tse_candidate_id,
           eh.ballot_name,
           eh.parliamentarian_id AS vinculo_atual,
           c.parliamentarian_id  AS vinculo_correto,
           p.name                AS parlamentar_atual
    FROM electoral_history eh
    JOIN candidacy c ON c.id = eh.candidacy_id
    LEFT JOIN parliamentarian p ON p.id = eh.parliamentarian_id
    WHERE eh.parliamentarian_id IS DISTINCT FROM c.parliamentarian_id
    ORDER BY eh.election_year, eh.id
    """
)

UPDATE_DIVERGENTES = text(
    """
    UPDATE electoral_history eh
    SET parliamentarian_id = c.parliamentarian_id
    FROM candidacy c
    WHERE c.id = eh.candidacy_id
      AND eh.parliamentarian_id IS DISTINCT FROM c.parliamentarian_id
    """
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Lista as linhas divergentes sem gravar.",
    )
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    from mamute_scrappers.db.session import session_scope

    with session_scope() as session:
        linhas = session.execute(SELECT_DIVERGENTES).mappings().all()

        if not linhas:
            logger.info("Nada a corrigir: nenhum vinculo divergente.")
            return 0

        logger.info("Linhas divergentes encontradas: %s", len(linhas))
        afetados = {r["vinculo_atual"] for r in linhas if r["vinculo_atual"]}
        logger.info("Parlamentares com atribuicao errada: %s", len(afetados))

        for r in linhas[:20]:
            logger.info(
                "  id=%s %s/%s tse=%s '%s' — hoje atribuida a %s, correto: %s",
                r["id"],
                r["election_year"],
                r["state"],
                r["tse_candidate_id"],
                r["ballot_name"],
                r["parlamentar_atual"] or r["vinculo_atual"],
                r["vinculo_correto"] if r["vinculo_correto"] else "NENHUM",
            )
        if len(linhas) > 20:
            logger.info("  ... e mais %s linhas.", len(linhas) - 20)

        if args.dry_run:
            logger.info("Dry-run: nada foi gravado.")
            return 0

        resultado = session.execute(UPDATE_DIVERGENTES)
        session.commit()
        logger.info("Linhas corrigidas: %s", resultado.rowcount)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
