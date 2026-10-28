"""FastAPI application — Punto de entrada del Prediction Service."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.endpoints import router as prediction_router

app = FastAPI(
    title="SISGAD5 Prediction Service",
    description="Servicio de modelado predictivo para SISGAD5 (read-only).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/api/predictions", tags=["predictions"])
