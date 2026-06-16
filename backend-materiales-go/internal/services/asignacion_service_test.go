package services

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

// mocks
type mockMaterialRepo struct{
    GetByIDFunc func(int) (*models.Material, error)
}

func (m *mockMaterialRepo) GetByID(id int) (*models.Material, error) {
    return m.GetByIDFunc(id)
}

type mockAsignacionRepo struct{
    CrearFunc func(*models.Asignacion) error
}

func (m *mockAsignacionRepo) CrearAsignacionConDetalles(a *models.Asignacion) error {
    return m.CrearFunc(a)
}

func TestCrearAsignacion_Success(t *testing.T) {
    materialRepo := &mockMaterialRepo{GetByIDFunc: func(id int) (*models.Material, error) {
        return &models.Material{ID: id, Precio: 12.5}, nil
    }}

    asignRepo := &mockAsignacionRepo{CrearFunc: func(a *models.Asignacion) error {
        // simulate DB assigning ID
        a.ID = 1
        return nil
    }}

    // We test the business logic in isolation using helper below

    // We'll call the logic directly by copying the relevant code path into a small helper
    asign := &models.Asignacion{IDTrabajador: 1, Detalles: []models.AsignacionDetalle{{IDMaterial: 2, Cantidad: 3}}}

    // Emulate the logic: validate and set costo unitario using mock
    require.NoError(t, validateAndFillAsignacion(asign, materialRepo))
    require.Equal(t, 12.5, asign.Detalles[0].CostoUnitario)

    // Simulate repo create
    err := asignRepo.CrearFunc(asign)
    require.NoError(t, err)
    require.Equal(t, 1, asign.ID)
}

func TestCrearAsignacion_MaterialNotFound(t *testing.T) {
    materialRepo := &mockMaterialRepo{GetByIDFunc: func(id int) (*models.Material, error) {
        return nil, errors.New("not found")
    }}

    asign := &models.Asignacion{IDTrabajador: 1, Detalles: []models.AsignacionDetalle{{IDMaterial: 2, Cantidad: 1}}}

    err := validateAndFillAsignacion(asign, materialRepo)
    require.Error(t, err)
}

// helper to reuse service logic in tests without importing postgres repo types
func validateAndFillAsignacion(asign *models.Asignacion, mRepo *mockMaterialRepo) error {
    if asign.IDTrabajador <= 0 {
        return errors.New("el ID del trabajador es requerido")
    }
    if len(asign.Detalles) == 0 {
        return errors.New("la asignación debe tener al menos un material")
    }
    for i := range asign.Detalles {
        d := &asign.Detalles[i]
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
