"""Training pipeline — Modelo: detección de anomalías (TASK-D-08).

Modelo: IsolationForest (detección de anomalías en demanda de materiales)
Criterio: Precision > 85% sobre detección de consumos atípicos
Datos: sintéticos anonimizados (TASK-D-20)

AGENTS.md §3.4: read-only sobre bd_materiales. Usa datos anonimizados.
"""

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "anomalias.joblib"
PRECISION_THRESHOLD = 0.85


def generate_synthetic_data(n_samples: int = 3000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)

    n_normal = int(n_samples * 0.90)
    n_anomalo = int(n_samples * 0.10)

    normal = np.random.exponential(scale=50, size=(n_normal, 4))
    normal[:, 3] = np.random.exponential(scale=5, size=n_normal)

    anomalo = np.random.exponential(scale=50, size=(n_anomalo, 4))
    anomalo[:, 3] = anomalo[:, 3] * 10 + 100

    X = np.vstack([normal, anomalo])
    y = np.hstack([np.zeros(n_normal, dtype=int), np.ones(n_anomalo, dtype=int)])

    feature_names = ["consumo_historical", "costo", "categoria_encoded", "consumo_real"]
    return pd.DataFrame(X, columns=feature_names), pd.Series(y, name="es_anomalo")


def train():
    from sklearn.ensemble import IsolationForest
    from sklearn.metrics import precision_score, recall_score

    print("=== TASK-D-08: Entrenamiento anomalias (IsolationForest v%s) ===" % MODEL_VERSION)

    X, y = generate_synthetic_data()
    feature_cols = list(X.columns)

    model = IsolationForest(
        contamination=0.10,
        n_estimators=200,
        max_samples="auto",
        random_state=42,
    )
    model.fit(X)

    y_pred = (model.predict(X) == -1).astype(int)

    precision = precision_score(y, y_pred, zero_division=0)
    recall = recall_score(y, y_pred, zero_division=0)

    print(f"  Total samples: {len(X)}")
    print(f"  Anomalies:     {y.sum()}")
    print(f"  Precision:     {precision*100:.2f}%  (threshold: {PRECISION_THRESHOLD*100}%)")
    print(f"  Recall:        {recall*100:.2f}%")

    passed = precision > PRECISION_THRESHOLD
    print(f"  Criterio:      {'PASS' if passed else 'FAIL'}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": MODEL_VERSION, "features": feature_cols, "precision": float(precision)}, MODEL_PATH)
    print(f"  Modelo guardado: {MODEL_PATH}")

    _register_mlflow(model, MODEL_VERSION, {"precision": float(precision), "recall": float(recall)})

    return {"precision": float(precision), "recall": float(recall), "passed": passed, "version": MODEL_VERSION}


def _register_mlflow(model, version: str, metrics: dict):
    try:
        import mlflow

        mlflow.set_experiment("sisgad5-anomalies")
        with mlflow.start_run(run_name=f"anomalias-v{version}"):
            mlflow.log_params({"model_type": "isolation_forest", "version": version})
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, artifact_path="model")
        print("  MLflow: registrado")
    except Exception as e:
        print(f"  MLflow: no disponible ({type(e).__name__})")


if __name__ == "__main__":
    result = train()
    sys.exit(0 if result["passed"] else 1)
