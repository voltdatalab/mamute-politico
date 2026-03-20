# Mamute Político Chatbot Backend

Backend construído com FastAPI e LangChain para oferecer um chatbot especializado nas notas taquigráficas, combinando busca vetorial no PostgreSQL (pgvector) e consultas SQL auxiliares.

## Estrutura

- `app/` – código da aplicação FastAPI (rotas, serviços e configurações)
- `scripts/` – utilitários para ingestão de dados no índice vetorial
- `.env.example` – modelo de variáveis de ambiente
- `requirements.txt` – dependências isoladas do backend

## Pré-requisitos

1. Python 3.11+
2. Banco PostgreSQL com extensão [`pgvector`](https://github.com/pgvector/pgvector) habilitada
3. Chave de API do OpenAI (modelo GPT e embeddings)

## Configuração

1. Crie e ajuste o arquivo de variáveis de ambiente:

   ```bash
   cp chatbot_backend/.env.example chatbot_backend/.env
   ```

   Edite o `.env` com suas credenciais de banco e chaves do OpenAI. Os campos `APPLICATION_NAME` (PostgreSQL) e `RERANK_TOP_K` (reranqueador) permitem ajustes de monitoramento e qualidade das respostas.

2. Crie um ambiente virtual e instale as dependências:

   ```bash
   cd chatbot_backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

## Indexação das notas taquigráficas

Use o script de ingestão para popular o índice vetorial no pgvector:

```bash
python -m chatbot_backend.scripts.ingest_transcripts --batch-size 200
```

O script lê as notas diretamente da tabela `speeches_transcripts`, cria chunks com `RecursiveCharacterTextSplitter` e adiciona documentos ao índice definido em `PGVECTOR_COLLECTION`.

## Sincronização contínua

Para manter o índice atualizado, execute periodicamente:

```bash
python -m chatbot_backend.scripts.sync_transcripts --window-hours 6
```

O comando carrega discursos inseridos/atualizados na janela especificada, remove chunks anteriores do mesmo discurso e reindexa os novos. Utilize `--since 2024-03-01T00:00:00Z` para sincronizar a partir de um instante fixo ou `--dry-run` para apenas inspecionar o que seria carregado.

## Executando a API

Inicie o servidor FastAPI em modo desenvolvimento com:

```bash
uvicorn chatbot_backend.app.main:app --reload --host 0.0.0.0 --port 8001
```

Endpoints principais:

- `POST /chatbot/stream` – responde em streaming via Server-Sent Events (`text/event-stream`).
- `POST /chatbot/query` – retorna a resposta completa sem streaming.
- `GET /health` – verificação simples de saúde.

### Formato do streaming

Cada evento é retornado no padrão SSE, por exemplo:

```text
data: {"type":"token","value":"Olá"}

data: {"type":"token","value":"!"}

data: {"type":"done"}
```

No front-end basta consumir o endpoint com `EventSource` (ou fetch streaming) para reconstruir o texto.

## Personalizações

- Ajuste `RETRIEVER_K` e `RETRIEVER_SCORE_THRESHOLD` para calibrar a quantidade de chunks trazidos do vetor.
- Ajuste `RERANK_TOP_K` para definir quantos chunks reranqueados alimentam o prompt final; o reranqueador usa o próprio modelo GPT para priorizar trechos mais relevantes.
- Modifique `SQL_CONTEXT_LIMIT` e a lista de stopwords em `SQL_KEYWORD_STOPWORDS` para adaptar as consultas SQL acessórias.
- Controle o volume de estatísticas agregadas retornadas com `SQL_FREQUENCY_LIMIT`; perguntas sobre “quantidade”, “frequência” ou “quantas vezes” ativam uma consulta de contagem por parlamentar.
- O prompt base está em `app/services/prompts.py`.

## Observabilidade

Caso utilize LangSmith/LangChain tracing, habilite `LANGCHAIN_TRACING_V2=true` e defina `LANGCHAIN_PROJECT` no `.env`.

## Testes recomendados

- Verifique o endpoint `POST /chatbot/query` com uma pergunta conhecida para validar a recuperação.
- Monitore o banco para garantir que o índice vetorial está sendo populado corretamente.
- Consuma `POST /chatbot/stream` via curl (`curl -N`) e observe o fluxo de tokens.

