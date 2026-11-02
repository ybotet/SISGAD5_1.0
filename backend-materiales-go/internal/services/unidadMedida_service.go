package services

import (
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
)

type UnidadMedidaService struct {
	unidadRepo *postgres.UnidadMedidaRepository
}

func NewUnidadMedidaService(unidadRepo *postgres.UnidadMedidaRepository) *UnidadMedidaService {
	return &UnidadMedidaService{unidadRepo: unidadRepo}
}

// --- Métodos del servicio ---

func (s *UnidadMedidaService) ListarUnidades() ([]models.UnidadMedida, error) {
	return s.unidadRepo.GetAll()
}

func (s *UnidadMedidaService) ObtenerUnidadPorID(id int) (*models.UnidadMedida, error) {
	return s.unidadRepo.GetByID(id)
}

func (s *UnidadMedidaService) CrearUnidad(unidad *models.UnidadMedida) error {
	return s.unidadRepo.Create(unidad)
}

func (s *UnidadMedidaService) ActualizarUnidad(unidad *models.UnidadMedida) error {
	return s.unidadRepo.Update(unidad)
}

func (s *UnidadMedidaService) EliminarUnidad(id int) error {
	return s.unidadRepo.Delete(id)
}
