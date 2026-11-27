# PENDIENTE HUMANO — TASK-220-04: Configurar Sentry (DSNs)

> **Estado:** ⏳ Pendiente (bloqueante para el cierre de TASK-220-04).
> **Código:** ya integrado y **no-op** mientras no haya DSN (los servicios arrancan igual).
> **Lo único que falta:** crear los proyectos en Sentry y cargar los DSN como secretos.
> **Responsable:** humano (requiere cuenta Sentry + acceso admin al repo GitHub + al servidor).
> **Fecha de registro:** 2026-11-27.

Esta guía es autónoma: sigue los pasos en orden y marca cada casilla al terminar.

---

## Resumen (qué vas a hacer)

1. Crear **5 proyectos** en Sentry (uno por servicio).
2. Copiar el **DSN** de cada proyecto.
3. Cargar los DSN como **GitHub Secrets** (para el build del frontend y el CD).
4. Añadir los DSN de backends al **`.env` del servidor** de producción.
5. (Opcional) Configurar **alertas** de excepciones en Sentry.
6. **Smoke test**: provocar un error y verificar que llega a Sentry.
7. Marcar TASK-220-04 como ✅ en `TASKLIST.md`.

---

## Paso 1 — Crear 5 proyectos en Sentry

En [sentry.io](https://sentry.io) (o tu instancia self-hosted) crea estos proyectos:

| # | Servicio          | Nombre sugerido      | Variable / Secreto         |
|---|-------------------|----------------------|----------------------------|
| 1 | API Gateway       | `sisgad5-gateway`    | `SENTRY_DSN_GATEWAY`       |
| 2 | Backend Users     | `sisgad5-users`      | `SENTRY_DSN_USERS`         |
| 3 | Backend MP        | `sisgad5-mp`         | `SENTRY_DSN_MP`            |
| 4 | Backend Materiales| `sisgad5-materiales` | `SENTRY_DSN_MATERIALS`     |
| 5 | Frontend (React)  | `sisgad5-frontend`   | `VITE_SENTRY_DSN_FRONTEND` |

Para cada proyecto: **Settings → Projects → [proyecto] → Client Keys (DSN)** y copia el DSN
(tiene la forma `https://<clave>@o<org>.ingest.sentry.io/<id>`).

> Recomendado: un solo **team** y un solo **proyecto por servicio** para separar alertas y
> tasas de muestreo. El plan gratuito (Free) admite varios proyectos.

- [ ] 5 proyectos creados y DSN copiados.

---

## Paso 2 — Cargar secretos en GitHub (Actions)

GitHub → repo `ybotet/SISGAD5_1.0` → **Settings → Secrets and variables → Actions →
New repository secret**. Crea estos 5:

| Secreto                    | Valor                          |
|----------------------------|--------------------------------|
| `SENTRY_DSN_USERS`         | DSN del proyecto users         |
| `SENTRY_DSN_MP`            | DSN del proyecto mp            |
| `SENTRY_DSN_MATERIALS`     | DSN del proyecto materiales    |
| `SENTRY_DSN_GATEWAY`       | DSN del proyecto gateway       |
| `VITE_SENTRY_DSN_FRONTEND` | DSN del proyecto frontend      |

> El frontend embebe `VITE_SENTRY_DSN_FRONTEND` en el build del CD (ya cableado en
> `.github/workflows/cd.yml` → `build-args`). Los backends reciben los suyos por el `.env`
> del servidor (Paso 3), no por Actions.

- [ ] 5 secretos creados en GitHub.

---

## Paso 3 — Añadir DSN al `.env` del servidor de producción

En el servidor, edita `/opt/sisgad5/.env` (no versionado) y añade:

```dotenv
# Sentry (TASK-220-04)
SENTRY_DSN_USERS=https://...ingest...
SENTRY_DSN_MP=https://...ingest...
SENTRY_DSN_MATERIALS=https://...ingest...
SENTRY_DSN_GATEWAY=https://...ingest...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=<git-sha-del-deploy>   # opcional; el CD puede inyectarlo
SENTRY_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.1
```

> `docker-compose.prod.yml` debe pasar estas variables a los contenedores de backends.
> Si tu compose ya inyecta `.env` por defecto (`env_file`), no hace falta nada más;
> si no, añade `SENTRY_DSN_*` al bloque `environment:` de cada servicio.

Reinicia los servicios tras editar el `.env`:

```bash
cd /opt/sisgad5
docker compose -f docker-compose.prod.yml up -d
```

- [ ] `.env` actualizado y servicios reiniciados.

---

## Paso 4 (opcional) — Alertas en Sentry

Para que Sentry **notifique** (no solo almacene):

- **Sentry → Alerts → Create Alert** → *Issues* → regla por defecto
  ("Alert me on new issues / regressions").
- Configura el canal (Email del equipo, Slack, etc.).
- Ajusta umbrales para evitar ruido (p. ej. solo issues nuevos o de nivel error).

- [ ] Al menos una regla de alerta creada (opcional).

---

## Paso 5 — Smoke test (verificar que llega el evento)

### Backends Node (gateway/users/mp)
El endpoint `/test-error` está activo en **dev** o con `SENTRY_TEST_ERROR=true`:

```bash
curl -s http://localhost:5000/test-error   # gateway
curl -s http://localhost:5001/test-error   # users
curl -s http://localhost:5002/test-error   # mp
```

Espera unos segundos y confirma en Sentry un evento con el mensaje
`Sentry smoke test (TASK-220-04)`.

### Backend Materiales (Go)
No hay endpoint de prueba; genera un 5xx controlado en un entorno de pruebas
(p. ej. una ruta que devuelva 500) o fuerza un `panic` temporal en una rama local.
El middleware captura panics y 5xx.

### Frontend (React)
En la consola del navegador (app cargada con el DSN):

```js
Sentry.captureException(new Error('Sentry smoke test frontend (TASK-220-04)'))
```

> Tras validar, **desactiva** el smoke test: `SENTRY_TEST_ERROR=false` y quita los DSN
> de los entornos de desarrollo/local.

- [ ] Evento recibido en Sentry para cada servicio.
- [ ] Smoke test desactivado en producción.

---

## Paso 6 — Cerrar la tarea

Cuando los pasos 1–3 (y 5) estén hechos, marca en `TASKLIST.md`:

```
| ✅ Completada | TASK-220-04 | ... | Evidencia: 5 proyectos Sentry + DSN en GH Secrets y /opt/sisgad5/.env; evento verificado |
```

Y recalcula el Resumen de Progreso con `scripts/count-tasks.py`.

---

## Criterios de aceptación (recordatorio)

- [x] SDK instalado por servicio (`@sentry/node`, `getsentry/sentry-go`, `@sentry/react`).
- [x] Init condicional (no-op sin DSN).
- [x] `sampleRate` 0.1 en prod; `tracesSampleRate` conservador.
- [x] Scrub de PII (Authorization/Cookie/email) en `beforeSend`.
- [x] Smoke test `/test-error` en los 3 servicios Node.
- [ ] **DSN en secrets + evento verificado en Sentry** → este pendiente humano.

---

## Archivos de referencia

- Código: `backend-*/src/shared/config/sentry.js`, `api-gateway/src/config/sentry.js`,
  `backend-materiales-go/internal/middleware/sentry.go`, `frontend/src/config/sentry.ts`.
- Config: `.env.example`, `.github/workflows/cd.yml`, `frontend/Dockerfile`.
- Guía técnica corta: `scripts/setup-sentry-secrets.md`.