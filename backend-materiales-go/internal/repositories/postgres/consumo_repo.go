package postgres

import (
	"fmt"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

// ConsumoRepository maneja operaciones con consumos
type ConsumoRepository struct{}

// NewConsumoRepository crea una nueva instancia
func NewConsumoRepository() *ConsumoRepository {
    return &ConsumoRepository{}
}

// CrearConsumoConDetalles guarda un consumo y todos sus detalles en UNA transacción
func (r *ConsumoRepository) CrearConsumoConDetalles(consumo *models.Consumo) error {
    // Iniciar transacción
    tx, err := DB.Beginx()
    if err != nil {
        return fmt.Errorf("error iniciando transacción: %w", err)
    }
    
    // Asegurar rollback si algo falla
    defer func() {
        if err != nil {
            tx.Rollback()
        }
    }()
    
    // 1. Insertar el consumo (cabecera)
    queryConsumo := `INSERT INTO tb_consumos (
        id_trabajo, id_trabajador, fecha_consumo, observaciones, created_at
    ) VALUES ($1, $2, $3, $4, NOW())
    RETURNING id_consumo, created_at`
    
    row := tx.QueryRow(queryConsumo,
        consumo.IDTrabajo,
        consumo.IDTrabajador,
        consumo.FechaConsumo,
        consumo.Observaciones,
    )
    
    err = row.Scan(&consumo.ID, &consumo.CreatedAt)
    if err != nil {
        return fmt.Errorf("error insertando consumo: %w", err)
    }
    
    // 2. Insertar cada detalle
    for i := range consumo.Detalles {
        detalle := &consumo.Detalles[i]
        detalle.IDConsumo = consumo.ID
        
        queryDetalle := `INSERT INTO tb_consumo_detalle (
            id_consumo, id_material, cantidad_usada, 
            costo_unitario_momento
        ) VALUES ($1, $2, $3, $4)
        RETURNING id_detalle`

        err = tx.QueryRow(queryDetalle,
            detalle.IDConsumo,
            detalle.IDMaterial,
            detalle.Cantidad,
            detalle.CostoUnitario,
        ).Scan(&detalle.ID)
        
        if err != nil {
            return fmt.Errorf("error insertando detalle de consumo: %w", err)
        }
    }
    
    // 3. Confirmar transacción
    err = tx.Commit()
    if err != nil {
        return fmt.Errorf("error haciendo commit: %w", err)
    }
    
    return nil
}

// ObtenerConsumosPorTrabajo lista todos los consumos de un trabajo específico
func (r *ConsumoRepository) ObtenerConsumosPorTrabajo(trabajoID int) ([]models.Consumo, error) {
    var consumos []models.Consumo
    
    query := `SELECT 
        id_consumo, id_trabajo, id_trabajador, 
        fecha_consumo, observaciones, created_at
        FROM tb_consumos
        WHERE id_trabajo = $1
        ORDER BY fecha_consumo DESC`
    
    err := DB.Select(&consumos, query, trabajoID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo consumos: %w", err)
    }
    
    // Cargar detalles para cada consumo
    for i := range consumos {
        detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
        if err != nil {
            return nil, fmt.Errorf("error cargando detalles del consumo %d: %w", consumos[i].ID, err)
        }
        consumos[i].Detalles = detalles
    }
    
    return consumos, nil
}

// ObtenerConsumosPorTrabajador lista consumos de un técnico (con filtro de fechas opcional)
func (r *ConsumoRepository) ObtenerConsumosPorTrabajador(
    trabajadorID int, 
    desde time.Time, 
    hasta time.Time,
) ([]models.Consumo, error) {
    var consumos []models.Consumo
    
    query := `SELECT 
        id_consumo, id_trabajo, id_trabajador, 
        fecha_consumo, observaciones, created_at
        FROM tb_consumos
        WHERE id_trabajador = $1
        AND fecha_consumo BETWEEN $2 AND $3
        ORDER BY fecha_consumo DESC`
    
    err := DB.Select(&consumos, query, trabajadorID, desde, hasta)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo consumos: %w", err)
    }
    
    // Cargar detalles
    for i := range consumos {
        detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
        if err != nil {
            return nil, err
        }
        consumos[i].Detalles = detalles
    }
    
    return consumos, nil
}

// obtenerDetallesPorConsumo es interno (privado)
func (r *ConsumoRepository) obtenerDetallesPorConsumo(consumoID int) ([]models.ConsumoDetalle, error) {
    var detalles []models.ConsumoDetalle
    
    query := `SELECT 
        id_detalle, id_consumo, id_material, 
        cantidad_usada, costo_unitario_momento
        FROM tb_consumo_detalle
        WHERE id_consumo = $1`
    
    err := DB.Select(&detalles, query, consumoID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo detalles de consumo: %w", err)
    }
    
    return detalles, nil
}

