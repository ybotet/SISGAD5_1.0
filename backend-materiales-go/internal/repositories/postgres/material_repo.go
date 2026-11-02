// material_repo.go - corregido
package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"gorm.io/gorm"
)

type MaterialRepository struct {
	db *gorm.DB
}

func NewMaterialRepository() *MaterialRepository {
	return &MaterialRepository{db: DB}
}

func (r *MaterialRepository) GetAll() ([]models.Material, error) {
	var materiales []models.Material
	err := r.db.
		Preload("TbCategoria").
		Preload("TbUnidadMedida").
		Order("created_at DESC").
		Find(&materiales).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo materiales: %w", err)
	}
	return materiales, nil
}

func (r *MaterialRepository) Count(search string) (int, error) {
	var total int64
	
	query := r.db.Model(&models.Material{})
	if search != "" {
		query = query.Where("codigo ILIKE ? OR nombre ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	err := query.Count(&total).Error
	if err != nil {
		return 0, fmt.Errorf("Error contando materiales: %w", err)
	}
	return int(total), nil
}

func (r *MaterialRepository) GetPaginated(search string, limit int, offset int) ([]models.Material, error) {
	var materiales []models.Material
	
	query := r.db.
		Preload("TbCategoria").
		Preload("TbUnidadMedida").
		Order("created_at DESC")
	
	if search != "" {
		query = query.Where("codigo ILIKE ? OR nombre ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	err := query.Limit(limit).Offset(offset).Find(&materiales).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
	}
	
	return materiales, nil
}

func (r *MaterialRepository) GetByID(id int) (*models.Material, error) {
	var material models.Material
	err := r.db.
		Preload("TbCategoria").
		Preload("TbUnidadMedida").
		First(&material, id).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo material: %w", err)
	}
	return &material, nil
}

func (r *MaterialRepository) Create(material *models.Material) error {
	err := r.db.Create(material).Error
	if err != nil {
		return fmt.Errorf("Error creando material: %w", err)
	}
	return nil
}

func (r *MaterialRepository) Update(material *models.Material) error {
	err := r.db.Save(material).Error
	if err != nil {
		return fmt.Errorf("Error actualizando material: %w", err)
	}
	return nil
}

func (r *MaterialRepository) Delete(id int) error {
	result := r.db.Delete(&models.Material{}, id)
	if result.Error != nil {
		return fmt.Errorf("Error eliminando material: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("material %d no encontrado", id)
	}
	return nil
}