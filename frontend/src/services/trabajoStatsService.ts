import api from "./apiMp";
import { consumoService, type ConsumoItem } from "./consumoService";

/**
 * Servicio de estadísticas de trabajos (TASK-710-08 — variantes B y E).
 *
 * - Vista B: listado global de trabajos/trabajadores con filtros (solo lectura).
 *   El CRUD de trabajos sigue viviendo dentro de "Ver quejas" (quejaService).
 * - Vista E: ficha individual de un trabajo con sus materiales/consumos.
 */

//#region TIPOS

export interface TrabajoStatsTrabajador {
  id_trabajador: number;
  clave_trabajador: string;
  nombre: string;
  total_trabajos: number;
  horas_totales: number;
  primera_fecha: string | null;
  ultima_fecha: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
}

export interface TrabajoStatsListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface QuejaTrabajoStatsItem {
  id_trabajo: number;
  fecha: string | null;
  estado: number | null;
  observaciones: string | null;
  horas: number;
  trabajadores: {
    id_trabajador: number;
    clave_trabajador: string;
    nombre: string;
  }[];
}

export interface QuejaStatsResponse {
  queja: { id_queja: number; num_reporte: number; estado: string | null };
  resumen: {
    total_trabajos: number;
    horas_totales: number;
    primera_fecha: string | null;
    ultima_fecha: string | null;
  };
  trabajos: QuejaTrabajoStatsItem[];
  por_trabajador: TrabajoStatsTrabajador[];
}

export interface TrabajoDetalleStats {
  id_trabajo: number;
  fecha: string | null;
  estado: number | null;
  estado_clave: string | null;
  observaciones: string | null;
  horas: number;
  probador: {
    id_trabajador: number;
    clave_trabajador: string;
    nombre: string;
  } | null;
  queja: { id_queja: number; num_reporte: number; estado: string | null } | null;
  trabajadores: {
    id_trabajador: number;
    clave_trabajador: string;
    nombre: string;
    horas_asignadas: number;
  }[];
  consumos_url: string;
}

//#endregion TIPOS

//#region SERVICIO

export const trabajoStatsService = {
  /**
   * Estadísticas agrupadas por trabajador (vista B).
   * GET /mp/trabajo/estadisticas/trabajadores
   */
  async getPorTrabajador(
    params: TrabajoStatsListParams = {},
  ): Promise<{ data: TrabajoStatsTrabajador[]; pagination?: Pagination }> {
    const response = await api.get<ApiResponse<TrabajoStatsTrabajador[]>>(
      "/trabajo/estadisticas/trabajadores",
      { params },
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Estadísticas de los trabajos de una queja concreta (vista B/E).
   * GET /mp/trabajo/estadisticas/queja/:id_queja
   */
  async getPorQueja(idQueja: number): Promise<QuejaStatsResponse> {
    const response = await api.get<ApiResponse<QuejaStatsResponse>>(
      `/trabajo/estadisticas/queja/${idQueja}`,
    );
    return response.data.data;
  },

  /**
   * Ficha estadística individual de un trabajo + sus consumos/materiales (vista E).
   * GET /mp/trabajo/:id/estadisticas  (+ GET /materiales/consumos/trabajo/:id)
   */
  async getTrabajoDetalle(idTrabajo: number): Promise<TrabajoDetalleStats & { consumos: ConsumoItem[] }> {
    const response = await api.get<ApiResponse<TrabajoDetalleStats>>(
      `/trabajo/${idTrabajo}/estadisticas`,
    );
    const stats = response.data.data;

    // Los materiales/consumos viven en backend-materiales (Go); se cargan en paralelo.
    let consumos: ConsumoItem[] = [];
    try {
      consumos = await consumoService.getConsumosPorTrabajo(idTrabajo);
    } catch {
      // Si el servicio de materiales no está disponible, la ficha sigue siendo útil.
      consumos = [];
    }

    return { ...stats, consumos };
  },
};

//#endregion SERVICIO
