import api from './api';

export interface Mando {
    id_mando: number;
    mando: string;
}
export interface Cable {
    id_cable: number;
    numero: string;
}
export interface Planta {
    id_planta: number;
    planta: string;
}

export interface Trabajador {
    id_trabajador: number;
    clave_trabajador: string;
}

export interface Sistema {
    id_sistema: number;
    sistema: string;
}

export interface Propietario {
    id_propietario: number;
    nombre: string;
}

export interface Clasificacion {
    id_clasificacion: number;
    nombre: string;
}

export interface TelefonoItem {
    id_telefono: number;
    telefono: string | null;
    nombre: string | null;
    direccion: string | null;
    lic: string | null;
    zona: string | null;
    esbaja: boolean;
    extensiones: number;
    facturado: string | null;
    sector: string | null;
    id_mando: number | null;
    id_clasificacion: number | null;
    createdAt: string;
    updatedAt: string;
    // Campos relacionados
    tb_mando?: Mando;
    tb_clasificacion?: Clasificacion;
}

export interface RecorridoItem {
    id_recorrido: number;
    numero: number;
    par: string | null;
    terminal: string | null;
    de: string | null;
    a: string | null;
    dirter: string | null;
    soporte: string | null;
    canal: string | null;
    id_telefono: number | null;
    id_linea: number | null;
    id_propietario: number | null;
    id_planta: number | null;
    id_cable: number | null;
    id_sistema: number | null;
    createdAt: string;
    updatedAt: string;
    tb_cable?: Cable;
    tb_planta?: Planta;
    tb_sistema?: Sistema;
    tb_propietario?: Propietario;
}

export interface QuejaItem {
    num_reporte: number;
    fecha: string;
    prioridad: string | null;
    fecha_prueba: string | null;
    probador: string | null;
    fecha_pdte: string | null;
    clave_pdte: string | null;
    claveok: string | null;
    fechaok: string | null;
    red: boolean;
    id_queja: number;
    id_telefono: number | null;
    id_linea: number | null;
    id_tipoqueja: number | null;
    id_clave: number | null;
    id_pizarra: number | null;
    reportado_por: string | null;
    createdAt: string;
    updatedAt: string;
    tb_trabajador?: Trabajador;
}

export interface CreateTelefonoRequest {
    telefono?: string;
    nombre?: string;
    direccion?: string;
    lic?: string;
    zona?: string;
    extensiones?: number;
    facturado?: string;
    sector?: string;
    id_mando?: number | null;
    id_clasificacion?: number | null;
    esbaja?: boolean;
}

export interface CreateRecorridoRequest {
    numero: number;
    par?: string | null;
    terminal?: string | null;
    de?: string | null;
    a?: string | null;
    dirter?: string | null;
    soporte?: string | null;
    canal?: string | null;
    id_telefono?: number | null;
    id_linea?: number | null;
    id_propietario?: number | null;
    id_planta?: number | null;
    id_cable?: number | null;
    id_sistema?: number | null;
}

export interface UpdateRecorridoRequest extends Partial<CreateRecorridoRequest> { }

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message?: string;
    errors?: string[];
    error?: string;
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

