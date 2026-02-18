// src/components/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string; // permiso opcional
}

export default function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(permission)) {
    // Puedes redirigir al dashboard o mostrar un 403
    return <div>No tienes permiso para acceder a esta sección.</div>;
    // o: return <Navigate to="/sistema" replace />;
  }

  return <>{children}</>;
}