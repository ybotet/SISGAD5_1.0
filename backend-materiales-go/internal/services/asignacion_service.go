package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
)

type AsignacionService struct {
    repo           *postgres.AsignacionRepository
    materialRepo   *postgres.MaterialRepository
}

func NewAsignacionService(
    repo *postgres.AsignacionRepository,
    materialRepo *postgres.MaterialRepository,
) *AsignacionService {
    return &AsignacionService{
        repo:         repo,
        materialRepo: materialRepo,
    }
}

// CrearAsignacion maneja la lógica de negocio para asignaciones
func (s *AsignacionService) CrearAsignacion(asignacion *models.Asignacion) error {
    // Validaciones básicas
    if asignacion.IDTrabajador <= 0 {
        return errors.New("el ID del trabajador es requerido")
    }
    
    if len(asignacion.Detalles) == 0 {
        return errors.New("la asignación debe tener al menos un material")
    }
    
    // Validar cada detalle
    for i, detalle := range asignacion.Detalles {
        if err := s.validarDetalleAsignacion(&detalle); err != nil {
            return fmt.Errorf("detalle %d: %w", i+1, err)
        }
    }
    
    // Establecer fecha si no viene
    if asignacion.FechaAsignacion.IsZero() {
        asignacion.FechaAsignacion = time.Now()
    }
    
    // Calcular costo unitario (precio actual del material)
    for i := range asignacion.Detalles {
        material, err := s.materialRepo.GetByID(asignacion.Detalles[i].IDMaterial)
        if err != nil {
            return fmt.Errorf("error obteniendo material %d: %w", 
                asignacion.Detalles[i].IDMaterial, err)
        }
        if material == nil {
            return fmt.Errorf("material %d no encontrado", 
                asignacion.Detalles[i].IDMaterial)
        }
        
        // Guardar el costo en el momento de la asignación
        asignacion.Detalles[i].CostoUnitario = material.Precio
    }
    
    // Guardar
    return s.repo.CrearAsignacionConDetalles(asignacion)
}

// validarDetalleAsignacion valida un detalle individual
func (s *AsignacionService) validarDetalleAsignacion(d *models.AsignacionDetalle) error {
    if d.IDMaterial <= 0 {
        return errors.New("ID de material inválido")
    }
    if d.Cantidad <= 0 {
        return errors.New("la cantidad debe ser mayor a cero")
    }
    return nil
}

func (s *AsignacionService) ListarAsignaciones() ([]models.Asignacion, error) {
    // Devuelve todas las asignaciones para que el frontend pueda aplicar
    // paginado/filtrado del lado del cliente cuando sea necesario.
    return s.repo.ListarTodasAsignaciones()
}

func (s *AsignacionService) ObtenerAsignacionPorID(id int) (*models.Asignacion, error) {
    if id <= 0 {
        return nil, errors.New("ID de asignación inválido")
    }
    return s.repo.ObtenerAsignacionPorID(id)
}

// ObtenerAsignacionesPorTrabajador con lógica adicional
func (s *AsignacionService) ObtenerAsignacionesPorTrabajador(trabajadorID int) ([]models.Asignacion, error) {
    if trabajadorID <= 0 {
        return nil, errors.New("ID de trabajador inválido")
    }
    
    return s.repo.ObtenerAsignacionesPorTrabajador(trabajadorID)
}

func (s *AsignacionService) ActualizarAsignacion(id int, asignacion *models.Asignacion) error {
    if id <= 0 {
        return errors.New("ID de asignación inválido")
    }
    return s.repo.ActualizarAsignacion(id, asignacion)
}

func (s *AsignacionService) EliminarAsignacion(id int) error {
    if id <= 0 {
        return errors.New("ID de asignación inválido")
    }
    // Verificar que existe
    existente, err := s.repo.ObtenerAsignacionPorID(id)
    if err != nil {
        return fmt.Errorf("error verificando asignación: %w", err)
    }
    if existente == nil {
        return errors.New("asignación no encontrada")
    }
    return s.repo.EliminarAsignacion(id)
}