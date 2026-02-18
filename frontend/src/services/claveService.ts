import api from './api';

export interface ClaveItem {
    id_clave: number;
    clave: string;
    descripcion: string;
    valor_p: string | null;
    id_clasificadorclave: number | null;
    es_pendiente: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClaveRequest {
    clave: string;
    descripcion: string;
    valor_p?: string;
    id_clasificadorclave?: number | null;
    es_pendiente?: boolean;
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

export const claveService = {
    // Obtener claves con paginación
    async getClaves(
        page: number = 1,
        limit: number = 10,
        search: string = '',
        estado: string = ''
    ): Promise<PaginatedResponse<ClaveItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        if (estado) {
            if (estado === 'no_pendiente') {
                params.append('es_pendiente', 'false');
            } else if (estado === 'pendiente') {
                params.append('es_pendiente', 'true');
            }
        }
        const response = await api.get<PaginatedResponse<ClaveItem>>(
            `/clave?${params.toString()}`
        );
        return response.data;
    },

    // Crear nueva clave
    async createClave(data: CreateClaveRequest): Promise<ClaveItem> {
        const response = await api.post<ApiResponse<ClaveItem>>('/clave', data);
        return response.data.data;
    },

    // Actualizar clave
    async updateClave(id: number, data: Partial<CreateClaveRequest>): Promise<ClaveItem> {
        const response = await api.put<ApiResponse<ClaveItem>>(`/clave/${id}`, data);
        return response.data.data;
    },

    // Eliminar clave
    async deleteClave(id: number): Promise<void> {
        console.log('Eliminando clave con ID:', id);
        try {
            const response = await api.delete(`/clave/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};