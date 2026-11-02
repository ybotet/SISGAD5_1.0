"""Script de anonimización de datos reales → sintéticos (TASK-D-20).

AGENTS.md §3.4: NO usar datos reales de producción sin anonimizar.
Este script genera datos sintéticos basados en la distribución estadística
de los datos reales, preservando patrones pero eliminando PII.

Uso:
    python -m prediction-service.scripts.anonymize_data --source postgres://... --output data/synthetic/

Autor: Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
"""

import argparse
import hashlib
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.utils import get_logger

logger = get_logger(__name__)

PII_FIELDS = {
    "queja": ["reportado_por", "observaciones", "fecha"],
    "trabajo": ["observaciones", "fecha"],
    "material": ["codigo", "nombre", "descripcion"],
    "trabajador": ["nombre", "clave_trabajador", "cargo"],
}

ENTITY_CONFIG = {
    "queja": {
        "table": "tb_queja",
        "date_field": "fecha",
        "numeric_distributions": ["prioridad"],
        "categorical_fields": ["estado", "tipo_queja"],
        "foreign_keys": ["id_tipoqueja", "id_clave", "id_telefono", "id_linea", "id_pizarra", "probador"],
    },
    "material": {
        "table": "tb_materiales",
        "date_field": "created_at",
        "numeric_distributions": ["precio_actual"],
        "categorical_fields": ["categoria"],
        "foreign_keys": ["id_categoria_material", "id_unidad_medida"],
    },
}


def hash_id(value: Any, salt: str = "sisgad5") -> int:
    """Hash determinista de IDs para preservar joins sin revelar valores originales."""
    h = hashlib.sha256(f"{salt}:{value}".encode()).hexdigest()
    return int(h[:8], 16)


class DataAnonymizer:
    """Genera datos sintéticos preservando distribuciones estadísticas."""

    def __init__(self, salt: str = "sisgad5_synthetic_2026"):
        self.salt = salt
        np.random.seed(42)

    def anonymize_quejas(self, df: pd.DataFrame, n_samples: int | None = None) -> pd.DataFrame:
        """Anonimiza datos de quejas preservando distribuciones."""
        df = df.copy()
        entity = "queja"

        pii_cols = [c for c in PII_FIELDS[entity] if c in df.columns]

        for col in pii_cols:
            if col == "fecha":
                df[col] = pd.to_datetime(df[col], errors="coerce")
                min_date = df[col].min()
                max_date = df[col].max()
                if n_samples:
                    df[col] = pd.date_range(min_date, max_date, periods=n_samples)[:len(df)] if n_samples <= len(df) else df[col]
                df[col] = df[col].dt.strftime("%Y-%m-%d")
            elif col == "observaciones":
                df[col] = "Sintético: " + df[col].apply(
                    lambda x: f"obs_{hashlib.md5(f'{self.salt}:{x}'.encode()).hexdigest()[:8]}"
                    if pd.notna(x) else None
                )
            elif col == "reportado_por":
                df[col] = "anon_" + df[col].apply(
                    lambda x: hashlib.sha256(f"{self.salt}:{x}".encode()).hexdigest()[:8]
                    if pd.notna(x) else None
                )

        for fk in ENTITY_CONFIG["queja"]["foreign_keys"]:
            if fk in df.columns:
                df[fk] = df[fk].apply(lambda x: hash_id(x, self.salt) if pd.notna(x) else None)

        if "probador" in df.columns:
            df["tecnico_id"] = df["probador"]

        return df

    def anonymize_materiales(self, df: pd.DataFrame) -> pd.DataFrame:
        """Anonimiza datos de materiales."""
        df = df.copy()
        entity = "material"

        for col in PII_FIELDS[entity]:
            if col in df.columns:
                df[col] = df[col].apply(
                    lambda x: f"anon_{hashlib.sha256(f'{self.salt}:{x}'.encode()).hexdigest()[:12]}"
                    if pd.notna(x) else None
                )

        for fk in ENTITY_CONFIG["material"]["foreign_keys"]:
            if fk in df.columns:
                df[fk] = df[fk].apply(lambda x: hash_id(x, self.salt) if pd.notna(x) else None)

        return df

    def generate_synthetic_quejas(
        self,
        real_df: pd.DataFrame,
        n_samples: int = 500,
    ) -> pd.DataFrame:
        """Genera datos sintéticos de quejas preservando distribuciones marginales."""
        synthetic = pd.DataFrame()

        for col in ["prioridad"]:
            if col in real_df.columns:
                values = real_df[col].dropna().unique()
                probs = real_df[col].value_counts(normalize=True).sort_index()
                synthetic[col] = np.random.choice(values, size=n_samples, p=probs.values)

        for col in ["estado", "tipo_queja"]:
            if col in real_df.columns:
                values = real_df[col].dropna().unique()
                probs = real_df[col].value_counts(normalize=True)
                probs = (probs / probs.sum()).sort_index()
                synthetic[col] = np.random.choice(values, size=n_samples, p=probs.values)

        for date_col in ["fecha", "created_at"]:
            if date_col in real_df.columns:
                real_dates = pd.to_datetime(real_df[date_col], errors="coerce").dropna()
                if len(real_dates) > 0:
                    min_d, max_d = real_dates.min(), real_dates.max()
                    day_offset = (max_d - min_d).days
                    synthetic[date_col] = min_d + pd.to_timedelta(
                        np.random.randint(0, day_offset + 1, size=n_samples), unit="D"
                    )

        for fk in ENTITY_CONFIG["queja"]["foreign_keys"]:
            if fk in real_df.columns:
                values = real_df[fk].dropna().unique()
                if len(values) > 0:
                    synthetic[fk] = np.random.choice(values, size=n_samples)

        synthetic["probador"] = synthetic.get("probador", np.random.randint(1, 100, size=n_samples))
        synthetic["red"] = np.random.choice([True, False], size=n_samples, p=[0.6, 0.4])

        return self.anonymize_quejas(synthetic)


