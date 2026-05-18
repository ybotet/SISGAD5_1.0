package models

import (
	"fmt"
	"time"
)

type Material struct {
	ID             int                `gorm:"primaryKey;column:id_material;autoIncrement" json:"id"`
	Codigo         string             `gorm:"column:codigo" json:"codigo"`
	Nombre         string             `gorm:"column:nombre" json:"nombre"`
	Descripcion    string             `gorm:"column:descripcion" json:"descripcion"`
	Categoria      int                `gorm:"column:id_categoria_material" json:"categoria"`
	TbCategoria    *CategoriaMaterial `gorm:"foreignKey:Categoria;references:ID" json:"tb_categoria_material,omitempty"`
	Unidad         int                `gorm:"column:id_unidad_medida" json:"unidad"`
	TbUnidadMedida *UnidadMedida      `gorm:"foreignKey:Unidad;references:ID" json:"tb_unidad_medida,omitempty"`
	Precio         float64            `gorm:"column:precio_actual" json:"precio"`
	CreatedAt      time.Time          `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time          `gorm:"column:updated_at" json:"updated_at"`
}

func (Material) TableName() string {
	return "tb_materiales"
}

func (m *Material) Validar() error {
	if m.Nombre == "" {
		return fmt.Errorf("el nombre del material es requerido")
	}
	if m.Precio <= 0 {
		return fmt.Errorf("el precio debe ser mayor a cero")
	}
	return nil
}

