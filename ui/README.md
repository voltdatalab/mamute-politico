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

### Storybook e testes visuais locais

Storybook usa Vite com `VITE_BASE_URL` fixo em **`http://127.0.0.1:8000`** (via [`.storybook/main.ts`](.storybook/main.ts)) para coincidir com o mock de rede do [MSW](https://mswjs.io/) em [`src/storybook/msw/handlers.ts`](src/storybook/msw/handlers.ts). Isso evita acertar o backend real durante o desenvolvimento de stories.

| Comando | O que faz |
|--------|------------|
| `npm run storybook` | Servidor de desenvolvimento em `http://localhost:6006`. |
| `npm run build-storybook` | Gera `storybook-static/` para inspeção offline ou para o test-runner. |
| `npm run test-storybook` | Smoke test das stories (precisa de uma instância já em execução ou use a URL com `--url`). |
| `npm run test-storybook:visual` | Constrói o Storybook estático, serve em `6007` e compara capturas de **`#storybook-root`** com **`jest-image-snapshot`**. |
| `npm run test-storybook:visual:update` | Atualiza os baselines locais de imagem (útil depois de mudanças de UI intencionais). |

As capturas ficam em [**`.storybook-visual/snapshots/`](.storybook-visual/snapshots/)** (listado em [`.gitignore`](.gitignore), conforme preferência de não versionar golden files). Variável opcional: defina `VITE_BASE_URL` no ambiente antes de `storybook`/build para outra origem (deve permanecer alinhada aos handlers MSW).

Componentes sensíveis a rede (por exemplo **`AccountModal`**, **`LoginModal`** com fluxo Ghost/axios ou primários **`Toast`** duplicados) usam **`parameters.screenshot.disable`** onde o snapshot não agrega valor. Histórias que dependem de JWT válido podem falhar até você colocar um token compatível em `localStorage` (mesma chave que o app; ver código em [`src/components/auth/config.ts`](src/components/auth/config.ts)).