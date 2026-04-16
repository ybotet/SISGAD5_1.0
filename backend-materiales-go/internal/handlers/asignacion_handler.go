package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type AsignacionHandler struct {
    service *services.AsignacionService
}

func NewAsignacionHandler(service *services.AsignacionService) *AsignacionHandler {
    return &AsignacionHandler{
        service: service,
    }
}

// CrearAsignacion godoc
// @Summary Crea una nueva asignación de materiales a un técnico
// @Tags Asignaciones
// @Accept json
// @Param asignacion body models.Asignacion true "Datos de la asignación (con detalles)"
// @Success 201 {object} models.Asignacion
// @Failure 400 {string} string "Error de validación"
// @Failure 500 {string} string "Error interno"
// @Router /asignaciones [post]
func (h *AsignacionHandler) CrearAsignacion(w http.ResponseWriter, r *http.Request) {
    var asignacion models.Asignacion
    
    // Decodificar JSON
    if err := json.NewDecoder(r.Body).Decode(&asignacion); err != nil {
            if strings.Contains(err.Error(), "parsing time") {
                http.Error(w, "Formato de fecha inválido. Use formato ISO 8601: 2024-01-15T10:00:00Z", http.StatusBadRequest)
            return
        }
        http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
        return
    }

    // Llamar al servicio
    if err := h.service.CrearAsignacion(&asignacion); err != nil {
        // El servicio ya devuelve mensajes de error amigables
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Responder
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(asignacion)
}

func (h *AsignacionHandler) ListarAsignaciones(w http.ResponseWriter, r *http.Request) {
    asignaciones, err := h.service.ListarAsignaciones()
    if err != nil {
        http.Error(w, "Error obteniendo asignaciones: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(asignaciones)
}

// ListarPorTrabajador godoc
// @Summary Lista todas las asignaciones de un técnico
// @Tags Asignaciones
// @Param id path int true "ID del trabajador"
// @Success 200 {array} models.Asignacion
// @Failure 400 {string} string "ID inválido"
// @Failure 500 {string} string "Error interno"
// @Router /asignaciones/trabajador/{id} [get]
func (h *AsignacionHandler) ListarPorTrabajador(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    trabajadorID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de trabajador inválido", http.StatusBadRequest)
        return
    }

    asignaciones, err := h.service.ObtenerAsignacionesPorTrabajador(trabajadorID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    // Asegurar que no devolvemos null
    if asignaciones == nil {
        asignaciones = []models.Asignacion{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(asignaciones)
}

// ObtenerAsignacion godoc
// @Summary Obtiene una asignación específica por ID
// @Tags Asignaciones
// @Param id path int true "ID de la asignación"
// @Success 200 {object} models.Asignacion
// @Failure 404 {string} string "Asignación no encontrada"
// @Failure 500 {string} string "Error interno"
// @Router /asignaciones/{id} [get]
func (h *AsignacionHandler) ObtenerAsignacion(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    asignacionID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de asignación inválido", http.StatusBadRequest)
        fmt.Println(asignacionID)
        return
    }

    asignacion, err := h.service.ObtenerAsignacionPorID(asignacionID)
    if err != nil {
        http.Error(w, "Error obteniendo asignación: "+err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(asignacion)
}

// ActualizarAsignacion godoc
// @Summary Actualiza una asignación existente
// @Tags Asignaciones
// @Accept json
// @Param id path int true "ID de la asignación"
// @Param asignacion body models.Asignacion true "Datos actualizados"
// @Success 200 {object} models.Asignacion
// @Failure 400 {string} string "Error de validación"
// @Failure 404 {string} string "Asignación no encontrada"
// @Router /asignaciones/{id} [put]
func (h *AsignacionHandler) ActualizarAsignacion(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    asignacionID, err := strconv.Atoi(vars["id"])
    if err != nil {
        http.Error(w, "ID de asignación inválido", http.StatusBadRequest)
        return
    }

    var asignacion models.Asignacion
    if err := json.NewDecoder(r.Body).Decode(&asignacion); err != nil {
        http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
        return
    }

    asignacion.ID = asignacionID

    if err := h.service.ActualizarAsignacion(asignacionID, &asignacion); err != nil {
        status := http.StatusInternalServerError
        if err.Error() == "asignación no encontrada" {
            status = http.StatusNotFound
        }
        http.Error(w, err.Error(), status)
        return
    }
}

// EliminarAsignacion godoc
// @Summary Elimina (anula) una asignación
// @Tags Asignaciones
// @Param id path int true "ID de la asignación"
// @Success 204 {string} string "Sin contenido"
// @Failure 404 {string} string "Asignación no encontrada"
// @Router /asignaciones/{id} [delete]
// EliminarAsignacion maneja DELETE /api/v1/asignaciones/{id}
func (h *AsignacionHandler) EliminarAsignacion(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    idStr := vars["id"]
    
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "ID inválido", http.StatusBadRequest)
        return
    }
    
    if err := h.service.EliminarAsignacion(id); err != nil {
        status := http.StatusInternalServerError
        if err.Error() == "asignación no encontrada" {
            status = http.StatusNotFound
        }
        http.Error(w, err.Error(), status)
        return
    }
    
    w.WriteHeader(http.StatusNoContent) // 204
}

