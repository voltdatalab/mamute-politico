"""Acompanhamento de candidaturas (projetos_candidacy) + métricas novas.

O vínculo é só o registro da escolha do assinante — nenhuma feature consome o
dado ainda. Regras cobertas: dono só enxerga o próprio vínculo, duplicata é
409 amigável, candidatura inexistente é 404, desmarcar apaga a linha, e a cota
`qtd_candidatos` do plano (seed = 10) barra o excedente com mensagem em
português. As métricas admin agregam sem nunca expor quem marcou o quê.
"""

from __future__ import annotations

import pytest
from fastapi import Request
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from api import main
from api.dependencies import get_db
from api.routers import projects
from api.services.admin_metrics import (
    metrics_candidacy_favorites,
    metrics_mamutometro,
)


def _make_session() -> Session:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with engine.begin() as conn:
        conn.exec_driver_sql(
            """
            create table projetos (
                id integer primary key, nome text not null, cliente text,
                email text not null, tier_id integer, tag_ghost text,
                qtd_termos integer not null default 0,
                created_at datetime not null default current_timestamp,
                updated_at datetime not null default current_timestamp,
                deleted_at datetime
            )
            """
        )
        conn.exec_driver_sql(
            """
            create table parliamentarian (
                id integer primary key, type text, parliamentarian_code integer,
                name text, full_name text, status text, party text,
                state_elected text, details text,
                created_at datetime not null, updated_at datetime not null
            )
            """
        )
        conn.exec_driver_sql(
            """
            create table candidacy (
                id integer primary key, election_year integer not null,
                tse_candidate_id integer not null, office_code integer,
                office text, state text, ballot_number integer,
                ballot_name text, full_name text, party text, coalition text,
                status text, totalization_status text, cpf text, voter_id text,
                photo_url text, tse_last_update datetime,
                birth_date date, gender text, race text, education text,
                occupation text, marital_status text, nationality text,
                federation text, profile_source text,
                listing_fingerprint text, parliamentarian_id integer,
                match_status text not null default 'unmatched', details text,
                created_at datetime not null default current_timestamp,
                updated_at datetime not null default current_timestamp
            )
            """
        )
        conn.exec_driver_sql(
            """
            create table projetos_candidacy (
                id integer primary key, projeto_id integer not null,
                candidacy_id integer not null,
                created_at datetime not null default current_timestamp,
                unique (projeto_id, candidacy_id)
            )
            """
        )
        conn.exec_driver_sql(
            """
            create table project_mamutometro (
                id integer primary key, projeto_id integer not null,
                parliamentarian_id integer not null, level integer not null,
                created_at datetime not null default current_timestamp,
                updated_at datetime not null default current_timestamp,
                unique (projeto_id, parliamentarian_id)
            )
            """
        )
        for projeto_id, email in (
            (10, "assinante@example.com"),
            (20, "outro@example.com"),
        ):
            conn.execute(
                text(
                    """
                    insert into projetos (id, nome, email, qtd_termos)
                    values (:id, :nome, :email, 10)
                    """
                ),
                {"id": projeto_id, "nome": f"Projeto {projeto_id}", "email": email},
            )
        # 15 candidaturas de cargos/UFs variados para lista, cota e métricas.
        for cid in range(1, 16):
            conn.execute(
                text(
                    """
                    insert into candidacy
                        (id, election_year, tse_candidate_id, office_code,
                         office, state, ballot_name, party, match_status)
                    values (:id, 2026, :tse, :cargo, :office, :uf,
                            :nome, 'XPTO', 'unmatched')
                    """
                ),
                {
                    "id": cid,
                    "tse": 1000 + cid,
                    "cargo": 5 if cid % 2 else 6,
                    "office": "Senador" if cid % 2 else "Deputado Federal",
                    "uf": "CE" if cid <= 8 else "SP",
                    "nome": f"CANDIDATO {cid}",
                },
            )
    return Session(engine)


def _client(db: Session, *, token_email: str = "assinante@example.com") -> TestClient:
    app = main.create_app()

    def fake_verify_token(request: Request) -> dict[str, str]:
        request.state.token_email = token_email
        return {"sub": token_email}

    def fake_get_db():
        yield db

    app.dependency_overrides[main.verify_token] = fake_verify_token
    app.dependency_overrides[get_db] = fake_get_db
    app.dependency_overrides[projects.get_db] = fake_get_db
    return TestClient(app)


