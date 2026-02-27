import api from "./api";

export interface MovimientoItem {
  id_movimiento: number;
  movimiento: string;
  fecha: string;
  motivo: string;
  id_os: number;
  id_telefono: number;
  id_linea: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovimientoRequest {
  movimiento: string;
  fecha: string;
  motivo: string;
  id_os: number;
  id_telefono: number;
  id_linea: number;
}

export const movimientoService = {
  // Obtener movimientos con paginación
  async getMovimientos(page: number, limit: number) {
    const response = await api.get(`/movimientos?page=${page}&limit=${limit}`);
    return response.data;
  },
  // Crear un nuevo movimiento
  async createMovimiento(movimiento: CreateMovimientoRequest) {
    const response = await api.post("/movimientos", movimiento);
    return response.data;
  },
  // Eliminar un movimiento
  async deleteMovimiento(id: number) {
    const response = await api.delete(`/movimientos/${id}`);
    return response.data;
  },
};
