package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type ConsumoHandler struct {
    service *services.ConsumoService
}

func NewConsumoHandler(service *services.ConsumoService) *ConsumoHandler {
    return &ConsumoHandler{
        service: service,
    }
}

// CrearConsumo godoc
// @Summary Registra un consumo de materiales en un trabajo
// @Tags Consumos
// @Accept json
// @Param consumo body models.Consumo true "Datos del consumo (con detalles)"
// @Success 201 {object} models.Consumo
// @Failure 400 {string} string "Error de validación"
// @Failure 500 {string} string "Error interno"
// @Router /consumos [post]
func (h *ConsumoHandler) CrearConsumo(w http.ResponseWriter, r *http.Request) {
    var consumo models.Consumo
    
    if err := json.NewDecoder(r.Body).Decode(&consumo); err != nil {
        http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
        return
    }

    if err := h.service.CrearConsumo(&consumo); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(consumo)
}

// ListarPorTrabajo godoc
// @Summary Lista consumos de un trabajo específico
// @Tags Consumos
// @Param id path int true "ID del trabajo"
// @Success 200 {array} models.Consumo
// @Failure 400 {string} string "ID inválido"
// @Failure 500 {string} string "Error interno"
// @Router /consumos/trabajo/{id} [get]
func (h *ConsumoHandler) ListarPorTrabajo(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    trabajoID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de trabajo inválido", http.StatusBadRequest)
        return
    }

    consumos, err := h.service.ObtenerConsumosPorTrabajo(trabajoID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if consumos == nil {
        consumos = []models.Consumo{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(consumos)
}

// ListarPorTrabajador godoc
// @Summary Lista consumos de un trabajador con filtro de fechas
// @Tags Consumos
// @Param id path int true "ID del trabajador"
// @Param desde query string false "Fecha desde (YYYY-MM-DD)"
// @Param hasta query string false "Fecha hasta (YYYY-MM-DD)"
// @Success 200 {array} models.Consumo
// @Failure 400 {string} string "ID o fechas inválidas"
// @Failure 500 {string} string "Error interno"
// @Router /consumos/trabajador/{id} [get]
func (h *ConsumoHandler) ListarPorTrabajador(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    trabajadorID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de trabajador inválido", http.StatusBadRequest)
        return
    }

    // Parámetros de fecha (opcionales)
    desdeStr := r.URL.Query().Get("desde")
    hastaStr := r.URL.Query().Get("hasta")

    desde := time.Now().AddDate(0, 0, -30) // Por defecto últimos 30 días
    hasta := time.Now()

    if desdeStr != "" {
        desde, err = time.Parse("2006-01-02", desdeStr)
        if err != nil {
            http.Error(w, "Formato de fecha 'desde' inválido. Use YYYY-MM-DD", http.StatusBadRequest)
            return
        }
    }

    if hastaStr != "" {
        hasta, err = time.Parse("2006-01-02", hastaStr)
        if err != nil {
            http.Error(w, "Formato de fecha 'hasta' inválido. Use YYYY-MM-DD", http.StatusBadRequest)
            return
        }
    }

    consumos, err := h.service.ObtenerConsumosPorTrabajador(trabajadorID, desde, hasta)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if consumos == nil {
        consumos = []models.Consumo{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(consumos)
}

// ObtenerConsumo godoc
// @Summary Obtiene un consumo específico por ID
// @Tags Consumos
// @Param id path int true "ID del consumo"
// @Success 200 {object} models.Consumo
// @Failure 404 {string} string "Consumo no encontrado"
// @Router /consumos/{id} [get]
func (h *ConsumoHandler) ObtenerConsumo(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    consumoID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de consumo inválido", http.StatusBadRequest)
        fmt.Printf("ID de consumo inválido: %v (ID: %d)", err, consumoID)
        return
    }

    // Este método necesitaríamos implementarlo
    http.Error(w, "Método no implementado", http.StatusNotImplemented)
}

// ActualizarConsumo godoc
// @Summary Actualiza un consumo existente
// @Tags Consumos
// @Accept json
// @Param id path int true "ID del consumo"
// @Param consumo body models.Consumo true "Datos actualizados"
// @Success 200 {object} models.Consumo
// @Failure 404 {string} string "Consumo no encontrado"
// @Router /consumos/{id} [put]
func (h *ConsumoHandler) ActualizarConsumo(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    consumoID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de consumo inválido", http.StatusBadRequest)
        return
    }

    var consumo models.Consumo
    if err := json.NewDecoder(r.Body).Decode(&consumo); err != nil {
        http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
        return
    }

    consumo.ID = consumoID
    http.Error(w, "Método no implementado", http.StatusNotImplemented)
}

// EliminarConsumo godoc
// @Summary Elimina un consumo
// @Tags Consumos
// @Param id path int true "ID del consumo"
// @Success 204 {string} string "Sin contenido"
// @Failure 404 {string} string "Consumo no encontrado"
// @Router /consumos/{id} [delete]
func (h *ConsumoHandler) EliminarConsumo(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    consumoID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de consumo inválido", http.StatusBadRequest)
        fmt.Printf("ID de consumo inválido: %v (ID: %d)", err, consumoID)
        return
    }

    http.Error(w, "Método no implementado", http.StatusNotImplemented)
}