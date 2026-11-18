import toast from 'react-hot-toast';

export interface NotifyOptions {
  code?: string;
  duration?: number;
}

export function notifySuccess(message: string, options: NotifyOptions = {}): string {
  return toast.success(message, { duration: options.duration ?? 4000 });
}

export function notifyError(message: string, options: NotifyOptions = {}): string {
  return toast.error(message, { duration: options.duration ?? 6000 });
}

export function notifyWarning(message: string, options: NotifyOptions = {}): string {
  return toast(message, { duration: options.duration ?? 4000, icon: '⚠️' });
}

export function notifyInfo(message: string, options: NotifyOptions = {}): string {
  return toast(message, { duration: options.duration ?? 4000 });
}

const ERROR_MAP: Record<string, string> = {
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  UNAUTHORIZED: 'Sesión expirada. Inicie sesión nuevamente.',
  NOT_FOUND: 'Recurso no encontrado',
  CONFLICT: 'El registro ya existe o está en uso',
  VALIDATION_ERROR: 'Datos de entrada inválidos',
  RATE_LIMITED: 'Demasiadas solicitudes. Intente más tarde.',
};

export function notifyApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  let code: string | undefined;
  let message = fallback;
  if (error && typeof error === 'object') {
    const e = error as { code?: string; message?: string; response?: { data?: { message?: string; error?: string } } };
    code = e.code;
    message = e.message || e.response?.data?.message || e.response?.data?.error || message;
  }
  const text = code && ERROR_MAP[code] ? ERROR_MAP[code] : message;
  return notifyError(text, { code });
}

export function clearNotifications(): void {
  toast.dismiss();
}