package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type UnidadMedidaRepository struct{}

func NewUnidadMedidaRepository() *UnidadMedidaRepository {	
	return &UnidadMedidaRepository{}
}

func (r *UnidadMedidaRepository) GetAll() ([]models.UnidadMedida, error) {
	var unidades []models.UnidadMedida

	err := DB.Select(&unidades, "SELECT * FROM tb_unidades_medida ORDER BY nombre")
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo unidades de medida: %w", err)
	}
	return unidades, nil
}

func (r *UnidadMedidaRepository) GetByID(id int) (*models.UnidadMedida, error) {
	var unidad models.UnidadMedida
	err := DB.Get(&unidad, "SELECT * FROM tb_unidades_medida WHERE id_unidad_medida = $1", id)
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo unidad de medida: %w", err)
	}	
	return &unidad, nil
}

func (r *UnidadMedidaRepository) Create(unidad *models.UnidadMedida) error {
	query := `INSERT INTO tb_unidades_medida (nombre) VALUES ($1) RETURNING id_unidad_medida`
	err := DB.QueryRow(query, unidad.Nombre).Scan(&unidad.ID)
	if err != nil {
		return fmt.Errorf("Error creando unidad de medida: %w", err)
	}
	return nil	
}

func (r *UnidadMedidaRepository) Update(unidad *models.UnidadMedida) error {
	query := `UPDATE tb_unidades_medida SET nombre = $1 WHERE id_unidad_medida = $2`
	_, err := DB.Exec(query, unidad.Nombre, unidad.ID)
	if err != nil {
		return fmt.Errorf("Error actualizando unidad de medida: %w", err)
	}
	return nil	
}

func (r *UnidadMedidaRepository) Delete(id int) error {
	result, err := DB.Exec("DELETE FROM tb_unidades_medida WHERE id_unidad_medida = $1", id)
	if err != nil {
		return fmt.Errorf("Error eliminando unidad de medida: %w", err)
	}	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("Error verificando eliminación de unidad de medida: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("unidad de medida %d no encontrada", id)
	}
	return nil
}

