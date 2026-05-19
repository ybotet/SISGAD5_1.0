// models/consumo.go
package models

import (
	"time"
)

type Consumo struct {
	ID            int              `gorm:"primaryKey;column:id_consumo;autoIncrement" json:"id"`
	IDTrabajo     int              `gorm:"column:id_trabajo" json:"id_trabajo"`
	IDTrabajador  int              `gorm:"column:id_trabajador" json:"id_trabajador"`
	FechaConsumo  time.Time        `gorm:"column:fecha_consumo" json:"fecha_consumo"`
	Observaciones string           `gorm:"column:observaciones" json:"observaciones"`
	CreatedAt     time.Time        `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time        `gorm:"column:updated_at" json:"updated_at"`
	Detalles      []ConsumoDetalle `gorm:"foreignKey:IDConsumo" json:"detalles,omitempty"`
}

func (Consumo) TableName() string {
	return "tb_consumos"
}

type ConsumoDetalle struct {
	ID            int       `gorm:"primaryKey;column:id_detalle" json:"id"`
	IDConsumo     int       `gorm:"column:id_consumo" json:"id_consumo"`
	IDMaterial    int       `gorm:"column:id_material" json:"id_material"`
	Cantidad      int       `gorm:"column:cantidad_usada" json:"cantidad"`
	CostoUnitario float64   `gorm:"column:costo_unitario_momento" json:"costo_unitario"`
	// IDAsignacion  *int      `gorm:"column:id_asignacion" json:"id_asignacion,omitempty"`
	TbMaterial    *Material `gorm:"foreignKey:IDMaterial;references:ID" json:"tb_material,omitempty"`
}

func (ConsumoDetalle) TableName() string {
	return "tb_consumo_detalle"
}