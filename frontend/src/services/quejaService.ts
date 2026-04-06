import api from "./apiMp";

//#region RESPUESTAS ESTÁNDAR DEL API
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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
//#endregion RESPUESTAS ESTÁNDAR DEL API

//#region DOMINIO: CATÁLOGOS (Combos/Selectores)
// ============================================
export interface Telefono {
  id_telefono: number;
  telefono: string;
}

export interface Trabajador {
  id_trabajador: number;
  clave_trabajador: string;
  nombre?: string;
  apellidos?: string;
  cargo?: string;
}

export interface TipoQueja {
  id_tipoqueja: number;
  tipoqueja: string;
}

export interface Clave {
  id_clave: number;
  clave: string;
  descripcion?: string;
}

export interface ResultadoPrueba {
  id_resultadoprueba: number;
  resultado: string;
}

export interface Pizarra {
  id_pizarra: number;
  nombre: string;
}

export interface Linea {
  id_linea: number;
  clavelinea: string;
}
//#endregion DOMINIO: CATÁLOGOS (Combos/Selectores)

//#region DOMINIO: QUEJA
// ============================================
export interface QuejaItem {
  num_reporte: number;
  fecha: string;
  prioridad: number | null;
  probador: number | null;
  fecha_pdte: string | null;
  clave_pdte: string | null;
  claveok: string | null;
  fechaok: string | null;
  red: boolean | null;
  estado: string | null;
  id_queja: number;
  id_telefono: number | null;
  id_linea: number | null;
  id_tipoqueja: number | null;
  id_clave: number | null;
  id_pizarra: number | null;
  reportado_por: string | null;
  createdAt: string;
  updatedAt: string;
  claves_flujo?: number[];
  fechas_flujo?: string[];

  // Relaciones
  tb_telefono?: Telefono | null;
  tb_linea?: Linea | null;
  tb_tipoqueja?: TipoQueja | null;
  tb_clave?: Clave | null;
  tb_pizarra?: Pizarra | null;
  tb_trabajador?: Trabajador | null;
}

export interface CreateQuejaRequest {
  num_reporte: number;
  fecha: string;
  prioridad?: number | null;
  probador?: number | null;
  fecha_pdte?: string | null;
  clave_pdte?: string | null;
  claveok?: string | null;
  fechaok?: string | null;
  red?: boolean;
  estado?: string | null;
  id_telefono?: number | null;
  id_linea?: number | null;
  id_tipoqueja?: number | null;
  id_clave?: number | null;
  id_pizarra?: number | null;
  reportado_por?: string | null;
}

export interface UpdateQuejaRequest extends Partial<CreateQuejaRequest> {}

export interface FlujoItem {
  id_clave: number | null;
  fecha: string | null;
}

export interface QuejaDetallesResponse {
  success: boolean;
  data: {
    queja: QuejaItem;
    pruebas: PruebaItem[];
    trabajos: TrabajoItem[];
    asignacion: AsignacionItem[];
    flujo: FlujoItem[];
  };
}
//#endregion DOMINIO: QUEJA

//#region DOMINIO: PRUEBA
// ============================================
export interface PruebaItem {
  id_prueba: number;
  fecha: string | null;
  id_resultado: number | null;
  id_trabajador: number | null;
  id_cable: number | null;
  id_clave: number | null;
  id_queja: number | null;
  estado: string | null;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  tb_resultadoprueba: ResultadoPrueba | null;
  tb_cable: any | null; // Pendiente tipar Cable
  tb_clave: Clave | null;
  tb_trabajador: Trabajador | null;
}

export interface CreatePruebaRequest {
  fecha?: string | null;
  id_resultado?: number | null;
  id_trabajador?: number | null;
  id_cable?: number | null;
  id_clave?: number | null;
  id_queja: number;
}
//#endregion DOMINIO: PRUEBA

//#region DOMINIO: TRABAJO
// ============================================
export interface TrabajoItem {
  id_trabajo: number;
  fecha: string;
  probador: number;
  estado: number | null;
  observaciones: string | null;
  id_queja: number;
  createdAt: string;
  updatedAt: string;

  // Relaciones
  tb_trabajador: Trabajador | null;
  tb_clave?: Clave | null; // Para el estado como clave
}

export interface CreateTrabajoRequest {
  fecha: string;
  probador: number;
  estado?: number | null;
  observaciones?: string | null;
  id_queja: number;
}
//#endregion DOMINIO: TRABAJO

//#region DOMINIO: ASIGNACIÓN
// ============================================
export interface AsignacionTrabajadores {
  id_trabajador: number;
  clave_trabajador: string;
  nombre?: string;
}

export interface AsignacionItem {
  id_asignacion: number;
  id_queja: number;
  fechaAsignacion: string;
  createdAt: string;
  updatedAt: string;
  trabajadores: AsignacionTrabajadores[];
}

export interface CreateAsignacionRequest {
  id_queja: number;
  fechaAsignacion: string;
  trabajadores: { id_trabajador: number }[];
}
//#endregion DOMINIO: ASIGNACIÓN

