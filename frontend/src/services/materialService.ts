import api from "./apiMaterials";

// Material item shape used by the frontend (camelCase)
export interface MaterialItem {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  // keep ID as number when available; some components expect numeric IDs in forms
  categoria: number | string; // category id or name
  unidad: number | string; // unit id or name
  // readable names for UI convenience
  categoriaNombre?: string;
  unidadNombre?: string;
  precio: number;
  stock_actual?: number;
  stock_minimo?: number;
  createdAt?: string;
  updatedAt?: string;
  // keep original backend fields for compatibility with existing components
  created_at?: string;
  updated_at?: string;
  tb_unidad_medida?: UnidadMedida;
  tb_categoria_material?: CategoriaMaterial;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
}

export interface CategoriaMaterial {
  id: number;
  nombre: string;
}

export interface CreateMaterialRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: number;
  unidad: number;
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

    const response = await api.get<any>(`/materiales?${params.toString()}`);
    // Map backend shape to frontend-friendly shape
    const payload = response.data as any;
    const mapped: MaterialItem[] = (payload.data || []).map((m: any) => ({
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion,
      // prefer numeric IDs when available (for forms), but keep readable names too
      categoria: m.tb_categoria_material?.id ?? m.categoria,
      unidad: m.tb_unidad_medida?.id ?? m.unidad,
      categoriaNombre:
        m.tb_categoria_material?.nombre ??
        (typeof m.categoria === "string" ? m.categoria : undefined),
      unidadNombre:
        m.tb_unidad_medida?.nombre ?? (typeof m.unidad === "string" ? m.unidad : undefined),
      precio: m.precio,
      stock_actual: m.stock_actual,
      stock_minimo: m.stock_minimo,
      createdAt: m.created_at || m.createdAt,
      updatedAt: m.updated_at || m.updatedAt,
      created_at: m.created_at || m.createdAt,
      updated_at: m.updated_at || m.updatedAt,
      tb_unidad_medida: m.tb_unidad_medida,
      tb_categoria_material: m.tb_categoria_material,
    }));

    return {
      data: mapped,
      total: payload.total,
      page: payload.page,
      limit: payload.limit,
      total_pages: payload.total_pages,
    };
  },

  async getMaterial(id: number): Promise<MaterialItem> {
    const response = await api.get<any>(`/materiales/${id}`);
    const m = response.data;
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion,
      categoria: m.tb_categoria_material?.id ?? m.categoria,
      unidad: m.tb_unidad_medida?.id ?? m.unidad,
      categoriaNombre:
        m.tb_categoria_material?.nombre ??
        (typeof m.categoria === "string" ? m.categoria : undefined),
      unidadNombre:
        m.tb_unidad_medida?.nombre ?? (typeof m.unidad === "string" ? m.unidad : undefined),
      precio: m.precio,
      stock_actual: m.stock_actual,
      stock_minimo: m.stock_minimo,
      createdAt: m.created_at || m.createdAt,
      updatedAt: m.updated_at || m.updatedAt,
      created_at: m.created_at || m.createdAt,
      updated_at: m.updated_at || m.updatedAt,
      tb_unidad_medida: m.tb_unidad_medida,
      tb_categoria_material: m.tb_categoria_material,
    };
  },

  async createMaterial(data: CreateMaterialRequest): Promise<MaterialItem> {
    const response = await api.post<any>("/materiales", data);
    const m = response.data;
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion,
      categoria: m.tb_categoria_material?.id ?? m.categoria,
      unidad: m.tb_unidad_medida?.id ?? m.unidad,
      categoriaNombre:
        m.tb_categoria_material?.nombre ??
        (typeof m.categoria === "string" ? m.categoria : undefined),
      unidadNombre:
        m.tb_unidad_medida?.nombre ?? (typeof m.unidad === "string" ? m.unidad : undefined),
      precio: m.precio,
      stock_actual: m.stock_actual,
      stock_minimo: m.stock_minimo,
      createdAt: m.created_at || m.createdAt,
      updatedAt: m.updated_at || m.updatedAt,
    };
  },

  async updateMaterial(id: number, data: Partial<CreateMaterialRequest>): Promise<MaterialItem> {
    const response = await api.put<any>(`/materiales/${id}`, data);
    const m = response.data;
    return {
      id: m.id,
      codigo: m.codigo,
      nombre: m.nombre,
      descripcion: m.descripcion,
      categoria:
        m.tb_categoria_material?.nombre || (typeof m.categoria === "string" ? m.categoria : ""),
      unidad: m.tb_unidad_medida?.nombre || (typeof m.unidad === "string" ? m.unidad : ""),
      precio: m.precio,
      stock_actual: m.stock_actual,
      stock_minimo: m.stock_minimo,
      createdAt: m.created_at || m.createdAt,
      updatedAt: m.updated_at || m.updatedAt,
    };
  },

  async deleteMaterial(id: number): Promise<void> {
    await api.delete(`/materiales/${id}`);
  },

  async getResumen(): Promise<any> {
    const response = await api.get(`/dashboard/materiales`);
    return response.data;
  },
};
