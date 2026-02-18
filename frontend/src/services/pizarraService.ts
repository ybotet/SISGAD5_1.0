import api from './api';

export interface Tipopizarra {
    id_tipopizarra: number;
    tipo: string;
}

export interface PizarraItem {
    id_pizarra: number;
    nombre: string | null;
    direccion: string | null;
    observacion: string | null;
    id_tipopizarra: number | null;
    createdAt: string;
    updatedAt: string;
    tb_tipopizarra?: Tipopizarra;
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
    errors?: string[];
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

export interface CreatePizarraRequest {
    nombre?: string;
    direccion?: string;
    observacion?: string;
    id_tipopizarra?: number | null;
}

export const pizarraService = {
    async getPizarras(
        page: number = 1,
        limit: number = 10,
        search: string = '',
        estado: string = ''
    ): Promise<PaginatedResponse<PizarraItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append('search', search);

        if (estado) {
            if (estado === 'activo') {
                params.append('esbaja', 'false');
            } else if (estado === 'baja') {
                params.append('esbaja', 'true');
            }
        }

        const response = await api.get<PaginatedResponse<PizarraItem>>(`/pizarra?${params.toString()}`);
        return response.data;
    },

    async getPizarraDetalles(id: number): Promise<{ pizarra: PizarraItem }> {
        const response = await api.get<ApiResponse<{ pizarra: PizarraItem }>>(`/pizarra/${id}`);
        return response.data.data;
    },

    async getTiposPizarra(): Promise<Tipopizarra[]> {
        const response = await api.get<ApiResponse<Tipopizarra[]>>('/tipopizarra?limit=200');
        return response.data.data;
    },

    async createPizarra(data: CreatePizarraRequest): Promise<PizarraItem> {
        const response = await api.post<ApiResponse<PizarraItem>>('/pizarra', data);
        return response.data.data;
    },

    async updatePizarra(id: number, data: Partial<CreatePizarraRequest>): Promise<PizarraItem> {
        const response = await api.put<ApiResponse<PizarraItem>>(`/pizarra/${id}`, data);
        return response.data.data;
    },

    async deletePizarra(id: number): Promise<void> {
        try {
            await api.delete(`/pizarra/${id}`);
        } catch (err) {
            throw err;
        }
    }
};

export default pizarraService;
