# Configuración de Sentry (TASK-220-04) — Acción humana

> El código ya está integrado y es **no-op** mientras no haya DSN. Esta guía cubre
> la **única parte bloqueante**: crear los proyectos en Sentry y cargar los DSN
> como secretos. Mientras no se haga, los servicios arrancan igual (no envían eventos).

## 1. Crear proyectos en Sentry

En [sentry.io](https://sentry.io) (o self-hosted), crea **5 proyectos**, uno por servicio:

| Servicio          | Proyecto Sentry (sugerido) | Variable de entorno / Secreto |
| ----------------- | -------------------------- | ----------------------------- |
| API Gateway       | `sisgad5-gateway`          | `SENTRY_DSN_GATEWAY`          |
| Backend Users     | `sisgad5-users`            | `SENTRY_DSN_USERS`            |
| Backend MP        | `sisgad5-mp`               | `SENTRY_DSN_MP`               |
| Backend Materiales| `sisgad5-materiales`       | `SENTRY_DSN_MATERIALS`        |
| Frontend (React)  | `sisgad5-frontend`         | `VITE_SENTRY_DSN_FRONTEND`    |

Copia el **DSN** de cada proyecto (Settings → Projects → [proyecto] → Client Keys (DSN)).

## 2. Cargar secretos en GitHub (producción)

GitHub → repo `ybotet/SISGAD5_1.0` → **Settings → Secrets and variables → Actions → New repository secret**:

| Secreto                   | Valor            |
| ------------------------- | ---------------- |
| `SENTRY_DSN_USERS`        | DSN users        |
| `SENTRY_DSN_MP`           | DSN mp           |
| `SENTRY_DSN_MATERIALS`    | DSN materiales   |
| `SENTRY_DSN_GATEWAY`      | DSN gateway      |
| `VITE_SENTRY_DSN_FRONTEND`| DSN frontend     |

> El frontend se compila en el job `build` del CD; para que el DSN quede embebido,
> el paso de build debe exponer `VITE_SENTRY_DSN_FRONTEND` como variable de entorno
> (p. ej. `env: VITE_SENTRY_DSN_FRONTEND: ${{ secrets.VITE_SENTRY_DSN_FRONTEND }}`).
> Ver `docs/14_deployment.es.md`.

## 3. Variables en el servidor de producción (deploy SSH)

En `/opt/sisgad5/.env` (no versionado) añade los DSN de los backends:

```
SENTRY_DSN_USERS=https://...ingest...
SENTRY_DSN_MP=https://...ingest...
SENTRY_DSN_MATERIALS=https://...ingest...
SENTRY_DSN_GATEWAY=https://...ingest...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=<git-sha>      # opcional; el CD puede inyectarlo
SENTRY_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## 4. Smoke test (validar que llega el evento)

Con un DSN configurado en local o en el servidor:

```bash
# Node (gateway/users/mp): endpoint /test-error (dev o SENTRY_TEST_ERROR=true)
curl -s http://localhost:5000/test-error
curl -s http://localhost:5001/test-error
curl -s http://localhost:5002/test-error
```

- Debe aparecer un evento en Sentry con el mensaje `Sentry smoke test (TASK-220-04)`.
- Para Materiales (Go), provoca un 5xx o un panic controlado en un entorno de pruebas.
- Para Frontend, fuerza un error en un handler (o `Sentry.captureException(new Error('smoke'))` en consola).

> Tras validar, desactiva el smoke test poniendo `SENTRY_TEST_ERROR=false` y
> quitando el DSN de los entornos de desarrollo.

## Criterios de aceptación cubiertos

- [x] SDK instalado por servicio (`@sentry/node`, `getsentry/sentry-go`, `@sentry/react`).
- [x] Init condicional (no-op sin DSN).
- [x] `sampleRate` 0.1 en prod; `tracesSampleRate` conservador.
- [x] Scrub de PII (Authorization/Cookie/email) en `beforeSend`.
- [x] Smoke test `/test-error` en los 3 servicios Node.
- [ ] DSN en secrets + evento verificado en Sentry → **acción humana (bloqueante)**.