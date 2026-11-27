/**
 * Sentry — inicialización condicional y compartida (TASK-220-04).
 *
 * Se inicializa SOLO si la variable de entorno `SENTRY_DSN_<SERVICIO>` está
 * definida. Si no, todas las funciones son no-op (no rompe entornos sin Sentry).
 *
 * Uso (Node/Express):
 *   const sentry = require("../config/sentry");
 *   sentry.init("USERS");                 // al arrancar, antes de listen
 *   app.use(sentry.errorHandler);         // AFTER logger, al final de la cadena
 *
 * Variables de entorno:
 *   SENTRY_DSN_USERS / SENTRY_DSN_MP / SENTRY_DSN_GATEWAY  (una por servicio)
 *   SENTRY_ENVIRONMENT   (def: NODE_ENV)
 *   SENTRY_RELEASE       (def: env GIT_SHA || "unknown")
 *   SENTRY_TRACES_SAMPLE_RATE (def: 0.1 en prod, 0 en dev)
 *   SENTRY_SAMPLE_RATE        (def: 0.1 en prod, 1.0 en dev)
 */

const SENTRY_DSN = {
  USERS: process.env.SENTRY_DSN_USERS,
  MP: process.env.SENTRY_DSN_MP,
  GATEWAY: process.env.SENTRY_DSN_GATEWAY,
};

let Sentry = null;
let initialized = false;

/** Inicializa Sentry para el servicio indicado (USERS | MP | GATEWAY). */
function init(serviceKey) {
  if (initialized) return;
  const dsn = SENTRY_DSN[serviceKey];
  if (!dsn) {
    // Sin DSN: no-op (no se envían eventos).
    initialized = true;
    return;
  }
  try {
    // Requerido perezosamente para no romper si la dependencia no está instalada.
    Sentry = require("@sentry/node");
    const isProd = process.env.NODE_ENV === "production";
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
      release: process.env.SENTRY_RELEASE || process.env.GIT_SHA || "unknown",
      sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE || (isProd ? "0.1" : "1.0")),
      tracesSampleRate: parseFloat(
        process.env.SENTRY_TRACES_SAMPLE_RATE || (isProd ? "0.1" : "0.0"),
      ),
      // No enviar PII: se filtran headers/cookies/query en beforeSend.
      beforeSend(event) {
        return scrubEvent(event);
      },
    });
    initialized = true;
  } catch (err) {
    // Si @sentry/node no está instalado, se ignora (no bloquea el arranque).
    console.warn(`[sentry] No se pudo inicializar (${serviceKey}): ${err.message}`);
    initialized = true;
  }
}

/** Elimina datos sensibles (PII) de un evento antes de enviarlo. */
function scrubEvent(event) {
  try {
    if (event && event.request) {
      // Headers: quitar Authorization, Cookie, X-User-Email.
      if (event.request.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
        delete event.request.headers.Cookie;
        delete event.request.headers.cookie;
        delete event.request.headers["X-User-Email"];
        delete event.request.headers["x-user-email"];
      }
      // Cookies y query string completos.
      delete event.request.cookies;
      if (event.request.query_string) delete event.request.query_string;
    }
    // Scrub de PII en datos extra y usuario.
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    if (event.extra) {
      for (const k of Object.keys(event.extra)) {
        if (/email|password|token|authorization|cookie/i.test(k)) {
          delete event.extra[k];
        }
      }
    }
  } catch (_) {
    /* best-effort */
  }
  return event;
}

/** Middleware de Express: Sentry errorHandler. Va DESPUÉS del logger. */
const errorHandler = (err, req, res, next) => {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(err, {
      extra: { method: req.method, path: req.path },
    });
  }
  next(err);
};

/** Captura una excepción manualmente (no-op si Sentry no está activo). */
function captureException(err, extra) {
  if (Sentry && Sentry.captureException) {
    Sentry.captureException(err, extra);
  }
}

module.exports = {
  init,
  errorHandler,
  scrubEvent,
  captureException,
  isEnabled: () => initialized && !!Sentry,
};