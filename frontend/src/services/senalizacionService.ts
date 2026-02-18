import api from './api';

// Interfaces según el modelo de Senalizacion
export interface SenalizacionItem {
    id_senalizacion: number;
    senalizacion: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSenalizacionRequest {
    senalizacion: string;
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

// Interface para la respuesta paginada
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

export const senalizacionService = {
    // Obtener senalizacion con paginación
    async getSenalizacion(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<SenalizacionItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<SenalizacionItem>>(
            `/senalizacion?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo senalizacion
    async createSenalizacion(data: CreateSenalizacionRequest): Promise<SenalizacionItem> {
        const response = await api.post<ApiResponse<SenalizacionItem>>('/senalizacion', data);
        return response.data.data;
    },

    // Actualizar senalizacion
    async updateSenalizacion(id: number, data: Partial<CreateSenalizacionRequest>): Promise<SenalizacionItem> {
        const response = await api.put<ApiResponse<SenalizacionItem>>(`/senalizacion/${id}`, data);
        return response.data.data;
    },

    // Eliminar senalizacion
    async deleteSenalizacion(id: number): Promise<void> {
        console.log('Eliminando senalizacion con ID:', id);
        try {
            const response = await api.delete(`/senalizacion/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