//obtenerConsumos es un método adicional para listar todos los consumos (sin filtro) - útil p   ara admin o dashboard
func (r *ConsumoRepository) ObtenerTodosConsumos() ([]models.Consumo, error) {
    var consumos []models.Consumo    

    query := `SELECT
        id_consumo, id_trabajo, id_trabajador,
        fecha_consumo, observaciones, created_at
        FROM tb_consumos
        ORDER BY fecha_consumo DESC`

    err := DB.Select(&consumos, query)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo consumos: %w", err)
    }

    // Cargar detalles para cada consumo
    for i := range consumos {
        detalles, err := r.obtenerDetallesPorConsumo(consumos[i].ID)
        if err != nil {
            return nil, fmt.Errorf("error cargando detalles del consumo %d: %w", consumos[i].ID, err)
        }
        consumos[i].Detalles = detalles
    }

    return consumos, nil
}

// ObtenerConsumoPorID devuelve un consumo con sus detalles por su ID
func (r *ConsumoRepository) ObtenerConsumoPorID(consumoID int) (*models.Consumo, error) {
    var consumo models.Consumo

    query := `SELECT
        id_consumo, id_trabajo, id_trabajador,
        fecha_consumo, observaciones, created_at
        FROM tb_consumos
        WHERE id_consumo = $1`

    err := DB.Get(&consumo, query, consumoID)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo consumo: %w", err)
    }

    detalles, err := r.obtenerDetallesPorConsumo(consumo.ID)
    if err != nil {
        return nil, fmt.Errorf("error cargando detalles del consumo %d: %w", consumo.ID, err)
    }
    consumo.Detalles = detalles

    return &consumo, nil
}

// ======================================================================================================================
// Métodos adicionales para el dashboard de técnicos (promedios, stock, alertas) - pueden ser parte de otro repo si quieres 
// ======================================================================================================================

// CalcularPromedioConsumoTrabajador calcula el consumo diario promedio de un técnico
// para los últimos N días, por material
// func (r *ConsumoRepository) CalcularPromedioConsumoTrabajador(
//     trabajadorID int, 
//     dias int,
// ) ([]models.PromedioConsumo, error) {
    
//     // Definimos un struct auxiliar para el resultado
//     type PromedioResult struct {
//         IDMaterial     int     `db:"id_material"`
//         NombreMaterial string  `db:"nombre_material"`
//         PromedioDiario float64 `db:"promedio_diario"`
//         TotalDias      int     `db:"total_dias"`
//         TotalConsumido int     `db:"total_consumido"`
//     }
    
//     var resultados []PromedioResult
    
//     query := `
//         SELECT 
//             cd.id_material,
//             m.nombre as nombre_material,
//             COALESCE(AVG(cd.cantidad_usada), 0) as promedio_diario,
//             COUNT(DISTINCT c.fecha_consumo) as total_dias,
//             SUM(cd.cantidad_usada) as total_consumido
//         FROM consumo_detalle cd
//         JOIN consumos c ON cd.id_consumo = c.id_consumo
//         JOIN materiales m ON cd.id_material = m.id_material
//         WHERE c.id_trabajador = $1
//         AND c.fecha_consumo >= NOW() - ($2 || ' days')::interval
//         GROUP BY cd.id_material, m.nombre
//         ORDER BY m.nombre
//     `
    
//     err := DB.Select(&resultados, query, trabajadorID, dias)
//     if err != nil {
//         return nil, fmt.Errorf("error calculando promedios: %w", err)
//     }
    
//     // Convertir a nuestro tipo público (si quieres exponerlo)
//     var promedios []models.PromedioConsumo
//     for _, r := range resultados {
//         promedios = append(promedios, models.PromedioConsumo{
//             IDMaterial:     r.IDMaterial,
//             NombreMaterial: r.NombreMaterial,
//             PromedioDiario: r.PromedioDiario,
//             TotalDias:      r.TotalDias,
//             TotalConsumido: r.TotalConsumido,
//         })
//     }
    
//     return promedios, nil
// }

// // ObtenerStockActualTrabajador calcula cuánto le queda a un técnico de cada material
// // (asignado - consumido)
// func (r *ConsumoRepository) ObtenerStockActualTrabajador(
//     trabajadorID int,
// ) ([]models.StockTrabajador, error) {
    
