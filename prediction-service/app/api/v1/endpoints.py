"""Endpoints API v1 — Prediction Service."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.schemas.prediction import (
    DemandaMaterialesResponse,
    EstadoRequest,
    TiempoResolucionResponse,
)

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, Any]:
    return {"status": "healthy", "service": "prediction-service", "timestamp": datetime.now()}


@router.post("/demanda-materiales", response_model=DemandaMaterialesResponse)
def predecir_demanda_materiales() -> DemandaMaterialesResponse:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TASK-D-06: Modelo de predicción de demanda pendiente de entrenamiento",
    )


@router.post("/tiempo-resolucion", response_model=TiempoResolucionResponse)
def predecir_tiempo_resolucion(request: EstadoRequest) -> TiempoResolucionResponse:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TASK-D-07: Modelo de predicción de tiempo pendiente de entrenamiento",
    )


@router.get("/anomalias")
def detectar_anomalias() -> dict[str, Any]:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="TASK-D-08: Modelo de detección de anomalías pendiente",
    )
