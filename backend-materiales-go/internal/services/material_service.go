package services

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
)

type MaterialService struct {
	materialRepo *postgres.MaterialRepository
}

func NewMaterialService(materialRepo *postgres.MaterialRepository) *MaterialService {
	return &MaterialService{materialRepo: materialRepo}
}


// --- Métodos del servicio ---

// ListarMateriales devuelve todos los materiales
type MaterialesPageResult struct {
    Data       []models.Material `json:"data"`
    Total      int               `json:"total"`
    Page       int               `json:"page"`
    Limit      int               `json:"limit"`
    TotalPages int               `json:"total_pages"`
}

// ListarMateriales devuelve todos los materiales (uso legacy)
func (s *MaterialService) ListarMateriales() ([]models.Material, error) {
    return s.materialRepo.GetAll()
}

func (s *MaterialService) ListarMaterialesPaginated(page, limit int, search string) (*MaterialesPageResult, error) {
    if page <= 0 {
        page = 1
    }
    if limit <= 0 || limit > 100 {
        limit = 10
    }

    total, err := s.materialRepo.Count(search)
    if err != nil {
        return nil, err
    }

    offset := (page - 1) * limit
    materiales, err := s.materialRepo.GetPaginated(search, limit, offset)
    if err != nil {
        return nil, err
    }

    totalPages := 1
    if total > 0 {
        totalPages = (total + limit - 1) / limit
    }

    return &MaterialesPageResult{
        Data:       materiales,
        Total:      total,
        Page:       page,
        Limit:      limit,
        TotalPages: totalPages,
    }, nil
}

// ObtenerMaterialPorID devuelve un material por su ID
func (s *MaterialService) ObtenerMaterialPorID(id int) (*models.Material, error) {
	if id <=0 {
		return nil, errors.New("ID inválido")
	}
	material, err := s.materialRepo.GetByID(id)
	if err != nil {
		return nil, fmt.Errorf("Material no encontrado: %w", err)
	}
	if material == nil {
		return nil, errors.New("Material no encontrado")
	}
	return material, nil
}

func (s *MaterialService) CrearMaterial(material *models.Material) error {
	if err := s.validarMaterial(material); err != nil {
		return err
	}

	material.CreatedAt = time.Now()
	material.UpdatedAt = time.Now()

	return s.materialRepo.Create(material)
}

func (s *MaterialService) ActualizarMaterial(material *models.Material) error {
	if material.ID <= 0 {
		return errors.New("ID del material es requerido para actualizar")
	}
	existente, err := s.materialRepo.GetByID(material.ID)
    if err != nil {
        return fmt.Errorf("error verificando material: %w", err)
    }
    if existente == nil {
        return errors.New("material no encontrado")
    }
	if err := s.validarMaterial(material); err != nil {
		return err
	}
	material.UpdatedAt = time.Now()
	return s.materialRepo.Update(material)
}

func (s *MaterialService) EliminarMaterial(id int) error {
	if id <= 0 {
		return errors.New("ID inválido")
	}
	existente, err := s.materialRepo.GetByID(id)
    if err != nil {
        return fmt.Errorf("error verificando material: %w", err)
    }
    if existente == nil {
        return errors.New("material no encontrado")
    }
	return s.materialRepo.Delete(id)
}

func (s *MaterialService) validarMaterial(m *models.Material) error {
    // Limpiar espacios
    m.Nombre = strings.TrimSpace(m.Nombre)
    m.Codigo = strings.TrimSpace(m.Codigo)
    m.Categoria = strings.TrimSpace(m.Categoria)
    
    // Validaciones
    if m.Nombre == "" {
        return errors.New("el nombre del material es requerido")
    }
    if len(m.Nombre) < 3 {
        return errors.New("el nombre debe tener al menos 3 caracteres")
    }
    if m.Precio <= 0 {
        return errors.New("el precio debe ser mayor a cero")
    }
    if m.Codigo == "" {
        return errors.New("el código SKU es requerido")
    }
    
    return nil
}