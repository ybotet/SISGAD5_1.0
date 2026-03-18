package models

import (
	"time"
)

// Asignacion representa una entrega de materiales a un técnico
type Asignacion struct {
    ID             int       `json:"id" db:"id_asignacion"`
    IDTrabajador   int       `json:"id_trabajador" db:"id_trabajador"`
    FechaAsignacion time.Time `json:"fecha_asignacion" db:"fecha_asignacion"`
    IDTrabajo      *int      `json:"id_trabajo,omitempty" db:"id_trabajo"`
    Observaciones  string    `json:"observaciones" db:"observaciones"`
    CreatedAt      time.Time `json:"created_at" db:"created_at"`
    // Relación: una asignación tiene muchos detalles
    // No es una columna, es para uso en Go
    Detalles       []AsignacionDetalle `json:"detalles,omitempty"`
}

// AsignacionDetalle representa cada material en una asignación
type AsignacionDetalle struct {
    ID              int     `json:"id" db:"id_detalle"`
    IDAsignacion    int     `json:"id_asignacion" db:"id_asignacion"`
    IDMaterial      int     `json:"id_material" db:"id_material"`
    Cantidad        int     `json:"cantidad" db:"cantidad_asignada"`
    CostoUnitario   float64 `json:"costo_unitario" db:"costo_unitario_momento"`
}