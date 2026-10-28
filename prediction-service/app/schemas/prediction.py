"""Modelos Pydantic — validación de entrada/salida de la API."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EstadoQueja(str, Enum):
    ABIERTA = "Abierta"
    PROBADA = "Probada"
    ASIGNADA = "Asignada"
    PENDIENTE = "Pendiente"
    RESUELTA = "Resuelta"
    CERRADA = "Cerrada"


class Prioridad(str, Enum):
    CRITICA = "1"
    ALTA = "2"
    MEDIA = "3"
    BAJA = "4"


class EstadoRequest(BaseModel):
    estado_actual: EstadoQueja
    prioridad: Prioridad
    dias_abierta: int = Field(default=0, ge=0)
    dias_en_riesgo: int = Field(default=0, ge=0)


class DemandaMaterialesResponse(BaseModel):
    material_id: int
    cantidad_predicha: float
    fecha_prediccion: datetime
    modelo_version: str


class TiempoResolucionResponse(BaseModel):
    tiempo_predicho_horas: float
    nivel_confianza: float
    modelo_version: str
