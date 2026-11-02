"""Modelos Pydantic — validación de entrada/salida de la API."""

from datetime import datetime
from enum import Enum
from typing import Any, List, Optional

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


class DemandaMaterialesRequest(BaseModel):
    dias_futuros: int = Field(default=30, ge=1, le=365)
    categoria: Optional[str] = None


class DemandaMaterialesItem(BaseModel):
    fecha: datetime
    categoria: str
    cantidad_predicha: float
    limite_inferior: float
    limite_superior: float


class DemandaMaterialesResponse(BaseModel):
    predicciones: List[DemandaMaterialesItem]
    modelo_version: str
    fecha_generacion: datetime


class TiempoResolucionRequest(BaseModel):
    prioridad: Prioridad
    tipo_falla: int = Field(default=0, ge=0, le=2)
    dia_semana: int = Field(default=0, ge=0, le=6)
    hist_tecnico_promedio: float = Field(default=8.0, ge=0)
    observaciones_presentes: bool = False


class TiempoResolucionResponse(BaseModel):
    tiempo_predicho_horas: float
    nivel_confianza: float
    modelo_version: str


class AnomaliasConsumoRequest(BaseModel):
    limite_registros: int = Field(default=100, ge=1, le=1000)


class AnomaliaItem(BaseModel):
    material_id: int
    categoria: str
    consumo_real: float
    consumo_esperado: float
    score_anomalia: float
    es_anomalo: bool


class AnomaliasConsumoResponse(BaseModel):
    anomalias: List[AnomaliaItem]
    total_analizados: int
    modelo_version: str
    fecha_analisis: datetime


class PrioridadQuejaRequest(BaseModel):
    tipo_falla: int = Field(default=0, ge=0, le=2)
    servicio: int = Field(default=0, ge=0, le=3)
    dia_semana: int = Field(default=0, ge=0, le=6)
    hist_resolucion_media: float = Field(default=12.0, ge=0)
    n_trabajos_previos: int = Field(default=5, ge=0)


class PrioridadQuejaResponse(BaseModel):
    prioridad_predicha: int
    probabilidades: dict[str, float]
    modelo_version: str


class FallosInfraestructuraRequest(BaseModel):
    limite_registros: int = Field(default=100, ge=1, le=1000)


class FalloItem(BaseModel):
    elemento_id: int
    tipo_elemento: str
    probabilidad_fallo: float
    es_critico: bool
    factores_riesgo: List[str]


class FallosInfraestructuraResponse(BaseModel):
    predicciones: List[FalloItem]
    total_analizados: int
    modelo_version: str
    fecha_analisis: datetime


class ModelosDisponiblesResponse(BaseModel):
    modelos: List[dict]
    total: int


class HealthResponse(BaseModel):
    status: str
    service: str
    timestamp: datetime
    modelos_cargados: int
