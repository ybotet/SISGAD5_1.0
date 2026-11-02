package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type Material struct {
	ID             int                `gorm:"primaryKey;column:id_material;autoIncrement" json:"id"`
	Codigo         string             `gorm:"column:codigo" json:"codigo"`
	Nombre         string             `gorm:"column:nombre" json:"nombre"`
	Descripcion    string             `gorm:"column:descripcion" json:"descripcion"`
	CategoriaID    int                `gorm:"column:id_categoria_material" json:"categoria_id"`
	TbCategoria    *CategoriaMaterial `gorm:"foreignKey:CategoriaID;references:ID" json:"tb_categoria_material,omitempty"`
	UnidadID       int                `gorm:"column:id_unidad_medida" json:"unidad_id"`
	TbUnidadMedida *UnidadMedida      `gorm:"foreignKey:UnidadID;references:ID" json:"tb_unidad_medida,omitempty"`
	Precio         float64            `gorm:"column:precio_actual" json:"precio"`
	CreatedAt      time.Time          `gorm:"column:created_at" json:"created_at"`
	UpdatedAt      time.Time          `gorm:"column:updated_at" json:"updated_at"`
}

// Para compatibilidad con el frontend que espera "categoria" y "unidad"
func (m *Material) UnmarshalJSON(data []byte) error {
    type Alias Material
    aux := struct {
        Categoria interface{} `json:"categoria"`
        Unidad    interface{} `json:"unidad"`
        *Alias
    }{
        Alias: (*Alias)(m),
    }
    
    if err := json.Unmarshal(data, &aux); err != nil {
        return err
    }
    
    // Mapear categoria a CategoriaID
    if aux.Categoria != nil {
        switch v := aux.Categoria.(type) {
        case float64:
            m.CategoriaID = int(v)
        case int:
            m.CategoriaID = v
        }
    }
    
    // Mapear unidad a UnidadID
    if aux.Unidad != nil {
        switch v := aux.Unidad.(type) {
        case float64:
            m.UnidadID = int(v)
        case int:
            m.UnidadID = v
        }
    }
    
    return nil
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