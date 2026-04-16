import api from "./apiMaterials";

export interface UnidadMedidaItem {
  id: number;
  nombre: string;
}

export interface CreateUnidadMedidaRequest {
  nombre: string;
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

export const unidadMedidaService = {
  async getUnidadesMedida(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<PaginatedResponse<UnidadMedidaItem>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await api.get<UnidadMedidaItem[]>(`/unidades-medida?${params.toString()}`);

    let items = response.data || [];
    if (search) {
      const normalizedSearch = search.toLowerCase();
      items = items.filter((item) => item.nombre.toLowerCase().includes(normalizedSearch));
    }

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  },

  async listAllUnidadesMedida(): Promise<UnidadMedidaItem[]> {
    const response = await api.get<UnidadMedidaItem[]>("/unidades-medida");
    return response.data;
  },

  async createUnidadMedida(data: CreateUnidadMedidaRequest): Promise<UnidadMedidaItem> {
    const response = await api.post<UnidadMedidaItem>("/unidades-medida", data);
    return response.data;
  },

  async deleteUnidadMedida(id: number): Promise<void> {
    await api.delete(`/unidades-medida/${id}`);
  },

  async updateUnidadMedida(id: number, data: CreateUnidadMedidaRequest): Promise<UnidadMedidaItem> {
    const response = await api.put<UnidadMedidaItem>(`/unidades-medida/${id}`, data);
    return response.data;
  },
};
