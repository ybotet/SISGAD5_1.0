# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-11-27

### Added
- **TASK-220-04 (flujo Asignada→Trabajo):** al crear una asignación (`POST /api/mp/asignacion`) se genera automáticamente un Trabajo en estado Abierto con los operarios asignados y fecha de inicio, en la misma transacción, y la queja pasa a Asignada; la respuesta incluye `trabajoId`. Nuevo `PATCH /api/mp/trabajo/:id/resolver` (`completado` → queja Resuelta, `pendiente` → queja Pendiente) con validación de estado (409 si el trabajo no está Abierto o la queja no está Asignada) y auditoría. `POST /api/mp/trabajo` queda solo para trabajos sin queja (uso interno). Backfill `scripts/backfill-trabajos-desde-asignaciones.js` para quejas Asignadas sin trabajo.

### Changed
- **Frontend (QuejaDetallesModal):** con la queja en Asignada se ocultan los botones de acciones anteriores y se muestra el bloque "Trabajo en curso" con un único botón "Resolver trabajo" (modal Completado/Pendiente + fechaFin + observaciones + duración real). i18n es/ru ampliado.
- **Docs:** `ARCHITECTURE.md` (diagrama de estados Asignada→Resuelta|Pendiente vía Trabajo) y `docs/10_api_contracts.es.md` / `.ru.md` actualizados.

## [Unreleased]

### Added
- **TASK-220-04:** SDK Sentry por servicio (no-op sin DSN) — `@sentry/node@9` en gateway/users/mp (`config/sentry.js`: init condicional, scrub PII en `beforeSend`, `errorHandler` tras el logger, endpoint `/test-error` en dev o con `SENTRY_TEST_ERROR=true`); `getsentry/sentry-go@v0.50.0` en materiales (`internal/middleware/sentry.go`: captura panic/5xx + `FlushSentry` en shutdown, cableado en `cmd/api/main.go`); `@sentry/react@9` en frontend (`config/sentry.ts`: `release`=git sha, scrub PII, `initSentry()` en `main.tsx`); `frontend/Dockerfile` ARG→ENV `VITE_SENTRY_*` y `cd.yml` build-args con `secrets.VITE_SENTRY_DSN_FRONTEND`; `.env.example` con DSNs y sample rates; `scripts/setup-sentry-secrets.md`. **Pendiente humano (bloqueante):** crear 5 proyectos Sentry y cargar `SENTRY_DSN_*`/`VITE_SENTRY_DSN_FRONTEND` en GH Secrets + `/opt/sisgad5/.env`.
- **TASK-100-06:** Matriz de trazabilidad Requisito->Caso de Uso->Endpoint->Test generada con script semi-automatizado (scripts/gen-traceability.py); 72 requisitos, 12 huérfanos sin test, 2 endpoints sin requisito; depende de revisión humana para cerrar GAPs
- **TASK-210-02 / TASK-900-01 / TASK-900-02 / TASK-900-03:** CD operativo — `cd.yml` construye y publica 5 imágenes por servicio (matriz, tags `sha-<commit>` + `latest`); job `deploy` con entorno `production` (aprobación manual) ejecuta `deploy.sh` por SSH (login GHCR, `compose pull`, `up -d`, healthcheck 60 s, rollback automático al tag anterior vía `CURRENT_TAG`); `deploy.sh` parametrizado con `IMAGE_TAG`; `workflow_dispatch` para dry-run; `docker-compose.prod.yml` referencia imágenes GHCR por `IMAGE_PREFIX`/`IMAGE_TAG`
- **TASK-210-04:** Branch protection en `main` mediante ruleset (require PR + 1 review, status checks lint/test obligatorios, block force pushes). Evidencia: GitHub Settings → Rules → Rulesets.

### Fixed
- **Bug al crear queja (500):** `logAuditoria` usaba placeholders posicionales `$1..$8` con `replacements` en array, que Sequelize no enlazaba (`no hay parámetro $1`) y revertía la transacción. Se cambiaron a placeholders `?` (enlazado posicional seguro). Afecta a toda operación auditada (Queja/Trabajo/Línea/Pizarra).
- **Bug al crear asignación (500):** `getEstadoClave` usaba `Clave.findOrCreate` dentro de la transacción; con la secuencia de `tb_clave` desincronizada (tabla poblada manualmente) el INSERT con `DEFAULT` en la PK lanzaba `SequelizeUniqueConstraintError` y el re-SELECT por `clave` no lo recuperaba. Reescrito para reutilizar la fila existente (`findOne`) o crearla con `id_clave` explícito (`max+1`), sin depender de la secuencia.

