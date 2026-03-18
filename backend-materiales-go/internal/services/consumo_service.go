package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
)

type ConsumoService struct {
    repo           *postgres.ConsumoRepository
    materialRepo   *postgres.MaterialRepository
    asignacionRepo *postgres.AsignacionRepository
}

func NewConsumoService(
    repo *postgres.ConsumoRepository,
    materialRepo *postgres.MaterialRepository,
    asignacionRepo *postgres.AsignacionRepository,
) *ConsumoService {
    return &ConsumoService{
        repo:           repo,
        materialRepo:   materialRepo,
        asignacionRepo: asignacionRepo,
    }
}

// CrearConsumo maneja la lógica de negocio para consumos
func (s *ConsumoService) CrearConsumo(consumo *models.Consumo) error {
    // Validaciones básicas
    if consumo.IDTrabajo <= 0 {
        return errors.New("el ID del trabajo es requerido")
    }
    if consumo.IDTrabajador <= 0 {
        return errors.New("el ID del trabajador es requerido")
    }
    if len(consumo.Detalles) == 0 {
        return errors.New("el consumo debe tener al menos un material")
    }
    
    // Validar cada detalle
    for i, detalle := range consumo.Detalles {
        if err := s.validarDetalleConsumo(&detalle); err != nil {
            return fmt.Errorf("detalle %d: %w", i+1, err)
        }
    }
    
    // Establecer fecha si no viene
    if consumo.FechaConsumo.IsZero() {
        consumo.FechaConsumo = time.Now()
    }
    
    // Verificar stock disponible (si se proporcionó asignación)
    for i := range consumo.Detalles {
        detalle := &consumo.Detalles[i]
        
        // Obtener precio del material
        material, err := s.materialRepo.GetByID(detalle.IDMaterial)
        if err != nil {
            return fmt.Errorf("error obteniendo material %d: %w", detalle.IDMaterial, err)
        }
        if material == nil {
            return fmt.Errorf("material %d no encontrado", detalle.IDMaterial)
        }
        
        // Guardar costo en el momento del consumo
        detalle.CostoUnitario = material.Precio
        
        // Si especificó una asignación, verificar que tenga suficiente stock
        if detalle.IDAsignacion != nil {
            if err := s.verificarStockAsignacion(*detalle.IDAsignacion, 
                detalle.IDMaterial, detalle.Cantidad); err != nil {
                return err
            }
        }
    }
    
    // Guardar
    return s.repo.CrearConsumoConDetalles(consumo)
}

// validarDetalleConsumo valida un detalle individual
func (s *ConsumoService) validarDetalleConsumo(d *models.ConsumoDetalle) error {
    if d.IDMaterial <= 0 {
        return errors.New("ID de material inválido")
    }
    if d.Cantidad <= 0 {
        return errors.New("la cantidad debe ser mayor a cero")
    }
    return nil
}

// verificarStockAsignacion comprueba si el material está disponible en la asignación
func (s *ConsumoService) verificarStockAsignacion(asignacionID, materialID, cantidad int) error {
    // Obtener asignaciones del trabajador
    asignaciones, err := s.asignacionRepo.ObtenerAsignacionesPorTrabajador(0) // Necesitaríamos trabajadorID
    if err != nil {
        return fmt.Errorf("error verificando asignaciones: %w", err)
    }
    if asignaciones == nil {
        return errors.New("no se encontraron asignaciones para el trabajador")
    }
    
    // Este método requeriría más lógica: buscar la asignación específica,
    // calcular consumos previos, etc. Lo dejamos como placeholder por ahora.
    
    return nil
}

func (s *ConsumoService) ObtenerConsumosPorTrabajo(trabajoID int) ([]models.Consumo, error){
    if trabajoID <= 0 {
        return nil, errors.New("Id del trabajo invalido")
    }
    consumos, err := s.repo.ObtenerConsumosPorTrabajo(trabajoID)
    if err != nil {
        // 3. Manejar el error del repositorio
        return nil, fmt.Errorf("error obteniendo consumos del trabajo %d: %w", trabajoID, err)
    }
        // 4. Si no hay consumos, devolvemos un slice vacío (no nil)
    if consumos == nil {
        consumos = []models.Consumo{}
    }
    
    // 5. Devolver los consumos encontrados
    return consumos, nil
}

func (s *ConsumoService) ObtenerConsumosPorTrabajador(trabajadorID int, desde, hasta time.Time) ([]models.Consumo, error) {
    if trabajadorID <= 0 {
        return nil, errors.New("Id del trabajador invalido")
    }
    consumos, err := s.repo.ObtenerConsumosPorTrabajador(trabajadorID, desde, hasta)
    if err != nil {
        return nil, fmt.Errorf("error obteniendo consumos del trabajador %d: %w", trabajadorID, err)
    }
    if consumos == nil {
        consumos = []models.Consumo{}
    }
    return consumos, nil
}

// // ObtenerDashboardTrabajador genera el dashboard completo para un trabajador
// func (s *ConsumoService) ObtenerDashboardTrabajador(
//     trabajadorID int,
//     diasReferencia int,
//     umbral float64,
// ) (*models.DashboardTrabajador, error) {
    
//     // 1. Obtener promedios
//     promedios, err := s.repo.CalcularPromedioConsumoTrabajador(trabajadorID, diasReferencia)
//     if err != nil {
//         return nil, fmt.Errorf("error calculando promedios: %w", err)
//     }
    
//     // 2. Obtener stock actual
//     stocks, err := s.repo.ObtenerStockActualTrabajador(trabajadorID)
//     if err != nil {
//         return nil, fmt.Errorf("error calculando stock: %w", err)
//     }
    
//     // 3. Generar alertas
//     alertas, err := s.repo.ObtenerAlertasStockBajo(trabajadorID, diasReferencia, umbral)
//     if err != nil {
//         return nil, fmt.Errorf("error generando alertas: %w", err)
//     }
    
//     // 4. Calcular resumen adicional
//     totalMateriales := len(stocks)
//     materialesConStock := 0
//     for _, s := range stocks {
//         if s.StockRestante > 0 {
//             materialesConStock++
//         }
//     }
    
//     dashboard := &models.DashboardTrabajador{
//         TrabajadorID:      trabajadorID,
//         FechaResumen:      time.Now(),
//         DiasReferencia:    diasReferencia,
//         UmbralAutonomia:   umbral,
//         PromediosConsumo:  promedios,
//         StockActual:       stocks,
//         Alertas:           alertas,
//         TotalAlertas:      len(alertas),
//         TotalMateriales:   totalMateriales,
//         MaterialesConStock: materialesConStock,
//     }
    
//     return dashboard, nil
// }