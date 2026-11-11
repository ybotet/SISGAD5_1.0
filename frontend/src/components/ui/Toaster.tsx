// components/ui/Toaster.tsx
// TASK-720-05 — Contenedor global de toasts.
// Lee la cola de `useNotificationStore` y renderiza cada toast.
//
// Se monta una única vez en App.tsx (no en cada página).

import { useEffect } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';

const TYPE_STYLES: Record<string, { bg: string; icon: string; border: string }> = {
  success: { bg: 'bg-green-50', icon: 'ri-check-circle-line', border: 'border-green-200' },
  error: { bg: 'bg-red-50', icon: 'ri-error-warning-line', border: 'border-red-200' },
  warning: { bg: 'bg-yellow-50', icon: 'ri-alert-line', border: 'border-yellow-200' },
  info: { bg: 'bg-blue-50', icon: 'ri-information-line', border: 'border-blue-200' },
};

const TYPE_TEXT: Record<string, string> = {
  success: 'text-green-700',
  error: 'text-red-700',
  warning: 'text-yellow-700',
  info: 'text-blue-700',
};

export default function Toaster() {
  const { toasts, removeToast } = useNotificationStore();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    toasts.forEach((t) => {
      if (t.duration && t.duration > 0) {
        timers.push(
          setTimeout(() => removeToast(t.id), t.duration),
        );
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => {
        const s = TYPE_STYLES[t.type] ?? TYPE_STYLES.info;
        const txt = TYPE_TEXT[t.type] ?? TYPE_TEXT.info;
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 ${s.bg} border ${s.border} rounded-lg shadow-lg p-3 animate-slide-in-right`}
          >
            <i className={`ri-line ${s.icon} text-lg ${txt} mt-0.5`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${txt}`}>{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Eliminar notificación"
            >
              <i className="ri-close-line" />
            </button>
          </div>
        );
      })}
    </div>
  );
}