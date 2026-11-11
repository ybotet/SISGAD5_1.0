// utils/notify.ts
// TASK-720-05 — Helpers de notificación (toasts).
// Mapea códigos de error del gateway a toasts en español.
//
// Uso:
//   import { notifySuccess, notifyError } from '../../utils/notify';
//   notifySuccess('Trabajo creado');
//   notifyError('No tienes permisos', { code: 'FORBIDDEN' });

import { useNotificationStore, type ToastType } from '../store/useNotificationStore';

export interface NotifyOptions {
  code?: string;
  duration?: number;
}

/** Llama a la store para agregar un toast. */
function notify(type: ToastType, message: string, options: NotifyOptions = {}): string {
  return useNotificationStore.getState().addToast({
    type,
    message,
    duration: options.duration ?? (type === 'error' ? 6000 : 4000),
  });
}

export function notifySuccess(message: string, options: NotifyOptions = {}): string {
  return notify('success', message, options);
}

export function notifyError(message: string, options: NotifyOptions = {}): string {
  return notify('error', message, options);
}

export function notifyWarning(message: string, options: NotifyOptions = {}): string {
  return notify('warning', message, options);
}

export function notifyInfo(message: string, options: NotifyOptions = {}): string {
  return notify('info', message, options);
}

/** Mapea un error de API (gateway) a un toast de error. */
export function notifyApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  // Códigos HTTP comunes del gateway (ver SPEC.md §8.3).
  const map: Record<string, string> = {
    FORBIDDEN: 'No tienes permisos para realizar esta acción',
    UNAUTHORIZED: 'Sesión expirada. Inicie sesión nuevamente.',
    NOT_FOUND: 'Recurso no encontrado',
    CONFLICT: 'El registro ya existe o está en uso',
    VALIDATION_ERROR: 'Datos de entrada inválidos',
    RATE_LIMITED: 'Demasiadas solicitudes. Intente más tarde.',
  };

  let code: string | undefined;
  let message = fallback;

  if (error && typeof error === 'object') {
    const e = error as { code?: string; message?: string; statusCode?: number };
    code = e.code;
    if (e.message) message = e.message;
  }

  const text = code && map[code] ? map[code] : message;
  return notifyError(text, { code });
}

/** Limpia todos los toasts. */
export function clearNotifications(): void {
  useNotificationStore.getState().clearAll();
}