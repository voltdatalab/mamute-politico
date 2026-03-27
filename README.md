# 🐘 Mamute-Politico

Monorepo do projeto Mamute Político (Correio Sabiá), com coleta de dados legislativos, API pública e backend de chatbot.

## Programas do repositório

- `mamute_scrappers` (coleta e sincronização de dados): `mamute_scrappers/README.md`
- `api` (API FastAPI de dados): `api/README.md`
- `chatbot_backend` (chatbot com RAG + pgvector): `chatbot_backend/README.md`

## Inicialização rápida (local)

1. Clone o repositório e entre na pasta raiz.
2. Configure e execute os scrappers primeiro (para popular/atualizar o banco).
3. Suba a API (`api`) para expor os dados coletados.
4. Suba o backend do chatbot (`chatbot_backend`) para as rotas de pergunta e streaming.

## Ordem recomendada de execução

1. `mamute_scrappers` -> migrações + coleta/sincronização.
2. `api` -> leitura do banco.
3. `chatbot_backend` -> indexação vetorial + serviço de chat.

## Links rápidos

- [README dos Scrappers](mamute_scrappers/README.md)
- [README da API](api/README.md)
- [README do Chatbot Backend](chatbot_backend/README.md)

## Diagrama

![Diagrama do banco de dados](mamute_scrappers/db/db.png)