//     type StockResult struct {
//         IDMaterial     int     `db:"id_material"`
//         NombreMaterial string  `db:"nombre_material"`
//         Asignado       int     `db:"total_asignado"`
//         Consumido      int     `db:"total_consumido"`
//         StockRestante  int     `db:"stock_restante"`
//     }
    
//     var resultados []StockResult
    
//     query := `
//         WITH 
//         asignado AS (
//             SELECT 
//                 ad.id_material,
//                 SUM(ad.cantidad_asignada) as total
//             FROM asignacion_detalle ad
//             JOIN asignaciones a ON ad.id_asignacion = a.id_asignacion
//             WHERE a.id_trabajador = $1
//             GROUP BY ad.id_material
//         ),
//         consumido AS (
//             SELECT 
//                 cd.id_material,
//                 SUM(cd.cantidad_usada) as total
//             FROM consumo_detalle cd
//             JOIN consumos c ON cd.id_consumo = c.id_consumo
//             WHERE c.id_trabajador = $1
//             GROUP BY cd.id_material
//         )
//         SELECT 
//             m.id_material,
//             m.nombre as nombre_material,
//             COALESCE(a.total, 0) as total_asignado,
//             COALESCE(c.total, 0) as total_consumido,
//             COALESCE(a.total, 0) - COALESCE(c.total, 0) as stock_restante
//         FROM materiales m
//         LEFT JOIN asignado a ON m.id_material = a.id_material
//         LEFT JOIN consumido c ON m.id_material = c.id_material
//         WHERE COALESCE(a.total, 0) > 0  -- Solo materiales que ha recibido
//         ORDER BY m.nombre
//     `
    
//     err := DB.Select(&resultados, query, trabajadorID)
//     if err != nil {
//         return nil, fmt.Errorf("error calculando stock: %w", err)
//     }
    
//     // Convertir a nuestro tipo público
//     var stocks []models.StockTrabajador
//     for _, r := range resultados {
//         stocks = append(stocks, models.StockTrabajador{
//             IDMaterial:     r.IDMaterial,
//             NombreMaterial: r.NombreMaterial,
//             Asignado:       r.Asignado,
//             Consumido:      r.Consumido,
//             StockRestante:  r.StockRestante,
//         })
//     }
    
//     return stocks, nil
// }

// // ObtenerAlertasStockBajo combina los dos métodos anteriores para generar alertas
// func (r *ConsumoRepository) ObtenerAlertasStockBajo(
//     trabajadorID int,
//     diasReferencia int,
//     umbralDias float64,
// ) ([]models.AlertaStock, error) {
    
//     // 1. Obtener promedios de consumo
//     promedios, err := r.CalcularPromedioConsumoTrabajador(trabajadorID, diasReferencia)
//     if err != nil {
//         return nil, err
//     }
    
//     // 2. Obtener stock actual
//     stocks, err := r.ObtenerStockActualTrabajador(trabajadorID)
//     if err != nil {
//         return nil, err
//     }
    
//     // 3. Combinar y calcular alertas
//     var alertas []models.AlertaStock
    
//     // Crear mapa de stocks para acceso rápido
//     stockMap := make(map[int]int)
//     for _, s := range stocks {
//         stockMap[s.IDMaterial] = s.StockRestante
//     }
    
//     for _, p := range promedios {
//         stock, existe := stockMap[p.IDMaterial]
//         if !existe {
//             continue // No tiene stock de este material (raro)
//         }
        
//         // Calcular días de autonomía
//         var diasAutonomia float64
//         if p.PromedioDiario > 0 {
//             diasAutonomia = float64(stock) / p.PromedioDiario
//         } else {
//             diasAutonomia = 999 // No consume, no hay alerta
//         }
        
//         if diasAutonomia < umbralDias {
//             alertas = append(alertas, models.AlertaStock{
//                 IDMaterial:     p.IDMaterial,
//                 NombreMaterial: p.NombreMaterial,
//                 StockActual:    stock,
//                 PromedioDiario: p.PromedioDiario,
//                 DiasAutonomia:  diasAutonomia,
//                 Nivel:          r.calcularNivelAlerta(diasAutonomia, umbralDias),
//             })
//         }
//     }
    
//     return alertas, nil
// }

// // calcularNivelAlerta es un helper interno
// func (r *ConsumoRepository) calcularNivelAlerta(diasAutonomia, umbral float64) string {
//     if diasAutonomia < umbral/2 {
//         return "CRÍTICO"
//     }
//     if diasAutonomia < umbral {
//         return "BAJO"
//     }
//     return "NORMAL" // No debería llegar aquí porque solo llamamos cuando < umbral
// }