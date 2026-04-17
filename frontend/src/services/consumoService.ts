import api from "./apiMaterials";

export interface ConsumoDetalleItem {
  id: number;
  id_consumo: number;
  id_material: number;
  cantidad: number;
  costo_unitario: number;
  id_asignacion?: number | null;
}

export interface ConsumoItem {
  id: number;
  id_trabajo: number;
  id_trabajador: number;
  fecha_consumo: string;
  observaciones?: string;
  detalles?: ConsumoDetalleItem[];
  created_at?: string;
  updated_at?: string;
}

export const consumoService = {
  async createConsumo(data: any): Promise<ConsumoItem> {
    const response = await api.post<ConsumoItem>("/consumos", data);
    return response.data;
  },

  async getConsumosPorTrabajo(idTrabajo: number): Promise<ConsumoItem[]> {
    const response = await api.get<ConsumoItem[]>(`/consumos/trabajo/${idTrabajo}`);
    return response.data || [];
  },

  async getConsumosPorTrabajador(
    idTrabajador: number,
    desde?: string,
    hasta?: string,
  ): Promise<ConsumoItem[]> {
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    const q = params.toString() ? `?${params.toString()}` : "";
    const response = await api.get<ConsumoItem[]>(`/consumos/trabajador/${idTrabajador}${q}`);
    return response.data || [];
  },
};
