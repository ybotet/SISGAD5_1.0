import api from './api';

export interface Rol {
    id_rol: number;
    nombre: string;
    descripcion: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Permiso {
    id_permiso: number;
    nombre: string;
    descripcion: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Usuario {
    id_usuario: number;
    email: string;
    nombre: string;
    apellidos: string;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
    tb_rol?: Rol[];
}


// Para creación de usuario
export interface CreateUsuarioRequest {
    email: string;
    password: string;
    nombre: string;
    apellidos: string;
    activo?: boolean;
    roles?: number[];
}

// Para actualización de usuario
export interface UpdateUsuarioRequest {
    email?: string;
    password?: string;
    nombre?: string;
    apellidos?: string;
    activo?: boolean;
    roles?: number[];
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

export const usuariosService = {
    // Obtener usuarios con paginación
    async getUsuarios(
        page: number = 1,
        limit: number = 10,
        search: string = ''
    ): Promise<PaginatedResponse<Usuario>> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
            console.log('🔍 Buscando usuarios con término:', search);
        }

        const url = `/user?${params.toString()}`;
        console.log('📡 URL de petición:', url);

        const response = await api.get<PaginatedResponse<Usuario>>(url);
        return response.data;
    },

    // Obtener un usuario específico
    async getUsuario(id: number): Promise<Usuario> {
        const response = await api.get<ApiResponse<Usuario>>(`/user/${id}`);
        return response.data.data;
    },

    // Obtener todos los roles
    async getRoles(): Promise<Rol[]> {
        const response = await api.get<ApiResponse<Rol[]>>('/roles?limit=100');
        return response.data.data;
    },

    // Obtener roles con permisos
    async getRolesConPermisos(): Promise<(Rol & { permisos?: Permiso[] })[]> {
        const response = await api.get<ApiResponse<any[]>>('/roles?withPermisos=true&limit=100');
        return response.data.data;
    },

    // Obtener todos los permisos
    async getPermisos(): Promise<Permiso[]> {
        const response = await api.get<ApiResponse<Permiso[]>>('/permisos?limit=100');
        return response.data.data;
    },

    // Crear rol
    async createRol(data: { nombre: string; descripcion?: string }) {
        const response = await api.post<ApiResponse<any>>('/roles', data);
        return response.data.data;
    },

    // Actualizar rol
    async updateRol(id: number, data: { nombre?: string; descripcion?: string }) {
        const response = await api.put<ApiResponse<any>>(`/roles/${id}`, data);
        return response.data.data;
    },

    // Eliminar rol
    async deleteRol(id: number) {
        await api.delete(`/roles/${id}`);
    },

    // Crear nuevo usuario (requiere password)
    async createUsuario(data: CreateUsuarioRequest): Promise<Usuario> {
        const response = await api.post<ApiResponse<Usuario>>('/user', data);
        return response.data.data;
    },

    // Actualizar usuario (password opcional)
    async updateUsuario(id: number, data: UpdateUsuarioRequest): Promise<Usuario> {
        const response = await api.put<ApiResponse<Usuario>>(`/user/${id}`, data);
        return response.data.data;
    },

    // Eliminar usuario
    async deleteUsuario(id: number): Promise<void> {
        await api.delete(`/user/${id}`);
    },

    // Eliminar múltiples usuarios
    async deleteUsuariosMultiple(ids: number[]): Promise<{ 
        success: boolean; 
        message: string;
        eliminados: number;
        totalSolicitados: number;
    }> {
        const response = await api.delete('/user/', {
            data: { ids } // Enviar los IDs en el body
        });
        return response.data;
    },
};