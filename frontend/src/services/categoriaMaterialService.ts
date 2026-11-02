import api from "./apiMaterials";

export interface CategoriaMaterialItem {
  id: number;
  nombre: string;
}

export interface CreateCategoriaMaterialRequest {
  nombre: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const categoriaMaterialService = {
  async getCategoriasMaterial(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<PaginatedResponse<CategoriaMaterialItem>> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);
    const response = await api.get<PaginatedResponse<CategoriaMaterialItem>>(
      `/categorias-material/paginated?${params.toString()}`,
    );
    // Asegurar que data es siempre un array
    if (!response.data.data) {
      response.data.data = [];
    }
    return response.data;
  },

  async listAllCategorias(): Promise<CategoriaMaterialItem[]> {
    const response = await api.get<CategoriaMaterialItem[]>("/categorias-material");
    return response.data || [];
  },

  async getCategoriaMaterial(id: number): Promise<CategoriaMaterialItem> {
    const response = await api.get<CategoriaMaterialItem>(`/categorias-material/${id}`);
    return response.data;
  },

  async createCategoriaMaterial(
    data: CreateCategoriaMaterialRequest,
  ): Promise<CategoriaMaterialItem> {
    const response = await api.post<CategoriaMaterialItem>("/categorias-material", data);
    return response.data;
  },

  async updateCategoriaMaterial(
    id: number,
    data: CreateCategoriaMaterialRequest,
  ): Promise<CategoriaMaterialItem> {
    const response = await api.put<CategoriaMaterialItem>(`/categorias-material/${id}`, data);
    return response.data;
  },

  async deleteCategoriaMaterial(id: number): Promise<void> {
    await api.delete(`/categorias-material/${id}`);
  },
};
