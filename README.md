# 🐘 Mamute-Politico

Monorepo do projeto Mamute Político (Correio Sabiá), com coleta de dados legislativos, API pública, interface web (SPA), backend de chatbot e integração com autenticação Ghost.

## Programas do repositório

- `mamute_scrappers` (coleta e sincronização de dados): `mamute_scrappers/README.md`
- `api` (API FastAPI de dados): `api/README.md`
- `chatbot_backend` (chatbot com RAG + pgvector): `chatbot_backend/README.md`
- `ui` (interface web React): `ui/README.md`

## Inicialização rápida (local)

1. Clone o repositório e entre na pasta raiz.
2. Configure e execute os scrappers primeiro (para popular/atualizar o banco).
3. Suba a API (`api`) para expor os dados coletados.
4. Suba o backend do chatbot (`chatbot_backend`) para as rotas de pergunta e streaming.
5. (Opcional) Rode a interface em `ui/` com `npm ci` e `npm run dev`, configurando `VITE_BASE_URL` para a mesma origem em que o navegador acessa a API e o Ghost (veja a seção [Interface web (ui)](#interface-web-ui) abaixo).

## Ordem recomendada de execução

1. `mamute_scrappers` -> migrações + coleta/sincronização.
2. `api` -> leitura do banco.
3. `chatbot_backend` -> indexação vetorial + serviço de chat.
4. `ui` -> front-end (após API e, se usar o chat na interface, o chatbot).

## Links rápidos

- [README dos Scrappers](mamute_scrappers/README.md)
- [README da API](api/README.md)
- [README do Chatbot Backend](chatbot_backend/README.md)
- [README da interface (UI)](ui/README.md)

## Diagrama

![Diagrama do banco de dados](mamute_scrappers/db/db.png)
