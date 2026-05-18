package postgres

import (
	"fmt"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"gorm.io/gorm"
)

type ConsumoRepository struct {
	db *gorm.DB
}

func NewConsumoRepository() *ConsumoRepository {
	return &ConsumoRepository{db: DB}
}

// CrearConsumoConDetalles guarda un consumo y todos sus detalles en UNA transacción
func (r *ConsumoRepository) CrearConsumoConDetalles(consumo *models.Consumo) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Crear el consumo (cabecera)
		if err := tx.Create(consumo).Error; err != nil {
			return fmt.Errorf("error insertando consumo: %w", err)
		}

		// 2. Crear los detalles
		for i := range consumo.Detalles {
			consumo.Detalles[i].IDConsumo = consumo.ID
			if err := tx.Create(&consumo.Detalles[i]).Error; err != nil {
				return fmt.Errorf("error insertando detalle de consumo: %w", err)
			}
		}

		return nil
	})
}

// ObtenerConsumosPorTrabajo lista todos los consumos de un trabajo específico
func (r *ConsumoRepository) ObtenerConsumosPorTrabajo(trabajoID int) ([]models.Consumo, error) {
	var consumos []models.Consumo
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		Where("id_trabajo = ?", trabajoID).
		Order("fecha_consumo DESC").
		Find(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	return consumos, nil
}

// ObtenerConsumosPorTrabajador lista consumos de un técnico con filtro de fechas
func (r *ConsumoRepository) ObtenerConsumosPorTrabajador(trabajadorID int, desde, hasta time.Time) ([]models.Consumo, error) {
	var consumos []models.Consumo
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		Where("id_trabajador = ?", trabajadorID).
		Where("fecha_consumo BETWEEN ? AND ?", desde, hasta).
		Order("fecha_consumo DESC").
		Find(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	return consumos, nil
}

// ObtenerTodosConsumos lista todos los consumos (sin filtro)
func (r *ConsumoRepository) ObtenerTodosConsumos() ([]models.Consumo, error) {
	var consumos []models.Consumo
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		Order("fecha_consumo DESC").
		Find(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	return consumos, nil
}

// ObtenerConsumoPorID devuelve un consumo con sus detalles
func (r *ConsumoRepository) ObtenerConsumoPorID(consumoID int) (*models.Consumo, error) {
	var consumo models.Consumo
	err := r.db.
		Preload("Detalles.TbMaterial.TbUnidadMedida").
		First(&consumo, consumoID).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumo: %w", err)
	}
	return &consumo, nil
}