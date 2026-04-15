# Mamute Político - UI

Tecnologias utilizadas:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


## Interface web (ui)

A pasta `ui/` contém uma **SPA** em **React** (Vite, TypeScript, shadcn/ui, Tailwind CSS) que:

- Consome a API REST em **`{VITE_BASE_URL}/api`** (por exemplo, parlamentares, proposições, votações).
- Usa **Ghost Members** para login e token: URLs de sessão, JWKS e links do portal são derivados de **`VITE_BASE_URL`** (mesma origem base configurada no build).
- Chama o chatbot por **mesma origem** em **`POST /chat/chatbot/stream`** (sem variável de ambiente extra; o proxy — por exemplo Caddy em `environments/*` — encaminha `/chat` ao serviço do chatbot).

### Variáveis de ambiente

Veja o modelo em [`ui/.env.example`](ui/.env.example). As principais:

| Variável | Função |
|----------|--------|
| `VITE_BASE_URL` | Origem sem barra final. A aplicação monta a API em `{VITE_BASE_URL}/api` e as rotas Ghost em `{VITE_BASE_URL}`. |
| `VITE_GHOST_JWKS` | (Opcional) JWKS do Ghost em JSON; se omitido, o fluxo de token pode seguir sem verificação no cliente. |

No **Docker**, as variáveis `VITE_*` são injetadas no **build** (ver [`ui/Dockerfile`](ui/Dockerfile)). No stack de **produção**, o serviço `ui` é definido em [`environments/production/docker-compose.yml`](environments/production/docker-compose.yml). O **Caddy** nos diretórios `environments/development` e `environments/production` encaminha tráfego para API, chatbot e arquivos estáticos conforme cada `Caddyfile`.

### Desenvolvimento local

```bash
cd ui
npm ci   # ou npm install
npm run dev
```

O servidor de desenvolvimento do Vite usa a **porta 8080** (ver `vite.config.ts`). Ajuste `VITE_BASE_URL` para coincidir com onde a API e o Ghost estão expostos no navegador.