import api from './api';

// Interfaces principales
export interface Telefono {
    id_telefono: number;
    telefono: string;
}

export interface Trabajador {
    id_trabajador: number;
    clave_trabajador: string;
}

export interface TipoQueja {
    id_tipoqueja: number;
    tipoqueja: string;
}

export interface Clave {
    id_clave: number;
    clave: string;
}

export interface ResultadoPrueba {
    id_resultadoprueba: number;
    resultado: string;
}

export interface Pizarra {
    id_pizarra: number;
    nombre: string;
}

export interface Linea {
    id_linea: number;
    clavelinea: string;
}

// Interfaces relacionadas para detalles
export interface PruebaItem {
    id_prueba: number;
    fecha: string | null;
    id_resultado: number | null;
    id_trabajador: number | null;
    id_cable: number | null;
    id_clave: number | null;
    id_queja: number | null;
    estado: string | null;
    createdAt: string;
    updatedAt: string;
    tb_resultadoprueba: any | null;
    tb_cable: any | null;
    tb_clave: Clave | null;
    tb_trabajador: any | null;
}

export interface TrabajoItem {
    id_trabajo: number;
    fecha: string;
    probador: number;
    estado: string | null;
    observaciones: string | null;
    id_queja: number;
    tb_trabajador: any | null;
    createdAt: string;
    updatedAt: string;
}

export interface QuejaItem {
    num_reporte: number;
    fecha: string;
    prioridad: number | null;
    probador: number | null;
    fecha_pdte: string | null;
    clave_pdte: string | null;
    claveok: string | null;
    fechaok: string | null;
    red: boolean | null;
    estado: string | null;
    id_queja: number;
    id_telefono: number | null;
    id_linea: number | null;
    id_tipoqueja: number | null;
    id_clave: number | null;
    id_pizarra: number | null;
    reportado_por: string | null;
    createdAt: string;
    updatedAt: string;

    // Campos relacionados
    tb_telefono?: Telefono | null;
    tb_linea?: Linea | null;
    tb_tipoqueja?: TipoQueja | null;
    tb_clave?: Clave | null;
    tb_pizarra?: Pizarra | null;
    tb_trabajador?: Trabajador | null;
}

export interface CreateQuejaRequest {
    num_reporte: number;
    fecha: string;
    prioridad?: number | null;
    probador?: number | null;
    fecha_pdte?: string | null;
    clave_pdte?: string | null;
    claveok?: string | null;
    fechaok?: string | null;
    red?: boolean;
    estado?: string | null;
    id_telefono?: number | null;
    id_linea?: number | null;
    id_tipoqueja?: number | null;
    id_clave?: number | null;
    id_pizarra?: number | null;
    reportado_por?: string | null;
}

export interface CreatePruebaRequest {
    fecha?: string | null;
    id_resultado?: number | null;
    id_trabajador?: number | null;
    id_cable?: number | null;
    id_clave?: number | null;
    id_queja: number;
}

export interface CreateTrabajoRequest {
    fecha: string;
    probador: number;
    estado?: string | null;
    observaciones?: string | null;
    id_queja: number;
}

export interface UpdateQuejaRequest extends Partial<CreateQuejaRequest> { }

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

export interface QuejaDetallesResponse {
    queja: QuejaItem;
    pruebas: PruebaItem[];
    trabajos: TrabajoItem[];
}

export const quejaService = {
    // Obtener quejas con paginación
    async getQuejas(
        page: number = 1,
        limit: number = 10,
        search: string = '',
        estado: string = ''
    ): Promise<PaginatedResponse<QuejaItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
            console.log('🔍 Buscando quejas con término:', search);
        }

        if (estado) {
            if (estado === 'red') {
                params.append('red', 'true');
            } else if (estado === 'resuelta') {
                params.append('red', 'false');
            }
            console.log('🎯 Aplicando filtro estado:', estado);
        }

        // const url = `/queja?${params.toString()}`;
        // console.log('📡 URL de petición:', url);

        const response = await api.get<PaginatedResponse<QuejaItem>>(
            `/queja?${params.toString()}`
        );
        return response.data;
    },

    // Obtener detalles de una queja específica
    async getQuejaDetalles(id: number): Promise<QuejaDetallesResponse> {
        const response = await api.get<ApiResponse<QuejaDetallesResponse>>(`/queja/${id}`);
        return response.data.data;
    },

    // Obtener teléfonos para combo
    async getTelefonos(): Promise<Telefono[]> {
        const response = await api.get<ApiResponse<Telefono[]>>('/telefono?limit=100');
        return response.data.data;
    },

    // Obtener tipos de queja para combo
    async getTiposQueja(): Promise<TipoQueja[]> {
        const response = await api.get<ApiResponse<TipoQueja[]>>('/tipoqueja?limit=100');
        return response.data.data;
    },

    // Obtener claves para combo
    async getClaves(): Promise<Clave[]> {
        const response = await api.get<ApiResponse<Clave[]>>('/clave?limit=100');
        return response.data.data;
    },

    // Obtener pizarras para combo
    async getPizarras(): Promise<Pizarra[]> {
        const response = await api.get<ApiResponse<Pizarra[]>>('/pizarra?limit=100');
        return response.data.data;
    },

    //Obtener pruebas para combo
    async getResultadosPrueba(): Promise<ResultadoPrueba[]> {
        const response = await api.get<ApiResponse<ResultadoPrueba[]>>('/resultadoprueba?limit=100');
        return response.data.data;
    },

    // Obtener líneas para combo
    async getLineas(): Promise<Linea[]> {
        const response = await api.get<ApiResponse<Linea[]>>('/linea?limit=100');
        return response.data.data;
    },

    //Obtener probadores para combo
    async getProbadores(): Promise<Trabajador[]> {
        const response = await api.get<ApiResponse<Trabajador[]>>('/trabajador/getProbadores');
        return response.data.data;
    },

    // Crear nueva queja
    async createQueja(data: CreateQuejaRequest): Promise<QuejaItem> {
        const response = await api.post<ApiResponse<QuejaItem>>('/queja', data);
        return response.data.data;
    },

    // Actualizar queja
    async updateQueja(id: number, data: UpdateQuejaRequest): Promise<QuejaItem> {
        const response = await api.put<ApiResponse<QuejaItem>>(`/queja/${id}`, data);
        return response.data.data;
    },

    // Eliminar queja
    async deleteQueja(id: number): Promise<void> {
        await api.delete(`/queja/${id}`);
    },

    // Crear nueva prueba
    async createPrueba(data: CreatePruebaRequest): Promise<PruebaItem> {
        const response = await api.post<ApiResponse<PruebaItem>>('/prueba', data);
        return response.data.data;
    },

    // Eliminar prueba
    async deletePrueba(id: number): Promise<void> {
        await api.delete(`/prueba/${id}`);
    },

    // Crear nuevo trabajo
    async createTrabajo(data: CreateTrabajoRequest): Promise<TrabajoItem> {
        const response = await api.post<ApiResponse<TrabajoItem>>('/trabajo', data);
        return response.data.data;
    },

    // Eliminar trabajo
    async deleteTrabajo(id: number): Promise<void> {
        await api.delete(`/trabajo/${id}`);
    },
};