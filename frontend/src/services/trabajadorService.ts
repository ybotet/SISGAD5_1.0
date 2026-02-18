import api from './api';

export interface TrabajadorItem {
    id_trabajador: number;
    clave_trabajador: string | null;
    nombre: string | null;
    cargo: string | null;
    activo: boolean | null;
    id_grupow: number | null;
    tb_grupow?: {
        id_grupow: number;
        grupo: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTrabajadorRequest {
    clave_trabajador?: string | null;
    nombre?: string | null;
    cargo?: string | null;
    activo?: boolean | null;
    id_grupow?: number | null;
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

export const trabajadorService = {
    async getTrabajadores(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<TrabajadorItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
        }

        const response = await api.get<PaginatedResponse<TrabajadorItem>>(
            `/trabajador?${params.toString()}`
        );
        return response.data;
    },

    async createTrabajador(data: CreateTrabajadorRequest): Promise<TrabajadorItem> {
        const response = await api.post<ApiResponse<TrabajadorItem>>('/trabajador', data);
        return response.data.data;
    },

    async updateTrabajador(id: number, data: Partial<CreateTrabajadorRequest>): Promise<TrabajadorItem> {
        const response = await api.put<ApiResponse<TrabajadorItem>>(`/trabajador/${id}`, data);
        return response.data.data;
    },

    async deleteTrabajador(id: number): Promise<void> {
        await api.delete(`/trabajador/${id}`);
    },
};

