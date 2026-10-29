"""Model loading utilities — lazy load y cache de modelos serializados."""

import joblib
from pathlib import Path
from typing import Any, Dict, Optional

from app.utils import get_logger

logger = get_logger(__name__)

_MODELS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "models"

_loaded_models: Dict[str, Dict[str, Any]] = {}


def get_models_dir() -> Path:
    if not _MODELS_DIR.exists():
        raise FileNotFoundError(f"Directorio de modelos no encontrado: {_MODELS_DIR}")
    return _MODELS_DIR


def load_model(name: str) -> Dict[str, Any]:
    """Carga (con cache) un modelo serializado como dict con 'model' + metadata."""
    if name in _loaded_models:
        return _loaded_models[name]

    model_path = get_models_dir() / f"{name}.joblib"
    if not model_path.exists():
        raise FileNotFoundError(f"Modelo no encontrado: {model_path}")

    logger.info("Cargando modelo desde %s", model_path)
    payload = joblib.load(model_path)

    if not isinstance(payload, dict) or "model" not in payload:
        raise ValueError(f"Formato de modelo inválido para {name}: se esperaba dict con 'model'")

    _loaded_models[name] = payload
    logger.info(
        "Modelo %s cargado — versión=%s",
        name,
        payload.get("version", "unknown"),
    )
    return payload


def get_model_artifact(name: str) -> Any:
    """Devuelve solo el estimador (modelo entrenado) del payload."""
    return load_model(name)["model"]


def get_model_version(name: str) -> str:
    """Devuelve la versión del modelo como string."""
    return str(load_model(name).get("version", "unknown"))


def get_model_features(name: str) -> list[str]:
    """Devuelve la lista de features esperados por el modelo."""
    return list(load_model(name).get("features", []))


def get_model_metric(name: str, key: str = "mae_pct") -> Optional[float]:
    """Devuelve una métrica almacenada en el payload del modelo."""
    return load_model(name).get(key)


def list_available_models() -> list[dict[str, Any]]:
    """Lista todos los modelos .joblib disponibles en el directorio models/."""
    models_dir = get_models_dir()
    results = []
    for path in sorted(models_dir.glob("*.joblib")):
        results.append({
            "name": path.stem,
            "file": path.name,
            "size_bytes": path.stat().st_size,
        })
    return results
