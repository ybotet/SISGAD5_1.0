"""Training pipeline — Modelo: predicción de demanda de materiales (TASK-D-06).

Modelo: Prophet (time-series forecasting)
Criterio: MAE < 15% sobre consumo histórico de materiales
Datos: sintéticos anonimizados (TASK-D-20)

AGENTS.md §3.4: read-only sobre bd_materiales. Usa datos anonimizados.
"""

import hashlib
import os
import sys
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "demanda_materiales.joblib"
MAE_THRESHOLD = 0.15


def generate_synthetic_data(n_dias: int = 365, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    fechas = pd.date_range(end=datetime.now(), periods=n_dias, freq="D")

    base_demanda = 50
    estacionalidad = 15 * np.sin(2 * np.pi * fechas.dayofyear / 365)
    tendencia = np.linspace(0, 20, n_dias)
    ruido = np.random.normal(0, 8, n_dias)

    demanda = base_demanda + estacionalidad + tendencia + ruido
    demanda = np.maximum(demanda, 0).round().astype(int)

    categorias = ["Cable", "Conector", "Herramienta", "Terminal"]
    return pd.DataFrame({
        "fecha": fechas,
        "categoria": np.random.choice(categorias, n_dias, p=[0.4, 0.3, 0.2, 0.1]),
        "demanda": demanda,
    })


def prepare_prophet_df(df: pd.DataFrame) -> pd.DataFrame:
    df_p = df.rename(columns={"fecha": "ds", "demanda": "y"})
    return df_p[["ds", "y"]]


def train():
    from prophet import Prophet

    print("=== TASK-D-06: Entrenamiento demanda_materiales (Prophet v%s) ===" % MODEL_VERSION)

    df = generate_synthetic_data()
    df_p = prepare_prophet_df(df)

    split_idx = int(len(df_p) * 0.8)
    train_df = df_p.iloc[:split_idx]
    test_df = df_p.iloc[split_idx:]

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode="additive",
        interval_width=0.95,
    )
    model.fit(train_df)

    forecast = model.predict(test_df)
    y_true = test_df["y"].values
    y_pred = forecast["yhat"].values

    mae = np.mean(np.abs(y_true - y_pred))
    mae_pct = mae / np.mean(y_true)

    print(f"  Train samples: {len(train_df)}")
    print(f"  Test samples:  {len(test_df)}")
    print(f"  MAE:           {mae:.2f}")
    print(f"  MAE %%:         {mae_pct*100:.2f}%  (threshold: {MAE_THRESHOLD*100}%)")

    passed = mae_pct < MAE_THRESHOLD
    print(f"  Criterio:      {'PASS' if passed else 'FAIL'}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": MODEL_VERSION, "mae_pct": float(mae_pct)}, MODEL_PATH)
    print(f"  Modelo guardado: {MODEL_PATH}")

    _register_mlflow(model, MODEL_VERSION, {"mae": float(mae), "mae_pct": float(mae_pct)})

    return {"mae": float(mae), "mae_pct": float(mae_pct), "passed": passed, "version": MODEL_VERSION}


def _register_mlflow(model, version: str, metrics: dict):
    try:
        import mlflow

        mlflow.set_experiment("sisgad5-datasets")
        with mlflow.start_run(run_name=f"demanda_materiales-v{version}"):
            mlflow.log_params({"model_type": "prophet", "version": version})
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, artifact_path="model")
        print("  MLflow: registrado")
    except Exception as e:
        print(f"  MLflow: no disponible ({type(e).__name__})")


if __name__ == "__main__":
    result = train()
    sys.exit(0 if result["passed"] else 1)
