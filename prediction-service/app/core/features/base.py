"""Base classes for feature engineering."""

from dataclasses import dataclass, field
from typing import Any

import pandas as pd


@dataclass
class FeatureSpec:
    """Spec for a single feature."""
    name: str
    type: str
    dtype: str
    source: str
    transform: str
    nullable: bool
    description: str
    metadata: dict[str, Any] = field(default_factory=dict)


class FeatureRegistry:
    """Registry of FeatureSpec objects for an entity."""

    def __init__(self, features: list[FeatureSpec]):
        self._features = {f.name: f for f in features}

    def __iter__(self):
        return iter(self._features.values())

    def __len__(self):
        return len(self._features)

    def get(self, name: str) -> FeatureSpec:
        return self._features[name]

    def names(self) -> list[str]:
        return list(self._features.keys())

    def to_dataframe(self) -> pd.DataFrame:
        """Export feature specs to a DataFrame for documentation."""
        rows = []
        for f in self:
            rows.append({
                "name": f.name,
                "type": f.type,
                "dtype": f.dtype,
                "source": f.source,
                "transform": f.transform,
                "nullable": f.nullable,
                "description": f.description,
            })
        return pd.DataFrame(rows)


__all__ = ["FeatureSpec", "FeatureRegistry"]
