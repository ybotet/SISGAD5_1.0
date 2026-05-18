package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"gorm.io/gorm"
)

type UnidadMedidaRepository struct {
	db *gorm.DB
}

func NewUnidadMedidaRepository() *UnidadMedidaRepository {
	return &UnidadMedidaRepository{db: DB}
}

func (r *UnidadMedidaRepository) GetAll() ([]models.UnidadMedida, error) {
	var unidades []models.UnidadMedida
	err := r.db.Order("nombre ASC").Find(&unidades).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo unidades de medida: %w", err)
	}
	return unidades, nil
}

func (r *UnidadMedidaRepository) GetByID(id int) (*models.UnidadMedida, error) {
	var unidad models.UnidadMedida
	err := r.db.First(&unidad, id).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo unidad de medida: %w", err)
	}
	return &unidad, nil
}

func (r *UnidadMedidaRepository) Create(unidad *models.UnidadMedida) error {
	err := r.db.Create(unidad).Error
	if err != nil {
		return fmt.Errorf("Error creando unidad de medida: %w", err)
	}
	return nil
}

func (r *UnidadMedidaRepository) Update(unidad *models.UnidadMedida) error {
	err := r.db.Save(unidad).Error
	if err != nil {
		return fmt.Errorf("Error actualizando unidad de medida: %w", err)
	}
	return nil
}

func (r *UnidadMedidaRepository) Delete(id int) error {
	result := r.db.Delete(&models.UnidadMedida{}, id)
	if result.Error != nil {
		return fmt.Errorf("Error eliminando unidad de medida: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("unidad de medida %d no encontrada", id)
	}
	return nil
}