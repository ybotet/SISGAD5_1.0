package models

import (
	"time"
)

// Asignacion representa una entrega de materiales a un técnico
type Asignacion struct {
	ID              int                 `gorm:"primaryKey;column:id_asignacion;autoIncrement" json:"id"`
	IDTrabajador    int                 `gorm:"column:id_trabajador" json:"id_trabajador"`
	FechaAsignacion time.Time           `gorm:"column:fecha_asignacion" json:"fecha_asignacion"`
	IDTrabajo       *int                `gorm:"column:id_trabajo" json:"id_trabajo,omitempty"`
	Observaciones   string              `gorm:"column:observaciones" json:"observaciones"`
	CreatedAt       time.Time           `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time           `gorm:"column:updated_at" json:"updated_at"`
	Detalles        []AsignacionDetalle `gorm:"foreignKey:IDAsignacion" json:"detalles,omitempty"`
}

func (Asignacion) TableName() string {
	return "tb_asignaciones"
}

// AsignacionDetalle representa cada material en una asignación
type AsignacionDetalle struct {
	ID            int        `gorm:"primaryKey;column:id_detalle" json:"id"`
	IDAsignacion  int        `gorm:"column:id_asignacion" json:"id_asignacion"`
	TbAsignacion  *Asignacion `gorm:"foreignKey:IDAsignacion;references:ID" json:"tb_asignacion,omitempty"`
	IDMaterial    int        `gorm:"column:id_material" json:"id_material"`
	TbMaterial    *Material   `gorm:"foreignKey:IDMaterial;references:ID" json:"tb_material,omitempty"`
	Cantidad      int        `gorm:"column:cantidad_asignada" json:"cantidad"`
	CostoUnitario float64    `gorm:"column:costo_unitario_momento" json:"costo_unitario"`
}

func (AsignacionDetalle) TableName() string {
	return "tb_asignacion_detalle"
}