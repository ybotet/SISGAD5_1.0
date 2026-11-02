/**
 * Obtiene el mensaje de error devuelto por el backend (validaciones del modelo, etc.)
 * para mostrarlo al usuario en lugar de un mensaje genérico.
 */
export function getBackendErrorMessage(err: unknown, defaultMsg: string): string {
    if (err == null || typeof err !== 'object') return defaultMsg;
    const e = err as {
        message?: string;
        response?: { data?: { message?: string; error?: string; details?: string[] } };
    };
    return (
        e.message ||
        e.response?.data?.message ||
        e.response?.data?.error ||
        (Array.isArray(e.response?.data?.details) ? e.response.data.details.join('. ') : null) ||
        defaultMsg
    );
}
