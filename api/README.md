# API Mamute
---

Aplicação FastAPI para expor os dados coletados pelo projeto.

## Como executar

1. Configure as variáveis de ambiente copiando o arquivo `.env.example` para `.env` e ajustando os valores para o seu ambiente Ghost Members.
2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
3. Exponha a variável `DATABASE_URL` apontando para o banco utilizado pelos scrappers.
4. Inicie a API:
   ```bash
   uvicorn api.main:app --reload
   ```

Por padrão o serviço ficará disponível em `http://127.0.0.1:8000` e a documentação interativa pode ser acessada em `http://127.0.0.1:8000/docs`.

> **Importante:** todas as rotas protegidas exigem o cabeçalho `Authorization: Bearer <token>` com um JWT emitido pelo Ghost Members. Caso os tokens deixem de ser validados por rotação de chaves, basta reiniciar a aplicação para que a nova chave pública seja buscada automaticamente.