//#region TIPOS INTERNOS DEL FRONTEND
// ============================================
export interface HistorialEvento {
  id: number;
  tipo: "clave_inicial" | "prueba" | "trabajo" | "asignacion";
  fecha: string;
  titulo: string;
  descripcion: string;
  realizadoPor?: string;
  detalles: Record<string, any>;
}
//#endregion TIPOS INTERNOS DEL FRONTEND

//#region SERVICIO
// ============================================
export const quejaService = {
  // ==================== QUEJAS ====================

  /**
   * Obtiene lista paginada de quejas
   */
  async getQuejas(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    estado: string = "",
  ): Promise<PaginatedResponse<QuejaItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append("search", search);
    if (estado) {
      if (estado === "red") params.append("red", "true");
      else if (estado === "resuelta") params.append("red", "false");
    }

    const response = await api.get<PaginatedResponse<QuejaItem>>(`/queja?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtiene detalles completos de una queja
   */
  async getQuejaDetalles(id: number): Promise<QuejaDetallesResponse["data"]> {
    console.log("🔵 [SERVICIO] Llamando a API para queja ID:", id);

    try {
      const response = await api.get(`/queja/${id}`);

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }

      if (response.data && response.data.queja) {
        return response.data;
      }

      console.error("🔵 [SERVICIO] Estructura no reconocida:", response.data);
      throw new Error("Estructura de respuesta no reconocida");
    } catch (error) {
      console.error("🔵 [SERVICIO] Error en la petición:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva queja
   */
  async createQueja(data: CreateQuejaRequest): Promise<QuejaItem> {
    const response = await api.post<ApiResponse<QuejaItem>>("/queja", data);
    return response.data.data;
  },

  /**
   * Actualiza una queja existente
   */
  async updateQueja(id: number, data: UpdateQuejaRequest): Promise<QuejaItem> {
    const response = await api.put<ApiResponse<QuejaItem>>(`/queja/${id}`, data);
    return response.data.data;
  },

  /**
   * Elimina una queja
   */
  async deleteQueja(id: number): Promise<void> {
    await api.delete(`/queja/${id}`);
  },

  // ==================== PRUEBAS ====================

  /**
   * Crea una nueva prueba
   */
  async createPrueba(data: CreatePruebaRequest): Promise<PruebaItem> {
    const response = await api.post<ApiResponse<PruebaItem>>("/prueba", data);
    return response.data.data;
  },

  /**
   * Elimina una prueba
   */
  async deletePrueba(id: number): Promise<void> {
    await api.delete(`/prueba/${id}`);
  },

  // ==================== TRABAJOS ====================

  /**
   * Crea un nuevo trabajo
   */
  async createTrabajo(data: CreateTrabajoRequest): Promise<TrabajoItem> {
    const response = await api.post<ApiResponse<TrabajoItem>>("/trabajo", data);
    return response.data.data;
  },

  /**
   * Elimina un trabajo
   */
  async deleteTrabajo(id: number): Promise<void> {
    await api.delete(`/trabajo/${id}`);
  },

  // ==================== ASIGNACIONES ====================

  /**
   * Crea una nueva asignación
   */
  async createAsignacion(data: CreateAsignacionRequest): Promise<AsignacionItem> {
    const response = await api.post<ApiResponse<AsignacionItem>>("/asignacion", data);
    return response.data.data;
  },

  /**
   * Elimina una asignación
   */
  async deleteAsignacion(id: number): Promise<void> {
    await api.delete(`/asignacion/${id}`);
  },

  // ==================== CATÁLOGOS (Combos) ====================

  /**
   * Obtiene teléfonos para combo
   */
  async getTelefonos(): Promise<Telefono[]> {
    const response = await api.get<ApiResponse<Telefono[]>>("/telefono?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene tipos de queja para combo
   */
  async getTiposQueja(): Promise<TipoQueja[]> {
    const response = await api.get<ApiResponse<TipoQueja[]>>("/tipoqueja?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene claves para combo
   */
  async getClaves(): Promise<Clave[]> {
    const response = await api.get<ApiResponse<Clave[]>>("/clave?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene pizarras para combo
   */
  async getPizarras(): Promise<Pizarra[]> {
    const response = await api.get<ApiResponse<Pizarra[]>>("/pizarra?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene resultados de prueba para combo
   */
  async getResultadosPrueba(): Promise<ResultadoPrueba[]> {
    const response = await api.get<ApiResponse<ResultadoPrueba[]>>("/resultadoprueba?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene líneas para combo
   */
  async getLineas(): Promise<Linea[]> {
    const response = await api.get<ApiResponse<Linea[]>>("/linea?limit=100");
    return response.data.data;
  },

  /**
   * Obtiene probadores para combo
   */
  async getProbadores(): Promise<Trabajador[]> {
    const response = await api.get<ApiResponse<Trabajador[]>>("/trabajador/getProbadores");
    return response.data.data;
  },
};
//#endregion SERVICIO
