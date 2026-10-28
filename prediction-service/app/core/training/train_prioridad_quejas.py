"""Training pipeline — Modelo: clasificación de prioridad de quejas (TASK-D-09).

Modelo: RandomForestClassifier
Criterio: Accuracy > 80% para clasificación de prioridad (1-3)
Datos: sintéticos anonimizados (TASK-D-20)

AGENTS.md §3.4: read-only sobre bd_mp. Usa datos anonimizados.
"""

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "prioridad_quejas.joblib"
ACCURACY_THRESHOLD = 0.80


def generate_synthetic_data(n_samples: int = 2000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)

    tipo_falla = np.random.choice([0, 1, 2], n_samples, p=[0.5, 0.3, 0.2])
    servicio = np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1])
    dia_semana = np.random.randint(0, 7, n_samples)
    hist_resolucion = np.random.exponential(scale=12, size=n_samples)
    n_trabajos_previos = np.random.poisson(lam=5, size=n_samples)

    prioridad = np.where(
        (tipo_falla == 2) | (hist_resolucion > 24) | (n_trabajos_previos > 10), 1,
        np.where((servicio == 0) | (dia_semana >= 5), 2, 3)
    )

    return pd.DataFrame({
        "tipo_falla_encoded": tipo_falla,
        "servicio_encoded": servicio,
        "dia_semana": dia_semana,
        "hist_resolucion_media": hist_resolucion,
        "n_trabajos_previos": n_trabajos_previos,
        "prioridad": prioridad,
    })


def train():
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import accuracy_score, precision_recall_fscore_support

    print("=== TASK-D-09: Entrenamiento prioridad_quejas (RandomForest v%s) ===" % MODEL_VERSION)

    df = generate_synthetic_data()
    feature_cols = [
        "tipo_falla_encoded", "servicio_encoded", "dia_semana",
        "hist_resolucion_media", "n_trabajos_previos",
    ]
    X = df[feature_cols]
    y = df["prioridad"]

    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=20,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

    print(f"  Train samples: {len(X_train)}")
    print(f"  Test samples:  {len(X_test)}")
    print(f"  Accuracy:      {accuracy*100:.2f}%  (threshold: {ACCURACY_THRESHOLD*100}%)")
    print(f"  Precision:     {precision*100:.2f}%")
    print(f"  Recall:        {recall*100:.2f}%")
    print(f"  F1:            {f1*100:.2f}%")

    passed = accuracy > ACCURACY_THRESHOLD
    print(f"  Criterio:      {'PASS' if passed else 'FAIL'}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": MODEL_VERSION, "features": feature_cols, "accuracy": float(accuracy)}, MODEL_PATH)
    print(f"  Modelo guardado: {MODEL_PATH}")

    _register_mlflow(model, MODEL_VERSION, {"accuracy": float(accuracy), "precision": float(precision), "recall": float(recall), "f1": float(f1)})

    return {"accuracy": float(accuracy), "precision": float(precision), "recall": float(recall), "f1": float(f1), "passed": passed, "version": MODEL_VERSION}


def _register_mlflow(model, version: str, metrics: dict):
    try:
        import mlflow

        mlflow.set_experiment("sisgad5-prioridad")
        with mlflow.start_run(run_name=f"prioridad_quejas-v{version}"):
            mlflow.log_params({"model_type": "random_forest", "version": version})
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, artifact_path="model")
        print("  MLflow: registrado")
    except Exception as e:
        print(f"  MLflow: no disponible ({type(e).__name__})")


if __name__ == "__main__":
    result = train()
    sys.exit(0 if result["passed"] else 1)
