package models

type UnidadMedida struct {
	ID     int    `json:"id" db:"id_unidad_medida"`
	Nombre string `json:"nombre" db:"nombre"`
}
