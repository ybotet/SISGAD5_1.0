FROM python:3.11-slim

WORKDIR /app

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar Poetry
RUN pip install --no-cache-dir --timeout=300 poetry==1.8.3

# Configurar Poetry para no crear virtualenvs
ENV POETRY_VIRTUALENVS_CREATE=false

# Copiar pyproject.toml y poetry.lock
COPY pyproject.toml poetry.lock* ./

# Instalar dependencias con timeout largo y índice alternativo
RUN poetry config installer.parallel true && \
    poetry install --no-interaction --no-ansi --no-root || \
    (pip install --no-cache-dir --timeout=300 -i https://pypi.org/simple \
     fastapi uvicorn pydantic pydantic-settings scikit-learn xgboost prophet pandas numpy mlflow sqlalchemy httpx joblib)

# Código
COPY . .

EXPOSE 5005

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5005"]