import api from './api';

// Interfaces según el modelo de Sistema
export interface Propietario {
    id_propietario: number;
    nombre: string;
}

export interface SistemaItem {
    id_sistema: number;
    sistema: string;
    id_propietario: number | null;
    direccion: string | null;
    tb_propietario?: Propietario | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSistemaRequest {
    sistema: string;
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

export const sistemaService = {
    // Obtener sistema con paginación
    async getSistema(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<SistemaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<SistemaItem>>(
            `/sistema?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo sistema
    async createSistema(data: CreateSistemaRequest): Promise<SistemaItem> {
        const response = await api.post<ApiResponse<SistemaItem>>('/sistema', data);
        return response.data.data;
    },

    // Actualizar sistema
    async updateSistema(id: number, data: Partial<CreateSistemaRequest>): Promise<SistemaItem> {
        const response = await api.put<ApiResponse<SistemaItem>>(`/sistema/${id}`, data);
        return response.data.data;
    },

    // Eliminar sistema
    async deleteSistema(id: number): Promise<void> {
        console.log('Eliminando sistema con ID:', id);
        try {
            const response = await api.delete(`/sistema/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};

