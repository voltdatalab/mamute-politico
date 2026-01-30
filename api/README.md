# API Mamute
---

Aplicação FastAPI para expor os dados coletados pelo projeto.

## Como executar

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
2. Exponha a variável `DATABASE_URL` apontando para o banco utilizado pelos scrappers.
3. Inicie a API:
   ```bash
   uvicorn api.main:app --reload
   ```

Por padrão o serviço ficará disponível em `http://127.0.0.1:8000` e a documentação interativa pode ser acessada em `http://127.0.0.1:8000/docs`.