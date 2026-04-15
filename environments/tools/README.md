# Environments Tools (Docker only)

This folder provides a Dockerized helper for production-oriented setup and status checks.

No host dependency is required besides Docker.

## Scripts

- `./setup.sh`: runs an interactive Ink wizard.
- `./status.sh`: prints active pieces and connectivity/consistency checks.
- `./up.sh`: starts only selected production compose services.
- `./down.sh`: stops/removes only selected production compose services.

## How it works

Each wrapper script:

1. Builds the local image from this folder.
2. Runs the CLI in a container.
3. Mounts this folder as `/workspace/tools`.
4. Loads `tools/.env` if present.

## Required config file

Create `environments/tools/.env` based on `.env.example`.

```dotenv
ACTIVE_UI=true
ACTIVE_REVERSE_PROXY=true
ACTIVE_API=true
API_MODE=all_together
REMOTE_API_BASE_URL=
ACTIVE_CHATBOT=true
CHATBOT_MODE=all_together
REMOTE_CHATBOT_BASE_URL=
ACTIVE_GHOST=true
PUBLIC_BASE_URL=http://localhost
```

## Setup output

`./setup.sh` does not write project `.env` files automatically. It tells you what to create:

- `environments/tools/.env`
- `environments/production/.env`
- `ui/.env`
- `api/.env` (if API is active and all_together)
- `chatbot_backend/.env` (if chatbot is active and all_together)

## Status checks

`./status.sh` validates:

- Which pieces are active.
- Presence/required keys in `.env` files.
- Production Caddy route assumptions (`/app*`, `/chat*`).
- Optional HTTP reachability for configured public/remote URLs.

## Notes

- This helper is production-stack oriented and only reads production Caddy/compose conventions.
- The current production compose file does not include the API service. Status warns about that when API mode is `all_together`.
