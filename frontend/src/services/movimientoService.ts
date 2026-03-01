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
  id_tipomovimiento: number;
  fecha: string;
  motivo: string;
  id_os?: number | null;
  id_telefono?: number | null;
  id_linea?: number | null;
}

export const movimientoService = {
  // Obtener movimientos con paginación
  async getMovimientos(page: number, limit: number) {
    const response = await api.get(`/movimiento?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Obtener movimientos de un teléfono
  async getMovimientosTelefono(
    idTelefono: number,
    page: number = 1,
    limit: number = 100,
  ) {
    const response = await api.get(
      `/movimiento?page=${page}&limit=${limit}&id_telefono=${idTelefono}`,
    );
    return response.data;
  },

  // Obtener movimientos de una línea
  async getMovimientosLinea(
    idLinea: number,
    page: number = 1,
    limit: number = 100,
  ) {
    const response = await api.get(
      `/movimiento?page=${page}&limit=${limit}&id_linea=${idLinea}`,
    );
    return response.data;
  },

  // Crear un nuevo movimiento
  async createMovimiento(movimiento: CreateMovimientoRequest) {
    console.log("🔵 [movimientoService.createMovimiento] INICIANDO con datos:", movimiento);
    try {
      const response = await api.post("/movimiento", movimiento);
      console.log("🟢 [movimientoService.createMovimiento] RESPUESTA:", response.data);
      return response.data;
    } catch (error) {
      console.error("🔴 [movimientoService.createMovimiento] ERROR:", error);
      throw error;
    }
  },

  // Eliminar un movimiento
  async deleteMovimiento(id: number) {
    const response = await api.delete(`/movimiento/${id}`);
    return response.data;
  },
};
