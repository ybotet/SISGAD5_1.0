package postgres

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type MaterialRepository struct{}

func NewMaterialRepository() *MaterialRepository {
    return &MaterialRepository{}
}

type materialDB struct {
    ID          int       `db:"id_material"`
    Codigo      string    `db:"codigo"`
    Nombre      string    `db:"nombre"`
    Descripcion string    `db:"descripcion"`
    Categoria   sql.NullInt64  `db:"id_categoria_material"`
    Unidad      sql.NullInt64  `db:"id_unidad_medida"`
    Precio      float64   `db:"precio_actual"`
    CreatedAt   time.Time `db:"created_at"`
    UpdatedAt   time.Time `db:"updated_at"`
    UnidadID     sql.NullInt64  `db:"unidad_id"`
    UnidadNombre sql.NullString `db:"unidad_nombre"`
    CategoriaID     sql.NullInt64  `db:"categoria_id"`
    CategoriaNombre sql.NullString `db:"categoria_nombre"`
}

func mapMaterialDB(item materialDB) models.Material {
    material := models.Material{
        ID:          item.ID,
        Codigo:      item.Codigo,
        Nombre:      item.Nombre,
        Descripcion: item.Descripcion,
        Precio:      item.Precio,
        CreatedAt:   item.CreatedAt,
        UpdatedAt:   item.UpdatedAt,
    }
    
    // Manejar id_categoria_material NULL
    if item.Categoria.Valid {
        material.Categoria = int(item.Categoria.Int64)
    }
    
    // Manejar id_unidad_medida NULL
    if item.Unidad.Valid {
        material.Unidad = int(item.Unidad.Int64)
    }
    
    if item.UnidadID.Valid || item.UnidadNombre.Valid {
        material.TbUnidadMedida = &models.UnidadMedida{
            ID:     int(item.UnidadID.Int64),
            Nombre: item.UnidadNombre.String,
        }
    }
    
    if item.CategoriaID.Valid || item.CategoriaNombre.Valid {
        material.TbCategoria = &models.CategoriaMaterial{
            ID:        int(item.CategoriaID.Int64),
            Categoria: item.CategoriaNombre.String,
        }
    }
    
    return material
}

func (r *MaterialRepository) GetAll() ([]models.Material, error) {
    var materialesDB []materialDB
    query := `SELECT m.id_material, m.codigo, m.nombre, m.descripcion, m.id_categoria_material, m.id_unidad_medida, m.precio_actual, m.created_at, m.updated_at,
                     u.id_unidad_medida AS unidad_id, u.nombre AS unidad_nombre,
                     c.id_categoria_material AS categoria_id, c.categoria AS categoria_nombre
              FROM tb_materiales m
              LEFT JOIN tb_unidades_medida u ON m.id_unidad_medida = u.id_unidad_medida
              LEFT JOIN tb_categorias_material c ON m.id_categoria_material = c.id_categoria_material
              ORDER BY m.created_at DESC`

    err := DB.Select(&materialesDB, query)
    if err != nil {
        return nil, fmt.Errorf("Error obteniendo materiales: %w", err)
    }

    materiales := make([]models.Material, 0, len(materialesDB))
    for _, item := range materialesDB {
        materiales = append(materiales, mapMaterialDB(item))
    }
    return materiales, nil
}

func (r *MaterialRepository) Count(search string) (int, error) {
	var total int
	if search == "" {
		err := DB.Get(&total, "SELECT COUNT(*) FROM tb_materiales")
		if err != nil {
			return 0, fmt.Errorf("Error contando materiales: %w", err)
		}
		return total, nil
	}

	searchPattern := fmt.Sprintf("%%%s%%", strings.ToLower(search))
	err := DB.Get(&total, `SELECT COUNT(*) FROM tb_materiales m LEFT JOIN tb_categorias_material c ON m.id_categoria_material = c.id_categoria_material WHERE LOWER(m.codigo) LIKE $1 OR LOWER(m.nombre) LIKE $1 OR LOWER(c.categoria) LIKE $1`, searchPattern)
	if err != nil {
		return 0, fmt.Errorf("Error contando materiales: %w", err)
	}
	return total, nil
}

