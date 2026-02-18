import api from './api';

// Interfaces según el modelo de Mando
export interface MandoItem {
    id_mando: number;
    mando: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMandoRequest {
    mando: string;
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

export const mandosService = {
    // Obtener mandos con paginación
    async getMandos(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<MandoItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<MandoItem>>(
            `/mando?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo mando
    async createMando(data: CreateMandoRequest): Promise<MandoItem> {
        const response = await api.post<ApiResponse<MandoItem>>('/mando', data);
        return response.data.data;
    },

    // Actualizar mando
    async updateMando(id: number, data: Partial<CreateMandoRequest>): Promise<MandoItem> {
        const response = await api.put<ApiResponse<MandoItem>>(`/mando/${id}`, data);
        return response.data.data;
    },

    // Eliminar mando
    async deleteMando(id: number): Promise<void> {
        console.log('Eliminando mando con ID:', id);
        try {
            const response = await api.delete(`/mando/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

