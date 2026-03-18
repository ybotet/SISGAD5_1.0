package postgres

import (
	"fmt"
	"strings"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type MaterialRepository struct{}

func NewMaterialRepository() *MaterialRepository {
    return &MaterialRepository{}
}

func (r *MaterialRepository) GetAll() ([]models.Material, error) {
	var materiales []models.Material
	
	err := DB.Select(&materiales, "SELECT * FROM materiales")
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo materiales: %w", err)
	}
	return materiales, nil
}

func (r *MaterialRepository) Count(search string) (int, error) {
	var total int
	if search == "" {
		err := DB.Get(&total, "SELECT COUNT(*) FROM materiales")
		if err != nil {
			return 0, fmt.Errorf("Error contando materiales: %w", err)
		}
		return total, nil
	}

	searchPattern := fmt.Sprintf("%%%s%%", strings.ToLower(search))
	err := DB.Get(&total, `SELECT COUNT(*) FROM materiales WHERE LOWER(codigo) LIKE $1 OR LOWER(nombre) LIKE $1 OR LOWER(categoria) LIKE $1`, searchPattern)
	if err != nil {
		return 0, fmt.Errorf("Error contando materiales: %w", err)
	}
	return total, nil
}

func (r *MaterialRepository) GetPaginated(search string, limit int, offset int) ([]models.Material, error) {
	var materiales []models.Material
	if search == "" {
		err := DB.Select(&materiales, "SELECT * FROM materiales ORDER BY created_at DESC LIMIT $1 OFFSET $2", limit, offset)
		if err != nil {
			return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
		}
		return materiales, nil
	}

	searchPattern := fmt.Sprintf("%%%s%%", strings.ToLower(search))
	err := DB.Select(&materiales, `SELECT * FROM materiales WHERE LOWER(codigo) LIKE $1 OR LOWER(nombre) LIKE $1 OR LOWER(categoria) LIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, searchPattern, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
	}
	return materiales, nil
}

func (r *MaterialRepository) GetByID(id int) (*models.Material, error) {
	var material models.Material
	err := DB.Get(&material, "SELECT * FROM materiales WHERE id_material = $1", id)
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo material: %w", err)
	}
	return &material, nil
}

func (r *MaterialRepository) Create(material *models.Material) error {
	query := `INSERT INTO materiales (codigo, nombre, descripcion, categoria, unidad_medida, precio_actual) 
			  VALUES ($1, $2, $3, $4, $5, $6) 
			  RETURNING id_material, created_at, updated_at`

	err := DB.QueryRow(query, material.Codigo, material.Nombre, material.Descripcion, material.Categoria, material.Unidad, material.Precio).Scan(&material.ID, &material.CreatedAt, &material.UpdatedAt)
	if err != nil {
		return fmt.Errorf("Error creando material: %w", err)
	}
	return nil
}

func (r *MaterialRepository) Update(material *models.Material) error {
	query := `UPDATE materiales SET codigo = $1, nombre = $2, descripcion = $3, categoria = $4, unidad_medida = $5, precio_actual = $6, updated_at = NOW() 
			  WHERE id_material = $7
			  RETURNING updated_at`
	err := DB.QueryRow(query, material.Codigo, material.Nombre, material.Descripcion, material.Categoria, material.Unidad, material.Precio, material.ID).Scan(&material.UpdatedAt)
	if err != nil {
		return fmt.Errorf("Error actualizando material: %w", err)
	}
	return nil
}

func (r *MaterialRepository) Delete(id int) error {
	result, err := DB.Exec("DELETE FROM materiales WHERE id_material = $1", id)
	if err != nil {
		return fmt.Errorf("Error eliminando material: %w", err)
	}

	rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("material %d no encontrado", id)
    }
	
	return nil
}