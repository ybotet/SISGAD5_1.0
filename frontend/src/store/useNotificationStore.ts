// store/useNotificationStore.ts
// TASK-700-04 — Estado global de notificaciones (Zustand).
// Fase 1 de la migración (ADR 0001): cola de toasts.
//
// No reemplaza ErrorContext (se mantiene intacto). Esta store es para
// notificaciones no bloqueantes (toasts). Los errores bloqueantes siguen
// usando ErrorContext hasta la Fase 2/3.

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms; 0 = persistente
}

interface NotificationState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let counter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clearAll: () => ({ toasts: [] }),
}));