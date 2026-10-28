"""Feature engineering para trabajos (TASK-D-04).

Features derivadas de:
  - backend-mp/src/features/trabajo/trabajo.model.js (tb_trabajo)
  - backend-mp/src/features/queja/queja.model.js (tb_queja — join vía id_queja)
  - backend-mp/src/features/prueba/prueba.model.js (tb_prueba)
  - backend-mp/src/features/tipoqueja/tipoqueja.model.js (tb_tipoqueja)

Todas las features usan datos anonimizados (TASK-D-20).
"""

import pandas as pd

from app.core.features.base import FeatureRegistry, FeatureSpec


class TrabajosFeatureEngineer:
    """Feature engineering para el dominio de trabajos."""

    SOURCE_API = "http://backend-mp:5002/api/trabajos"
    TARGET_MODELS = ["tiempo_resolucion"]

    FEATURES = FeatureRegistry([
        FeatureSpec(
            name="duracion",
            type="numeric",
            dtype="float32",
            source="tb_trabajo.created_at → tb_trabajo.fecha (parsed)",
            transform="(fecha - created_at).total_seconds() / 3600",
            nullable=True,
            description="Duración del trabajo en horas (target leak: solo para entrenamiento)",
        ),
        FeatureSpec(
            name="duracion_historical_tecnico",
            type="numeric",
            dtype="float32",
            source="tb_trabajo (GROUP BY tecnico_id, 3-month window)",
            transform="Rolling mean: AVG(duracion) para el mismo técnico en ultimos 90 dias",
            nullable=True,
            description="Duración histórica promedio del técnico (feature lagged)",
        ),
        FeatureSpec(
            name="tecnico_id",
            type="numeric",
            dtype="int32",
            source="tb_trabajo.probador → tb_trabajador.id_trabajador",
            transform="None (anonymized hash)",
            nullable=True,
            description="Técnico asignado al trabajo (anonymizado)",
        ),
        FeatureSpec(
            name="tipo_falla",
            type="categorical",
            dtype="category",
            source="tb_tipoqueja.tipoqueja (joined via tb_queja.id_tipoqueja)",
            transform="One-hot encoding: TELÉFONO, LÍNEA, PIZARRA",
            nullable=False,
            description="Tipo de falla según categoría de infraestructura",
        ),
        FeatureSpec(
            name="tipo_falla_encoded",
            type="categorical",
            dtype="int8",
            source="tb_tipoqueja.tipoqueja",
            transform="Label encoding: TELÉFONO=0, LÍNEA=1, PIZARRA=2",
            nullable=True,
            description="Tipo de falla codificado numéricamente",
        ),
        FeatureSpec(
            name="prioridad_queja",
            type="numeric",
            dtype="int8",
            source="tb_queja.prioridad (joined via id_queja)",
            transform="None (raw value 1-3)",
            nullable=True,
            description="Prioridad heredada de la queja origen",
        ),
        FeatureSpec(
            name="estado_queja_encoded",
            type="categorical",
            dtype="int8",
            source="tb_queja.estado (joined via id_queja)",
            transform="Label encoding: Abierta=0, Probada=1, Asignada=2, Pendiente=3, Resuelta=4, Cerrada=5",
            nullable=True,
            description="Estado de la queja origen (FSM encoded)",
        ),
        FeatureSpec(
            name="dia_semana_trabajo",
            type="numeric",
            dtype="int8",
            source="tb_trabajo.fecha (parsed)",
            transform="datetime.weekday() (0=Lunes, 6=Domingo)",
            nullable=False,
            description="Día de la semana en que se realizó el trabajo",
        ),
        FeatureSpec(
            name="observaciones_presentes",
            type="boolean",
            dtype="bool",
            source="tb_trabajo.observaciones",
            transform="bool(observaciones != null and observaciones != '')",
            nullable=False,
            description="Indicador de si hay observaciones registradas",
        ),
    ])

    @classmethod
    def extract(cls, df_raw: pd.DataFrame) -> pd.DataFrame:
        return df_raw

    @classmethod
    def transform(cls, df_extracted: pd.DataFrame) -> pd.DataFrame:
        df = df_extracted.copy()

        df["tipo_falla_encoded"] = df["tipo_falla_desc"].map({
            "TELÉFONO": 0, "LÍNEA": 1, "PIZARRA": 2,
        }).astype("int8")

        df["estado_queja_encoded"] = df["estado_queja"].map({
            "Abierta": 0, "Probada": 1, "Asignada": 2,
            "Pendiente": 3, "Resuelta": 4, "Cerrada": 5,
        }).astype("int8")

        df["dia_semana_trabajo"] = pd.to_datetime(df["fecha"]).dt.weekday.astype("int8")
        df["observaciones_presentes"] = df["observaciones"].notna() & (df["observaciones"] != "")

        return df[
            ["duracion", "duracion_historical_tecnico", "tecnico_id", "tipo_falla",
             "tipo_falla_encoded", "prioridad_queja", "estado_queja_encoded",
             "dia_semana_trabajo", "observaciones_presentes"]
        ]
