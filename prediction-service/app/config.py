"""Configuración del Prediction Service."""

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SISGAD5 Prediction Service"
    environment: str = "development"
    port: int = 5005

    jwt_secret: str
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "bd_sisgad5_predictions"
    db_user: str = "postgres"
    db_password: str = ""

    materials_service_url: str = "http://localhost:5003"
    mp_service_url: str = "http://localhost:5002"
    users_service_url: str = "http://localhost:5001"

    cors_origin: str = "*"
    log_level: str = "info"

    mlflow_tracking_uri: str = "http://localhost:5006"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_jwt_secret(self):
        if not self.jwt_secret or len(self.jwt_secret) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long")
        return self


settings = Settings()
