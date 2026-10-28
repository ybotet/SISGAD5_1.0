"""Feature engineering para materiales (TASK-D-05).

Features derivadas de:
  - backend-materiales-go/internal/models/materiales.go
  - backend-materiales-go/internal/models/asignacion.go
  - backend-materiales-go/internal/models/consumo.go
  - backend-materiales-go/internal/models/categoriaMaterial.go

Todas las features usan datos anonimizados (TASK-D-20).
"""

import numpy as np
import pandas as pd

from app.core.features.base import FeatureRegistry, FeatureSpec


class MaterialesFeatureEngineer:
    """Feature engineering para el dominio de materiales."""

    SOURCE_API = "http://backend-materiales:5003/api/materiales"
    TARGET_MODELS = ["demanda_materiales"]

    FEATURES = FeatureRegistry([
        FeatureSpec(
            name="categoria",
            type="categorical",
            dtype="category",
            source="tb_categorias_material.categoria",
            transform="One-hot encoding",
            nullable=False,
            description="Categoría lógica del material (Cable, Conector, Herramienta, etc.)",
        ),
        FeatureSpec(
            name="costo",
            type="numeric",
            dtype="float32",
            source="tb_materiales.precio_actual",
            transform="None (raw value)",
            nullable=False,
            description="Precio unitario actual del material (CUP)",
        ),
        FeatureSpec(
            name="consumo_historical",
            type="numeric",
            dtype="int32",
            source="tb_consumo_detalle.cantidad_usada (3 meses rolling window)",
            transform="Rolling sum: Σ cantidad_usada GROUP BY tb_materiales.id_material, ultimos 90 dias",
            nullable=False,
            description="Consumo histórico total en los últimos 90 días (features lagged)",
        ),
        FeatureSpec(
            name="estacionalidad",
            type="numeric",
            dtype="float32",
            source="tb_consumo.fecha_consumo (parsed)",
            transform="sin(2π·mes/12), cos(2π·mes/12) — Fourier seasonal encoding",
            nullable=False,
            description="Componentes de estacionalidad mensual (sin, cos) para capturar patrones cíclicos",
        ),
        FeatureSpec(
            name="material_id",
            type="numeric",
            dtype="int32",
            source="tb_materiales.id_material",
            transform="None (anonymized hash)",
            nullable=False,
            description="Identificador del material (anonymizado)",
        ),
        FeatureSpec(
            name="categoria_encoded",
            type="categorical",
            dtype="int8",
            source="tb_categorias_material.categoria",
            transform="Label encoding (anonymizado)",
            nullable=False,
            description="Categoría codificada numéricamente",
        ),
        FeatureSpec(
            name="precio_momento",
            type="numeric",
            dtype="float32",
            source="tb_asignacion_detalle.costo_unitario_momento",
            transform="None (raw value, frozen at assignment time)",
            nullable=True,
            description="Precio congelado al momento de la asignación",
        ),
        FeatureSpec(
            name="consumo_real",
            type="numeric",
            dtype="float32",
            source="tb_consumo_detalle.costo_unitario_momento * cantidad_usada",
            transform="Multiply: costo × cantidad",
            nullable=True,
            description="Consumo real (costo × cantidad) registrado",
        ),
    ])

    @classmethod
    def extract(cls, df_raw: pd.DataFrame) -> pd.DataFrame:
        return df_raw

    @classmethod
    def transform(cls, df_extracted: pd.DataFrame) -> pd.DataFrame:
        df = df_extracted.copy()

        df["categoria_encoded"] = df["categoria"].astype("category").cat.codes.astype("int8")

        df["estacionalidad_sin"] = np.sin(2 * 3.14159 * df["mes"] / 12).astype("float32")
        df["estacionalidad_cos"] = np.cos(2 * 3.14159 * df["mes"] / 12).astype("float32")

        return df[
            ["categoria", "costo", "consumo_historical", "estacionalidad_sin", "estacionalidad_cos",
             "material_id", "categoria_encoded", "precio_momento", "consumo_real"]
        ]
