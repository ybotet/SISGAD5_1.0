package models

type CategoriaMaterial struct {
	ID        int    `json:"id" db:"id_categoria_material"`
	Categoria string `json:"nombre" db:"categoria"`
}