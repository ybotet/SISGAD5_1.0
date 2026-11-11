// context/AuthContext.tsx
// TASK-700-04 — Shim compatible sobre Zustand (ADR 0001).
//
// Los consumidores de `useAuth` NO cambian: mismo nombre, misma interfaz,
// mismo proveedor `AuthProvider`. Internamente delega en
// `src/store/useAuthStore.ts`.
//
// ⚠️ No tocar `hooks/useAuth.ts` (hook muerto, QA-03) — TASK separado.

import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';

interface AuthContextType {
  usuario: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  // Inicializar una vez al montar la app (bootstrap de sesión).
  useEffect(() => {
    store.initialize();
  }, [store.initialize]);

  const value: AuthContextType = {
    usuario: store.tabla,
    loading: store.loading,
    login: store.login,
    logout: store.logout,
    isAuthenticated: store.isAuthenticated,
    hasPermission: store.hasPermission,
    setUser: store.setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};