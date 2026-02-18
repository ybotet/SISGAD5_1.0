import api from './api';

// Interfaces actualizadas según tu API
export interface ClasificacionItem {
    id_clasificacion: number;
    nombre: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClasificacionRequest {
    nombre: string;
    tipo: string;
    // createdAt lo genera el backend automáticamente
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination: {
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

export const clasificacionService = {
    // Obtener clasificaciones con paginación
    async getClasificaciones(
        tipo: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<ClasificacionItem>> {
        const params = new URLSearchParams({
            tipo,
            page: page.toString(),
            limit: limit.toString()
        });
        const response = await api.get<PaginatedResponse<ClasificacionItem>>(
            `/clasificacion?${params.toString()}`
        );
        return response.data;
    },

    // Crear nueva clasificación
    async createClasificacion(data: CreateClasificacionRequest): Promise<ClasificacionItem> {
        const response = await api.post<ApiResponse<ClasificacionItem>>('/clasificacion', data);
        return response.data.data;
    },

    // Actualizar clasificación
    async updateClasificacion(id: number, data: Partial<ClasificacionItem>): Promise<ClasificacionItem> {
        const response = await api.put<ApiResponse<ClasificacionItem>>(`/clasificacion/${id}`, data);
        return response.data.data;
    },

    // Eliminar clasificación
    async deleteClasificacion(id: number): Promise<void> {
        console.log('Eliminando clasificación con ID:', id); // ← Debug
        try {
            const response = await api.delete(`/clasificacion/${id}`);
            console.log('Respuesta de eliminación:', response); // ← Debug
        } catch (error) {
            console.error('Error en servicio delete:', error); // ← Debug
            throw error;
        }
    },
};