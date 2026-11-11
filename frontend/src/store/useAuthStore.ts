// store/useAuthStore.ts
// TASK-700-04 — Estado global de autenticación (Zustand).
// Fase 2 de la migración (ADR 0001): wrapper hook-compatible.
//
// Estrategia: `AuthContext.tsx` se reduce a un shim que llama a este store.
// Los consumidores (`useAuth`, `ProtectedRoute`, etc.) NO cambian.
//
// No se toca `hooks/useAuth.ts` (hook muerto, QA-03) — se elimina en TASK
// separado.

import { create } from 'zustand';
import type { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthState {
  usuario: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
  hasPermission: (permission: string) => boolean;

  // Interno: inicialización una vez al montar la app.
  initialize: () => void;
}

let initialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  loading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // backend responde { success, data: { usuario, accessToken, refreshToken } }
      const { usuario: usuarioData, accessToken } = response.data.data;
      authService.setAuthData(accessToken, usuarioData);
      set({ usuario: usuarioData, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ usuario: null, isAuthenticated: false });
  },

  setUser: (u: User | null) => {
    set({ usuario: u, isAuthenticated: !!u });
  },

  hasPermission: (permission: string): boolean => {
    const { usuario } = get();
    if (!usuario) return false;

    // El backend devuelve `tb_rol` y `tb_permiso`, pero algunas partes
    // del frontend usan `Rols`/`Permisos`. Soportamos ambas estructuras.
    const rolesAny: any = (usuario as any).Rols ?? (usuario as any).tb_rol;

    return (
      rolesAny?.some((rol: any) => {
        const permisos = rol.Permisos ?? rol.tb_permiso;
        return permisos?.some((perm: any) => perm.nombre === permission);
      }) ?? false
    );
  },

  initialize: () => {
    if (initialized) return;
    initialized = true;

    const token = authService.getToken();
    const storedUser = authService.getUser();

    if (token && storedUser) {
      set({ usuario: storedUser, isAuthenticated: true });

      // Verificar si el token sigue siendo válido
      authService
        .getPerfil()
        .then((usuarioActualizado) => {
          set({ usuario: usuarioActualizado, isAuthenticated: true });
          authService.setAuthData(token, usuarioActualizado);
        })
        .catch(() => {
          // Token inválido, hacer logout
          authService.logout();
          set({ usuario: null, isAuthenticated: false });
        })
        .finally(() => {
          set({ loading: false });
        });
    } else {
      set({ loading: false });
    }
  },
}));