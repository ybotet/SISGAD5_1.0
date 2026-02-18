import api from './api';

// Interfaces según el modelo de Clasifpizarra
export interface ClasifpizarraItem {
    id_clasifpizarra: number;
    clasificacion: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClasifpizarraRequest {
    clasificacion: string;
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

export const clasifpizarraService = {
    // Obtener clasificaciones de pizarra con paginación
    async getClasificacionesPizarra(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<ClasifpizarraItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<ClasifpizarraItem>>(
            `/clasifpizarra?${params.toString()}`
        );
        return response.data;
    },

    // Crear nueva clasificación de pizarra
    async createClasifpizarra(data: CreateClasifpizarraRequest): Promise<ClasifpizarraItem> {
        const response = await api.post<ApiResponse<ClasifpizarraItem>>('/clasifpizarra', data);
        return response.data.data;
    },

    // Actualizar clasificación de pizarra
    async updateClasifpizarra(id: number, data: Partial<CreateClasifpizarraRequest>): Promise<ClasifpizarraItem> {
        const response = await api.put<ApiResponse<ClasifpizarraItem>>(`/clasifpizarra/${id}`, data);
        return response.data.data;
    },

    // Eliminar clasificación de pizarra
    async deleteClasifpizarra(id: number): Promise<void> {
        console.log('Eliminando clasificación de pizarra con ID:', id);
        try {
            const response = await api.delete(`/clasifpizarra/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

