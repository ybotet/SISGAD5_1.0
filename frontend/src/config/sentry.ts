/**
 * Sentry (TASK-220-04) — inicialización condicional del SDK en el frontend.
 *
 * Se inicializa SOLO si `VITE_SENTRY_DSN_FRONTEND` está definida en el build.
 * Si falta, `initSentry` es no-op (no rompe el build ni el runtime).
 *
 * Variables (Vite, prefijo VITE_):
 *   VITE_SENTRY_DSN_FRONTEND   DSN del proyecto frontend
 *   VITE_SENTRY_ENVIRONMENT    (def: import.meta.env.MODE)
 *   VITE_SENTRY_RELEASE        (def: VITE_GIT_SHA || "unknown")
 *   VITE_SENTRY_TRACES_SAMPLE_RATE (def: 0.1 en prod, 0 en dev)
 *
 * No se envía PII: `beforeSend` elimina Authorization/Cookie/email y datos
 * de usuario (email/ip).
 */

import * as Sentry from '@sentry/react';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  const dsn = import.meta.env.VITE_SENTRY_DSN_FRONTEND as string | undefined;
  if (!dsn) {
    // Sin DSN: no-op.
    return;
  }

  const isProd = import.meta.env.PROD;
  const tracesRaw = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined;
  const tracesSampleRate = tracesRaw !== undefined ? parseFloat(tracesRaw) : isProd ? 0.1 : 0.0;

  Sentry.init({
    dsn,
    environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) || import.meta.env.MODE,
    release: (import.meta.env.VITE_SENTRY_RELEASE as string | undefined) || (import.meta.env.VITE_GIT_SHA as string | undefined) || 'unknown',
    tracesSampleRate,
    // Scrub de PII antes de enviar.
    beforeSend(event) {
      return scrubEvent(event);
    },
  });
}

/** Elimina datos sensibles (PII) de un evento antes de enviarlo. */
function scrubEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
  try {
    if (event.request) {
      if (event.request.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers.cookie;
        delete event.request.headers['X-User-Email'];
      }
      delete event.request.cookies;
    }
    if (event.user) {
      delete event.user.email;
      delete (event.user as { ip_address?: string }).ip_address;
    }
  } catch {
    /* best-effort */
  }
  return event;
}

export { Sentry };