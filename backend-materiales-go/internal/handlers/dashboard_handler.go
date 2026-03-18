package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type DashboardHandler struct {
    consumoService *services.ConsumoService
    materialService *services.MaterialService
}

func NewDashboardHandler(
    consumoService *services.ConsumoService,
    materialService *services.MaterialService,
) *DashboardHandler {
    return &DashboardHandler{
        consumoService: consumoService,
        materialService: materialService,
    }
}

// ResumenTrabajador godoc
// @Summary Dashboard completo de un trabajador (stock + alertas)
// @Tags Dashboard
// @Param id path int true "ID del trabajador"
// @Param dias_referencia query int false "Días para calcular promedio (default: 30)"
// @Param umbral query float false "Umbral de días para alertas (default: 3)"
// @Success 200 {object} models.DashboardTrabajador
// @Failure 400 {string} string "ID inválido"
// @Failure 500 {string} string "Error interno"
// @Router /dashboard/trabajador/{id} [get]
// func (h *DashboardHandler) ResumenTrabajador(w http.ResponseWriter, r *http.Request) {
//     vars := mux.Vars(r)
//     trabajadorID, err := strconv.Atoi(vars["id"])
//     if err != nil {
//         http.Error(w, "ID de trabajador inválido", http.StatusBadRequest)
//         return
//     }

//     // Parámetros opcionales
//     diasReferencia := 30
//     umbral := 3.0

//     if diasStr := r.URL.Query().Get("dias_referencia"); diasStr != "" {
//         diasReferencia, _ = strconv.Atoi(diasStr)
//     }
//     if umbralStr := r.URL.Query().Get("umbral"); umbralStr != "" {
//         umbral, _ = strconv.ParseFloat(umbralStr, 64)
//     }

//     dashboard, err := h.consumoService.ObtenerDashboardTrabajador(trabajadorID, diasReferencia, umbral)
//     if err != nil {
//         http.Error(w, err.Error(), http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(dashboard)
// }

// ResumenMateriales godoc
// @Summary Estadísticas globales de materiales
// @Tags Dashboard
// @Success 200 {object} map[string]interface{}
// @Router /dashboard/materiales [get]
func (h *DashboardHandler) ResumenMateriales(w http.ResponseWriter, r *http.Request) {
    materiales, err := h.materialService.ListarMateriales()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Calcular estadísticas
    totalMateriales := len(materiales)
    totalValor := 0.0
    categorias := make(map[string]int)

    for _, m := range materiales {
        totalValor += m.Precio
        categorias[m.Categoria]++
    }

    respuesta := map[string]interface{}{
        "total_materiales":   totalMateriales,
        "total_valor_catalogo": totalValor,
        "promedio_precio":    totalValor / float64(totalMateriales),
        "distribucion_categorias": categorias,
        "materiales":         materiales,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// AlertasGlobales godoc
// @Summary Alertas de stock bajo para todos los trabajadores (simplificado)
// @Tags Dashboard
// @Success 200 {array} map[string]interface{}
// @Router /dashboard/alertas [get]
func (h *DashboardHandler) AlertasGlobales(w http.ResponseWriter, r *http.Request) {
    // Este endpoint requeriría consultar todos los trabajadores
    // Por ahora devolvemos un placeholder
    respuesta := []map[string]interface{}{
        {
            "trabajador_id": 123,
            "trabajador_nombre": "Juan Pérez",
            "alertas": 3,
            "materiales_criticos": []string{"Router X100", "Cable UTP"},
        },
        {
            "trabajador_id": 456,
            "trabajador_nombre": "María Gómez",
            "alertas": 1,
            "materiales_criticos": []string{"Conectores RJ45"},
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// ResumenGeneral godoc
// @Summary Dashboard general (visión ejecutiva)
// @Tags Dashboard
// @Success 200 {object} map[string]interface{}
// @Router /dashboard/general [get]
func (h *DashboardHandler) ResumenGeneral(w http.ResponseWriter, r *http.Request) {
    // Obtener total de materiales
    materiales, _ := h.materialService.ListarMateriales()
    
    respuesta := map[string]interface{}{
        "timestamp": time.Now(),
        "resumen_materiales": map[string]interface{}{
            "total": len(materiales),
            "valor_total": calcularValorTotal(materiales),
        },
        "mensaje": "Dashboard general - en construcción",
        "proximos_features": []string{
            "Gráficos de consumo por período",
            "Top materiales más usados",
            "Ranking de trabajadores con más alertas",
        },
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(respuesta)
}

// Helper interno
func calcularValorTotal(materiales []models.Material) float64 {
    total := 0.0
    for _, m := range materiales {
        total += m.Precio
    }
    return total
}