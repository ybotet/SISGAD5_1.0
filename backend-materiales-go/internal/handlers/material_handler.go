package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type MaterialHandler struct {
    service *services.MaterialService
}

func NewMaterialHandler(service *services.MaterialService) *MaterialHandler {
    return &MaterialHandler{
        service: service,
    }
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(map[string]string{"message": message})
}

func (h *MaterialHandler) Listar(w http.ResponseWriter, r *http.Request) {
    query := r.URL.Query()
    page := 1
    limit := 10
    search := ""

    if query.Get("page") != "" {
        if v, err := strconv.Atoi(query.Get("page")); err == nil && v > 0 {
            page = v
        }
    }
    if query.Get("limit") != "" {
        if v, err := strconv.Atoi(query.Get("limit")); err == nil && v > 0 && v <= 100 {
            limit = v
        }
    }
    if query.Get("search") != "" {
        search = query.Get("search")
    }

    result, err := h.service.ListarMaterialesPaginated(page, limit, search)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}

func (h *MaterialHandler) Obtener(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])
    
    material, err := h.service.ObtenerMaterialPorID(id)
    if err != nil {
        // Podríamos distinguir tipos de error
        status := http.StatusInternalServerError
        if err.Error() == "Material no encontrado" {
            status = http.StatusNotFound
        }
        http.Error(w, err.Error(), status)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(material)
}


// Crear godoc
// @Summary Crea un nuevo material
// @Tags Materiales
// @Accept json
// @Param material body object true "Datos del material" SchemaExample({
//   "codigo": "RT-100",
//   "nombre": "Router X100",
//   "descripcion": "Router WiFi 6",
//   "categoria": "Router",
//   "unidad": "unidad",
//   "precio": 89.99
// })
func (h *MaterialHandler) Crear(w http.ResponseWriter, r *http.Request) {
    var material models.Material
    if err := json.NewDecoder(r.Body).Decode(&material); err != nil {
        writeJSONError(w, http.StatusBadRequest, "JSON inválido")
        return
    }
    
    if err := h.service.CrearMaterial(&material); err != nil {
        writeJSONError(w, http.StatusBadRequest, err.Error())
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(material)
}

func (h *MaterialHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])
    
    var material models.Material
    if err := json.NewDecoder(r.Body).Decode(&material); err != nil {
        writeJSONError(w, http.StatusBadRequest, "JSON inválido")
        return
    }
    
    material.ID = id
    
    if err := h.service.ActualizarMaterial(&material); err != nil {
        status := http.StatusInternalServerError
        if err.Error() == "material no encontrado" {
            status = http.StatusNotFound
        } else if err.Error() == "el nombre del material es requerido" {
            status = http.StatusBadRequest
        }
        writeJSONError(w, status, err.Error())
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(material)
}

func (h *MaterialHandler) Eliminar(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])
    
    if err := h.service.EliminarMaterial(id); err != nil {
        status := http.StatusInternalServerError
        if err.Error() == "material no encontrado" {
            status = http.StatusNotFound
        }
        writeJSONError(w, status, err.Error())
        return
    }
    
    w.WriteHeader(http.StatusNoContent)
}