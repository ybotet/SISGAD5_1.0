import api from './api';

// Interfaces según el modelo de Tipolinea
export interface TipolineaItem {
    id_tipolinea: number;
    tipo: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTipolineaRequest {
    tipo: string;
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

export const tipolineaService = {
    // Obtener tipos de línea con paginación
    async getTiposLinea(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<TipolineaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<TipolineaItem>>(
            `/tipolinea?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo tipo de línea
    async createTipolinea(data: CreateTipolineaRequest): Promise<TipolineaItem> {
        const response = await api.post<ApiResponse<TipolineaItem>>('/tipolinea', data);
        return response.data.data;
    },

    // Actualizar tipo de línea
    async updateTipolinea(id: number, data: Partial<CreateTipolineaRequest>): Promise<TipolineaItem> {
        const response = await api.put<ApiResponse<TipolineaItem>>(`/tipolinea/${id}`, data);
        return response.data.data;
    },

    // Eliminar tipo de línea
    async deleteTipolinea(id: number): Promise<void> {
        console.log('Eliminando tipo de línea con ID:', id);
        try {
            const response = await api.delete(`/tipolinea/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

