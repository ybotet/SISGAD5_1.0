import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  usuario: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la app
    const token = authService.getToken();
    const storedUser = authService.getUser();

    if (token && storedUser) {
      setUser(storedUser);

      // Verificar si el token sigue siendo válido
      authService.getPerfil()
        .then(usuarioActualizado => {
          setUser(usuarioActualizado);
          authService.setAuthData(token, usuarioActualizado);
        })
        .catch(() => {
          // Token inválido, hacer logout
          authService.logout();
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // backend responde { success, data: { usuario, token } }
      const { usuario: usuarioData, token } = response.data.data;

      authService.setAuthData(token, usuarioData);
      setUser(usuarioData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!usuario) return false;

    // El backend devuelve `tb_rol` y `tb_permiso`, pero algunas partes
    // del frontend usan `Rols`/`Permisos`. Soportamos ambas estructuras.
    const rolesAny: any = (usuario as any).Rols ?? (usuario as any).tb_rol;

    return rolesAny?.some((rol: any) => {
      const permisos = rol.Permisos ?? rol.tb_permiso;
      return permisos?.some((perm: any) => perm.nombre === permission);
    }) ?? false;
  };

  const value: AuthContextType = {
    usuario,
    loading,
    login,
    logout,
    isAuthenticated: !!usuario,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};