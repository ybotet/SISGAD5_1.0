package models

import (
	"fmt"
	"time"
)

type Material struct {
    ID          int       `json:"id" db:"id_material"`
    Codigo      string    `json:"codigo" db:"codigo"`
    Nombre      string    `json:"nombre" db:"nombre"`
    Descripcion string    `json:"descripcion" db:"descripcion"`
    Categoria   int    `json:"categoria" db:"id_categoria_material"`
    TbCategoria *CategoriaMaterial `json:"tb_categoria_material,omitempty"`
    Unidad          int               `json:"unidad" db:"id_unidad_medida"`
    TbUnidadMedida *UnidadMedida     `json:"tb_unidad_medida,omitempty"`
    Precio          float64           `json:"precio" db:"precio_actual"`
    CreatedAt       time.Time         `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
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