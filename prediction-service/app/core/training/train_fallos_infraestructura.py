"""Training pipeline — Modelo: predicción de fallos de infraestructura (TASK-D-10).

Modelo: XGBoost (clasificación binaria: fallo vs. no fallo)
Criterio: Recall > 75% para detección de fallos críticos
Datos: sintéticos anonimizados (TASK-D-20)

AGENTS.md §3.4: read-only sobre bd_mp/bd_materiales. Usa datos anonimizados.
"""

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "fallos_infraestructura.joblib"
RECALL_THRESHOLD = 0.75


def generate_synthetic_data(n_samples: int = 2500, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)

    prioridad = np.random.choice([1, 2, 3], n_samples, p=[0.2, 0.5, 0.3])
    dia_semana = np.random.randint(0, 7, n_samples)
    hist_quejas = np.random.exponential(scale=3, size=n_samples)
    consumo_real = np.random.exponential(scale=200, size=n_samples)
    edad_infra = np.random.exponential(scale=36, size=n_samples)

    fallo = np.where(
        (prioridad == 1) | (hist_quejas > 8) | (edad_infra > 60), 1,
        np.where((consumo_real > 400) & (dia_semana >= 5), 1, 0)
    )
    fallo_prob = np.random.random(n_samples) * 0.15
    fallo = np.where(fallo_prob < 0.05, 1 - fallo, fallo)

    return pd.DataFrame({
        "prioridad": prioridad,
        "dia_semana": dia_semana,
        "hist_quejas_por_elemento": hist_quejas,
        "consumo_real_material": consumo_real,
        "edad_infra_dias": edad_infra,
        "es_fallo": fallo,
    })


def train():
    from xgboost import XGBClassifier
    from sklearn.metrics import accuracy_score, precision_score, recall_score
    from sklearn.model_selection import train_test_split

    print("=== TASK-D-10: Entrenamiento fallos_infraestructura (XGBoost v%s) ===" % MODEL_VERSION)

    df = generate_synthetic_data()
    feature_cols = [
        "prioridad", "dia_semana", "hist_quejas_por_elemento",
        "consumo_real_material", "edad_infra_dias",
    ]
    X = df[feature_cols]
    y = df["es_fallo"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=2.0,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)

    print(f"  Train samples: {len(X_train)}")
    print(f"  Test samples:  {len(X_test)}")
    print(f"  Accuracy:      {accuracy*100:.2f}%")
    print(f"  Precision:     {precision*100:.2f}%")
    print(f"  Recall:        {recall*100:.2f}%  (threshold: {RECALL_THRESHOLD*100}%)")

    passed = recall > RECALL_THRESHOLD
    print(f"  Criterio:      {'PASS' if passed else 'FAIL'}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "version": MODEL_VERSION, "features": feature_cols, "recall": float(recall)}, MODEL_PATH)
    print(f"  Modelo guardado: {MODEL_PATH}")

    _register_mlflow(model, MODEL_VERSION, {"accuracy": float(accuracy), "precision": float(precision), "recall": float(recall)})

    return {"accuracy": float(accuracy), "precision": float(precision), "recall": float(recall), "passed": passed, "version": MODEL_VERSION}


def _register_mlflow(model, version: str, metrics: dict):
    try:
        import mlflow

        mlflow.set_experiment("sisgad5-fallos")
        with mlflow.start_run(run_name=f"fallos_infraestructura-v{version}"):
            mlflow.log_params({"model_type": "xgboost_classifier", "version": version})
            mlflow.log_metrics(metrics)
            mlflow.sklearn.log_model(model, artifact_path="model")
        print("  MLflow: registrado")
    except Exception as e:
        print(f"  MLflow: no disponible ({type(e).__name__})")


if __name__ == "__main__":
    result = train()
    sys.exit(0 if result["passed"] else 1)
