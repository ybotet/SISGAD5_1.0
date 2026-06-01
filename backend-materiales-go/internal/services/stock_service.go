package services

import (
	"fmt"
	"sort"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
)

type StockMaterialItem struct {
	MaterialID        int    `json:"material_id"`
	Codigo            string `json:"codigo"`
	Nombre            string `json:"nombre"`
	CantidadAsignada  int    `json:"cantidad_asignada"`
	CantidadConsumida int    `json:"cantidad_consumida"`
	Stock             int    `json:"stock"`
}

type StockTrabajadorItem struct {
	TrabajadorID    int                 `json:"trabajador_id"`
	TotalStock      int                 `json:"total_stock"`
	MaterialesCount int                 `json:"materiales_count"`
	Materiales      []StockMaterialItem `json:"materiales"`
}

type stockAccumulator struct {
	materialID int
	codigo     string
	nombre     string
	asignado   int
	consumido  int
}

type StockService struct {
	asignacionService *AsignacionService
	consumoService    *ConsumoService
	materialService   *MaterialService
}

func NewStockService(
	asignacionService *AsignacionService,
	consumoService *ConsumoService,
	materialService *MaterialService,
) *StockService {
	return &StockService{
		asignacionService: asignacionService,
		consumoService:    consumoService,
		materialService:   materialService,
	}
}

func (s *StockService) CalcularStockPorTrabajador() ([]StockTrabajadorItem, error) {
	asignaciones, err := s.asignacionService.ListarAsignaciones()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}

	consumos, err := s.consumoService.ObtenerTodosConsumos()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo consumos: %w", err)
	}

	catalogo, err := s.materialService.ListarMateriales()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo catálogo de materiales: %w", err)
	}

	materialInfo := make(map[int]models.Material, len(catalogo))
	for _, m := range catalogo {
		materialInfo[m.ID] = m
	}

	workers := make(map[int]map[int]*stockAccumulator)

	ensureEntry := func(trabajadorID, materialID int, mat *models.Material) {
		if _, ok := workers[trabajadorID]; !ok {
			workers[trabajadorID] = make(map[int]*stockAccumulator)
		}
		if _, ok := workers[trabajadorID][materialID]; !ok {
			entry := &stockAccumulator{materialID: materialID}
			if mat != nil {
				entry.codigo = mat.Codigo
				entry.nombre = mat.Nombre
			}
			if info, ok := materialInfo[materialID]; ok {
				if entry.codigo == "" {
					entry.codigo = info.Codigo
				}
				if entry.nombre == "" {
					entry.nombre = info.Nombre
				}
			}
			if entry.nombre == "" {
				entry.nombre = fmt.Sprintf("Material #%d", materialID)
			}
			workers[trabajadorID][materialID] = entry
		}
	}

	for _, a := range asignaciones {
		if a.IDTrabajador <= 0 {
			continue
		}
		for _, d := range a.Detalles {
			if d.IDMaterial <= 0 {
				continue
			}
			ensureEntry(a.IDTrabajador, d.IDMaterial, d.TbMaterial)
			workers[a.IDTrabajador][d.IDMaterial].asignado += d.Cantidad
		}
	}

	for _, c := range consumos {
		if c.IDTrabajador <= 0 {
			continue
		}
		for _, d := range c.Detalles {
			if d.IDMaterial <= 0 {
				continue
			}
			ensureEntry(c.IDTrabajador, d.IDMaterial, d.TbMaterial)
			workers[c.IDTrabajador][d.IDMaterial].consumido += d.Cantidad
		}
	}

	trabajadorIDs := make([]int, 0, len(workers))
	for trID := range workers {
		trabajadorIDs = append(trabajadorIDs, trID)
	}
	sort.Ints(trabajadorIDs)

	result := make([]StockTrabajadorItem, 0, len(trabajadorIDs))
	for _, trID := range trabajadorIDs {
		matMap := workers[trID]
		materialIDs := make([]int, 0, len(matMap))
		for mID := range matMap {
			materialIDs = append(materialIDs, mID)
		}
		sort.Ints(materialIDs)

		materiales := make([]StockMaterialItem, 0, len(materialIDs))
		totalStock := 0
		for _, mID := range materialIDs {
			entry := matMap[mID]
			stock := entry.asignado - entry.consumido
			totalStock += stock
			materiales = append(materiales, StockMaterialItem{
				MaterialID:        entry.materialID,
				Codigo:            entry.codigo,
				Nombre:            entry.nombre,
				CantidadAsignada:  entry.asignado,
				CantidadConsumida: entry.consumido,
				Stock:             stock,
			})
		}

		result = append(result, StockTrabajadorItem{
			TrabajadorID:    trID,
			TotalStock:      totalStock,
			MaterialesCount: len(materiales),
			Materiales:      materiales,
		})
	}

	return result, nil
}
