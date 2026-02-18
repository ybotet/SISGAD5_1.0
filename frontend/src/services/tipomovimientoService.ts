import api from './api';

// Interfaces según el modelo de TipoMovimiento
export interface TipoMovimientoItem {
    id_tipomovimiento: number;
    movimiento: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTipoMovimientoRequest {
    movimiento: string;
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

export const tipomovimientoService = {
    // Obtener tipos de movimiento con paginación
    async getTiposMovimiento(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<TipoMovimientoItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<TipoMovimientoItem>>(
            `/tipomovimiento?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo tipo de movimiento
    async createTipoMovimiento(data: CreateTipoMovimientoRequest): Promise<TipoMovimientoItem> {
        const response = await api.post<ApiResponse<TipoMovimientoItem>>('/tipomovimiento', data);
        return response.data.data;
    },

    // Actualizar tipo de movimiento
    async updateTipoMovimiento(id: number, data: Partial<CreateTipoMovimientoRequest>): Promise<TipoMovimientoItem> {
        const response = await api.put<ApiResponse<TipoMovimientoItem>>(`/tipomovimiento/${id}`, data);
        return response.data.data;
    },

    // Eliminar tipo de movimiento
    async deleteTipoMovimiento(id: number): Promise<void> {
        console.log('Eliminando tipo de movimiento con ID:', id);
        try {
            const response = await api.delete(`/tipomovimiento/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

