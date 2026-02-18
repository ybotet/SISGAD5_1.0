// hooks/useApiError.ts
import { useState, useCallback } from 'react';
import { ApiError, ForbiddenError, UnauthorizedError } from '../errors/ApiError';

// Define el mismo tipo que usa ErrorDisplay
export type ErrorDisplayType = 'FORBIDDEN' | 'UNAUTHORIZED' | 'GENERAL' | null;

export const useApiError = () => {
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<ErrorDisplayType>(null);

    const handleError = useCallback((error: unknown) => {
        if (error instanceof ForbiddenError) {
            setError(error.message);
            setErrorType('FORBIDDEN');
            console.warn('Error 403: Acceso denegado', error);
        } else if (error instanceof UnauthorizedError) {
            setError(error.message);
            setErrorType('UNAUTHORIZED');
        } else if (error instanceof ApiError) {
            setError(error.message);
            setErrorType('GENERAL');
        } else {
            setError('Error desconocido');
            setErrorType('GENERAL');
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setErrorType(null);
    }, []);

    return {
        error,
        errorType,
        handleError,
        clearError,
        isForbidden: errorType === 'FORBIDDEN',
        isUnauthorized: errorType === 'UNAUTHORIZED',
    };
};