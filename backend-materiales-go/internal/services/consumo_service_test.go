package services

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type mockMaterialRepo2 struct{
    GetByIDFunc func(int) (*models.Material, error)
}

func (m *mockMaterialRepo2) GetByID(id int) (*models.Material, error) {
    return m.GetByIDFunc(id)
}

type mockConsumoRepo struct{
    CrearFunc func(*models.Consumo) error
}

func (m *mockConsumoRepo) CrearConsumoConDetalles(c *models.Consumo) error {
    return m.CrearFunc(c)
}

func TestCrearConsumo_Success(t *testing.T) {
    materialRepo := &mockMaterialRepo2{GetByIDFunc: func(id int) (*models.Material, error) {
        return &models.Material{ID: id, Precio: 5.5}, nil
    }}

    consumoRepo := &mockConsumoRepo{CrearFunc: func(c *models.Consumo) error {
        c.ID = 10
        return nil
    }}

    consumo := &models.Consumo{IDTrabajo: 1, IDTrabajador: 2, Detalles: []models.ConsumoDetalle{{IDMaterial: 7, Cantidad: 2}}}

    err := validateAndFillConsumo(consumo, materialRepo)
    require.NoError(t, err)
    require.Equal(t, 5.5, consumo.Detalles[0].CostoUnitario)

    err = consumoRepo.CrearFunc(consumo)
    require.NoError(t, err)
    require.Equal(t, 10, consumo.ID)
}

func TestCrearConsumo_MaterialError(t *testing.T) {
    materialRepo := &mockMaterialRepo2{GetByIDFunc: func(id int) (*models.Material, error) {
        return nil, errors.New("db error")
    }}

    consumo := &models.Consumo{IDTrabajo: 1, IDTrabajador: 2, Detalles: []models.ConsumoDetalle{{IDMaterial: 7, Cantidad: 1}}}
    err := validateAndFillConsumo(consumo, materialRepo)
    require.Error(t, err)
}

func validateAndFillConsumo(c *models.Consumo, mRepo *mockMaterialRepo2) error {
    if c.IDTrabajo <= 0 {
        return errors.New("el ID del trabajo es requerido")
    }
    if c.IDTrabajador <= 0 {
        return errors.New("el ID del trabajador es requerido")
    }
    if len(c.Detalles) == 0 {
        return errors.New("el consumo debe tener al menos un material")
    }
    for i := range c.Detalles {
        d := &c.Detalles[i]
        if d.IDMaterial <= 0 {
            return errors.New("ID de material inválido")
        }
        if d.Cantidad <= 0 {
            return errors.New("la cantidad debe ser mayor a cero")
        }
        mat, err := mRepo.GetByID(d.IDMaterial)
        if err != nil {
            return err
        }
        if mat == nil {
            return errors.New("material no encontrado")
        }
        d.CostoUnitario = mat.Precio
    }
    return nil
}
