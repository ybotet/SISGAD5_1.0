package postgres

import (
	"fmt"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type CategoriaMaterialRepository struct{}

func NewCategoriaMaterialRepository() *CategoriaMaterialRepository {
	return &CategoriaMaterialRepository{}
}

func (r *CategoriaMaterialRepository) GetAll() ([]models.CategoriaMaterial, error) {
	categorias := make([]models.CategoriaMaterial, 0)
	query := `SELECT id_categoria_material, categoria FROM tb_categorias_material ORDER BY categoria ASC`
	err := DB.Select(&categorias, query)
	if err != nil {
		return categorias, fmt.Errorf("Error obteniendo categorías de material: %w", err)
	}
	return categorias, nil
}

func (r *CategoriaMaterialRepository) GetPaginated(page int, limit int, search string) ([]models.CategoriaMaterial, int, error) {
	var categorias []models.CategoriaMaterial
	var total int

	// Inicializar como slice vacío en lugar de nil
	categorias = make([]models.CategoriaMaterial, 0)

	// Calcular offset
	offset := (page - 1) * limit

	// Consulta de conteo
	countQuery := `SELECT COUNT(*) FROM tb_categorias_material`
	countParams := []interface{}{}

	if search != "" {
		countQuery += ` WHERE categoria ILIKE $1`
		countParams = append(countParams, "%"+search+"%")
	}

	err := DB.Get(&total, countQuery, countParams...)
	if err != nil {
		return categorias, 0, fmt.Errorf("Error contando categorías de material: %w", err)
	}

	// Consulta de datos
	query := `SELECT id_categoria_material, categoria FROM tb_categorias_material`
	queryParams := []interface{}{}

	if search != "" {
		query += ` WHERE categoria ILIKE $1`
		queryParams = append(queryParams, "%"+search+"%")
	}

	query += ` ORDER BY categoria ASC LIMIT $` + fmt.Sprintf("%d", len(queryParams)+1) + ` OFFSET $` + fmt.Sprintf("%d", len(queryParams)+2)
	queryParams = append(queryParams, limit, offset)

	err = DB.Select(&categorias, query, queryParams...)
	if err != nil {
		return categorias, 0, fmt.Errorf("Error obteniendo categorías de material paginadas: %w", err)
	}

	return categorias, total, nil
}

func (r *CategoriaMaterialRepository) GetByID(id int) (*models.CategoriaMaterial, error) {
	var categoria models.CategoriaMaterial
	err := DB.Get(&categoria, "SELECT id_categoria_material, categoria FROM tb_categorias_material WHERE id_categoria_material = $1", id)
	if err != nil {
		return nil, fmt.Errorf("Error obteniendo categoría de material: %w", err)
	}
	return &categoria, nil
}

func (r *CategoriaMaterialRepository) Create(categoria *models.CategoriaMaterial) error {
	query := `INSERT INTO tb_categorias_material (categoria) VALUES ($1) RETURNING id_categoria_material`
	err := DB.QueryRow(query, categoria.Categoria).Scan(&categoria.ID)
	if err != nil {
		return fmt.Errorf("Error creando categoría de material: %w", err)
	}
	return nil
}

func (r *CategoriaMaterialRepository) Update(categoria *models.CategoriaMaterial) error {
	query := `UPDATE tb_categorias_material SET categoria = $1 WHERE id_categoria_material = $2`
	_, err := DB.Exec(query, categoria.Categoria, categoria.ID)
	if err != nil {
		return fmt.Errorf("Error actualizando categoría de material: %w", err)
	}
	return nil
}

func (r *CategoriaMaterialRepository) Delete(id int) error {
	result, err := DB.Exec("DELETE FROM tb_categorias_material WHERE id_categoria_material = $1", id)
	if err != nil {
		return fmt.Errorf("Error eliminando categoría de material: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("Error verificando eliminación de categoría de material: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("categoría de material %d no encontrada", id)
	}
	return nil
}