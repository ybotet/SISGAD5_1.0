# Prediction Service

Microservicio de modelado predictivo para SISGAD5 (Python 3.11 + FastAPI).

## Características

- **Arquitectura**: Python 3.11, FastAPI, Uvicorn, scikit-learn, XGBoost, Prophet, MLflow
- **Base de datos**: PostgreSQL (`bd_predictions`)
- **Patrón**: Read-only (consume datos via REST de otros servicios)
- **MLOps**: MLflow (Model Registry), Airflow (pipelines)

## Estructura

```
prediction-service/
├── app/
│   ├── main.py        # FastAPI app entry point
│   ├── config.py      # Settings (pydantic-settings)
│   ├── api/v1/        # API routers (presentation)
│   ├── core/          # Configuración, features, modelos, training, evaluation
│   ├── db/            # SQLAlchemy + bd_predictions
│   ├── schemas/       # Pydantic models
│   └── utils/         # Helpers (logging, HTTP client)
├── tests/             # unit/ + integration/
├── pyproject.toml     # Poetry dependencies
└── Dockerfile
```

## Variables de entorno

Ver `.env.example` en la raíz del proyecto. Clave:

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PREDICTION_PORT` | Puerto del servicio | 5005 |
| `PREDICTION_DB_NAME` | Nombre de la BD | bd_sisgad5_predictions |
| `JWT_SECRET` | Secreto para validación JWT | (obligatorio) |
| `MATERIALES_SERVICE_URL` | URL Materials Service | http://localhost:5003 |
| `MLFLOW_TRACKING_URI` | URI del servidor MLflow | http://localhost:5006 |

## Desarrollo

```bash
cd prediction-service
poetry install
uvicorn app.main:app --reload --port 5005
```
