import api from './api';

export interface TipoQuejaItem {
    id_tipoqueja: number;
    tipoqueja: string;
    servicio: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTipoQuejaRequest {
    tipoqueja: string;
    servicio: string;
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

// Validar que el servicio sea uno de los permitidos
const validateServicio = (servicio: string): boolean => {
    const serviciosPermitidos = ['TELÉFONO', 'LÍNEA', 'PIZARRA'];
    return serviciosPermitidos.includes(servicio);
};

export const tipoquejaService = {
    // Obtener tipos de queja con paginación
    async getTiposQueja(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<TipoQuejaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<TipoQuejaItem>>(
            `/tipoqueja?${params.toString()}`
        );
        return response.data;
    },

    // Crear nuevo tipo de queja
    async createTipoQueja(data: CreateTipoQuejaRequest): Promise<TipoQuejaItem> {
        if (!validateServicio(data.servicio)) {
            throw new Error('Servicio no válido. Debe ser: TELÉFONO, LÍNEA o PIZARRA');
        }
        const response = await api.post<ApiResponse<TipoQuejaItem>>('/tipoqueja', data);
        return response.data.data;
    },

    // Actualizar tipo de queja
    async updateTipoQueja(id: number, data: Partial<CreateTipoQuejaRequest>): Promise<TipoQuejaItem> {
        if (data.servicio && !validateServicio(data.servicio)) {
            throw new Error('Servicio no válido. Debe ser: TELÉFONO, LÍNEA o PIZARRA');
        }
        const response = await api.put<ApiResponse<TipoQuejaItem>>(`/tipoqueja/${id}`, data);
        return response.data.data;
    },

    // Eliminar tipo de queja
    async deleteTipoQueja(id: number): Promise<void> {
        console.log('Eliminando tipo de queja con ID:', id);
        try {
            const response = await api.delete(`/tipoqueja/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};