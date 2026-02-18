// context/ErrorContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { ApiError, ForbiddenError } from '../errors/ApiError';
import type { ReactNode } from 'react';

interface ErrorContextType {
    error: string | null;
    setError: (error: string | null) => void;
    handleApiError: (error: unknown) => void;
    clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [error, setError] = useState<string | null>(null);

    const handleApiError = (error: unknown) => {
        if (error instanceof ForbiddenError) {
            setError('No tienes permisos para realizar esta acción');
            // Redireccionar o mostrar modal específico
        } else if (error instanceof ApiError) {
            setError(error.message);
        } else {
            setError('Ocurrió un error inesperado');
        }
    };

    const clearError = () => setError(null);

    return (
        <ErrorContext.Provider value={{ error, setError, handleApiError, clearError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within ErrorProvider');
    }
    return context;
};