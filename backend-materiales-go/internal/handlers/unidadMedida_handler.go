package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/models"
	"github.com/ybotet/SISGAD5_1.0/backend-materiales-go/internal/services"
)	

type UnidadMedidaHandler struct {
	service *services.UnidadMedidaService
}

func NewUnidadMedidaHandler(service *services.UnidadMedidaService) *UnidadMedidaHandler {
	return &UnidadMedidaHandler{service: service}
}

func (h *UnidadMedidaHandler) Listar(w http.ResponseWriter, r *http.Request) {
	unidades, err := h.service.ListarUnidades()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(unidades)
}	

func (h *UnidadMedidaHandler) Obtener(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	unidad, err := h.service.ObtenerUnidadPorID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(unidad)
}

func (h *UnidadMedidaHandler) Crear(w http.ResponseWriter, r *http.Request) {
	var unidad models.UnidadMedida
	err := json.NewDecoder(r.Body).Decode(&unidad)
	if err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}	
	err = h.service.CrearUnidad(&unidad)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(unidad)
}

func (h *UnidadMedidaHandler) Actualizar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	var unidad models.UnidadMedida
	err := json.NewDecoder(r.Body).Decode(&unidad)	
	if err != nil {
		http.Error(w, "Datos inválidos", http.StatusBadRequest)
		return
	}
	unidad.ID = id
	err = h.service.ActualizarUnidad(&unidad)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(unidad)
}

func (h *UnidadMedidaHandler) Eliminar(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])
	err := h.service.EliminarUnidad(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
