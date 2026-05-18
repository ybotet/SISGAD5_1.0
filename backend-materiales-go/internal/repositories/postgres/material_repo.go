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
	
	// Usar SQL raw para el conteo
	query := `SELECT COUNT(*) FROM tb_materiales`
	args := []interface{}{}
	
	if search != "" {
		query += ` WHERE codigo ILIKE $1 OR nombre ILIKE $1`
		args = append(args, "%"+search+"%")
	}
	
	err := r.db.Raw(query, args...).Scan(&total).Error
	if err != nil {
		return 0, fmt.Errorf("Error contando materiales: %w", err)
	}
	return int(total), nil
}

func (r *MaterialRepository) GetPaginated(search string, limit int, offset int) ([]models.Material, error) {
	var materiales []models.Material
	
	// Construir la consulta SQL raw
	query := `
		SELECT 
			m.id_material,
			m.codigo,
			m.nombre,
			m.descripcion,
			m.id_categoria_material,
			m.id_unidad_medida,
			m.precio_actual,
			m.created_at,
			m.updated_at
		FROM tb_materiales m
	`
	args := []interface{}{}
	
	if search != "" {
		query += ` WHERE m.codigo ILIKE $1 OR m.nombre ILIKE $1`
		args = append(args, "%"+search+"%")
	}
	
	query += ` ORDER BY m.created_at DESC LIMIT $` + fmt.Sprintf("%d", len(args)+1) + ` OFFSET $` + fmt.Sprintf("%d", len(args)+2)
	args = append(args, limit, offset)
	
	// Ejecutar consulta raw
	err := r.db.Raw(query, args...).Scan(&materiales).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
	}
	
	// Cargar relaciones por separado (Preload después de obtener los IDs)
	for i := range materiales {
		// Cargar categoría
		if materiales[i].Categoria > 0 {
			var categoria models.CategoriaMaterial
			err := r.db.Where("id_categoria_material = ?", materiales[i].Categoria).First(&categoria).Error
			if err == nil {
				materiales[i].TbCategoria = &categoria
			}
		}
		
		// Cargar unidad de medida
		if materiales[i].Unidad > 0 {
			var unidad models.UnidadMedida
			err := r.db.Where("id_unidad_medida = ?", materiales[i].Unidad).First(&unidad).Error
			if err == nil {
				materiales[i].TbUnidadMedida = &unidad
			}
		}
	}
	
	return materiales, nil
}

func (r *MaterialRepository) GetByID(id int) (*models.Material, error) {
	var material models.Material
	
	// Usar SQL raw para obtener material con sus relaciones
	query := `
		SELECT 
			m.id_material,
			m.codigo,
			m.nombre,
			m.descripcion,
			m.id_categoria_material,
			m.id_unidad_medida,
			m.precio_actual,
			m.created_at,
			m.updated_at
		FROM tb_materiales m
		WHERE m.id_material = $1
	`
	
	err := r.db.Raw(query, id).Scan(&material).Error
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo material: %w", err)
	}
	
	// Cargar relaciones
	if material.Categoria > 0 {
		var categoria models.CategoriaMaterial
		err := r.db.Where("id_categoria_material = ?", material.Categoria).First(&categoria).Error
		if err == nil {
			material.TbCategoria = &categoria
		}
	}
	
	if material.Unidad > 0 {
		var unidad models.UnidadMedida
		err := r.db.Where("id_unidad_medida = ?", material.Unidad).First(&unidad).Error
		if err == nil {
			material.TbUnidadMedida = &unidad
		}
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