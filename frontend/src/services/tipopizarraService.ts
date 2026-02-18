import api from './api';

export interface ClasifPizarra {
    id_clasifpizarra: number;
    clasificacion: string;
}

export interface TipoPizarraItem {
    id_tipopizarra: number;
    tipo: string;
    id_clasifpizarra: number;
    createdAt: string;
    updatedAt: string;
    // Campo relacionado
    tb_clasifpizarra?: ClasifPizarra;
}

export interface CreateTipoPizarraRequest {
    tipo: string;
    id_clasifpizarra: number;
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

export const tipopizarraService = {
    // Obtener tipos de pizarra con paginación
    async getTiposPizarra(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<TipoPizarraItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }
        const response = await api.get<PaginatedResponse<TipoPizarraItem>>(
            `/tipopizarra?${params.toString()}`
        );
        return response.data;
    },

    // Obtener clasificaciones de pizarra para el combo
    async getClasifPizarras(): Promise<ClasifPizarra[]> {
        const response = await api.get<ApiResponse<ClasifPizarra[]>>('/clasifpizarra?limit=100');
        return response.data.data;
    },

    // Crear nuevo tipo de pizarra
    async createTipoPizarra(data: CreateTipoPizarraRequest): Promise<TipoPizarraItem> {
        const response = await api.post<ApiResponse<TipoPizarraItem>>('/tipopizarra', data);
        return response.data.data;
    },

    // Actualizar tipo de pizarra
    async updateTipoPizarra(id: number, data: Partial<CreateTipoPizarraRequest>): Promise<TipoPizarraItem> {
        const response = await api.put<ApiResponse<TipoPizarraItem>>(`/tipopizarra/${id}`, data);
        return response.data.data;
    },

    // Eliminar tipo de pizarra
    async deleteTipoPizarra(id: number): Promise<void> {
        console.log('Eliminando tipo de pizarra con ID:', id);
        try {
            const response = await api.delete(`/tipopizarra/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },
};