import api from "./api";

export interface MaterialItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  unidad: string;
  precio: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  unidad: string;
  precio: number;
}

export interface MaterialesPageResponse {
  data: MaterialItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const materialService = {
  async getMaterials(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<MaterialesPageResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append("search", search);
    }

    const response = await api.get<MaterialesPageResponse>(
      `/materiales/materiales?${params.toString()}`,
    );
    return response.data;
  },

  async getMaterial(id: number): Promise<MaterialItem> {
    const response = await api.get<MaterialItem>(
      `/materiales/materiales/${id}`,
    );
    return response.data;
  },

  async createMaterial(data: CreateMaterialRequest): Promise<MaterialItem> {
    const response = await api.post<MaterialItem>(
      "/materiales/materiales",
      data,
    );
    return response.data;
  },

  async updateMaterial(
    id: number,
    data: Partial<CreateMaterialRequest>,
  ): Promise<MaterialItem> {
    const response = await api.put<MaterialItem>(
      `/materiales/materiales/${id}`,
      data,
    );
    return response.data;
  },

  async deleteMaterial(id: number): Promise<void> {
    await api.delete(`/materiales/materiales/${id}`);
  },
};
