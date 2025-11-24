# Generic single-database configuration.

### Gerar a primeira revisão:

`alembic revision --autogenerate -m "create initial tables"`

Conferir o arquivo gerado em migrations/versions/.
### Aplicar migrations:

`alembic upgrade head`

### Outras operações úteis:

```bash
alembic downgrade -1 (voltar uma versão)
alembic history (listar histórico)
alembic current (ver versão aplicada)
```

## Mini tutoriais de uso

### 1. Atualizar `.env` e rodar migrations em outro ambiente
```bash
cp .env.example .env             # se ainda não existir
vim .env                         # ajuste DATABASE_URL, SQLALCHEMY_ECHO etc.
alembic upgrade head             # aplica no banco apontado pelo .env
```

### 2. Criar uma nova migration após alterar modelos
```bash
alembic revision --autogenerate -m "add new tables or columns"
vim migrations/versions/*.py     # revise o diff gerado
alembic upgrade head             # aplica no banco
```

### 3. Reverter temporariamente a última migration
```bash
alembic downgrade -1
# faça os ajustes necessários...
alembic upgrade head             # volta para a versão mais recente
```

### 4. Aplicar migrations em múltiplos ambientes (ex.: staging e produção)
```bash
# staging
export DATABASE_URL="postgresql://staging_user:.../staging_db"
alembic upgrade head

# produção
export DATABASE_URL="postgresql://prod_user:.../prod_db"
alembic upgrade head
```

### 5. Validar divergências entre modelos e banco existente
```bash
alembic check                   # detecta se há revision pendente
alembic history --verbose       # inspeciona versões aplicadas
alembic current -v              # mostra a revisão atual no banco alvo
```