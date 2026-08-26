# 🐘 Mamute Político — núcleo aberto

Núcleo de dados do [Mamute Político](https://mamutepolitico.com.br), plataforma de
monitoramento da atividade parlamentar brasileira do [Correio Sabiá](https://correiosabia.com.br),
desenvolvida com apoio do **Codesinfo — Fundo de Inovação para o Jornalismo** (Projor).

Este repositório contém tudo que transforma dados públicos dispersos em uma base
consultável — e é **software livre sob [AGPLv3](LICENSE)**: qualquer redação ou
organização pode usar, auditar e derivar, desde que mantenha o derivado aberto.

## O que mora aqui

| Módulo | O quê |
|---|---|
| [`mamute_scrappers/`](mamute_scrappers/README.md) | Coletores de dados: Câmara, Senado, TSE (candidaturas, histórico eleitoral e perfil demográfico 1994→2026), Portal da Transparência (emendas), Transferegov, cota parlamentar. Inclui as **migrations Alembic** — o schema completo do banco. |
| [`api/`](api/README.md) | API FastAPI de leitura dos dados legislativos e eleitorais. |
| [`docs/arquitetura-ia.md`](docs/arquitetura-ia.md) | **Como funciona a IA do Mamute** — motor RAG, modelos, embeddings, limites. |

A camada de **produto** (interface web, chatbot e deploy) é privada e vive em
`correiosabia/mamute-politico-app`. A divisão é deliberada: o *como obtemos e
tratamos os dados* é público e auditável; a experiência de produto financia o projeto.

## Rodando o núcleo

Requisitos: Python 3.11+, PostgreSQL 16+ com a extensão `pgvector`.

```bash
# banco
createdb mamute_politico && psql mamute_politico -c "CREATE EXTENSION vector;"

# migrations (schema completo)
cd mamute_scrappers && pip install -r requirements.txt && \
  DATABASE_URL=postgresql+psycopg2://user:pass@localhost/mamute_politico alembic upgrade head

# um coletor, por exemplo o de candidaturas do TSE (dados abertos, 1994→2022)
python -m mamute_scrappers.tse_crawler.consulta_cand --anos 2022

# a API
cd ../api && pip install -r requirements.txt && uvicorn main:app --reload
```

Cada módulo tem README próprio com os comandos de todos os coletores, os cronjobs
recomendados e os gotchas de cada fonte (e são muitos — documentados conforme medidos
ao vivo).

## Licença e uso por outras organizações

**AGPLv3**: uso, estudo e modificação livres; quem oferecer um serviço derivado deve
abrir o código derivado. Dados coletados são públicos por natureza (fontes: dados
abertos da Câmara, Senado, TSE e Portal da Transparência) — a licença cobre o código,
não os dados. Dúvidas ou interesse em cooperação: contato@correiosabia.com.br.