export const telefonoService = {
    // Obtener teléfonos con paginación
    async getTelefonos(
        page: number = 1,
        limit: number = 10,
        search: string = '',
        estado: string = ''
    ): Promise<PaginatedResponse<TelefonoItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) {
            params.append('search', search);
            console.log('🔍 Buscando quejas con término:', search);
        }

        if (estado) {
            if (estado === 'activo') {
                params.append('esbaja', 'false');
            } else if (estado === 'baja') {
                params.append('esbaja', 'true');
            }
        }
        const url = `/telefono?${params.toString()}`;
        console.log('📡 URL de petición:', url);

        const response = await api.get<PaginatedResponse<TelefonoItem>>(
            `/telefono?${params.toString()}`
        );
        return response.data;
    },

    // Obtener detalles de un teléfono específico
    async getTelefonoDetalles(id: number): Promise<{
        telefono: TelefonoItem;
        recorridos: RecorridoItem[];
        quejas: QuejaItem[];
    }> {
        const response = await api.get<ApiResponse<{
            telefono: TelefonoItem;
            recorridos: RecorridoItem[];
            quejas: QuejaItem[];
        }>>(`/telefono/${id}`);
        console.log(response.data.data)
        return response.data.data;
    },

    // Obtener mandos para el combo
    async getMandos(): Promise<Mando[]> {
        const response = await api.get<ApiResponse<Mando[]>>('/mando?limit=100');
        return response.data.data;
    },

    // Obtener clasificaciones para el combo
    async getClasificaciones(): Promise<Clasificacion[]> {
        const response = await api.get<ApiResponse<Clasificacion[]>>('/clasificacion?limit=100');
        return response.data.data;
    },

    // Crear nuevo teléfono
    async createTelefono(data: CreateTelefonoRequest): Promise<TelefonoItem> {
        try {
            const response = await api.post<ApiResponse<TelefonoItem>>('/telefono', data);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            const err: any = new Error(response.data.message || 'Error al crear el teléfono');
            err.response = { data: response.data };
            throw err;
        } catch (error: any) {
            // Si la petición falla con un código HTTP (axios error), reenviamos tal cual
            if (error?.response) throw error;
            // Si es otro error, lo normalizamos
            const err: any = new Error(error?.message || 'Error al crear el teléfono');
            err.response = { data: error?.response?.data || { error: error?.message } };
            throw err;
        }
    },

    // Actualizar teléfono
    async updateTelefono(id: number, data: Partial<CreateTelefonoRequest>): Promise<TelefonoItem> {
        const response = await api.put<ApiResponse<TelefonoItem>>(`/telefono/${id}`, data);
        return response.data.data;
    },

    // Eliminar teléfono
    async deleteTelefono(id: number): Promise<void> {
        console.log('Eliminando teléfono con ID:', id);
        try {
            const response = await api.delete(`/telefono/${id}`);
            console.log('Respuesta de eliminación:', response);
        } catch (error) {
            console.error('Error en servicio delete:', error);
            throw error;
        }
    },

    async getRecorridosTelefono(
        idTelefono: number,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<RecorridoItem>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            id_telefono: idTelefono.toString()
        });

        const response = await api.get<PaginatedResponse<RecorridoItem>>(
            `/recorrido?${params.toString()}`
        );
        return response.data;
    },

    // Obtener plantas para combo
    async getPlantas(): Promise<Planta[]> {
        const response = await api.get<ApiResponse<Planta[]>>('/planta?limit=100');
        return response.data.data;
    },

    // Obtener propietarios para combo
    async getPropietarios(): Promise<Propietario[]> {
        const response = await api.get<ApiResponse<Propietario[]>>('/propietario?limit=100');
        return response.data.data;
    },

    // Obtener cables para combo
    async getCables(): Promise<Cable[]> {
        const response = await api.get<ApiResponse<Cable[]>>('/cable?limit=100');
        return response.data.data;
    },

    // Obtener sistemas para combo
    async getSistemas(): Promise<Sistema[]> {
        const response = await api.get<ApiResponse<Sistema[]>>('/sistema?limit=100');
        return response.data.data;
    },

    // Crear nuevo recorrido
    async createRecorrido(data: CreateRecorridoRequest): Promise<RecorridoItem> {
        const response = await api.post<ApiResponse<RecorridoItem>>('/recorrido', data);
        return response.data.data;
    },

    // Actualizar recorrido
    async updateRecorrido(id: number, data: UpdateRecorridoRequest): Promise<RecorridoItem> {
        const response = await api.put<ApiResponse<RecorridoItem>>(`/recorrido/${id}`, data);
        return response.data.data;
    },

    // Eliminar recorrido
    async deleteRecorrido(id: number): Promise<void> {
        await api.delete(`/recorrido/${id}`);
    }
};