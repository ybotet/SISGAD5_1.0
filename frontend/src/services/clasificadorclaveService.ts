import api from './api';

// Interfaces según el modelo de Clasificadorclave
export interface ClasificadorclaveItem {
    id_clasificadorclave: number;
    clasificador: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClasificadorclaveRequest {
    clasificador: string;
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

export const clasificadorclaveService = {
    // Obtener clasificadores de clave con paginación
    async getClasificadoresClave(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<ClasificadorclaveItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<ClasificadorclaveItem>>(
            `/clasificadorclave?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo clasificador de clave
    async createClasificadorclave(data: CreateClasificadorclaveRequest): Promise<ClasificadorclaveItem> {
        const response = await api.post<ApiResponse<ClasificadorclaveItem>>('/clasificadorclave', data);
        return response.data.data;
    },

    // Actualizar clasificador de clave
    async updateClasificadorclave(id: number, data: Partial<CreateClasificadorclaveRequest>): Promise<ClasificadorclaveItem> {
        const response = await api.put<ApiResponse<ClasificadorclaveItem>>(`/clasificadorclave/${id}`, data);
        return response.data.data;
    },

    // Eliminar clasificador de clave
    async deleteClasificadorclave(id: number): Promise<void> {
        console.log('Eliminando clasificador de clave con ID:', id);
        try {
            const response = await api.delete(`/clasificadorclave/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

