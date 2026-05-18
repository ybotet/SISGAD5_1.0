package postgres

import (
	"errors"
	"fmt"
	"strings"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"gorm.io/gorm"
)

type AsignacionRepository struct {
	db           *gorm.DB
	materialRepo *MaterialRepository
}

func NewAsignacionRepository(materialRepo *MaterialRepository) *AsignacionRepository {
	return &AsignacionRepository{
		db:           DB,
		materialRepo: materialRepo,
	}
}

// CrearAsignacionConDetalles guarda una asignación y todos sus detalles en UNA transacción
func (r *AsignacionRepository) CrearAsignacionConDetalles(asignacion *models.Asignacion) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Crear la asignación (cabecera)
		if err := tx.Create(asignacion).Error; err != nil {
			return fmt.Errorf("error insertando asignación: %w", err)
		}

		// 2. Crear los detalles
		for i := range asignacion.Detalles {
			asignacion.Detalles[i].IDAsignacion = asignacion.ID
			if err := tx.Create(&asignacion.Detalles[i]).Error; err != nil {
				return fmt.Errorf("error insertando detalle: %w", err)
			}
		}

		return nil
	})
}

// ListarAsignacionesPaginated con paginación y búsqueda
func (r *AsignacionRepository) ListarAsignacionesPaginated(page, limit int, search string) ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	query := r.db.Preload("Detalles.TbMaterial.TbUnidadMedida")

	if search != "" {
		query = query.Where("observaciones ILIKE ?", "%"+strings.ToLower(search)+"%")
	}

	offset := (page - 1) * limit
	err := query.
		Order("fecha_asignacion DESC").
		Limit(limit).
		Offset(offset).
		Find(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}

	return asignaciones, nil
}

// ListarTodasAsignaciones devuelve todas las asignaciones
func (r *AsignacionRepository) ListarTodasAsignaciones() ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		Order("fecha_asignacion DESC").
		Find(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}
	return asignaciones, nil
}

// ObtenerAsignacionesPorTrabajador lista asignaciones de un técnico
func (r *AsignacionRepository) ObtenerAsignacionesPorTrabajador(trabajadorID int) ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		Where("id_trabajador = ?", trabajadorID).
		Order("fecha_asignacion DESC").
		Find(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}
	return asignaciones, nil
}

// ObtenerAsignacionPorID devuelve una asignación por ID con sus detalles
func (r *AsignacionRepository) ObtenerAsignacionPorID(id int) (*models.Asignacion, error) {
	var asignacion models.Asignacion
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		First(&asignacion, id).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignación: %w", err)
	}
	return &asignacion, nil
}

// ActualizarAsignacion actualiza una asignación completa (reemplaza detalles)
func (r *AsignacionRepository) ActualizarAsignacion(id int, asignacion *models.Asignacion) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Verificar que existe
		var existente models.Asignacion
		if err := tx.First(&existente, id).Error; err != nil {
			return errors.New("asignación no encontrada")
		}

		// Actualizar cabecera
		asignacion.ID = id
		if err := tx.Save(asignacion).Error; err != nil {
			return fmt.Errorf("error actualizando asignación: %w", err)
		}

		// Eliminar detalles antiguos
		if err := tx.Where("id_asignacion = ?", id).Delete(&models.AsignacionDetalle{}).Error; err != nil {
			return fmt.Errorf("error eliminando detalles antiguos: %w", err)
		}

		// Insertar nuevos detalles
		for i := range asignacion.Detalles {
			asignacion.Detalles[i].IDAsignacion = id
			if err := tx.Create(&asignacion.Detalles[i]).Error; err != nil {
				return fmt.Errorf("error insertando detalle: %w", err)
			}
		}

		return nil
	})
}

// EliminarAsignacion elimina una asignación y sus detalles
func (r *AsignacionRepository) EliminarAsignacion(id int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Verificar que existe
		var existente models.Asignacion
		if err := tx.First(&existente, id).Error; err != nil {
			return errors.New("asignación no encontrada")
		}

		// Eliminar detalles (GORM lo hace automáticamente si configuraste cascade,
		// pero lo hacemos explícito por seguridad)
		if err := tx.Where("id_asignacion = ?", id).Delete(&models.AsignacionDetalle{}).Error; err != nil {
			return fmt.Errorf("error eliminando detalles: %w", err)
		}

		// Eliminar cabecera
		if err := tx.Delete(&models.Asignacion{}, id).Error; err != nil {
			return fmt.Errorf("error eliminando asignación: %w", err)
		}

		return nil
	})
}