// components/ProtectedComponent.tsx
import React, { useState, useEffect } from 'react';
import { useApiError } from '../hooks/useApiError';
import ErrorDisplay from './ErrorDisplay';
import api from '../services/api';

const ProtectedComponent: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { error, errorType, handleError, clearError, isForbidden } = useApiError();

    useEffect(() => {
        fetchProtectedData();
    }, []);

    const fetchProtectedData = async () => {
        try {
            setLoading(true);
            clearError();

            const response = await api.get('/ruta-protegida');
            setData(response.data);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <ErrorDisplay
                error={error}
                errorType={errorType}
                onClose={clearError}
            />

            {isForbidden ? (
                <div>
                    <h2>No tienes permisos para ver este contenido</h2>
                    <p>Contacta al administrador si necesitas acceso.</p>
                </div>
            ) : (
                <div>
                    {/* Mostrar datos normales */}
                    {data && (
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProtectedComponent;