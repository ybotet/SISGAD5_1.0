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
// CrearAsignacionConDetalles guarda una asignación y todos sus detalles en UNA transacción
func (r *AsignacionRepository) CrearAsignacionConDetalles(asignacion *models.Asignacion) error {
    return r.db.Transaction(func(tx *gorm.DB) error {
        // 1. Crear la asignación (cabecera)
        if err := tx.Omit("Detalles").Create(asignacion).Error; err != nil {
            return fmt.Errorf("error insertando asignación: %w", err)
        }

        // 2. Crear los detalles (OMITIENDO el campo ID)
        for i := range asignacion.Detalles {
            asignacion.Detalles[i].IDAsignacion = asignacion.ID
            // IMPORTANTE: Omitir el campo ID para que PostgreSQL use la secuencia
            if err := tx.Omit("ID").Create(&asignacion.Detalles[i]).Error; err != nil {
                return fmt.Errorf("error insertando detalle: %w", err)
            }
        }

        return nil
    })
}

// ListarAsignacionesPaginated con paginación y búsqueda
// ListarAsignacionesPaginated con paginación y búsqueda
func (r *AsignacionRepository) ListarAsignacionesPaginated(page, limit int, search string) ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	
	offset := (page - 1) * limit
	
	// Consulta base
	query := `
		SELECT 
			id_asignacion, id_trabajador, fecha_asignacion, 
			id_trabajo, observaciones, created_at, updated_at
		FROM tb_asignaciones
	`
	args := []interface{}{}
	
	if search != "" {
		query += ` WHERE observaciones ILIKE $1`
		args = append(args, "%"+strings.ToLower(search)+"%")
	}
	
	query += ` ORDER BY fecha_asignacion DESC LIMIT $` + fmt.Sprintf("%d", len(args)+1) + ` OFFSET $` + fmt.Sprintf("%d", len(args)+2)
	args = append(args, limit, offset)
	
	// Ejecutar consulta
	err := r.db.Raw(query, args...).Scan(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}
	
	// Cargar detalles y materiales para cada asignación
	for i := range asignaciones {
		detalles, err := r.obtenerDetallesPorAsignacion(asignaciones[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		asignaciones[i].Detalles = detalles
	}
	
	return asignaciones, nil
}

// ListarTodasAsignaciones devuelve todas las asignaciones
// ListarTodasAsignaciones devuelve todas las asignaciones
func (r *AsignacionRepository) ListarTodasAsignaciones() ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	
	query := `
		SELECT 
			id_asignacion, id_trabajador, fecha_asignacion, 
			id_trabajo, observaciones, created_at, updated_at
		FROM tb_asignaciones
		ORDER BY fecha_asignacion DESC
	`
	
	err := r.db.Raw(query).Scan(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}
	
	// Cargar detalles y materiales para cada asignación
	for i := range asignaciones {
		detalles, err := r.obtenerDetallesPorAsignacion(asignaciones[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		asignaciones[i].Detalles = detalles
	}
	
	return asignaciones, nil
}

// ObtenerAsignacionesPorTrabajador lista asignaciones de un técnico
// ObtenerAsignacionesPorTrabajador lista asignaciones de un técnico
func (r *AsignacionRepository) ObtenerAsignacionesPorTrabajador(trabajadorID int) ([]models.Asignacion, error) {
	var asignaciones []models.Asignacion
	
	query := `
		SELECT 
			id_asignacion, id_trabajador, fecha_asignacion, 
			id_trabajo, observaciones, created_at, updated_at
		FROM tb_asignaciones
		WHERE id_trabajador = $1
		ORDER BY fecha_asignacion DESC
	`
	
	err := r.db.Raw(query, trabajadorID).Scan(&asignaciones).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}
	
	// Cargar detalles y materiales para cada asignación
	for i := range asignaciones {
		detalles, err := r.obtenerDetallesPorAsignacion(asignaciones[i].ID)
		if err != nil {
			return nil, fmt.Errorf("error cargando detalles: %w", err)
		}
		asignaciones[i].Detalles = detalles
	}
	
	return asignaciones, nil
}

// ObtenerAsignacionPorID devuelve una asignación por ID con sus detalles
// ObtenerAsignacionPorID devuelve una asignación por ID con sus detalles
func (r *AsignacionRepository) ObtenerAsignacionPorID(id int) (*models.Asignacion, error) {
	var asignacion models.Asignacion
	
	query := `
		SELECT 
			id_asignacion, id_trabajador, fecha_asignacion, 
			id_trabajo, observaciones, created_at, updated_at
		FROM tb_asignaciones
		WHERE id_asignacion = $1
	`
	
	err := r.db.Raw(query, id).Scan(&asignacion).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignación: %w", err)
	}
	
	// Cargar detalles y materiales
	detalles, err := r.obtenerDetallesPorAsignacion(asignacion.ID)
	if err != nil {
		return nil, fmt.Errorf("error cargando detalles: %w", err)
	}
	asignacion.Detalles = detalles
	
	return &asignacion, nil
}

// obtenerDetallesPorAsignacion carga los detalles y sus materiales usando SQL raw
func (r *AsignacionRepository) obtenerDetallesPorAsignacion(asignacionID int) ([]models.AsignacionDetalle, error) {
	// Struct auxiliar para capturar el resultado del JOIN
	type DetalleConMaterial struct {
		ID            int     `gorm:"column:id_detalle"`
		IDAsignacion  int     `gorm:"column:id_asignacion"`
		IDMaterial    int     `gorm:"column:id_material"`
		Cantidad      int     `gorm:"column:cantidad_asignada"`
		CostoUnitario float64 `gorm:"column:costo_unitario_momento"`
		MaterialID    int     `gorm:"column:material_id"`
		MaterialCodigo string  `gorm:"column:material_codigo"`
		MaterialNombre string  `gorm:"column:material_nombre"`
		MaterialPrecio float64 `gorm:"column:material_precio"`
	}
	
	query := `
		SELECT 
			d.id_detalle,
			d.id_asignacion,
			d.id_material,
			d.cantidad_asignada,
			d.costo_unitario_momento,
			m.id_material as material_id,
			m.codigo as material_codigo,
			m.nombre as material_nombre,
			m.precio_actual as material_precio
		FROM tb_asignacion_detalle d
		LEFT JOIN tb_materiales m ON d.id_material = m.id_material
		WHERE d.id_asignacion = $1
		ORDER BY d.id_detalle ASC
	`
	
	var resultados []DetalleConMaterial
	err := r.db.Raw(query, asignacionID).Scan(&resultados).Error
	if err != nil {
		return nil, fmt.Errorf("error obteniendo detalles: %w", err)
	}
	
	// Convertir resultados a AsignacionDetalle con TbMaterial poblado
	detalles := make([]models.AsignacionDetalle, 0, len(resultados))
	for _, r := range resultados {
		detalle := models.AsignacionDetalle{
			ID:            r.ID,
			IDAsignacion:  r.IDAsignacion,
			IDMaterial:    r.IDMaterial,
			Cantidad:      r.Cantidad,
			CostoUnitario: r.CostoUnitario,
		}
		
		// Poblar el material si existe
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