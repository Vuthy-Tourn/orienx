FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start server. Embedding sync is best-effort: if Ollama/bge-m3 is not running
# the advisor still works in keyword-only mode.
CMD ["sh", "-c", "alembic upgrade head && python scripts/seed_data.py && (python scripts/sync_knowledge_embeddings.py || true) && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

