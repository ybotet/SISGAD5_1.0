import api from './api';

export interface GrupoTrabajoItem {
    id_grupow: number;
    grupo: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateGrupoTrabajoRequest {
    grupo: string;
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

export const grupowService = {
    async getGruposTrabajo(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<GrupoTrabajoItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        const response = await api.get<PaginatedResponse<GrupoTrabajoItem>>(
            `/grupow?${params.toString()}`
        );
        return response.data;
    },

    async createGrupoTrabajo(data: CreateGrupoTrabajoRequest): Promise<GrupoTrabajoItem> {
        const response = await api.post<ApiResponse<GrupoTrabajoItem>>('/grupow', data);
        return response.data.data;
    },

    async updateGrupoTrabajo(id: number, data: Partial<CreateGrupoTrabajoRequest>): Promise<GrupoTrabajoItem> {
        const response = await api.put<ApiResponse<GrupoTrabajoItem>>(`/grupow/${id}`, data);
        return response.data.data;
    },

    async deleteGrupoTrabajo(id: number): Promise<void> {
        try {
            await api.delete(`/grupow/${id}`);
        } catch (error) {
            console.error('Error eliminando grupo de trabajo:', error);
            throw error;
        }
    },
};

