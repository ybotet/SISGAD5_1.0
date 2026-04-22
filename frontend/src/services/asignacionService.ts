import api from "./apiMaterials";
import { trabajadorService } from "./trabajadorService";

export interface AsignacionDetalleItem {
  id: number;
  id_asignacion: number;
  id_material: number;
  tb_material?: {
    id: number;
    codigo: string;
    nombre: string;
  };
  cantidad: number;
  costo_unitario: number;
}

export interface AsignacionItem {
  id: number;
  id_trabajador: number;
  fecha_asignacion: string;
  id_trabajo?: number;
  observaciones: string;
  detalles?: AsignacionDetalleItem[];
  created_at: string;
  updated_at: string;
  tb_trabajador?: {
    id_trabajador: number;
    clave_trabajador: string | null;
  };
}

export interface CreateAsignacionRequest {
  id_trabajador: number;
  fecha_asignacion: string;
  id_trabajo?: number;
  observaciones?: string;
  detalles: Array<{
    id_material: number;
    cantidad: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const asignacionService = {
  async getAsignaciones(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    fechaDesde?: string,
    fechaHasta?: string,
    claveTrabajador?: string,
  ): Promise<PaginatedResponse<AsignacionItem>> {
    try {
      // El backend solo soporta /asignaciones sin paginación
      // Implementamos paginación en cliente
      const response = await api.get<AsignacionItem[]>("/asignaciones");
      const items = response.data || [];

      // Aplicar búsqueda/filtrado si existe
      let filtered = items;

      // Filtrar por texto genérico (`search`) sobre observaciones o clave/id trabajador
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            (item.observaciones || "").toLowerCase().includes(s) ||
            item.id_trabajador.toString().includes(s) ||
            (item.tb_trabajador?.clave_trabajador || "").toLowerCase().includes(s),
        );
      }

      // Filtrar por rango/fecha exacta si se proporcionan
      if (fechaDesde || fechaHasta) {
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;
        filtered = filtered.filter((item) => {
          const d = new Date(item.fecha_asignacion);
          if (desde && d < desde) return false;
          if (hasta && d > hasta) return false;
          return true;
        });
      }

      // Filtrar por clave del trabajador consultando el microservicio MP
      if (claveTrabajador) {
        // intentamos obtener trabajadores que coincidan con la clave
        try {
          const resp = await trabajadorService.getTrabajadores(1, 50, claveTrabajador);
          const ids = (resp.data || []).map((t) => t.id_trabajador);
          const claveLower = claveTrabajador.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              (item.tb_trabajador && ids.includes(item.tb_trabajador.id_trabajador)) ||
              (item.tb_trabajador?.clave_trabajador || "").toLowerCase().includes(claveLower),
          );
        } catch (e) {
          // Si falla la consulta a MP, no filtramos por trabajador (fallo silencioso)
        }
      }

      // Aplicar paginación
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedItems = filtered.slice(offset, offset + limit);

      return {
        data: paginatedItems,
        page,
        limit,
        total,
        total_pages: pages,
      };
    } catch (error) {
      // Si hay error, retornar respuesta vacía
      return {
        data: [],
        page,
        limit,
        total: 0,
        total_pages: 0,
      };
    }
  },

  async listAllAsignaciones(): Promise<AsignacionItem[]> {
    const response = await api.get<AsignacionItem[]>("/asignaciones");
    return response.data || [];
  },

  async getAsignacion(id: number): Promise<AsignacionItem> {
    const response = await api.get<AsignacionItem>(`/asignaciones/${id}`);
    return response.data;
  },

  async getAsignacionesPorTrabajador(idTrabajador: number): Promise<AsignacionItem[]> {
    const response = await api.get<AsignacionItem[]>(`/asignaciones/trabajador/${idTrabajador}`);
    return response.data || [];
  },

  async createAsignacion(data: CreateAsignacionRequest): Promise<AsignacionItem> {
    // Crear una copia de los datos con la fecha en formato ISO
    const requestData = {
      ...data,
      // Si la fecha viene como "2026-04-14", convertirla a ISO
      fecha_asignacion: data.fecha_asignacion
        ? new Date(data.fecha_asignacion).toISOString()
        : new Date().toISOString(),
    };
    const response = await api.post<AsignacionItem>("/asignaciones", requestData);
    return response.data;
  },

  async updateAsignacion(id: number, data: CreateAsignacionRequest): Promise<AsignacionItem> {
    const requestData = {
      ...data,
      fecha_asignacion: data.fecha_asignacion
        ? new Date(data.fecha_asignacion).toISOString()
        : new Date().toISOString(),
    };
    const response = await api.put<AsignacionItem>(`/asignaciones/${id}`, requestData);
    return response.data;
  },

  async deleteAsignacion(id: number): Promise<void> {
    await api.delete(`/asignaciones/${id}`);
  },
};
