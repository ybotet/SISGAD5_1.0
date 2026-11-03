import api from "./apiMp";
import type { TrabajadorItem } from "./trabajadorService";
import type { ClaveItem } from "./claveService";

export interface TrabajoItem {
  id_trabajo: number;
  fecha: string | null;
  probador: number | null;
  estado: number | null;
  observaciones: string | null;
  id_queja: number | null;
  createdAt: string;
  updatedAt: string;
  trabajadores?: TrabajadorItem[];
  tb_clave?: ClaveItem;
  tb_trabajador?: TrabajadorItem;
}

export interface CreateTrabajoRequest {
  fecha: string;
  probador: number;
  estado: number;
  observaciones?: string;
  id_queja: number;
  trabajadores?: { id_trabajador: number }[];
}

export interface UpdateTrabajoRequest {
  fecha?: string;
  probador?: number;
  estado?: number;
  observaciones?: string;
  id_queja?: number;
  trabajadores?: { id_trabajador: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
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

export const trabajoService = {
  /**
   * Listado de trabajos con paginación y búsqueda.
   * Endpoint: GET /api/mp/trabajo
   */
  async getTrabajos(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    sortBy: string = "createdAt",
    sortOrder: string = "DESC",
  ): Promise<PaginatedResponse<TrabajoItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    if (search) {
      params.append("search", search);
    }
    const response = await api.get<PaginatedResponse<TrabajoItem>>(
      `/trabajo?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Obtener un trabajo por su ID (incluye trabajadores asignados y clave).
   * Endpoint: GET /api/mp/trabajo/:id
   */
  async getTrabajo(id: number): Promise<TrabajoItem> {
    const response = await api.get<ApiResponse<TrabajoItem>>(`/trabajo/${id}`);
    return response.data.data;
  },

  /**
   * Crear un nuevo trabajo. Siempre debe asociarse a una queja (id_queja obligatorio).
   * Endpoint: POST /api/mp/trabajo
   */
  async createTrabajo(data: CreateTrabajoRequest): Promise<TrabajoItem> {
    const response = await api.post<ApiResponse<TrabajoItem>>("/trabajo", data);
    return response.data.data;
  },

  /**
   * Actualizar un trabajo existente (incluye reasignación de técnicos).
   * Endpoint: PUT /api/mp/trabajo/:id
   */
  async updateTrabajo(
    id: number,
    data: UpdateTrabajoRequest,
  ): Promise<TrabajoItem> {
    const response = await api.put<ApiResponse<TrabajoItem>>(
      `/trabajo/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Eliminar un trabajo.
   * Endpoint: DELETE /api/mp/trabajo/:id
   */
  async deleteTrabajo(id: number): Promise<void> {
    await api.delete(`/trabajo/${id}`);
  },
};
