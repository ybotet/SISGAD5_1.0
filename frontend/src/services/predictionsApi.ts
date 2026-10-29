import axios from "axios";
import {
  ApiError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/ApiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/predictions`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function getBackendMessage(
  data: { message?: string; error?: string; details?: string[] } | undefined,
): string {
  if (!data) return "Error del servidor";
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.details) && data.details.length > 0)
    return data.details.join(". ");
  return "Error del servidor";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = getBackendMessage(data);

      switch (status) {
        case 403:
          throw new ForbiddenError(message);
        case 401:
          throw new UnauthorizedError(message);
        case 404:
          throw new NotFoundError(message);
        case 503:
          throw new ApiError(message, status);
        default:
          throw new ApiError(message, status);
      }
    }
    throw error;
  },
);

export interface DemandaItem {
  fecha: string;
  categoria: string;
  cantidad_predicha: number;
  limite_inferior: number;
  limite_superior: number;
}

export interface DemandaResponse {
  predicciones: DemandaItem[];
  modelo_version: string;
  fecha_generacion: string;
}

export interface TiempoResolucionResponse {
  tiempo_predicho_horas: number;
  nivel_confianza: number;
  modelo_version: string;
}

export interface AnomaliaItem {
  material_id: number;
  categoria: string;
  consumo_real: number;
  consumo_esperado: number;
  score_anomalia: number;
  es_anomalo: boolean;
}

export interface AnomaliasResponse {
  anomalias: AnomaliaItem[];
  total_analizados: number;
  modelo_version: string;
  fecha_analisis: string;
}

export interface PrioridadResponse {
  prioridad_predicha: number;
  probabilidades: Record<string, number>;
  modelo_version: string;
}

export interface FalloItem {
  elemento_id: number;
  tipo_elemento: string;
  probabilidad_fallo: number;
  es_critico: boolean;
  factores_riesgo: string[];
}

export interface FallosResponse {
  predicciones: FalloItem[];
  total_analizados: number;
  modelo_version: string;
  fecha_analisis: string;
}

export interface ModeloInfo {
  name: string;
  file: string;
  size_bytes: number;
}

export interface ModelosResponse {
  modelos: ModeloInfo[];
  total: number;
}

export const predictionsService = {
  async getDemandaMateriales(
    diasFuturos: number = 30,
    categoria?: string,
  ): Promise<DemandaResponse> {
    const params = new URLSearchParams({ dias_futuros: String(diasFuturos) });
    if (categoria) params.append("categoria", categoria);
    const response = await api.get<DemandaResponse>(
      `/demanda-materiales?${params.toString()}`,
    );
    return response.data;
  },

  async getTiempoResolucion(quejaId: number): Promise<TiempoResolucionResponse> {
    const response = await api.get<TiempoResolucionResponse>(
      `/tiempo-resolucion/${quejaId}`,
    );
    return response.data;
  },

  async getAnomaliasConsumo(limite: number = 100): Promise<AnomaliasResponse> {
    const response = await api.get<AnomaliasResponse>(
      `/anomalias-consumo?limite_registros=${limite}`,
    );
    return response.data;
  },

  async getPrioridadQueja(quejaId: number): Promise<PrioridadResponse> {
    const response = await api.get<PrioridadResponse>(
      `/prioridad-queja/${quejaId}`,
    );
    return response.data;
  },

  async getFallosInfraestructura(limite: number = 100): Promise<FallosResponse> {
    const response = await api.get<FallosResponse>(
      `/fallos-infraestructura?limite_registros=${limite}`,
    );
    return response.data;
  },

  async getModelos(): Promise<ModelosResponse> {
    const response = await api.get<ModelosResponse>("/modelos");
    return response.data;
  },
};

export default predictionsService;
