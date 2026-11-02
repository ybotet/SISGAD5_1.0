export interface Permiso {
    id: number
    nombre: string
}

export interface Rol {
    id: number
    nombre: string
    Permisos?: Permiso[]
}

export interface User {
    id_usuario: number
    usuario?: string
    nombre?: string
    apellidos?: string
    email?: string
    Rols?: Rol[]
}
