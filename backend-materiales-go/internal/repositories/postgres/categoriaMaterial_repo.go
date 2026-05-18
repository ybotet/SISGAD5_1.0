package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"gorm.io/gorm"
)

type CategoriaMaterialRepository struct {
	db *gorm.DB
}

func NewCategoriaMaterialRepository() *CategoriaMaterialRepository {
	return &CategoriaMaterialRepository{db: DB}
}

func (r *CategoriaMaterialRepository) GetAll() ([]models.CategoriaMaterial, error) {
	var categorias []models.CategoriaMaterial
	err := r.db.Order("categoria ASC").Find(&categorias).Error
	if err != nil {
		return categorias, fmt.Errorf("Error obteniendo categorías de material: %w", err)
	}
	return categorias, nil
}

func (r *CategoriaMaterialRepository) GetPaginated(page int, limit int, search string) ([]models.CategoriaMaterial, int, error) {
	var categorias []models.CategoriaMaterial
	var total int64

	query := r.db.Model(&models.CategoriaMaterial{})

	if search != "" {
		query = query.Where("categoria ILIKE ?", "%"+search+"%")
	}

	// Contar total
	err := query.Count(&total).Error
	if err != nil {
		return categorias, 0, fmt.Errorf("Error contando categorías de material: %w", err)
	}

	// Obtener datos paginados
	offset := (page - 1) * limit
	err = query.Order("categoria ASC").Limit(limit).Offset(offset).Find(&categorias).Error
	if err != nil {
		return categorias, 0, fmt.Errorf("Error obteniendo categorías de material paginadas: %w", err)
	}

	return categorias, int(total), nil
}

func (r *CategoriaMaterialRepository) GetByID(id int) (*models.CategoriaMaterial, error) {
	var categoria models.CategoriaMaterial
	err := r.db.First(&categoria, id).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo categoría de material: %w", err)
	}
	return &categoria, nil
}

func (r *CategoriaMaterialRepository) Create(categoria *models.CategoriaMaterial) error {
	err := r.db.Create(categoria).Error
	if err != nil {
		return fmt.Errorf("Error creando categoría de material: %w", err)
	}
	return nil
}

func (r *CategoriaMaterialRepository) Update(categoria *models.CategoriaMaterial) error {
	err := r.db.Save(categoria).Error
	if err != nil {
		return fmt.Errorf("Error actualizando categoría de material: %w", err)
	}
	return nil
}

func (r *CategoriaMaterialRepository) Delete(id int) error {
	result := r.db.Delete(&models.CategoriaMaterial{}, id)
	if result.Error != nil {
		return fmt.Errorf("Error eliminando categoría de material: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("categoría de material %d no encontrada", id)
	}
	return nil
}