### 📚 Documentación
- **TASK-C-01:** Renombrado 18 archivos `docs/*.md` a `docs/*.es.md` y corregidos enlaces internos
- **TASK-C-02:** Creadas 13 archivos `.ru.md` traduciendo documentación existente (18 total)
- **TASK-C-03:** Movido `AUDITORIA.md` a `docs/audit/AUDITORIA.md`
- **TASK-C-04:** Fusionado `docs/requirements.md` en `docs/05_requirements.es.md`
- **TASK-C-05:** Fusionado `docs/roadmap.md` en `docs/17_roadmap.es.md`
- Verificación de 0 enlaces rotos en archivos `.es.md` y `.ru.md`
- Reorganización de la estructura del repositorio según `ESTRUCTURA.md`
- Migración de documentación del repositorio SISGAD5_doc al repositorio principal
- Creación de `AGENT.md`, `SPEC.md`, `ARCHITECTURE.md` y `TASKLIST.md`
- Creación de `CHANGELOG.md` (Keep a Changelog + SemVer)
- Creación de `CONTRIBUTING.md` con convenciones de ramas, commits y PRs
- Documentación de APIs en `docs/api/` (OpenAPI 3.0 YAML specs)
- Creación de `docs/requirements.md` consolidando todos los requisitos del sistema
- Creación de `docs/architecture.md` con diagramas Mermaid y decisiones arquitectónicas (ADRs)
- Creación de `docs/roadmap.md` con roadmap de desarrollo detallado
- Añadida sección 6.7 (Prediction Service) en `SPEC.md`
- Actualizada `PROMPTS.md` con FASE 9 (MLOps y Prediction Service)
- Actualizada `memory.md` con ADR-004 (Prediction Service)

### 🌟 Features (Prediction Service)
- Agregado módulo Prediction Service (Python 3.11+ + FastAPI + scikit-learn + XGBoost + Prophet)
- Nueva base de datos `bd_predictions` (PostgreSQL) para datos predictivos
- MLflow (Model Registry) y Apache Airflow (pipelines) como stack MLOps
- 6 endpoints predictivos: `/api/predictions/{demanda,tiempo,anomalias,prioridad,fallos,asignacion}`
- Nuevas ADRs: ADR-004 (Arquitectura ML), ADR-005 (FastAPI), ADR-006 (MLflow + Airflow)
- Añadido `pytest + pytest-cov` al stack de testing

### 🐛 Bug Fix
- Corregido `setupPostgresTimezone` function missing en `backend-mp/src/config/database.js`
- Corregido path de `.env.local` en `backend-mp/src/config/database.js` (de `../../` a `../../../`)
- Corregido `DB_PASSWORD` incorrecto en `backend-materiales-go/.env` (`password` → `postgres`)
- Corregido referencia incorrecta a "Gin" → "gorilla/mux" en archivos de documentación

### 🔒 Seguridad
- Rotados `JWT_SECRET` y `DB_PASSWORD` con entropía criptográfica (`crypto.randomBytes`); valores en `.env.local`/`.env` (gitignored)
- Eliminado fallback `JWT_SECRET || "secreto"` en `backend-mp`; validación de arranque en `backend-users` y `backend-mp`
- **TASK-A-10:** `docker-compose.prod.yml` — cerrados puertos internos (5001, 5002, 5003, 5432) en producción
- Añadido `backend-materiales-go` y `frontend` services a `docker-compose.prod.yml` con exposición mínima de puertos (solo 5000 localhost + 5004)
- **TASK-A-11:** Reemplazado `GF_SECURITY_ADMIN_PASSWORD=admin` por `${GRAFANA_ADMIN_PASSWORD}` en `docker-compose.yml`; añadida variable a `.env.example`
- **TASK-A-12:** Corregido `DB_NAME=${MP_DB_NAME}` → `MP_DB_NAME=${MP_DB_NAME}` en `docker-compose.yml`; el Zod schema de `backend-mp` consumía `MP_DB_NAME`, no `DB_NAME`, lo que provocaba abort en arranque
- Archivos `.env.docker` y `.env.production` removidos de git
- Añadida excepción `!.env.example` en `.gitignore`

