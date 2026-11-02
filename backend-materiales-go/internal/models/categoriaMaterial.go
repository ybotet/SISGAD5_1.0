package models

type CategoriaMaterial struct {
	ID        int    `gorm:"primaryKey;column:id_categoria_material;autoIncrement" json:"id"`
	Categoria string `gorm:"column:categoria" json:"nombre"`
}

func (CategoriaMaterial) TableName() string {
	return "tb_categorias_material"
}