# 🐘 Mamute-Politico

Monorepo do projeto Mamute Político (Correio Sabiá), com coleta de dados legislativos, API pública, interface web (SPA), backend de chatbot e integração com autenticação via **Ghost** (CMS / portal de membros).

## Programas do repositório

![Diagrama de arquitetura](environments/architecture.svg)

- `mamute_scrappers` (coleta e sincronização de dados): [`mamute_scrappers/README.md`](mamute_scrappers/README.md)
- `api` (API FastAPI de dados legislativos): [`api/README.md`](api/README.md)
- `chatbot_backend` (chatbot com RAG + pgvector): [`chatbot_backend/README.md`](chatbot_backend/README.md)
- `ui` (interface web React): [`ui/README.md`](ui/README.md)
- `environments` (Caddy + Docker Compose por ambiente): pasta [`environments/`](environments/) 

## Inicializar a Stack

- Baixe e instale o Docker na máquina.
- Clone o repositório, rode o script utilitário de configuração e forneça as informações requisitadas pelo script:

```
cd environments/tools && ./setup.sh
```

- Rode o script para subir a aplicação

```
./up.sh
```

- Para verificar o status, use:

```
./status.sh
```


## Stack Docker em produção

O ficheiro [`environments/production/docker-compose.yml`](environments/production/docker-compose.yml) define o compose **`prod-mamute-politico`** com os seguintes serviços:

| Serviço | Função |
|---------|--------|
| **`caddy`** | Proxy reverso na porta `CADDY_HTTP_PORT` (por omissão 80). Monta o [`Caddyfile`](environments/production/Caddyfile) e volumes de dados/configuração do Caddy. |
| **`ui`** | Imagem construída a partir de [`ui/Dockerfile`](ui/Dockerfile) (build estático do front). O Caddy encaminha o tráfego com prefixo `/app` para o contentor `ui:8080`. |
| **`mamute-politico-api`** | API FastAPI de dados legislativos (build em `api`), com `api/.env` montado em `/app/.env`. O Caddy encaminha `/api*` para a porta 8000 deste serviço. |
| **`mamute-politico-chatbot`** | Backend do chatbot (build em `chatbot_backend`), com `chatbot_backend/.env` montado em `/app/.env`. O Caddy encaminha `/chat*` para a porta 8000 deste serviço. |
| **`mamute-politico-scrappers`** | Scheduler de coleta/sincronização (build em `mamute_scrappers`), com `mamute_scrappers/.env` montado em `/app/.env` e rotinas via cron. |
| **`ghost-db`** | MySQL 8 para a base de dados do Ghost. Palavra-passe root e nome da BD vêm de variáveis (ver [`environments/production/.env.example`](environments/production/.env.example)). |
| **`ghost`** | Ghost em produção; `url` definida por `PUBLIC_URL`; liga-se ao MySQL em `ghost-db`. Conteúdo persistente em volume `ghost_content`. |

**Redes:** `frontend` agrega Caddy, UI, chatbot e Ghost (face ao utilizador). `backend` isola o MySQL; o Ghost está em `frontend` e `backend` para falar com a base de dados.

**Nota:** os composes de **produção** e **desenvolvimento** incluem o serviço `mamute-politico-api`, e os Caddyfiles de ambos ambientes encaminham `/api*` para esse serviço.

## Inicialização rápida (local)

1. Clone o repositório e entre na pasta raiz.
2. Configure e execute os scrappers primeiro (para popular/atualizar o banco).
3. Suba a API (`api`) para expor os dados coletados.
4. Suba o backend do chatbot (`chatbot_backend`) para as rotas de pergunta e streaming.
5. (Opcional) Rode a interface em `ui/` com `npm ci` e `npm run dev`, configurando `VITE_BASE_URL` para a mesma origem em que o navegador acessa a API e o Ghost (veja a seção [Interface web (ui)](#interface-web-ui)).

## Ordem recomendada de execução

1. `mamute_scrappers` → migrações + coleta/sincronização.
2. `api` → leitura do banco.
3. `chatbot_backend` → indexação vetorial + serviço de chat.
4. `ui` → front-end (após API e, se usar o chat na interface, o chatbot).

## Configurar o Ghost

Após subir a stack, configure o Ghost para redirecionar a home para a aplicação e aplicar os ajustes visuais recomendados.

- Guia completo: [`environments/ghost.md`](environments/ghost.md)
- Inclui: script de redirecionamento no Code Injection
## Links rápidos

- [README dos Scrappers](mamute_scrappers/README.md)
- [README da API](api/README.md)
- [README do Chatbot Backend](chatbot_backend/README.md)
- [README da interface (UI)](ui/README.md)
- [Configuração do Ghost](environments/ghost.md)
- [Compose de produção](environments/production/docker-compose.yml) · [Compose de desenvolvimento](environments/development/docker-compose.yml)

## Diagrama

![Diagrama do banco de dados](mamute_scrappers/db/db.png)