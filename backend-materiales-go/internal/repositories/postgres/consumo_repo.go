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
        // Crear el consumo
        if err := tx.Omit("Detalles").Create(consumo).Error; err != nil {
            return fmt.Errorf("error insertando consumo: %w", err)
        }

        // Crear los detalles sin  campo ID
        for i := range consumo.Detalles {
            consumo.Detalles[i].IDConsumo = consumo.ID
            // IMPORTANTE: Omitir el campo ID para que PostgreSQL use la secuencia
            if err := tx.Omit("ID").Create(&consumo.Detalles[i]).Error; err != nil {
                return fmt.Errorf("error insertando detalle de consumo: %w", err)
            }
        }

        return nil
    })
}

// ObtenerConsumosPorTrabajo lista todos los consumos de un trabajo específico
// ObtenerConsumosPorTrabajo lista todos los consumos de un trabajo específico
func (r *ConsumoRepository) ObtenerConsumosPorTrabajo(trabajoID int) ([]models.Consumo, error) {
	var consumos []models.Consumo
	
	query := `
		SELECT 
			id_consumo, id_trabajo, id_trabajador, 
			fecha_consumo, observaciones, created_at, updated_at
		FROM tb_consumos
		WHERE id_trabajo = $1
		ORDER BY fecha_consumo DESC
	`
	
	err := r.db.Raw(query, trabajoID).Scan(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	
	// Cargar detalles y materiales
	for i := range consumos {
		detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		consumos[i].Detalles = detalles
	}
	
	return consumos, nil
}

// ObtenerConsumosPorTrabajador lista consumos de un técnico con filtro de fechas
// ObtenerConsumosPorTrabajador lista consumos de un técnico con filtro de fechas
func (r *ConsumoRepository) ObtenerConsumosPorTrabajador(trabajadorID int, desde, hasta time.Time) ([]models.Consumo, error) {
	var consumos []models.Consumo
	
	query := `
		SELECT 
			id_consumo, id_trabajo, id_trabajador, 
			fecha_consumo, observaciones, created_at, updated_at
		FROM tb_consumos
		WHERE id_trabajador = $1
		AND fecha_consumo BETWEEN $2 AND $3
		ORDER BY fecha_consumo DESC
	`
	
	err := r.db.Raw(query, trabajadorID, desde, hasta).Scan(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	
	// Cargar detalles y materiales
	for i := range consumos {
		detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		consumos[i].Detalles = detalles
	}
	
	return consumos, nil
}
// ObtenerTodosConsumos lista todos los consumos (sin filtro)
// ObtenerTodosConsumos lista todos los consumos (sin filtro)
func (r *ConsumoRepository) ObtenerTodosConsumos() ([]models.Consumo, error) {
	var consumos []models.Consumo
	
	query := `
		SELECT 
			id_consumo, id_trabajo, id_trabajador, 
			fecha_consumo, observaciones, created_at, updated_at
		FROM tb_consumos
		ORDER BY fecha_consumo DESC
	`
	
	err := r.db.Raw(query).Scan(&consumos).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}
	
	// Cargar detalles y materiales
	for i := range consumos {
		detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		consumos[i].Detalles = detalles
	}
	
	return consumos, nil
}

// ObtenerConsumoPorID devuelve un consumo con sus detalles
// ObtenerConsumoPorID devuelve un consumo con sus detalles
func (r *ConsumoRepository) ObtenerConsumoPorID(consumoID int) (*models.Consumo, error) {
	var consumo models.Consumo
	
	query := `
		SELECT 
			id_consumo, id_trabajo, id_trabajador, 
			fecha_consumo, observaciones, created_at, updated_at
		FROM tb_consumos
		WHERE id_consumo = $1
	`
	
	err := r.db.Raw(query, consumoID).Scan(&consumo).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumo: %w", err)
	}
	
	// Cargar detalles y materiales
	detalles, err := r.obtenerDetallesPorConsumo(consumo.ID)
	if err != nil {
		return nil, fmt.Errorf("error cargando detalles: %w", err)
	}
	consumo.Detalles = detalles
	
	return &consumo, nil
}

// obtenerDetallesPorConsumo carga los detalles y sus materiales usando SQL raw
func (r *ConsumoRepository) obtenerDetallesPorConsumo(consumoID int) ([]models.ConsumoDetalle, error) {
	type DetalleConMaterial struct {
		ID            int     `gorm:"column:id_detalle"`
		IDConsumo     int     `gorm:"column:id_consumo"`
		IDMaterial    int     `gorm:"column:id_material"`
		Cantidad      int     `gorm:"column:cantidad_usada"`
		CostoUnitario float64 `gorm:"column:costo_unitario_momento"`
		MaterialID    int     `gorm:"column:material_id"`
		MaterialCodigo string  `gorm:"column:material_codigo"`
		MaterialNombre string  `gorm:"column:material_nombre"`
		MaterialPrecio float64 `gorm:"column:material_precio"`
	}
	
	query := `
		SELECT 
			d.id_detalle,
			d.id_consumo,
			d.id_material,
			d.cantidad_usada,
			d.costo_unitario_momento,
			m.id_material as material_id,
			m.codigo as material_codigo,
			m.nombre as material_nombre,
			m.precio_actual as material_precio
		FROM tb_consumo_detalle d
		LEFT JOIN tb_materiales m ON d.id_material = m.id_material
		WHERE d.id_consumo = $1
		ORDER BY d.id_detalle ASC
	`
	
	var resultados []DetalleConMaterial
	err := r.db.Raw(query, consumoID).Scan(&resultados).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo detalles: %w", err)
	}
	
	detalles := make([]models.ConsumoDetalle, 0, len(resultados))
	for _, r := range resultados {
		detalle := models.ConsumoDetalle{
			ID:            r.ID,
			IDConsumo:     r.IDConsumo,
			IDMaterial:    r.IDMaterial,
			Cantidad:      r.Cantidad,
			CostoUnitario: r.CostoUnitario,
		}
		
		if r.MaterialID > 0 {
			detalle.TbMaterial = &models.Material{
				ID:     r.MaterialID,
				Codigo: r.MaterialCodigo,
				Nombre: r.MaterialNombre,
				Precio: r.MaterialPrecio,
			}
		}
		
		detalles = append(detalles, detalle)
	}
	
	return detalles, nil
}