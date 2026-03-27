# API Mamute

Aplicação FastAPI para expor os dados coletados no projeto.

Projeto pai: [README raiz](../README.md)

## Pré-requisitos

- Python 3.11+
- Banco PostgreSQL já populado pelos scrappers

## Inicialização

1. Entre na pasta da API:

   ```bash
   cd api
   ```

2. Crie e ative o ambiente virtual:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

   Ajuste principalmente `DATABASE_URL` e as variáveis do Ghost Members.

5. Inicie a API:

   ```bash
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Endereços locais

- API: `http://127.0.0.1:8000`
- Docs Swagger: `http://127.0.0.1:8000/docs`

## Observações

- Rotas protegidas exigem `Authorization: Bearer <token>` com JWT emitido pelo Ghost Members.
- Em caso de rotação de chaves JWKS, reinicie a aplicação para recarregar a chave pública.