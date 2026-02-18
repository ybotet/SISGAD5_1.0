import api from './api';

export interface PropietarioItem {
    id_propietario: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePropietarioRequest {
    nombre: string;
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

export const propietarioService = {
    async getPropietarios(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<PropietarioItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        const response = await api.get<PaginatedResponse<PropietarioItem>>(
            `/propietario?${params.toString()}`
        );
        return response.data;
    },

    async createPropietario(data: CreatePropietarioRequest): Promise<PropietarioItem> {
        const response = await api.post<ApiResponse<PropietarioItem>>('/propietario', data);
        return response.data.data;
    },

    async updatePropietario(id: number, data: Partial<CreatePropietarioRequest>): Promise<PropietarioItem> {
        const response = await api.put<ApiResponse<PropietarioItem>>(`/propietario/${id}`, data);
        return response.data.data;
    },

    async deletePropietario(id: number): Promise<void> {
        try {
            await api.delete(`/propietario/${id}`);
        } catch (error) {
            console.error('Error eliminando propietario:', error);
            throw error;
        }
    },
};

