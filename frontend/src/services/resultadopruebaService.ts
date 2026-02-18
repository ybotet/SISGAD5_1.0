import api from './api';

// Interfaces según el modelo de ResultadoPrueba
export interface ResultadoPruebaItem {
    id_resultadoprueba: number;
    resultado: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateResultadoPruebaRequest {
    resultado: string;
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

export const resultadopruebaService = {
    // Obtener resultadoprueba con paginación
    async getResultadoPrueba(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<ResultadoPruebaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<ResultadoPruebaItem>>(
            `/resultadoprueba?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo resultadoprueba
    async createResultadoPrueba(data: CreateResultadoPruebaRequest): Promise<ResultadoPruebaItem> {
        const response = await api.post<ApiResponse<ResultadoPruebaItem>>('/resultadoprueba', data);
        return response.data.data;
    },

    // Actualizar resultadoprueba
    async updateResultadoPrueba(id: number, data: Partial<CreateResultadoPruebaRequest>): Promise<ResultadoPruebaItem> {
        const response = await api.put<ApiResponse<ResultadoPruebaItem>>(`/resultadoprueba/${id}`, data);
        return response.data.data;
    },

    // Eliminar resultadoprueba
    async deleteResultadoPrueba(id: number): Promise<void> {
        console.log('Eliminando resultadoprueba con ID:', id);
        try {
            const response = await api.delete(`/resultadoprueba/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