func (r *MaterialRepository) GetPaginated(search string, limit int, offset int) ([]models.Material, error) {
    var materialesDB []materialDB
    baseQuery := `SELECT m.id_material, m.codigo, m.nombre, m.descripcion, m.id_categoria_material, m.id_unidad_medida, m.precio_actual, m.created_at, m.updated_at,
                          u.id_unidad_medida AS unidad_id, u.nombre AS unidad_nombre,
                          c.id_categoria_material AS categoria_id, c.categoria AS categoria_nombre
                   FROM tb_materiales m
                   LEFT JOIN tb_unidades_medida u ON m.id_unidad_medida = u.id_unidad_medida
                   LEFT JOIN tb_categorias_material c ON m.id_categoria_material = c.id_categoria_material`

    if search == "" {
        query := baseQuery + " ORDER BY m.created_at DESC LIMIT $1 OFFSET $2"
        err := DB.Select(&materialesDB, query, limit, offset)
        if err != nil {
            return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
        }
    } else {
        searchPattern := fmt.Sprintf("%%%s%%", strings.ToLower(search))
        query := baseQuery + ` WHERE LOWER(m.codigo) LIKE $1 OR LOWER(m.nombre) LIKE $1 OR LOWER(c.categoria) LIKE $1 ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`
        err := DB.Select(&materialesDB, query, searchPattern, limit, offset)
        if err != nil {
            return nil, fmt.Errorf("Error obteniendo materiales paginados: %w", err)
        }
    }

    materiales := make([]models.Material, 0, len(materialesDB))
    for _, item := range materialesDB {
        materiales = append(materiales, mapMaterialDB(item))
    }
    return materiales, nil
}

func (r *MaterialRepository) GetByID(id int) (*models.Material, error) {
    var materialDB materialDB
    query := `SELECT m.id_material, m.codigo, m.nombre, m.descripcion, m.id_categoria_material, m.id_unidad_medida, m.precio_actual, m.created_at, m.updated_at,
                     u.id_unidad_medida AS unidad_id, u.nombre AS unidad_nombre,
                     c.id_categoria_material AS categoria_id, c.categoria AS categoria_nombre
              FROM tb_materiales m
              LEFT JOIN tb_unidades_medida u ON m.id_unidad_medida = u.id_unidad_medida
              LEFT JOIN tb_categorias_material c ON m.id_categoria_material = c.id_categoria_material
              WHERE m.id_material = $1`

    err := DB.Get(&materialDB, query, id)
    if err != nil {
        return nil, fmt.Errorf("Error obteniendo material: %w", err)
    }

    material := mapMaterialDB(materialDB)
    return &material, nil
}

func (r *MaterialRepository) Create(material *models.Material) error {
    query := `INSERT INTO tb_materiales (codigo, nombre, descripcion, id_categoria_material, id_unidad_medida, precio_actual) 
              VALUES ($1, $2, $3, $4, $5, $6) 
              RETURNING id_material, created_at, updated_at`

    err := DB.QueryRow(query, material.Codigo, material.Nombre, material.Descripcion, material.Categoria, material.Unidad, material.Precio).Scan(&material.ID, &material.CreatedAt, &material.UpdatedAt)
    if err != nil {
        return fmt.Errorf("Error creando material: %w", err)
    }
    return nil
}

func (r *MaterialRepository) Update(material *models.Material) error {
    query := `UPDATE tb_materiales SET codigo = $1, nombre = $2, descripcion = $3, id_categoria_material = $4, id_unidad_medida = $5, precio_actual = $6, updated_at = NOW() 
              WHERE id_material = $7
              RETURNING updated_at`
    err := DB.QueryRow(query, material.Codigo, material.Nombre, material.Descripcion, material.Categoria, material.Unidad, material.Precio, material.ID).Scan(&material.UpdatedAt)
    if err != nil {
        return fmt.Errorf("Error actualizando material: %w", err)
    }
    return nil
}

func (r *MaterialRepository) Delete(id int) error {
	result, err := DB.Exec("DELETE FROM tb_materiales WHERE id_material = $1", id)
	if err != nil {
		return fmt.Errorf("Error eliminando material: %w", err)
	}

	rows, _ := result.RowsAffected()
    if rows == 0 {
        return fmt.Errorf("material %d no encontrado", id)
    }
	
	return nil
}