# Mamute Scrappers

Módulo responsável pela coleta e sincronização de dados legislativos (Câmara e Senado), além de rotinas auxiliares de atualização.

Projeto pai: [README raiz](../README.md)

## Pré-requisitos

- Python 3.11+
- PostgreSQL acessível via `DATABASE_URL`

## Inicialização

1. Entre na pasta dos scrappers:

   ```bash
   cd mamute_scrappers
   ```

2. Crie e ative o ambiente virtual:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Instale dependências:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Ajuste no mínimo `DATABASE_URL`. Para sincronização de usuários e análise com OpenAI, configure também `GHOST_API_KEY`, `GHOST_ADMIN_URL` e `OPENAI_API_KEY`.

5. Rode as migrações:

   ```bash
   alembic upgrade head
   ```

## Execução dos programas principais

### Coleta de pronunciamentos do Senado

```bash
python -m mamute_scrappers.senado_crawler.speechs_transcipts --help
```

### Reprocessar análise de texto de pronunciamentos

```bash
python -m mamute_scrappers.scripts.rebuild_speech_text_analysis --help
```

### Sincronizar usuários/projetos via Ghost

```bash
python -m mamute_scrappers.scripts.create_users
```

## Observações

- Use `--help` nos comandos para ver todos os parâmetros disponíveis.
- É recomendado executar os scrappers antes de iniciar `api` e `chatbot_backend`.
