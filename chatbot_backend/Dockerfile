FROM python:3.11-bookworm
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --root-user-action=ignore \
    -r requirements.txt \
    "langchain>=0.2.0,<0.3" \
    "langchain-openai>=0.1.8,<0.2" \
    "langchain-community>=0.2.0,<0.3" \
    "langchain-text-splitters>=0.2.0,<0.3" \
    "psycopg2-binary>=2.9.9"

COPY app/ app/

CMD [ "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000" ]
