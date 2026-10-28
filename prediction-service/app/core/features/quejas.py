"""Feature engineering para quejas (TASK-D-04).

Features derivadas de: backend-mp/src/features/queja/queja.model.js
Fuente: tb_queja + tb_tipoqueja + tb_clave + tb_trabajador + tb_telefono/linia/pizarra

Todas las features usan datos anonimizados (TASK-D-20).
"""

from datetime import datetime
from typing import Any

import pandas as pd
from pydantic import BaseModel

from app.core.features.base import FeatureRegistry, FeatureSpec


class QuejasFeatureEngineer:
    """Feature engineering para el dominio de quejas."""

    SOURCE_API = "http://backend-mp:5002/api/quejas"
    TARGET_MODELS = ["demanda_materiales", "tiempo_resolucion"]

    FEATURES = FeatureRegistry([
        FeatureSpec(
            name="prioridad",
            type="numeric",
            dtype="int8",
            source="tb_queja.prioridad",
            transform="None (raw value 1-3)",
            nullable=False,
            description="Nivel de urgencia de la queja (1=Crítica, 2=Alta, 3=Media, 4=Baja)",
        ),
        FeatureSpec(
            name="estado_encoded",
            type="categorical",
            dtype="int8",
            source="tb_queja.estado",
            transform="Label encoding: Abierta=0, Probada=1, Asignada=2, Pendiente=3, Resuelta=4, Cerrada=5",
            nullable=False,
            description="Estado actual de la queja (FSM encoded)",
        ),
        FeatureSpec(
            name="tecnico_id",
            type="numeric",
            dtype="int32",
            source="tb_queja.probador → tb_trabajador.id_trabajador",
            transform="None (foreign key hash)",
            nullable=True,
            description="Técnico que atiende la queja (anonymizado)",
        ),
        FeatureSpec(
            name="ubicacion",
            type="categorical",
            dtype="category",
            source="tb_tipoqueja.tipoqueja + tb_pizarra.id_pizarra",
            transform="One-hot encoding por tipo (TELÉFONO/LÍNEA/PIZARRA) + pizarra hash",
            nullable=True,
            description="Ubicación geográfica de la queja (tipo de infraestructura)",
        ),
        FeatureSpec(
            name="tipo_queja_encoded",
            type="categorical",
            dtype="int8",
            source="tb_tipoqueja.tipoqueja",
            transform="Label encoding: TELÉFONO=0, LÍNEA=1, PIZARRA=2",
            nullable=False,
            description="Tipo de infraestructura afectada",
        ),
        FeatureSpec(
            name="servicio",
            type="categorical",
            dtype="category",
            source="tb_tipoqueja.servicio",
            transform="One-hot encoding",
            nullable=True,
            description="Servicio telefónico afectado",
        ),
        FeatureSpec(
            name="red",
            type="boolean",
            dtype="bool",
            source="tb_queja.red",
            transform="None (raw boolean)",
            nullable=True,
            description="Indicador de queja relacionada con red vs. abonado",
        ),
        FeatureSpec(
            name="dia_semana",
            type="numeric",
            dtype="int8",
            source="tb_queja.fecha (parsed)",
            transform="datetime.weekday() (0=Lunes, 6=Domingo)",
            nullable=False,
            description="Día de la semana en que se reportó la queja",
        ),
        FeatureSpec(
            name="mes",
            type="numeric",
            dtype="int8",
            source="tb_queja.fecha (parsed)",
            transform="datetime.month (1-12)",
            nullable=False,
            description="Mes de reporte (para estacionalidad)",
        ),
        FeatureSpec(
            name="horas_abierta",
            type="numeric",
            dtype="float32",
            source="tb_queja.created_at → tb_queja.fechaok",
            transform="(fechaok - created_at).total_seconds() / 3600",
            nullable=True,
            description="Horas desde apertura hasta resolución (solo para quejas cerradas)",
        ),
    ])

    @classmethod
    def extract(cls, df_raw: pd.DataFrame) -> pd.DataFrame:
        """Extrae features del DataFrame raw proveniente de la API."""
        return df_raw

    @classmethod
    def transform(cls, df_extracted: pd.DataFrame) -> pd.DataFrame:
        """Aplica transformaciones para generar features."""
        df = df_extracted.copy()

        df["estado_encoded"] = df["estado"].map({
            "Abierta": 0, "Probada": 1, "Asignada": 2,
            "Pendiente": 3, "Resuelta": 4, "Cerrada": 5,
        }).astype("int8")

        df["tipo_queja_encoded"] = df["tipo_queja_desc"].map({
            "TELÉFONO": 0, "LÍNEA": 1, "PIZARRA": 2,
        }).astype("int8")

        df["dia_semana"] = pd.to_datetime(df["fecha"]).dt.weekday.astype("int8")
        df["mes"] = pd.to_datetime(df["fecha"]).dt.month.astype("int8")

        return df[
            ["prioridad", "estado_encoded", "tecnico_id", "ubicacion", "tipo_queja_encoded",
             "servicio", "red", "dia_semana", "mes", "horas_abierta"]
        ]
