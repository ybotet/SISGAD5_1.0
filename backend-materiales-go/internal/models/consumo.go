package models

import (
	"time"
)

// Consumo representa materiales usados en un trabajo
type Consumo struct {
    ID            int       `json:"id" db:"id_consumo"`
    IDTrabajo     int       `json:"id_trabajo" db:"id_trabajo"`
    IDTrabajador  int       `json:"id_trabajador" db:"id_trabajador"`
    FechaConsumo  time.Time `json:"fecha_consumo" db:"fecha_consumo"`
    Observaciones string    `json:"observaciones" db:"observaciones"`
    CreatedAt     time.Time `json:"created_at" db:"created_at"`
    // Relación
    Detalles      []ConsumoDetalle `json:"detalles,omitempty"`
}

// ConsumoDetalle representa cada material en un consumo
type ConsumoDetalle struct {
    ID            int     `json:"id" db:"id_detalle"`
    IDConsumo     int     `json:"id_consumo" db:"id_consumo"`
    IDMaterial    int     `json:"id_material" db:"id_material"`
    Cantidad      int     `json:"cantidad" db:"cantidad_usada"`
    CostoUnitario float64 `json:"costo_unitario" db:"costo_unitario_momento"`
    IDAsignacion  *int    `json:"id_asignacion,omitempty" db:"id_asignacion"`
}