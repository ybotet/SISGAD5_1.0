import api from "./api";

export interface TipoMovimiento {
  id_tipomovimiento: number;
  movimiento: string;
}

export interface Telefono {
  id_telefono: number;
  telefono: string;
}

export interface Linea {
  id_linea: number;
  clavelinea: string;
}
export interface MovimientoItem {
  id_movimiento: number;
  id_tipomovimiento: number;
  fecha: string;
  motivo: string;
  id_os: number;
  id_telefono: number;
  id_linea: number;
  tb_tipomovimiento?: TipoMovimiento;
  tb_telefono?: Telefono;
  tb_linea?: Linea;
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

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
    // call the telefono-specific endpoint which includes the tipo_movimiento association
    const response = await api.get(
      `/movimiento/telefono/${idTelefono}?page=${page}&limit=${limit}`,
    );
    // the server returns { success: boolean, data: MovimientoItem[] }
    return response.data;
  },

  // Obtener movimientos de una línea
  async getMovimientosLinea(
    idLinea: number,
    page: number = 1,
    limit: number = 100,
  ) {
    // call the linea-specific endpoint so we get the movimiento type included
    const response = await api.get(
      `/movimiento/linea/${idLinea}?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  // Crear un nuevo movimiento
  async createMovimiento(movimiento: CreateMovimientoRequest) {
    console.log(
      "[movimientoService.createMovimiento] INICIANDO con datos:",
      movimiento,
    );
    try {
      const response = await api.post("/movimiento", movimiento);
      console.log(
        "[movimientoService.createMovimiento] RESPUESTA:",
        response.data,
      );
      return response.data;
    } catch (error) {
      console.error("[movimientoService.createMovimiento] ERROR:", error);
      throw error;
    }
  },

  // Eliminar un movimiento
  async deleteMovimiento(id: number) {
    const response = await api.delete(`/movimiento/${id}`);
    return response.data;
  },
};