### 🚀 Infraestructura
- Creación de `.github/projects/sisgad5-roadmap.yml` con configuración del tablero
- Creación de `scripts/setup-github-project.sh` para configurar GitHub Projects
- **TASK-B-20:** Migraciones versionadas + índices (28 tablas MP, users): `migrations/`, `.sequelizerc`, `sequelize.config.js`, scripts `db:migrate`/`db:migrate:undo`, `sync({ alter: false })`
- **TASK-B-21:** Jest + Supertest en `backend-mp` (21 tests) y `backend-users` (11 tests); `server.js` exporta `app` con listen condicional
- `.sequelizerc` añadido a `.gitignore`

---

## [1.0.0] - 2026-09-20

### Added
- **Auth Module**: JWT-based authentication with access/refresh token rotation
- **Users Module**: CRUD for usuarios with RBAC (5 roles: admin, probador, editor, visor, admin_materiales)
- **MP Module**: 
  - Gestión de Teléfonos (CRUD con clasificación de cliente)
  - Gestión de Líneas (CRUD)
  - Gestión de Pizarras (CRUD, mapeo de puertos, ubicación física)
  - Gestión de Quejas (registro, priorización automática, FSM de estados)
  - Gestión de Pruebas (registro con resultados y mediciones)
  - Gestión de Trabajos (órdenes, asignación, cierre con tiempo real)
- **Materials Module**:
  - Catálogo de Materiales (CRUD con categorías y unidades)
  - Asignaciones (transaccional, captura de precio momento)
  - Consumos (transaccional, captura de precio real)
  - Dashboard analítico con KPIs y saldo lógico
- **API Gateway**: Rutas agrupadas, health checks agregados
- **Frontend**: Dashboard principal, módulos de quejas y materiales

### Changed
- Migración de sistema monolítico Access → arquitectura de microservicios
- Separación de bases de datos por servicio (bd_users, bd_mp, bd_materiales)

### Fixed
- Control de concurrencia en operaciones de stock (lock distribuido con Redis)

### Security
- JWT con expiración corta (15 min access, 7 días refresh)
- Rate limiting por IP y usuario

---

## [0.3.0] - 2025-08-25

### Added
- Workers de Telegram para notificaciones de stock bajo
- Dashboard de materiales en frontend
- Endpoint de estadísticas MP

### Changed
- Refactorización de servicios de materiales a Go (backend-materiales-go)
- Implementación de concurrencia con goroutines para validación de stock

---

## [0.2.0] - 2025-07-15

### Added
- FSM para estados de queja
- Registro de pruebas técnicas
- Dashboard de KPIs

### Changed
- Separación del módulo de materiales como microservicio independiente

---

## [0.1.0] - 2025-06-01

### Added
- Estructura base de microservicios
- Auth Service (Node.js + Express + Sequelize)
- MP Service (Node.js + Express + Sequelize)
- Docker Compose para desarrollo

---

## Formato del Changelog

| Símbolo | Tipo de Cambio |
|---------|----------------|
| 📈 | Feature nueva |
| 🐛 | Bug fix |
| ⚡ | Mejora de performance |
| 🔒 | Seguridad |
| 📚 | Documentación |
| 🎨 | Estética / UI |
| ♻️ | Refactor |
| 🗑️ | Deprecación / remoción |
| 🚀 | Deploy / CI-CD |
| ✅ | Test |
| ⚠️ | Nota importante |

---

## Estado de Reglas de Negocio por Versión

| Versión | Reglas cubiertas |
|---------|-----------------|
| v1.0.0 | BR-01 ✅, BR-02 ✅, BR-03 ✅, BR-04 ✅, BR-05 ✅, BR-06 ✅, BR-07 ✅, BR-08 ⚠️, BR-09 ✅, BR-10 ✅, BR-11 ⚠️, BR-12 ✅ |
| v0.3.0 | BR-03 ✅, BR-04 ✅, BR-07 ✅, BR-08 ⚠️, BR-09 ⚠️ |
| v0.2.0 | BR-03 ✅, BR-04 ✅ |
| v0.1.0 | BR-01 ✅ |

---

## Referencias

- [TASKLIST.md](./TASKLIST.md)
- [SPEC.md](./SPEC.md)
- [Tesis - Testing](../docs/thesis/05_results.md)


