package postgres

import (
	"errors"
	"fmt"
	"strings"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type AsignacionRepository struct{
    materialRepo *MaterialRepository
}

func NewAsignacionRepository(materialRepo *MaterialRepository) *AsignacionRepository {
    return &AsignacionRepository{
        materialRepo: materialRepo,
    }
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
    queryAsignacion := `INSERT INTO tb_asignaciones (
        id_trabajador, fecha_asignacion, id_trabajo, observaciones, created_at
    ) VALUES ($1, $2, $3, $4, NOW())
    RETURNING id_asignacion, created_at, updated_at`
    
    row := tx.QueryRow(queryAsignacion,
        asignacion.IDTrabajador,
        asignacion.FechaAsignacion,
        asignacion.IDTrabajo,
        asignacion.Observaciones,
    )
    
    err = row.Scan(&asignacion.ID, &asignacion.CreatedAt, &asignacion.UpdatedAt)
    if err != nil {
        return fmt.Errorf("error insertando asignación: %w", err)
    }
    
    // 2. Insertar cada detalle
    for i := range asignacion.Detalles {
        detalle := &asignacion.Detalles[i]
        detalle.IDAsignacion = asignacion.ID
        
        queryDetalle := `INSERT INTO tb_asignacion_detalle (
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

// Listar Asignaciones con paginación y búsqueda (opcional)
func (r *AsignacionRepository) ListarAsignacionesPaginated(page, limit int, search string) ([]models.Asignacion, error) {
    var asignaciones []models.Asignacion
    
    offset := (page - 1) * limit
    baseQuery := `SELECT 
        id_asignacion, id_trabajador, fecha_asignacion, 
        id_trabajo, observaciones, created_at
        FROM tb_asignaciones`

    if search != "" {
        searchPattern := fmt.Sprintf("%%%s%%", strings.ToLower(search))
        baseQuery += ` WHERE LOWER(observaciones) LIKE $1`
        baseQuery += ` ORDER BY fecha_asignacion DESC LIMIT $2 OFFSET $3`
        err := DB.Select(&asignaciones, baseQuery, searchPattern, limit, offset)    
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
    } else {
        baseQuery += ` ORDER BY fecha_asignacion DESC LIMIT $1 OFFSET $2`
        err := DB.Select(&asignaciones, baseQuery, limit, offset)
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
    }


    return asignaciones, nil
}

// ListarTodasAsignaciones devuelve todas las asignaciones (sin paginación)
func (r *AsignacionRepository) ListarTodasAsignaciones() ([]models.Asignacion, error) {
    var asignaciones []models.Asignacion

    query := `SELECT id_asignacion, id_trabajador, fecha_asignacion, id_trabajo, observaciones, created_at
        FROM tb_asignaciones
        ORDER BY fecha_asignacion DESC`

    err := DB.Select(&asignaciones, query)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
    }

    for i := range asignaciones {
        detalles, err := r.obtenerDetallesPorAsignacion(asignaciones[i].ID)
        if err != nil {
            return nil, err
        }
        asignaciones[i].Detalles = detalles
    }

    return asignaciones, nil
}

// ObtenerAsignacionesPorTrabajador lista asignaciones de un técnico
func (r *AsignacionRepository) ObtenerAsignacionesPorTrabajador(trabajadorID int) ([]models.Asignacion, error) {
    var asignaciones []models.Asignacion
    
    query := `SELECT 
        id_asignacion, id_trabajador, fecha_asignacion, 
        id_trabajo, observaciones, created_at
        FROM tb_asignaciones
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
// obtenerDetallesPorAsignacion carga los detalles y sus materiales relacionados usando JOIN
// Esta es la versión OPTIMIZADA (una sola consulta)
func (r *AsignacionRepository) obtenerDetallesPorAsignacion(asignacionID int) ([]models.AsignacionDetalle, error) {
    // Struct auxiliar para el resultado del JOIN (solo existe dentro de esta función)
    type detalleConMaterial struct {
        // Campos del detalle
        ID            int     `db:"id_detalle"`
        IDAsignacion  int     `db:"id_asignacion"`
        IDMaterial    int     `db:"id_material"`
        Cantidad      int     `db:"cantidad_asignada"`
        CostoUnitario float64 `db:"costo_unitario_momento"`
        // Campos del material
        MaterialID     int     `db:"material_id"`
        MaterialCodigo string  `db:"material_codigo"`
        MaterialNombre string  `db:"material_nombre"`
        MaterialPrecio float64 `db:"material_precio"`
        // Campos de la unidad de medida
        UnidadID     int    `db:"unidad_id"`
        UnidadNombre string `db:"unidad_nombre"`
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
            m.precio_actual as material_precio,
            COALESCE(u.id_unidad_medida, 0) as unidad_id,
            COALESCE(u.nombre, 'unidad') as unidad_nombre
        FROM tb_asignacion_detalle d
        LEFT JOIN tb_materiales m ON d.id_material = m.id_material
        LEFT JOIN tb_unidades_medida u ON m.id_unidad_medida = u.id_unidad_medida
        WHERE d.id_asignacion = $1
        ORDER BY d.id_detalle ASC`
    
    var resultados []detalleConMaterial
    err := DB.Select(&resultados, query, asignacionID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo detalles con join: %w", err)
    }
    
    // Si no hay resultados, devolvemos slice vacío
    if len(resultados) == 0 {
        return []models.AsignacionDetalle{}, nil
    }
    
    // Mapear resultados a los modelos
    detalles := make([]models.AsignacionDetalle, 0, len(resultados))
    for _, r := range resultados {
        // Construir el material con su unidad de medida
        material := &models.Material{
            ID:     r.MaterialID,
            Codigo: r.MaterialCodigo,
            Nombre: r.MaterialNombre,
            Precio: r.MaterialPrecio,
            TbUnidadMedida: &models.UnidadMedida{
                ID:     r.UnidadID,
                Nombre: r.UnidadNombre,
            },
        }
        
        // Construir el detalle
        detalle := models.AsignacionDetalle{
            ID:            r.ID,
            IDAsignacion:  r.IDAsignacion,
            IDMaterial:    r.IDMaterial,
            Cantidad:      r.Cantidad,
            CostoUnitario: r.CostoUnitario,
            TbMaterial:    material,
        }
        
        detalles = append(detalles, detalle)
    }
    
    return detalles, nil
}

func (r *AsignacionRepository) ObtenerAsignacionPorID(id int) (*models.Asignacion, error) {
    var asignacion models.Asignacion    
    err := DB.Get(&asignacion, `SELECT id_asignacion, id_trabajador, fecha_asignacion, 
    id_trabajo, observaciones, created_at, updated_at
    FROM tb_asignaciones 
    WHERE id_asignacion = $1`, id)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo asignación: %w", err)  
    }
    // Cargar detalles
    detalles, err := r.obtenerDetallesPorAsignacion(asignacion.ID)
    if err != nil {
        return nil, fmt.Errorf("error cargando detalles de la asignación: %w", err)
    }
    asignacion.Detalles = detalles
    return &asignacion, nil
}

func (r *AsignacionRepository) ActualizarAsignacion(id int, asignacion *models.Asignacion) error {
    // Validar que la asignación existe
    existente, err := r.ObtenerAsignacionPorID(id)
    if err != nil {
        return fmt.Errorf("error verificando asignación: %w", err)
    }
    if existente == nil {
        return errors.New("asignación no encontrada")
    }
    
    // Actualizar y capturar updated_at
    query := `UPDATE tb_asignaciones 
              SET id_trabajador = $1, fecha_asignacion = $2, updated_at = NOW()
              WHERE id_asignacion = $3
              RETURNING updated_at`
    
    err = DB.QueryRow(query, asignacion.IDTrabajador, asignacion.FechaAsignacion, id).Scan(&asignacion.UpdatedAt)
    if err != nil {
        return fmt.Errorf("error actualizando asignación: %w", err)
    }
    
    return nil
}
func (r *AsignacionRepository) EliminarAsignacion(id int) error {
    // Validar que la asignación existe
    existente, err := r.ObtenerAsignacionPorID(id)
    if err != nil {
        return fmt.Errorf("error verificando asignación: %w", err)
    }
    if existente == nil {
        return errors.New("asignación no encontrada")
    }
    // Eliminar
    _, err = DB.Exec("DELETE FROM tb_asignaciones WHERE id_asignacion = $1", id)
    if err != nil {
        return fmt.Errorf("error eliminando asignación: %w", err)
    }
    return nil
}