package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type DashboardHandler struct {
    consumoService    *services.ConsumoService
    materialService   *services.MaterialService
    asignacionService *services.AsignacionService
    stockService      *services.StockService
}

func NewDashboardHandler(
    consumoService *services.ConsumoService,
    materialService *services.MaterialService,
    asignacionService *services.AsignacionService,
    stockService *services.StockService,
) *DashboardHandler {
    return &DashboardHandler{
        consumoService:    consumoService,
        materialService:   materialService,
        asignacionService: asignacionService,
        stockService:      stockService,
    }
}

// ResumenMateriales godoc
func (h *DashboardHandler) ResumenMateriales(w http.ResponseWriter, r *http.Request) {
    // Obtener todos los materiales usando el servicio existente
    materiales, err := h.materialService.ListarMateriales()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error obteniendo materiales: %v", err), http.StatusInternalServerError)
        return
    }

    total := len(materiales)
    
    // Calcular suma de precios
    var sumaPrecio float64
    for _, m := range materiales {
        sumaPrecio += m.Precio
    }

    // Distribución por categoría
    categoriaMap := make(map[string]int)
    for _, m := range materiales {
        catNombre := "Sin categoría"
        if m.TbCategoria != nil {
            catNombre = m.TbCategoria.Categoria
        }
        categoriaMap[catNombre]++
    }
    
    cats := make([]map[string]interface{}, 0, len(categoriaMap))
    for cat, count := range categoriaMap {
        cats = append(cats, map[string]interface{}{
            "categoria": cat,
            "count":     count,
        })
    }
    //ordenar cats por count descendente y retornar las 10 primeras
    for i := 0; i < len(cats)-1; i++ {
        for j := 0; j < len(cats)-i-1; j++ {
            if cats[j]["count"].(int) < cats[j+1]["count"].(int) {
                cats[j], cats[j+1] = cats[j+1], cats[j]
            }
        }
    }
    if len(cats) > 10 {
        cats = cats[:10]
    }


    // Distribución por unidad de medida
    unidadMap := make(map[string]int)
    for _, m := range materiales {
        unidadNombre := "Sin unidad"
        if m.TbUnidadMedida != nil {
            unidadNombre = m.TbUnidadMedida.Nombre
        }
        unidadMap[unidadNombre]++
    }
    
    unis := make([]map[string]interface{}, 0, len(unidadMap))
    for unidad, count := range unidadMap {
        unis = append(unis, map[string]interface{}{
            "nombre": unidad,
            "count":  count,
        })
    }

    // ordenar unis por count descendente y retornar las 10 primeras
    for i := 0; i < len(unis)-1; i++ {
        for j := 0; j < len(unis)-i-1; j++ {
            if unis[j]["count"].(int) < unis[j+1]["count"].(int) {
                unis[j], unis[j+1] = unis[j+1], unis[j]
            }
        }
    }
    if len(unis) > 10 {
        unis = unis[:10]
    }
    

    


    respuesta := map[string]interface{}{
        "total_materiales":        total,
        "total_valor_catalogo":    sumaPrecio,
        "promedio_precio":         func() float64 { if total == 0 { return 0 }; return sumaPrecio / float64(total) }(),
        "distribucion_categorias": cats,
        "distribucion_unidades":   unis,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// AlertasGlobales godoc
func (h *DashboardHandler) AlertasGlobales(w http.ResponseWriter, r *http.Request) {
    respuesta := []map[string]interface{}{
        {
            "trabajador_id":       123,
            "trabajador_nombre":   "Juan Pérez",
            "alertas":             3,
            "materiales_criticos": []string{"Router X100", "Cable UTP"},
        },
        {
            "trabajador_id":       456,
            "trabajador_nombre":   "María Gómez",
            "alertas":             1,
            "materiales_criticos": []string{"Conectores RJ45"},
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// ResumenGeneral godoc
func (h *DashboardHandler) ResumenGeneral(w http.ResponseWriter, r *http.Request) {
    materiales, err := h.materialService.ListarMateriales()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    respuesta := map[string]interface{}{
        "timestamp": time.Now(),
        "resumen_materiales": map[string]interface{}{
            "total": len(materiales),
            "valor_total": func() float64 {
                total := 0.0
                for _, m := range materiales {
                    total += m.Precio
                }
                return total
            }(),
        },
        "mensaje": "Dashboard general",
        "proximos_features": []string{
            "Gráficos de consumo por período",
            "Top materiales más usados",
            "Ranking de trabajadores con más alertas",
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// StockTrabajadores devuelve el stock actual por trabajador (asignado - consumido)
func (h *DashboardHandler) StockTrabajadores(w http.ResponseWriter, r *http.Request) {
    data, err := h.stockService.CalcularStockPorTrabajador()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if data == nil {
        data = []services.StockTrabajadorItem{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "data":    data,
    })
}