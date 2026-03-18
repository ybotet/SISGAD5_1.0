package models

import (
	"time"
)

// DashboardTrabajador es la respuesta completa para el dashboard
type DashboardTrabajador struct {
    TrabajadorID      int                `json:"trabajador_id"`
    FechaResumen      time.Time          `json:"fecha_resumen"`
    DiasReferencia    int                `json:"dias_referencia"`
    UmbralAutonomia   float64            `json:"umbral_autonomia"`
    // PromediosConsumo  []PromedioConsumo  `json:"promedios_consumo"`
    // StockActual       []StockTrabajador  `json:"stock_actual"`
    // Alertas           []AlertaStock      `json:"alertas"`
    TotalAlertas      int                `json:"total_alertas"`
    TotalMateriales   int                `json:"total_materiales"`
    MaterialesConStock int               `json:"materiales_con_stock"`
}