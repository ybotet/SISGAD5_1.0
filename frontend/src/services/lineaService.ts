import api from "./apiMp";

export interface Senalizacion {
  id_senalizacion: number;
  senalizacion: string;
}

export interface Cable {
  id_cable: number;
  numero: number;
}

export interface Planta {
  id_planta: number;
  planta: string;
}

export interface Sistema {
  id_sistema: number;
  sistema: string;
}

export interface TipoLinea {
  id_tipolinea: number;
  tipo: string;
}

export interface Propietario {
  id_propietario: number;
  nombre: string;
}

export interface LineaItem {
  id_linea: number;
  clavelinea: string;
  clave_n: string | null;
  codificacion: string | null;
  hilos: string | null;
  desde: string;
  dirde: string;
  distdesde: number;
  zd: string;
  hasta: string;
  dirha: string;
  disthasta: number;
  zh: string;
  esbaja: boolean;
  facturado: string | null;
  sector: string | null;
  id_senalizacion: number | null;
  id_tipolinea: number | null;
  id_propietario: number | null;
  createdAt: string;
  updatedAt: string;
  // Campos relacionados
  tb_senalizacion?: Senalizacion;
  tb_tipolinea?: TipoLinea;
  tb_propietario?: Propietario;
}

export interface RecorridoItem {
  id_recorrido: number;
  numero: number;
  par: string | null;
  terminal: string | null;
  de: string | null;
  a: string | null;
  dirter: string | null;
  soporte: string | null;
  canal: string | null;
  id_telefono: number | null;
  id_linea: number | null;
  id_propietario: number | null;
  id_planta: number | null;
  id_cable: number | null; // Cable asociado al recorrido
  id_sistema: number | null;
  createdAt: string;
  updatedAt: string;
  tb_cable?: Cable;
  tb_planta?: Planta;
  tb_sistema?: Sistema;
}

export interface QuejaItem {
  num_reporte: number;
  fecha: string;
  prioridad: string | null;
  fecha_prueba: string | null;
  probador1: string | null;
  fecha_pdte: string | null;
  clave_pdte: string | null;
  claveok: string | null;
  fechaok: string | null;
  red: boolean;
  id_queja: number;
  id_telefono: number | null;
  id_linea: number | null;
  id_tipoqueja: number | null;
  id_clave: number | null;
  id_pizarra: number | null;
  reportado_por: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLineaRequest {
  clavelinea?: string;
  clave_n?: string;
  codificacion?: string;
  hilos?: string;
  desde: string;
  dirde: string;
  distdesde?: number;
  zd: string;
  hasta: string;
  dirha: string;
  disthasta?: number;
  zh: string;
  facturado?: string;
  sector?: string;
  id_senalizacion?: number | null;
  id_tipolinea?: number | null;
  id_propietario?: number | null;
  esbaja?: boolean;
}

export interface CreateRecorridoRequest {
  numero: number;
  par?: string | null;
  terminal?: string | null;
  de?: string | null;
  a?: string | null;
  dirter?: string | null;
  soporte?: string | null;
  canal?: string | null;
  id_telefono?: number | null;
  id_linea?: number | null;
  id_propietario?: number | null;
  id_planta?: number | null;
  id_cable?: number | null;
  id_sistema?: number | null;
}

export interface UpdateRecorridoRequest extends Partial<CreateRecorridoRequest> {}

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

export const lineaService = {
  // Obtener líneas con paginación
  async getLineas(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    estado: string = "",
  ): Promise<PaginatedResponse<LineaItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    if (estado) {
      if (estado === "activo") {
        params.append("esbaja", "false");
      } else if (estado === "baja") {
        params.append("esbaja", "true");
      }
    }

    const response = await api.get<PaginatedResponse<LineaItem>>(
      `/linea?${params.toString()}`,
    );
    return response.data;
  },

  // Obtener detalles de una línea específica
  async getLineaDetalles(id: number): Promise<{
    linea: LineaItem;
    recorridos: RecorridoItem[];
    quejas: QuejaItem[];
  }> {
    const response = await api.get(`/linea/${id}`);
    return response.data.data;
  },

  // Obtener señalizaciones para el combo
  async getSenalizaciones(): Promise<Senalizacion[]> {
    const response = await api.get<ApiResponse<Senalizacion[]>>(
      "/senalizacion?limit=100",
    );
    return response.data.data;
  },

  // Obtener tipos de línea para el combo
  async getTiposLinea(): Promise<TipoLinea[]> {
    const response = await api.get<ApiResponse<TipoLinea[]>>(
      "/tipolinea?limit=100",
    );
    return response.data.data;
  },

  // Obtener propietarios para el combo
  async getPropietarios(): Promise<Propietario[]> {
    const response = await api.get<ApiResponse<Propietario[]>>(
      "/propietario?limit=100",
    );
    return response.data.data;
  },

  // Crear nueva línea
  async createLinea(data: CreateLineaRequest): Promise<LineaItem> {
    const response = await api.post<ApiResponse<LineaItem>>("/linea", data);
    return response.data.data;
  },

  // Actualizar línea
  async updateLinea(
    id: number,
    data: Partial<CreateLineaRequest>,
  ): Promise<LineaItem> {
    const response = await api.put<ApiResponse<LineaItem>>(
      `/linea/${id}`,
      data,
    );
    return response.data.data;
  },

  // Eliminar línea
  async deleteLinea(id: number): Promise<void> {
    console.log("Eliminando línea con ID:", id);
    try {
      const response = await api.delete(`/linea/${id}`);
      console.log("Respuesta de eliminación:", response);
    } catch (error) {
      console.error("Error en servicio delete:", error);
      throw error;
    }
  },

  // Obtener cables para combo
  async getCables(): Promise<Cable[]> {
    const response = await api.get<ApiResponse<Cable[]>>("/cable?limit=100");
    return response.data.data;
  },

  // Obtener plantas para combo
  async getPlantas(): Promise<Planta[]> {
    const response = await api.get<ApiResponse<Planta[]>>("/planta?limit=100");
    return response.data.data;
  },

  // Obtener sistemas para combo
  async getSistemas(): Promise<Sistema[]> {
    const response =
      await api.get<ApiResponse<Sistema[]>>("/sistema?limit=100");
    return response.data.data;
  },

  // Obtener recorridos de una línea
  async getRecorridosLinea(
    idLinea: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<RecorridoItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      id_linea: idLinea.toString(),
    });

    const response = await api.get<PaginatedResponse<RecorridoItem>>(
      `/recorrido?${params.toString()}`,
    );
    return response.data;
  },

  // Crear nuevo recorrido
  async createRecorrido(data: CreateRecorridoRequest): Promise<RecorridoItem> {
    const response = await api.post<ApiResponse<RecorridoItem>>(
      "/recorrido",
      data,
    );
    return response.data.data;
  },

  // Actualizar recorrido
  async updateRecorrido(
    id: number,
    data: UpdateRecorridoRequest,
  ): Promise<RecorridoItem> {
    const response = await api.put<ApiResponse<RecorridoItem>>(
      `/recorrido/${id}`,
      data,
    );
    return response.data.data;
  },

  // Eliminar recorrido
  async deleteRecorrido(id: number): Promise<void> {
    await api.delete(`/recorrido/${id}`);
  },
};
