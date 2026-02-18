import api from './api';

export interface PlantaItem {
    id_planta: number;
    codigo: number;
    planta: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlantaRequest {
    codigo: number;
    planta: string;
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

export const plantaService = {
    // Obtener plantas con paginación
    async getPlantas(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<PlantaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<PlantaItem>>(
            `/planta?${params.toString()}`
        );
        return response.data;
    },

    // Crear nueva planta
    async createPlanta(data: CreatePlantaRequest): Promise<PlantaItem> {
        const response = await api.post<ApiResponse<PlantaItem>>('/planta', data);
        return response.data.data;
    },

    // Actualizar planta
    async updatePlanta(id: number, data: Partial<CreatePlantaRequest>): Promise<PlantaItem> {
        const response = await api.put<ApiResponse<PlantaItem>>(`/planta/${id}`, data);
        return response.data.data;
    },

    // Eliminar planta
    async deletePlanta(id: number): Promise<void> {
        console.log('Eliminando planta con ID:', id);
        try {
            const response = await api.delete(`/planta/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};