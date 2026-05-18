package models

type UnidadMedida struct {
	ID     int    `gorm:"primaryKey;column:id_unidad_medida;autoIncrement" json:"id"`
	Nombre string `gorm:"column:nombre" json:"nombre"`
}

func (UnidadMedida) TableName() string {
	return "tb_unidades_medida"
}