def main():
    parser = argparse.ArgumentParser(description="Anonimiza datos reales de SISGAD5 para ML.")
    parser.add_argument("--input", type=str, required=True, help="CSV de datos reales")
    parser.add_argument("--output", type=str, required=True, help="CSV de salida anonimizado")
    parser.add_argument("--entity", type=str, required=True, choices=["queja", "material"], help="Tipo de entidad")
    parser.add_argument("--synthetic", action="store_true", help="Generar datos sintéticos (no anonimizar)")
    parser.add_argument("--n-samples", type=int, default=500, help="Número de muestras sintéticas")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    logger.info("Cargando datos desde %s", input_path)
    df = pd.read_csv(input_path)
    logger.info("Filas cargadas: %d", len(df))

    anonymizer = DataAnonymizer()

    if args.synthetic:
        logger.info("Generando datos sintéticos (entity=%s, n=%d)", args.entity, args.n_samples)
        if args.entity == "queja":
            df_out = anonymizer.generate_synthetic_quejas(df, args.n_samples)
        else:
            df_out = anonymizer.anonymize_materiales(df)
    else:
        logger.info("Anonimizando datos (entity=%s)", args.entity)
        if args.entity == "queja":
            df_out = anonymizer.anonymize_quejas(df)
        else:
            df_out = anonymizer.anonymize_materiales(df)

    df_out.to_csv(output_path, index=False)
    logger.info("Datos anonimizados guardados en %s (%d filas)", output_path, len(df_out))

    pii_count = len([c for c in df_out.columns if c.lower() in ["nombre", "observaciones", "reportado_por"]])
    logger.info("Validación: %d campos PII restantes (debe ser 0)", pii_count)

    return 0


if __name__ == "__main__":
    sys.exit(main())
