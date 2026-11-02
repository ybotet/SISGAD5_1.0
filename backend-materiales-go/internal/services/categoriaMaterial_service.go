package services

import (
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/repositories/postgres"
)

type CategoriaMaterialService struct {
	categoriaRepo *postgres.CategoriaMaterialRepository
}

func NewCategoriaMaterialService(categoriaRepo *postgres.CategoriaMaterialRepository) *CategoriaMaterialService {
	return &CategoriaMaterialService{categoriaRepo: categoriaRepo}
}

// --- Métodos del servicio ---

func (s *CategoriaMaterialService) ListarCategorias() ([]models.CategoriaMaterial, error) {
	return s.categoriaRepo.GetAll()
}

func (s *CategoriaMaterialService) ListarCategoriasPaginated(page int, limit int, search string) ([]models.CategoriaMaterial, int, error) {
	return s.categoriaRepo.GetPaginated(page, limit, search)
}

func (s *CategoriaMaterialService) ObtenerCategoriaPorID(id int) (*models.CategoriaMaterial, error) {
	return s.categoriaRepo.GetByID(id)
}

func (s *CategoriaMaterialService) CrearCategoria(categoria *models.CategoriaMaterial) error {
	return s.categoriaRepo.Create(categoria)
}

func (s *CategoriaMaterialService) ActualizarCategoria(categoria *models.CategoriaMaterial) error {
	return s.categoriaRepo.Update(categoria)
}

func (s *CategoriaMaterialService) EliminarCategoria(id int) error {
	return s.categoriaRepo.Delete(id)
}
