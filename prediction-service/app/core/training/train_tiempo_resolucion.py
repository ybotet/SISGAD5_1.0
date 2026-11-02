"""Training pipeline — Modelo: predicción de tiempo de resolución (TASK-D-07).

Modelo: XGBoost (regresión sobre features de trabajos)
Criterio: MAE < 20% sobre tiempo de resolución en horas
Datos: sintéticos anonimizados (TASK-D-20)

AGENTS.md §3.4: read-only sobre bd_mp. Usa datos anonimizados.
"""

import sys
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "tiempo_resolucion.joblib"
MAE_THRESHOLD = 0.20


def generate_synthetic_data(n_samples: int = 2000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)

    prioridad = np.random.choice([1, 2, 3], n_samples, p=[0.2, 0.5, 0.3])
    tipo_falla = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.3, 0.2])
    dia_semana = np.random.randint(0, 7, n_samples)
    hist_tecnico = np.random.exponential(scale=8, size=n_samples).round(1)
    observaciones = np.random.choice([0, 1], n_samples, p=[0.6, 0.4])

    tiempo = (
        2.0
        + hist_tecnico * 0.5
        + (prioridad == 1) * 4.0
        + (prioridad == 3) * 1.0
        + (tipo_falla == 2) * 3.0
        + (dia_semana >= 5) * 2.0
        + np.random.normal(0, 1.5, n_samples)
    )
    tiempo = np.maximum(tiempo, 0.1).round(1)

    return pd.DataFrame({
        "prioridad_queja": prioridad,
        "tipo_falla_encoded": tipo_falla,
        "dia_semana_trabajo": dia_semana,
        "duracion_historical_tecnico": hist_tecnico,
        "observaciones_presentes": observaciones,
        "duracion_horas": tiempo,
    })


def train():
    from xgboost import XGBRegressor
    from sklearn.metrics import mean_absolute_error
    from sklearn.model_selection import train_test_split

    print("=== TASK-D-07: Entrenamiento tiempo_resolucion (XGBoost v%s) ===" % MODEL_VERSION)

    df = generate_synthetic_data()
    feature_cols = [
        "prioridad_queja", "tipo_falla_encoded", "dia_semana_trabajo",
        "duracion_historical_tecnico", "observaciones_presentes",
    ]
    X = df[feature_cols]
    y = df["duracion_horas"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mae_pct = mae / np.mean(y_test)

    print(f"  Train samples: {len(X_train)}")
    print(f"  Test samples:  {len(X_test)}")
    print(f"  MAE:           {mae:.2f} horas")
    print(f"  MAE %%:         {mae_pct*100:.2f}%  (threshold: {MAE_THRESHOLD*100}%)")

    passed = mae_pct < MAE_THRESHOLD
    print(f"  Criterio:      {'PASS' if passed else 'FAIL'}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": MODEL_VERSION, "features": feature_cols, "mae_pct": float(mae_pct)}, MODEL_PATH)
    print(f"  Modelo guardado: {MODEL_PATH}")

    _register_mlflow(model, MODEL_VERSION, {"mae": float(mae), "mae_pct": float(mae_pct)})

    return {"mae": float(mae), "mae_pct": float(mae_pct), "passed": passed, "version": MODEL_VERSION}


def _register_mlflow(model, version: str, metrics: dict):
    try:
        import mlflow

        mlflow.set_experiment("sisgad5-datasets")
        with mlflow.start_run(run_name=f"tiempo_resolucion-v{version}"):
            mlflow.log_params({"model_type": "xgboost", "version": version})
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, artifact_path="model")
        print("  MLflow: registrado")
    except Exception as e:
        print(f"  MLflow: no disponible ({type(e).__name__})")


if __name__ == "__main__":
    result = train()
    sys.exit(0 if result["passed"] else 1)