@pytest.fixture()
def db() -> Session:
    return _make_session()


def _acompanhar(client: TestClient, candidacy_id: int):
    return client.post(
        "/api/projects/me/candidacy-favorites", json={"candidacy_id": candidacy_id}
    )


def test_registra_lista_e_remove(db: Session) -> None:
    client = _client(db)

    criado = _acompanhar(client, 1)
    assert criado.status_code == 201
    assert criado.json()["candidacy_id"] == 1

    listagem = client.get("/api/projects/me/candidacy-favorites").json()
    assert [f["candidacy_id"] for f in listagem] == [1]

    removido = client.delete("/api/projects/me/candidacy-favorites/1")
    assert removido.status_code == 204
    assert client.get("/api/projects/me/candidacy-favorites").json() == []


def test_duplicata_e_409_amigavel(db: Session) -> None:
    client = _client(db)
    assert _acompanhar(client, 1).status_code == 201
    duplicata = _acompanhar(client, 1)
    assert duplicata.status_code == 409
    assert "acompanha" in duplicata.json()["detail"]


def test_candidatura_inexistente_e_404(db: Session) -> None:
    client = _client(db)
    assert _acompanhar(client, 999).status_code == 404


def test_remover_o_que_nao_acompanha_e_404(db: Session) -> None:
    client = _client(db)
    assert client.delete("/api/projects/me/candidacy-favorites/1").status_code == 404


def test_lista_e_escopada_por_assinante(db: Session) -> None:
    dono = _client(db)
    outro = _client(db, token_email="outro@example.com")
    _acompanhar(dono, 1)
    _acompanhar(outro, 2)
    assert [f["candidacy_id"] for f in dono.get("/api/projects/me/candidacy-favorites").json()] == [1]
    assert [f["candidacy_id"] for f in outro.get("/api/projects/me/candidacy-favorites").json()] == [2]


def test_cota_do_plano_barra_o_decimo_primeiro(db: Session) -> None:
    """Projeto sem tier cai no default do seed (10)."""
    client = _client(db)
    for cid in range(1, 11):
        assert _acompanhar(client, cid).status_code == 201
    barrado = _acompanhar(client, 11)
    assert barrado.status_code == 403
    assert "10/10" in barrado.json()["detail"]


def test_metrics_candidacy_favorites_agrega_por_cargo_e_uf(db: Session) -> None:
    client = _client(db)
    outro = _client(db, token_email="outro@example.com")
    _acompanhar(client, 1)   # Senador CE
    _acompanhar(client, 2)   # Dep. Federal CE
    _acompanhar(outro, 1)    # Senador CE — 2a pessoa no mesmo candidato

    data = metrics_candidacy_favorites(db)
    assert data["totals"] == {"links": 3, "candidacies": 2, "users": 2}
    assert data["top"][0]["candidacy_id"] == 1
    assert data["top"][0]["monitors"] == 2
    assert data["by_office"][0] == {"office": "Senador", "monitors": 2}
    assert data["by_state"][0] == {"state": "CE", "monitors": 3}


def test_metrics_mamutometro_tres_leituras(db: Session) -> None:
    """3 mamutes de um assinante + 2 de outro = 2 pessoas, 5 no total, média 2.5."""
    db.execute(
        text(
            """
            insert into parliamentarian (id, type, name, state_elected, created_at, updated_at)
            values (7, 'Deputado', 'Fulano', 'CE', '2026-01-01', '2026-01-01')
            """
        )
    )
    db.execute(
        text(
            """
            insert into project_mamutometro (projeto_id, parliamentarian_id, level)
            values (10, 7, 3), (20, 7, 2)
            """
        )
    )
    db.commit()

    data = metrics_mamutometro(db)
    assert data["totals"] == {"parliamentarians": 1, "marks": 2, "mamutinhos": 5}
    linha = data["top"][0]
    assert linha["people"] == 2
    assert linha["total"] == 5
    assert linha["average"] == 2.5
