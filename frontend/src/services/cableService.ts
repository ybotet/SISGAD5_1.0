import api from './api';

// Interfaces según el modelo de Cable
export interface Propietario {
    id_propietario: number;
    nombre: string; // Cambié 'propietario' por 'nombre' basado en tus datos
}

export interface CableItem {
    id_cable: number;
    numero: string;
    direccion: string | null;
    id_propietario: number | null;
    tb_propietario?: Propietario | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCableRequest {
    numero: string;
    direccion?: string;
    id_propietario?: number | null;
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

export const cableService = {
    // Obtener cables con paginación
    async getCables(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<CableItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<CableItem>>(
            `/cable?${params.toString()}`
        );
        return response.data;
    },

    // Obtener propietarios para el combo
    async getPropietarios(): Promise<Propietario[]> {
        const response = await api.get<ApiResponse<Propietario[]>>('/propietario?limit=1000');
        return response.data.data;
    },

    // Crear nuevo cable
    async createCable(data: CreateCableRequest): Promise<CableItem> {
        const response = await api.post<ApiResponse<CableItem>>('/cable', data);
        return response.data.data;
    },

    // Actualizar cable
    async updateCable(id: number, data: Partial<CreateCableRequest>): Promise<CableItem> {
        const response = await api.put<ApiResponse<CableItem>>(`/cable/${id}`, data);
        return response.data.data;
    },

    // Eliminar cable
    async deleteCable(id: number): Promise<void> {
        console.log('Eliminando cable con ID:', id);
        try {
            const response = await api.delete(`/cable/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};