package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type AsignacionRepository struct{}

func NewAsignacionRepository() *AsignacionRepository {
    return &AsignacionRepository{}
}

// CrearAsignacionConDetalles guarda una asignación y todos sus detalles en UNA transacción
func (r *AsignacionRepository) CrearAsignacionConDetalles(asignacion *models.Asignacion) error {
    // Iniciar transacción
    tx, err := DB.Beginx()
    if err != nil {
        return fmt.Errorf("error iniciando transacción: %w", err)
    }
    
    // Asegurar que si algo falla, se haga rollback
    defer func() {
        if err != nil {
            tx.Rollback()
        }
    }()
    
    // 1. Insertar la asignación (cabecera)
    queryAsignacion := `INSERT INTO asignaciones (
        id_trabajador, fecha_asignacion, id_trabajo, observaciones, created_at
    ) VALUES ($1, $2, $3, $4, NOW())
    RETURNING id_asignacion, created_at`
    
    row := tx.QueryRow(queryAsignacion,
        asignacion.IDTrabajador,
        asignacion.FechaAsignacion,
        asignacion.IDTrabajo,
        asignacion.Observaciones,
    )
    
    err = row.Scan(&asignacion.ID, &asignacion.CreatedAt)
    if err != nil {
        return fmt.Errorf("error insertando asignación: %w", err)
    }
    
    // 2. Insertar cada detalle
    for i := range asignacion.Detalles {
        detalle := &asignacion.Detalles[i]
        detalle.IDAsignacion = asignacion.ID
        
        queryDetalle := `INSERT INTO asignacion_detalle (
            id_asignacion, id_material, cantidad_asignada, costo_unitario_momento
        ) VALUES ($1, $2, $3, $4)
        RETURNING id_detalle`
        
        err = tx.QueryRow(queryDetalle,
            detalle.IDAsignacion,
            detalle.IDMaterial,
            detalle.Cantidad,
            detalle.CostoUnitario,
        ).Scan(&detalle.ID)
        
        if err != nil {
            return fmt.Errorf("error insertando detalle: %w", err)
        }
    }
    
    // 3. Confirmar transacción
    err = tx.Commit()
    if err != nil {
        return fmt.Errorf("error haciendo commit: %w", err)
    }
    
    return nil
}

// ObtenerAsignacionesPorTrabajador lista asignaciones de un técnico
func (r *AsignacionRepository) ObtenerAsignacionesPorTrabajador(trabajadorID int) ([]models.Asignacion, error) {
    var asignaciones []models.Asignacion
    
    query := `SELECT 
        id_asignacion, id_trabajador, fecha_asignacion, 
        id_trabajo, observaciones, created_at
        FROM asignaciones
        WHERE id_trabajador = $1
        ORDER BY fecha_asignacion DESC`
    
    err := DB.Select(&asignaciones, query, trabajadorID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
    }
    
    // Para cada asignación, cargar sus detalles
    for i := range asignaciones {
        detalles, err := r.obtenerDetallesPorAsignacion(asignaciones[i].ID)
        if err != nil {
            return nil, err
        }
        asignaciones[i].Detalles = detalles
    }
    
    return asignaciones, nil
}

// obtenerDetallesPorAsignacion es un método interno (privado)
func (r *AsignacionRepository) obtenerDetallesPorAsignacion(asignacionID int) ([]models.AsignacionDetalle, error) {
    var detalles []models.AsignacionDetalle
    
    query := `SELECT 
        id_detalle, id_asignacion, id_material, 
        cantidad_asignada, costo_unitario_momento
        FROM asignacion_detalle
        WHERE id_asignacion = $1`
    
    err := DB.Select(&detalles, query, asignacionID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo detalles: %w", err)
    }
    
    return detalles, nil
}