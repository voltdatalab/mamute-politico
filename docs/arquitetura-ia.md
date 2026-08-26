# Arquitetura da IA do Mamute Político

Este documento descreve, em detalhe honesto, como funciona o assistente de IA do
[Mamute Político](https://mamutepolitico.com.br) — motor, modelos, dados e limites.
O **código** do chatbot é privado (é a camada de produto do projeto), mas a
**arquitetura** é pública: acreditamos que transparência sobre como uma IA
jornalística produz respostas é parte do próprio jornalismo.

## Visão geral

O assistente responde perguntas sobre a atividade parlamentar brasileira usando
**RAG (Retrieval-Augmented Generation)**: em vez de "saber" as respostas, ele
busca trechos relevantes na nossa base de dados — construída pelos coletores
abertos deste repositório — e pede a um LLM que responda *apenas* com base no
que foi recuperado, citando as fontes.

```
pergunta do usuário
      │
      ▼
[1] Query understanding (LLM)     → intenção, entidades, filtros (político, tema, período)
      │
      ▼
[2] Recuperação híbrida           → busca vetorial (pgvector) + filtros SQL + trigram
      │                             com MMR para diversidade dos trechos
      ▼
[3] Geração (LLM, streaming)      → resposta fundamentada nos trechos, com citações
      │
      ▼
[4] Observabilidade               → tokens, custo, latência e falhas registrados por consulta
```

## Componentes

### Base de conhecimento
- **Fonte**: discursos e pronunciamentos de parlamentares (Câmara e Senado),
  coletados pelos crawlers abertos em `mamute_scrappers/` — a mesma base
  alimenta o site e o chatbot.
- **Vetorização**: embeddings **OpenAI `text-embedding-3-large`** (3.072
  dimensões, preservadas na íntegra). O índice vive no PostgreSQL com
  **pgvector**, coluna `halfvec(3072)` e índice **HNSW** — meia precisão para
  caber no limite de 2.000 dimensões do índice HNSW padrão sem degradar o recall.
- **Volume** (ordem de grandeza): ~120 mil discursos vetorizados, ~120 milhões
  de tokens de ingestão.

### Query understanding
Antes de buscar, um LLM leve interpreta a pergunta: extrai a intenção, os
políticos citados (com resolução de apelidos/nome de urna via similaridade de
trigram no Postgres), o recorte temporal e o tema. Isso vira filtros SQL que
restringem a busca vetorial — perguntar "o que fulano falou sobre saúde em
2024" busca só nos discursos de fulano em 2024, não no acervo inteiro.

### Recuperação
- **Busca vetorial** por similaridade de cosseno sobre os embeddings.
- **MMR (Maximal Marginal Relevance)** para diversificar os trechos — evita que
  cinco pedaços do mesmo discurso ocupem todo o contexto.
- Modo **panorama** para perguntas amplas ("o que se discutiu sobre X?"), que
  amostra trechos entre políticos e datas distintas em vez de aprofundar em um.

### Geração
- **LLM**: Google **Gemini 2.5 Flash**, servido via **OpenRouter** (o provedor
  é intercambiável por configuração; escolhemos pelo custo/latência).
- **Streaming** de tokens até o navegador (SSE), com a resposta ancorada nos
  trechos recuperados e instruída a citar as fontes e a admitir quando a base
  não cobre a pergunta.

### Guarda-corpos e limites
- O modelo responde **somente com base no que foi recuperado** — sem fontes
  suficientes, diz que não sabe, em vez de inventar.
- Quotas por plano de assinatura (consultas/semana e mês) aplicadas no backend.
- **Observabilidade por consulta**: tokens, custo estimado, tempo de resposta e
  falhas (inclusive "resposta vazia" — o streaming quebrar sem erro é o bug mais
  traiçoeiro de um chat) alimentam um painel administrativo.

### O que é privado, e por quê
Os **prompts** (query understanding e geração), o código de orquestração e o
refino de produto são fechados: são o resultado de meses de iteração e o que
diferencia o produto. A arquitetura acima, os dados de origem (públicos por
natureza) e o schema do banco (nas migrations abertas) permitem a qualquer
equipe reconstruir um sistema equivalente — com o próprio tempero.

## Stack, resumida

| Camada | Tecnologia |
|---|---|
| Coleta | Python (crawlers abertos neste repositório) |
| Banco | PostgreSQL + pgvector (`halfvec(3072)`, HNSW) |
| Embeddings | OpenAI `text-embedding-3-large` |
| LLM | Gemini 2.5 Flash via OpenRouter |
| Backend do chat | FastAPI, streaming SSE |
| Busca auxiliar | pg_trgm (resolução de nomes), filtros SQL |
