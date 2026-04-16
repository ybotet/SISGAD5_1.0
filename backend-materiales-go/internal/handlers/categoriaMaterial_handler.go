package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)

type CategoriaMaterialHandler struct {
	service *services.CategoriaMaterialService
}

func NewCategoriaMaterialHandler(service *services.CategoriaMaterialService) *CategoriaMaterialHandler {
	return &CategoriaMaterialHandler{service: service}
}

type PaginatedCategorias struct {
	Data        []models.CategoriaMaterial `json:"data"`
	Page        int                        `json:"page"`
	Limit       int                        `json:"limit"`
	Total       int                        `json:"total"`
	TotalPages  int                        `json:"total_pages"`
}

// Listar con paginación
func (h *CategoriaMaterialHandler) ListarPaginado(w http.ResponseWriter, r *http.Request) {
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

	categorias, total, err := h.service.ListarCategoriasPaginated(page, limit, search)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Asegurar que categorias sea un array vacío y no nil
	if categorias == nil {
		categorias = make([]models.CategoriaMaterial, 0)
	}

	totalPages := (total + limit - 1) / limit
	response := PaginatedCategorias{
		Data:       categorias,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Listar todas
func (h *CategoriaMaterialHandler) Listar(w http.ResponseWriter, r *http.Request) {
	categorias, err := h.service.ListarCategorias()
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	// Asegurar que categorias sea un array vacío y no nil
	if categorias == nil {
		categorias = make([]models.CategoriaMaterial, 0)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categorias)
}

func (h *CategoriaMaterialHandler) Obtener(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	categoria, err := h.service.ObtenerCategoriaPorID(id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categoria)
}

func (h *CategoriaMaterialHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var categoria models.CategoriaMaterial
	err := json.NewDecoder(r.Body).Decode(&categoria)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Datos inválidos")
		return
	}

	err = h.service.CrearCategoria(&categoria)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(categoria)
}

func (h *CategoriaMaterialHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var categoria models.CategoriaMaterial
	err := json.NewDecoder(r.Body).Decode(&categoria)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Datos inválidos")
		return
	}
	categoria.ID = id
	err = h.service.ActualizarCategoria(&categoria)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categoria)
}

func (h *CategoriaMaterialHandler) Eliminar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	err := h.service.EliminarCategoria(id)
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
