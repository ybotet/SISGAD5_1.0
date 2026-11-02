# Auditoría — SISGAD5

> Generado por el agente `project-auditor` (solo lectura del código; este archivo es el entregable del informe).
> Skills aplicados: `sisgad5-architecture`, `code-audit-methodology`, `sisgad-microservices-audit`, `sisgad-go-audit`, `nodejs-audit`, `report-generation`.

## 1. Resumen Ejecutivo

- **Proyecto auditado:** SISGAD5 1.0 (gestión de quejas y servicios de telecomunicaciones).
- **Fecha:** 7 de octubre de 2026.
- **Alcance:** `api-gateway/`, `backend-users/`, `backend-mp/`, `backend-materiales-go/`, `frontend/`, `docker-compose.yml`, CI (`.github/workflows/ci.yml`) y contraste con `AGENT.md` / `ARCHITECTURE.md` / skills del repositorio.
- **Fuera de alcance:** ejecución de la aplicación, tests en runtime y revisión de secretos locales no versionados (`.env.local`).
- **Veredicto general:** Hay una arquitectura de microservicios reconocible (gateway, tres contextos de datos, RBAC en Users, Zod en MP, transacciones GORM en asignaciones/consumos). La frontera de seguridad **no cumple** lo documentado: el gateway no valida JWT, Materials no autentica, y varios puertos internos están publicados. El cierre de queja no orquesta materiales. Predicción, Redis y Prometheus aparecen en la documentación y no en el código/compose revisado.

## 2. Estadísticas

| Severidad | Cantidad |
|-----------|----------|
| Crítico | 3 |
| Alto | 11 |
| Medio | 10 |
| Bajo | 4 |

**Módulos con más hallazgos:** `backend-materiales-go`, `api-gateway`, `backend-mp`, `docker-compose.yml`.

## 3. Hallazgos por Área

### Seguridad

| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| SEC-01 | Crítico | Login firma JWT con fallback `"secreto"` si falta `JWT_SECRET`. | `backend-users/src/controllers/AuthController.js:120-126`; `backend-mp/src/controllers/AuthController.js:106-112` | Fallar al arrancar si el secreto no existe (como Zod en MP `src/config/env.js:26`). Quitar el fallback. |
| SEC-02 | Crítico | Materials no tiene middleware JWT. CORS admite `Authorization`, pero no se verifica. Compose publica `5003:5003`. | `backend-materiales-go/cmd/api/main.go:116-177`, `208-214`; `docker-compose.yml:101-102` | JWT + RBAC en Go; no publicar el puerto fuera de la red Docker fuera de desarrollo. |
| SEC-03 | Crítico | Grafana con usuario/contraseña `admin`/`admin` y puerto 3000 publicado. | `docker-compose.yml:192-199` | Credenciales de despliegue; no exponer Grafana en claro. |
| SEC-04 | Alto | Gateway: CORS `origin: true` (refleja cualquier Origin) si no hay `CORS_ORIGIN`; CSP de Helmet desactivada. | `api-gateway/src/server.js:23-40` | Lista blanca de orígenes; CSP en producción. |
| SEC-05 | Alto | El gateway solo hace proxy; no verifica JWT. Users/MP sí; Materials no. Quien llega a `:5001/:5002/:5003` evita el rate-limit de auth del gateway. | `api-gateway/src/server.js:86-140`; `docker-compose.yml:33-34`, `63-64` | Auth en gateway y en cada servicio; no mapear puertos internos. |
| SEC-06 | Alto | RBAC incompleto en el dominio: `tienePermiso` comentado o no usado en queja, trabajo, teléfono, línea, pizarra, movimiento; `asignacion` importa el middleware y no lo aplica. Cualquier JWT válido puede crear/borrar. | `backend-mp/src/routes/queja.js:5-7`; `trabajo.js:5-7,27-41`; `asignacion.js:4-13` | Permisos por operación (`quejas.crear`, `quejas.cerrar`, etc.) alineados a `docs/12_rbac_matrix.md`. |
| SEC-07 | Alto | SQL del dashboard interpola fechas en el string. Depende de `normalizeDateRange`; no son consultas parametrizadas. | `backend-mp/src/controllers/QuejaController.js:830-838` | Bind parameters (`replacements`) de Sequelize. |
| SEC-08 | Medio | `DebugLogin` con credenciales fijas. | `frontend/src/pages/auth/DebugLogin.tsx:14` | Quitar de builds de producción. |

### Arquitectura / microservicios

| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| ARC-01 | Alto | Documentación ≠ código: Materials es gorilla/mux, no Gin; no hay Prediction/Redis/Prometheus en compose; un solo Postgres y `POSTGRES_DB: sisgad5-users`. | `ARCHITECTURE.md:25-38`; `backend-materiales-go/cmd/api/main.go:13`; `docker-compose.yml:4-10`, `156-211` | Actualizar docs o implementar lo prometido. El skill `sisgad5-architecture` también indica Gin. |
| ARC-02 | Alto | MP valida JWT y en cada request llama a Users `GET /api/auth/perfil`. Acoplamiento + SPOF: si Users cae, MP autenticado también. | `backend-mp/src/middleware/auth.js:17-43` | Claims de rol en el JWT o caché con TTL; timeout/circuit breaker. |
| ARC-03 | Alto | Cerrar queja solo actualiza MP. No hay llamada HTTP a Materials ni saga/compensación (sí descrita en `ARCHITECTURE.md`). | `backend-mp/src/controllers/QuejaController.js:664-708` | Orquestar consumo/stock al cerrar, o evento + compensación. |
| ARC-04 | Alto | Compose inyecta `DB_NAME=${MP_DB_NAME}`; MP valida y usa `MP_DB_NAME`. En contenedor Zod puede abortar el arranque. | `docker-compose.yml:70`; `backend-mp/src/config/env.js:23`; `backend-mp/src/config/database.js:22-23` | Pasar `MP_DB_NAME` (y el resto del schema) al servicio. |
| ARC-05 | Medio | Health checks no prueban PostgreSQL. Gateway `/health` es liveness local; `/health/services` usa `fetch(..., { timeout })` (opción que no aplica en `fetch` nativo). | `api-gateway/src/server.js:147-174`; health de users/mp/go | Readiness con ping a BD; `AbortSignal.timeout`. |
| ARC-06 | Medio | `X-Request-Id` se genera por servicio, no se propaga en el proxy. | `api-gateway/src/middleware/requestLogger.js`; `api-gateway/src/server.js:69-74` | Copiar/inyectar el header al upstream. |
| ARC-07 | Medio | Gateway no declara `MATERIALES_SERVICE_URL` ni `depends_on` de materiales (el default DNS `backend-materiales` puede salvarlo). | `docker-compose.yml:109-130` | Variable explícita y dependencia. |

### Lógica de negocio / API

| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| BUS-01 | Alto | Verificación de stock al consumir está comentada; `verificarStockAsignacion` es placeholder (`_ = cantidad`). Riesgo de stock negativo. | `backend-materiales-go/internal/services/consumo_service.go:79-85`, `117-124` | Validar y descontar en la misma transacción GORM. |
| BUS-02 | Alto | Rutas `GET /dashboard/*` van después de `GET /:id`. Express trata `dashboard` como id. Los KPIs del dashboard de quejas no se alcanzan por esa URL. | `backend-mp/src/routes/queja.js:20`, `45-53` | Registrar `/dashboard/...` antes de `/:id`. |
| BUS-03 | Medio | Máquina de estados más laxa que `Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada` (p. ej. `Probada → Resuelta`). Cerrar permite `Resuelta` o `Probada`. | `backend-mp/src/controllers/QuejaController.js:567-574`, `695-697` | Unificar con SPEC/docs y tests de transición. |
| BUS-04 | Medio | `fecha` de queja es `STRING`, no `DATE`/`TIMESTAMP`. Complica índices y filtros. | `backend-mp/src/models/Queja.js:15-18` | Tipo fecha real + migración. |

### Datos

| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| DAT-01 | Alto | No hay carpeta `migrations/`. Users y MP hacen `sequelize.sync({ force: false })`. Sin índices `indexes:` en modelos. | `backend-users/src/models/index.js:38-40`; `backend-mp/src/models/index.js:306` | Migraciones versionadas; índices en `estado`, FKs, `fecha`. |
| DAT-02 | Medio | GORM `SkipDefaultTransaction: true`: las lecturas/escrituras sueltas no son transaccionales salvo donde hay `Transaction`. | `backend-materiales-go/internal/repositories/postgres/connection.go:29-30`; sí hay TX en `asignacion_repo.go` y `consumo_repo.go:21` | Mantener TX en todo cambio de stock; no ampliar escrituras fuera de TX. |
| DAT-03 | Medio | N+1: por cada consumo se cargan detalles en bucle. | `backend-materiales-go/internal/repositories/postgres/consumo_repo.go:60-66` | `Preload` / un JOIN. |

### Calidad / pruebas / frontend

| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| QA-01 | Alto | `npm test` en users y MP es `exit 1`. CI `test-js` no puede pasar. | `backend-users/package.json:10`; `backend-mp/package.json:10`; `.github/workflows/ci.yml:37-78` | Jest/Supertest reales o quitar el job. |
| QA-02 | Medio | Tests Go solo en servicios de consumo/asignación. Casi no hay tests de Node/Frontend. | `backend-materiales-go/internal/services/*_test.go` | Contratos de API y transiciones de queja. |
| QA-03 | Medio | Código muerto: `AuthController` de MP (no hay ruta `/auth`); hook `frontend/src/hooks/useAuth.ts` llama `/api/auth/me` (el backend expone `/perfil`). El login real usa `AuthContext`. | `backend-mp/src/controllers/AuthController.js`; `frontend/src/hooks/useAuth.ts:49`; `frontend/src/contexts/AuthContext.tsx:60-67` | Eliminar o conectar una sola vía. |
| QA-04 | Bajo | Duplicación de `authLimiter` en el gateway. | `api-gateway/src/middleware/rateLimit.js:9-23` | Un solo export. |
| QA-05 | Bajo | Comentario de rutas Go dice `/api/v1/`; las rutas son `/api/materiales`. | `backend-materiales-go/cmd/api/main.go:128-129`, `239` | Alinear logs/docs. |
| QA-06 | Bajo | `tienePermiso` recorre roles en un `forEach` que no usa el resultado. | `backend-mp/src/middleware/permissions.js:25-35` | Limpiar. |
| QA-07 | Bajo | Tipo `User` del hook muerto incluye `password_hash`. El login de users sí lo omite en la respuesta. | `frontend/src/hooks/useAuth.ts:6-7`; `backend-users/src/controllers/AuthController.js:129-130` | No modelar el hash en el cliente. |

### Controles que sí están implementados

- Hash de contraseñas con bcrypt (`backend-users/src/models/User.js:50-66`).
- Respuesta de login sin `password_hash` (`AuthController.js:129-130`).
- Zod en validaciones de MP (`backend-mp/src/validations/`) y `validate` en create/update de queja.
- Rate limit de login en gateway (`max: 5`).
- Frontend habla con el gateway (`frontend/src/services/api.ts:5`, `VITE_API_URL` → puerto 5000).
- `ProtectedRoute` y permisos en rutas de `frontend/src/App.tsx`.
- Transacciones GORM al crear consumo/asignación.
- Graceful shutdown en Go y en el gateway.

## 4. Recomendaciones Priorizadas

1. Cerrar Materials: JWT + autorización; dejar de publicar `:5003`, `:5001`, `:5002` y `:5432` fuera de la red interna.
2. Eliminar `JWT_SECRET || "secreto"` y exigir secreto ≥ 32 en Users (igual que MP).
3. Auth en el gateway además de en cada servicio; CORS/CSP de producción; Grafana sin credenciales por defecto.
4. RBAC en quejas, trabajos y asignaciones (hoy un usuario autenticado puede borrar).
5. Arreglar el orden de rutas del dashboard de quejas.
6. Stock real en transacción al registrar consumo; definir saga o compensación al cerrar queja.
7. Migraciones + índices; alinear `MP_DB_NAME` en Docker.
8. Sustituir el `npm test` placeholder y añadir tests de transiciones/contratos.
9. Actualizar `ARCHITECTURE.md` / `AGENT.md` (mux vs Gin, Redis, ML, Prometheus) o implementar esos componentes.
10. Propagar `X-Request-Id` y health checks que comprueben la BD.

## 5. Anexos

### Puntos de entrada

| Componente | Entrada | Puerto |
|------------|---------|--------|
| API Gateway | `api-gateway/src/server.js` | 5000 |
| Users | `backend-users/src/server.js` → `/api` | 5001 |
| MP | `backend-mp/src/server.js` → `/api/mp` | 5002 |
| Materials | `backend-materiales-go/cmd/api/main.go` | 5003 |
| Frontend | React + Vite | 5004 |

### Proxy del gateway (código actual)

- `/api/auth` → Users
- `/api/users` → Users (`pathRewrite` a `/api`)
- `/api/materiales` → Materials (Go)
- `/api/mp` → MP

### Flujo de autenticación real

- Login: Users `POST /api/auth/login`.
- Frontend: `authService` + `AuthContext`.
- MP revalida contra Users en cada petición.
- Go: sin autenticación.

### Documentación de contexto

- `AGENT.md`, `ARCHITECTURE.md`, `SPEC.md`, `TASKLIST.md`, `ESTRUCTURA.md`
- `docs/12_rbac_matrix.md`, `docs/13_security.md`, `docs/10_api_contracts.md`
