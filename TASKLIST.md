# ✅ TASKLIST.md — Lista de Tareas del Proyecto SISGAD5

> **Versión:** 2.0 (auditada contra el código real del repositorio)
> **Proyecto:** SISGAD5 — Sistema de Información para la Gestión y Soporte de la Dirección No. 5
> **Repositorio de documentación:** https://github.com/ybotet/SISGAD5_doc
> **Repositorio de implementación:** https://github.com/ybotet/SISGAD5_1.0
> **Autor:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> **Objetivo:** Guiar a los agentes de IA en la ejecución sistemática de todas las tareas del proyecto, desde el inicio hasta el fin.
> **Estado:** En progreso

---

## 📑 Tabla de Contenidos

1. [Leyenda y Convenciones](#1-leyenda-y-convenciones)
2. [FASE 0 — Planificación y Documentación Base](#2-fase-0--planificación-y-documentación-base)
3. [FASE 1 — Diseño y Modelado](#3-fase-1--diseño-y-modelado)
4. [FASE 2 — Infraestructura y Configuración](#4-fase-2--infraestructura-y-configuración)
5. [FASE 3 — Desarrollo: Users Service](#5-fase-3--desarrollo-users-service)
6. [FASE 4 — Desarrollo: MP Service](#6-fase-4--desarrollo-mp-service)
7. [FASE 5 — Desarrollo: Materials Service](#7-fase-5--desarrollo-materials-service)
8. [FASE 6 — Desarrollo: API Gateway](#8-fase-6--desarrollo-api-gateway)
9. [FASE 7 — Desarrollo: Frontend](#9-fase-7--desarrollo-frontend)
10. [FASE 8 — Testing y QA](#10-fase-8--testing-y-qa)
11. [FASE 9 — Despliegue y Operación](#11-fase-9--despliegue-y-operación)
12. [FASE 10 — Analítica y Reportes](#12-fase-10--analítica-y-reportes)
13. [FASE 11 — Documentación Final y Defensa](#13-fase-11--documentación-final-y-defensa)
14. [FASE 12 — Mantenimiento y Evolución](#14-fase-12--mantenimiento-y-evolución)
15. [Resumen de Progreso](#15-resumen-de-progreso)
16. [Registro de Auditoría](#16-registro-de-auditoría-v20)

---

## 1. Leyenda y Convenciones

### Estados de Tarea
| Símbolo | Significado            |
| ------- | ---------------------- |
| ✅      | Completada             |
| 🔄      | En progreso            |
| ⏳      | Pendiente              |
| 🚫      | Bloqueada (actualmente sin uso)  |
| ❌      | Cancelada / Descartada |

### Prioridades
| Símbolo | Prioridad            |
| ------- | -------------------- |
| 🔴     | Crítica (bloqueante) |
| 🟡     | Alta                 |
| 🟢     | Media                |
| ⚪      | Baja                 |

### Estimación de Esfuerzo
| Símbolo | Duración estimada |
| ------- | ----------------- |
| ⚡      | < 1 hora          |
| 🔨     | 1–4 horas         |
| 🏗️   | 1–3 días          |
| 🏛️   | > 3 días          |

### Formato de Tarea
Las tareas se gestionan en tablas Markdown con las columnas: **Estado | ID | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados**.

> **Nota de auditoría v2.0:** la columna *Evidencia Actual* documenta qué existe hoy en el repositorio (verificada por inspección de código), para justificar el estado asignado.

---

## 2. FASE 0 — Planificación y Documentación Base

### 2.1. Documentación del Proyecto

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-000-01 | Alta | 🔨 | Crear README.md principal (ES/RU) | Humano | — | README con descripción, arquitectura, stack, enlaces y quickstart; versiones ES y RU equivalentes | Existe `README.md` y `README.es.md` completos | `README.md`, `README.es.md` |
| ✅ Completada | TASK-000-02 | Alta | 🔨 | Crear AGENT.md con instrucciones para agentes de IA | Humano + IA | — | Documento con contexto del proyecto, reglas de trabajo, estructura y formato de reporte para agentes | `AGENT.md` presente en la raíz | `AGENT.md` |
| ✅ Completada | TASK-000-03 | Alta | 🔨 | Crear SPEC.md con especificación técnica completa | Humano + IA | — | SPEC con arquitectura, módulos, contratos de datos y roadmap; coherente con el código actual | `SPEC.md` presente; verificar consistencia periódica con `docs/` | `SPEC.md` |
| ✅ Completada | TASK-000-04 | Alta | 🔨 | Crear CHANGELOG.md | Agente | — | Formato Keep a Changelog + SemVer; entrada por cada hito relevante con fecha | `CHANGELOG.md` existe con v1.0.0 (2026-09-20); falta mantenerlo al día por servicio | `CHANGELOG.md` |
| ✅ Completada | TASK-000-05 | Alta | 🔨 | Crear CONTRIBUTING.md con convenciones | Agente | — | Convenciones de ramas, commits, PRs y setup local documentadas; plantilla de PR activa | `CONTRIBUTING.md` + `.github/PULL_REQUEST_TEMPLATE.md` e ISSUE_TEMPLATE presentes | `CONTRIBUTING.md`, `.github/` |
| ✅ Completada | TASK-000-06 | Media | 🔨 | Documentar requisitos funcionales y no funcionales | Agente | — | Requisitos RF/RNF numerados, trazables a casos de uso, en `/docs/` | `docs/05_requirements.md` existe (la ruta original `docs/requirements.md` se ajustó a la convención numerada) | `docs/05_requirements.md` |
| ✅ Completada | TASK-000-07 | Media | 🔨 | Documentar arquitectura con diagramas y decisiones | Agente | — | Diagrama de despliegue/componentes (Mermaid o imagen) + ADRs de decisiones clave | `ARCHITECTURE.md` y `docs/` cubren la arquitectura; **débil**: sin ADRs formales ni diagramas Mermaid consolidados | `ARCHITECTURE.md`, `docs/` |
| ⏳ Pendiente | TASK-000-08 | Alta | 🔨 | Crear roadmap de desarrollo en GitHub Projects | Humano | — | Tablero público con columnas Backlog / In Progress / Review / Done, enlazado desde el README | No verificable en el repo; este TASKLIST.md es el sustituto interno | GitHub Projects |

**Subtotal FASE 0: 7/8 (87.5%)**

---

## 3. FASE 1 — Diseño y Modelado

### 3.1. Modelado del Sistema (Repositorio SISGAD5_doc / docs/)

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-100-01 | 🔴 | 🏗️ | Diagrama/documento de casos de uso (24 casos, 7 actores) | Humano | — | Catálogo completo de casos con actores, flujos principales/alternativos y relaciones include/extend | `docs/03_use_cases.md` y `docs/02_actors.md` documentados | `docs/02`, `docs/03` |
| ✅ Completada | TASK-100-02 | 🔴 | 🏗️ | Diagrama de clases/modelo de dominio (28 clases, 5 contextos) | Humano | — | Modelo de dominio con atributos, relaciones y contextos delimitados | `docs/07_domain_model.md` + `docs/11_data_model.md` | `docs/07`, `docs/11` |
| 🔄 En progreso | TASK-100-03 | 🔴 | 🏗️ | Diagrama de paquetes (5 paquetes/servicios) | Humano | — | Diagrama con dependencias entre gateway, servicios, frontend e infra | Cubierto parcialmente en texto por `ARCHITECTURE.md`/`ESTRUCTURA.md`; falta diagrama formal UML | `ARCHITECTURE.md`, `docs/` |
| 🔄 En progreso | TASK-100-04 | 🔴 | 🏗️ | Diagramas de secuencia (3 escenarios críticos) | Humano | — | 3+ escenarios (registro de queja, asignación de materiales, autenticación) con mensajes numerados | `docs/08_sequence_diagrams.md` existe como texto; sin diagramas renderizables (Mermaid/PlantUML) | `docs/08_sequence_diagrams.md` |
| ✅ Completada | TASK-100-05 | 🔴 | 🔨 | Diccionario de términos (Ubiquitous Language) | Humano | — | Términos del dominio definidos y unificados (ES/RU) | `docs/04_glossary.md` presente | `docs/04_glossary.md` |
| ⏳ Pendiente | TASK-100-06 | 🔴 | 🔨 | Matriz de trazabilidad | Humano | TASK-000-06, TASK-100-01 | Tabla Requisito → Caso de uso → Endpoint/Clase → Test, sin huérfanos | No existe documento de trazabilidad | `docs/` |
| ✅ Completada | TASK-100-07 | 🔴 | 🔨 | User Story Map | Humano | — | Mapa de historias por actor con liberaciones (MVP/v1/v2) | `docs/practices/practice_02_user_story_map.md` | `docs/practices/` |
| ✅ Completada | TASK-100-08 | 🔴 | 🔨 | Event Storming | Humano | — | Eventos de dominio, comandos y agregados identificados y documentados | `docs/practices/practice_03_event_storming.md` | `docs/practices/` |

### 3.2. Diseño de Contratos y Modelos

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-110-01 | 🔴 | 🔨 | Contrato OpenAPI 3.0 para Users Service | Agente | TASK-100-01 | YAML válido (lint sin errores) con cobertura exacta de los endpoints implementados | `docs/api/users.yaml` existe pero **promete `/auth/refresh`, `/auth/logout` y `/users` que aún no están implementados**, y omite `/auth/perfil`, `/user` y `/roles` reales → contract drift | `docs/api/users.yaml` |
| 🔄 En progreso | TASK-110-02 | 🔴 | 🔨 | Contrato OpenAPI 3.0 para MP Service | Agente | TASK-100-01 | YAML válido alineado con las rutas reales del servicio | `docs/api/mp.yaml` documenta un contrato aspiracional (`/mp/quejas/{id}/asignar`, `/pizarras/{id}/puertos`, catálogos) distinto de las rutas reales (`/queja`, `/telefono`, 27 nomencladores); sí existen `mp_swagger.json` y anotaciones JSDoc en controladores | `docs/api/mp.yaml` |
| ✅ Completada | TASK-110-03 | 🔴 | 🔨 | Contrato OpenAPI/Swagger para Materials Service | Humano | — | Swagger UI funcional servido por el backend Go | `docs/api/materiales_swagger.json` + `materiales_swagger_index.html` | `docs/api/` |
| 🔄 En progreso | TASK-110-04 | Alta | 🔨 | Modelo ER consolidado de las 3 BD | Agente | — | Diagrama ER (Mermaid) de `bd_sisgad5_users`, `bd_sisgad5_mp`, `bd_sisgad5_materiales` con claves foráneas | `docs/11_data_model.md` describe el modelo; falta diagrama ER visual consolidado | `docs/11_data_model.md` |
| 🔄 En progreso | TASK-110-05 | Alta | 🔨 | Diseñar estrategia de autenticación (JWT + Refresh) | Agente | — | Documento con flujo access+refresh, expiraciones, rotación y revocación | `docs/13_security.md` documenta JWT; **el refresh token NO está implementado** (login emite un único token 24h) → ver TASK-300-03 | `docs/13_security.md` |
| ✅ Completada | TASK-110-06 | Alta | 🔨 | Mapear permisos RBAC por endpoint | Agente | — | Matriz rol × permiso × endpoint alineada con el middleware real | `docs/12_rbac_matrix.md` + middleware `permissions.js` (`tienePermiso('x.y')`) en uso | `docs/12_rbac_matrix.md` |

**Subtotal FASE 1: 7✅ + 6🔄 de 14 — 71.4% ponderado**

---

## 4. FASE 2 — Infraestructura y Configuración

### 4.1. Docker y Contenerización

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-200-02 | 🔴 | 🔨 | Dockerfile multi-stage para Users Service | Agente | — | Build reproducible; imagen final < 200 MB; arranca con variables de entorno | `backend-users/Dockerfile` presente | `backend-users/Dockerfile` |
| ✅ Completada | TASK-200-03 | 🔴 | 🔨 | Dockerfile multi-stage para MP Service | Agente | — | Ídem Users Service | `backend-mp/Dockerfile` presente | `backend-mp/Dockerfile` |
| ✅ Completada | TASK-200-04 | 🔴 | 🔨 | Dockerfile multi-stage para API Gateway | Agente | — | Ídem Users Service | `api-gateway/Dockerfile` presente | `api-gateway/Dockerfile` |
| ✅ Completada | TASK-200-05 | 🔴 | 🔨 | Dockerfile multi-stage para Frontend | Agente | — | Build Vite + servidor Nginx; SPA fallback configurado | `frontend/Dockerfile` presente | `frontend/Dockerfile` |
| ✅ Completada | TASK-200-01 | 🔴 | 🔨 | Dockerfile multi-stage para Materials Service | Humano | — | Imagen Go optimizada < 50 MB | `backend-materiales-go/Dockerfile` presente | `backend-materiales-go/Dockerfile` |
| ✅ Completada | TASK-200-06 | 🔴 | 🔨 | Docker Compose para desarrollo | Humano | — | `docker compose up -d` levanta DB + 4 servicios + frontend + monitoring | `docker-compose.yml` con postgres, redis, loki/promtail/grafana/prometheus | `docker-compose.yml` |
| ✅ Completada | TASK-200-07 | 🔴 | 🔨 | Docker Compose para producción | Humano | — | Sin volúmenes de dev, reinicios automáticos, secretos vía env | `docker-compose.prod.yml` + `deploy.sh` presentes | `docker-compose.prod.yml` |

### 4.2. CI/CD

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-210-01 | 🔴 | 🔨 | GitHub Actions CI (lint + test) | Humano | — | Jobs lint (4 servicios Node), test-js, test-go y quality-gate en cada PR | `.github/workflows/ci.yml` con matriz de lint, test-js, test-go, test-e2e y gate | `.github/workflows/ci.yml` |
| 🔄 En progreso | TASK-210-02 | Alta | 🔨 | GitHub Actions CD (build + push + deploy) | Agente | TASK-210-01 | Push de imágenes a GHCR en merge a `main` Y despliegue automático ejecutado | `cd.yml` construye y publica imágenes, pero **el paso de despliegue remoto está comentado/placeholder** | `.github/workflows/cd.yml` |
| ✅ Completada | TASK-210-03 | Alta | ⚡ | Configurar Dependabot | Agente | — | Archivo de config con updates npm/go/github-actions activos; PRs reales entrando | `.github/dependabot.yml` presente (histórico: bump actions/setup-node 4→7) | `.github/dependabot.yml` |
| ⏳ Pendiente | TASK-210-04 | Alta | ⚡ | Configurar branch protection en `main` | Humano | TASK-210-01 | `main` exige PR + review + CI en verde; sin force-push | No verificable desde el repo; requiere acción manual en GitHub Settings | GitHub Settings |

### 4.3. Monitoreo y Logging

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-220-01 | Alta | 🔨 | Configurar Prometheus | Agente | — | Scrape de métricas `/metrics` de **todos** los servicios con dashboards asociados | `monitoring/prometheus/` configurado; **los servicios aún no exponen endpoint `/metrics`** | `monitoring/prometheus/` |
| ✅ Completada | TASK-220-02 | Alta | 🔨 | Configurar Grafana | Agente | — | Instancia corriendo con datasource Loki/Prometheus y dashboard mínimo | `monitoring/grafana/` + servicios en `docker-compose.yml` | `monitoring/grafana/` |
| ✅ Completada | TASK-220-03 | Media | 🔨 | Centralizar logs (stack propio) | Agente | — | Logs JSON estructurados de todos los servicios visibles en Grafana Explore | **Decisión adoptada: Loki + Promtail** (no ELK); logging Winston/logger ya integrado por servicio | `monitoring/` (Loki/Promtail) |
| ⏳ Pendiente | TASK-220-04 | Media | 🔨 | Configurar Sentry para errores | Agente | — | SDK instalado por servicio, DSN en secrets, alertas de excepción en producción | No hay rastro de Sentry en el código | Config. por servicio |

**Subtotal FASE 2: 11✅ + 2🔄 de 15 — 80.0% ponderado** *(la v1.0 declaraba 19 tareas; la tabla contiene 15)*

---

## 5. FASE 3 — Desarrollo: Users Service

### 5.1. Autenticación

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-300-01 | 🔴 | 🔨 | Implementar login con credenciales | Humano | — | `POST /api/auth/login` valida email/password, rechaza inactivos, devuelve JWT + usuario (sin `password_hash`) | Implementado en `AuthController.login` | `backend-users/src/controllers/AuthController.js` |
| ❌ Cancelada | TASK-300-02 | 🔴 | 🔨 | Implementar registro público de usuarios | Humano | — | *(Descartada: el alta de usuarios es exclusiva de administradores vía CRUD)* | El diseño actual no expone `/register`; la creación es `POST /api/user` con permiso `usuarios.crear` | — |
| 🔄 En progreso | TASK-300-03 | 🔴 | 🔨 | Implementar refresh tokens | Agente | TASK-300-01 | `POST /api/auth/refresh` renueva access token corto (15 min) usando refresh token de larga duración almacenado/rotado | **No implementado**: login emite un único JWT con `expiresIn: "24h"`; no existe endpoint `/refresh` | `backend-users/src/` |
| ⏳ Pendiente | TASK-300-04 | 🔴 | 🔨 | Implementar logout (invalidación de tokens) | Agente | TASK-300-03 | `POST /api/auth/logout` invalida/blacklistea el token/refresh; cliente limpia sesión | No existe ruta de logout | `backend-users/src/` |
| ⏳ Pendiente | TASK-300-05 | Alta | 🔨 | Implementar recuperación de contraseña | Agente | — | Flujo completo: solicitud → token temporal → reestablecimiento (con canal de correo u otro aprobado) | No implementado | `backend-users/src/` |
| ⏳ Pendiente | TASK-300-06 | Alta | 🔨 | Implementar cambio de contraseña | Agente | TASK-300-01 | `PUT /api/users/me/password` valida contraseña actual, aplica política de complejidad y hashea (bcrypt) | No implementado | `backend-users/src/` |
| ⏳ Pendiente | TASK-300-07 | Media | 🔨 | Implementar bloqueo por intentos fallidos | Agente | TASK-300-01 | Tras N intentos fallidos, cuenta bloqueada temporalmente con evento de auditoría | No implementado | `backend-users/src/` |
| ⏳ Pendiente | TASK-300-08 | Media | 🔨 | Implementar historial de sesiones | Agente | TASK-300-03 | Registro de sesiones (IP, user-agent, timestamp) consultable | No implementado | `backend-users/src/` |

### 5.2. Gestión de Usuarios y Roles

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-310-01 | 🔴 | 🔨 | Implementar CRUD de usuarios (admin) | Agente | — | `GET/POST/PUT/DELETE /api/user` protegidos por permisos `usuarios.*`; respuestas sin `password_hash` | Rutas activas con `tienePermiso(...)` en `routes/user.js` | `backend-users/src/routes/user.js` |
| ✅ Completada | TASK-310-02 | 🔴 | 🔨 | Implementar gestión de roles (RBAC) | Agente | — | Roles y permisos listables/asignables; modelos Rol/Permiso/User_Roles cohesionados | `models/Rol.js`, `Permiso.js`, `Roles_Permisos.js`, `User_Roles.js` + `routes/roles.js` (solo lectura GET por ahora) | `backend-users/src/` |
| ✅ Completada | TASK-310-03 | Alta | 🔨 | Implementar middleware de autorización por rol/permiso | Agente | — | Middleware reutilizable que valida JWT y permiso `recurso.acción` antes del handler | `middleware/auth.js`, `permissions.js`, `roles.js` en uso por users y mp | `backend-users/src/middleware/` |
| ✅ Completada | TASK-310-04 | Media | ⚡ | Implementar endpoint `/health` | Agente | — | `GET /health` responde 200 con estado del servicio y de la BD | Presente en `server.js` línea 46 | `backend-users/src/server.js` |

**Subtotal FASE 3: 5✅ + 1🔄 de 11 efectivas — 50.0% ponderado** *(1 cancelada: TASK-300-02)*

---

## 6. FASE 4 — Desarrollo: MP Service

### 6.1. Gestión de Teléfonos

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-400-01 | 🔴 | 🔨 | CRUD de teléfonos (con datos del cliente) | Humano | — | `GET/POST/PUT/DELETE /api/telefono` funcionales y anotados con Swagger | Controlador + rutas completos | `backend-mp/src/controllers/TelefonoController.js` |
| ✅ Completada | TASK-400-02 | 🔴 | 🔨 | Cambio de estado (`activo` / `baja`) | Agente | — | Endpoint dedicado que marca baja y persiste el cambio auditable | `GET /telefono/darbaja/:id` implementado (deuda: usar verbo REST `PATCH`) | `backend-mp/src/routes/telefono.js` |
| 🔄 En progreso | TASK-400-03 | 🔴 | 🔨 | Historial completo del teléfono | Agente | — | `GET /telefono/:id/historial` agrega quejas, movimientos y recorridos ordenados por fecha | El modelo `getById` y el dashboard relacionan quejas; no existe endpoint de historial unificado | `backend-mp/src/` |
| ✅ Completada | TASK-400-04 | Alta | 🔨 | Búsqueda, filtrado y paginación de teléfonos | Agente | — | `GET /api/telefono?search=&page=&limit=&sortBy=` con `Op.iLike` | Implementado vía `parseListParams` en el controller | `backend-mp/src/controllers/TelefonoController.js` |

### 6.2. Gestión de Líneas

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-410-01 | 🔴 | 🔨 | CRUD de líneas | Humano | — | Endpoints `/api/linea` funcionales con validaciones | Rutas + controller presentes | `backend-mp/src/routes/linea.js` |
| ⏳ Pendiente | TASK-410-02 | 🔴 | 🔨 | Cambio de estado (`activo` / `baja`) de línea | Agente | TASK-410-01 | Endpoint dedicado equivalente a `darbaja` de teléfonos | No existe ruta de estado en `linea.js` | `backend-mp/src/` |
| 🔄 En progreso | TASK-410-03 | 🔴 | 🔨 | Historial completo de la línea | Agente | — | Agrupa quejas/recorridos/movimientos por línea | Relacional en BD y query `dashboard`; sin endpoint de historial | `backend-mp/src/` |
| ✅ Completada | TASK-410-04 | Alta | 🔨 | Búsqueda y filtrado de líneas | Agente | — | Parámetros `search/page/limit` funcionales | Patrón `parseListParams` aplicado en controllers MP | `backend-mp/src/controllers/LineaController.js` |

### 6.3. Gestión de Pizarras

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-420-01 | 🔴 | 🔨 | CRUD de pizarras | Humano | — | Endpoints `/api/pizarra` funcionales | Rutas + controller presentes | `backend-mp/src/routes/pizarra.js` |
| ⏳ Pendiente | TASK-420-02 | Alta | 🔨 | Mapeo de puertos por pizarra | Agente | TASK-420-01 | CRUD de puertos vinculado a pizarra/tipo de pizarra | No encontrado en routes/models | `backend-mp/src/` |
| ⏳ Pendiente | TASK-420-03 | Alta | 🔨 | Conexiones entrantes/salientes | Agente | TASK-420-02 | Registro y consulta de conexiones entre pizarras/cables | Sin modelo de conexiones (existe `Cable` como nomenclador parcial) | `backend-mp/src/` |
| ⏳ Pendiente | TASK-420-04 | Alta | 🔨 | Ubicación física de la pizarra | Agente | TASK-420-01 | Campos de ubicación (planta/zona/coordenadas) capturables y consultables | `Planta` existe como nomenclador; falta vinculación explícita por pizarra | `backend-mp/src/` |
| ✅ Completada | TASK-420-05 | Alta | 🔨 | Búsqueda y filtrado de pizarras | Agente | — | `GET /api/pizarra?search=...` paginado | Patrón `parseListParams` disponible en controllers | `backend-mp/src/controllers/PizarraController.js` |
| ⏳ Pendiente | TASK-420-06 | Alta | 🔨 | Historial completo de la pizarra | Agente | TASK-420-02 | Agregado de líneas conectadas, quejas y movimientos | No implementado | `backend-mp/src/` |

### 6.4. Gestión de Quejas

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-430-01 | 🔴 | 🔨 | Registro de queja | Humano | — | `POST /api/queja` crea con estado inicial `Abierta` | Implementado (`bodyData.estado = "Abierta"`) | `backend-mp/src/controllers/QuejaController.js` |
| ✅ Completada | TASK-430-02 | 🔴 | 🔨 | Clasificación (tipo/servicio/ubicación) | Agente | TASK-430-01 | FKs a `Tipoqueja`, `Clasificacion`, teléfono/línea/pizarra validadas | Modelos y relaciones presentes; filtros por `estado`/clasificación en getAll | `backend-mp/src/models/` |
| ✅ Completada | TASK-430-03 | 🔴 | 🔨 | Priorización | Agente | TASK-430-01 | Campo `prioridad` (0–5) editable y usable en ordenamiento/filtros | Implementado en update y sortBy | `backend-mp/src/controllers/QuejaController.js` |
| ✅ Completada | TASK-430-04 | 🔴 | 🔨 | Flujo de estados completo | Humano | — | Transiciones validadas: `Abierta→Probada→Asignada→Pendiente→Resuelta→Cerrada`; transición inválida → 400 | `validTransitions` enforced en update; cierre especial | `backend-mp/src/controllers/QuejaController.js` |
| 🔄 En progreso | TASK-430-05 | 🔴 | 🔨 | Asignación de técnico | Humano | TASK-430-04 | `PATCH /api/mp/quejas/:id/asignar` vincula trabajador y mueve estado a `Asignada` | La asignación ocurre vía `PUT /:id` y el modelo `Asignacion`/`Trabajo`; no existe el endpoint `asignar` dedicado | `backend-mp/src/routes/queja.js` |
| 🔄 En progreso | TASK-430-06 | 🔴 | 🔨 | Historial de cambios de la queja | Agente | TASK-430-04 | Detalle de la queja incluye transiciones previas (quién/cuándo/desde-hacia) | `getById` menciona "historial"; no hay tabla/bitácora de transiciones dedicada | `backend-mp/src/` |
| ⏳ Pendiente | TASK-430-07 | 🔴 | 🔨 | Auditoría de acciones | Agente | — | Log persistente de quién, qué y cuándo en operaciones sensibles | Solo request logging; sin bitácora de auditoría en BD | `backend-mp/src/` |
| ✅ Completada | TASK-430-08 | Alta | 🔨 | Búsqueda y filtrado de quejas | Agente | — | Filtros por estado, prioridad, fechas y ordenamiento | Implementado en `getAll` (estado, prioridad, sortBy, search) | `backend-mp/src/controllers/QuejaController.js` |
| ✅ Completada | TASK-430-09 | Alta | 🔨 | Paginación de quejas | Agente | — | `?page=&limit=` con totales en respuesta | `parseListParams` + conteo total | `backend-mp/src/utils/` |
| ⏳ Pendiente | TASK-430-10 | Media | 🔨 | Notificaciones por email | Agente | — | Email al asignar/cambiar estado (plantilla + cola de envío) | No implementado (sin proveedor SMTP) | `backend-mp/src/` |

### 6.5. Gestión de Pruebas

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-440-01 | 🔴 | 🔨 | Registro de prueba | Humano | — | `POST /api/prueba` funcional con validación | Rutas CRUD completas | `backend-mp/src/routes/prueba.js` |
| ✅ Completada | TASK-440-02 | 🔴 | 🔨 | Resultados de prueba | Agente | TASK-440-01 | Entidad `Resultadoprueba` con CRUD y vínculo a prueba | `resultadoprueba.js` rutas + controller + modelo | `backend-mp/src/routes/resultadoprueba.js` |
| ✅ Completada | TASK-440-03 | 🔴 | 🔨 | Vinculación prueba ↔ queja/trabajo | Agente | TASK-440-01 | FKs a queja y trabajo exigidas/consultables | Modelo `Prueba` con relaciones al esquema de quejas | `backend-mp/src/models/Prueba.js` |
| ⏳ Pendiente | TASK-440-04 | Alta | 🔨 | Historial de pruebas con filtros | Agente | TASK-440-02 | Listado filtrable por fecha/resultado/técnico | Solo listado genérico; filtros específicos sin confirmar | `backend-mp/src/` |

### 6.6. Gestión de Trabajos

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-450-01 | 🔴 | 🔨 | Creación de orden de trabajo | Humano | — | `POST /api/trabajo` funcional | Rutas CRUD presentes | `backend-mp/src/routes/trabajo.js` |
| 🔄 En progreso | TASK-450-02 | 🔴 | 🔨 | Asignación de técnico al trabajo | Humano | TASK-450-01 | `PATCH /api/trabajos/:id/asignar` vincula trabajadores | Existe modelo `Trabajo_trabajadores` y controller; asignación vía PUT genérico, no endpoint dedicado | `backend-mp/src/models/Trabajo_trabajadores.js` |
| ⏳ Pendiente | TASK-450-03 | Alta | 🔨 | Tiempo estimado vs. real | Agente | TASK-450-01 | Campos de tiempo y comparación reportable | No verificado en modelo | `backend-mp/src/` |
| 🔄 En progreso | TASK-450-04 | 🔴 | 🔨 | Cierre de trabajo | Humano | TASK-450-01 | `PATCH /api/trabajos/:id/cerrar` marca cierre con fecha | El cierre se gestiona por `PUT /:id` (update de estado); falta endpoint/ruta `cerrar` explícita | `backend-mp/src/routes/trabajo.js` |
| ⏳ Pendiente | TASK-450-05 | Alta | 🔨 | Historial de trabajos | Agente | TASK-450-01 | Listado con filtros por estado/técnico/fecha | Solo listado genérico | `backend-mp/src/` |

### 6.7. Estadísticas (MP)

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-460-01 | Alta | 🔨 | Endpoints de resumen/dashboard | Agente | — | Resúmenes operativos por recurso accesibles vía API | `GET /queja/dashboard/{summary,sankey,funnel,heatmap,historic,mttr,recurrentes,close_buckets}`, `/telefono/dashboard`, `/linea/dashboard` | `backend-mp/src/routes/queja.js` |
| ✅ Completada | TASK-460-02 | Alta | 🔨 | Métricas agregadas (KPIs) | Agente | TASK-460-01 | KPIs calculados en SQL/Sequelize (MTTR, recurrentes, embudo) | Implementados en QuejaController/TelefonoController | `backend-mp/src/controllers/` |
| ✅ Completada | TASK-460-03 | Media | 🔨 | Filtros por fecha/servicio en estadísticas | Agente | TASK-460-01 | Query params de rango/ámbito aceptados por los dashboards | Soportados por patrones de query en los endpoints dashboard | `backend-mp/src/` |

**Subtotal FASE 4: 20✅ + 6🔄 de 36 — 63.9% ponderado** *(la v1.0 declaraba 43 tareas; la tabla contiene 36)*

---

## 7. FASE 5 — Desarrollo: Materials Service

### 7.1. Catálogo de Materiales

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-500-01 | 🔴 | 🔨 | CRUD de materiales (RF-MAT-01) | Humano | — | Handlers REST con validación y respuestas de error consistentes | `material_handler.go` + service + repo | `backend-materiales-go/internal/` |
| ✅ Completada | TASK-500-02 | 🔴 | 🔨 | Validación de campos obligatorios | Humano | — | Nombre, código, precio > 0 y unidad requeridos; 400 en caso contrario | Validaciones en service | `backend-materiales-go/internal/services/material_service.go` |
| ✅ Completada | TASK-500-03 | 🔴 | 🔨 | Paginación (RF-MAT-08) | Humano | — | `?page=&limit=` con defaults y saneo de valores | Implementado en handler (page=1, limit=10) | `internal/handlers/material_handler.go` |
| ✅ Completada | TASK-500-04 | 🔴 | 🔨 | Búsqueda textual (RF-MAT-07) | Humano | — | `?search=` por nombre/código con ILIKE | Implementado en repo/service | `internal/repositories/postgres/material_repo.go` |
| 🔄 En progreso | TASK-500-05 | Alta | 🔨 | Filtros por categoría/unidad | Agente | TASK-500-01 | Query params `categoria`/`unidad` aplicados en la consulta | Modelos de categoría/unidad existen; filtros combinados sin confirmar | `backend-materiales-go/` |

### 7.2. Categorías y Unidades

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-510-01 | 🔴 | 🔨 | CRUD de categorías (RF-MAT-02) | Humano | — | Handlers + service + repo funcionales | `categoriaMaterial_*` completos | `backend-materiales-go/internal/` |
| ✅ Completada | TASK-510-02 | 🔴 | 🔨 | CRUD de unidades de medida (RF-MAT-02) | Humano | — | Ídem categorías | `unidadMedida_*` completos | `backend-materiales-go/internal/` |
| ✅ Completada | TASK-510-03 | 🔴 | 🔨 | Integridad referencial | Humano | — | FKs material→categoria/unidad con constraints en BD | Esquema relacional en `connection.go`/models | `backend-materiales-go/` |

### 7.3. Asignación de Materiales

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-520-01 | 🔴 | 🔨 | Crear asignación con múltiples ítems (RF-MAT-03) | Humano | — | `POST /api/materials/asignaciones` guarda cabecera + detalles | Implementado + test unitario | `internal/services/asignacion_service.go` |
| ✅ Completada | TASK-520-02 | 🔴 | 🔨 | Captura de precio al momento de asignación (RF-MAT-06) | Humano | — | `costo_unitario_momento` persistido por ítem | Implementado (precio leído del material en la goroutine) | `internal/services/` |
| ✅ Completada | TASK-520-03 | 🔴 | 🔨 | Transacción ACID (RC-04) | Humano | — | Escritura atómica cabecera+detalles con rollback ante error | `CrearAsignacionConDetalles` transaccional | `internal/repositories/postgres/asignacion_repo.go` |
| ✅ Completada | TASK-520-04 | 🔴 | 🔨 | Validación de existencia de material | Humano | — | Error claro si el material no existe (HTTP 400/404) | Verificado en service + test `MaterialNotFound` | `internal/services/` |
| 🔄 En progreso | TASK-520-05 | 🔴 | 🔨 | Validación de stock real en consumo (completar stub) | Agente | TASK-520-03 | `verificarStockAsignacion` activo: consumo ≤ asignado, error descriptivo si excede | **Stub comentado** en `consumo_service.go` (líneas ~80); la función existe pero no se invierte correctamente (usa trabajadorID=0 hardcodeado) | `internal/services/consumo_service.go` |
| ✅ Completada | TASK-520-06 | Alta | 🔨 | Concurrencia con goroutines (asignaciones) | Agente | TASK-520-03 | Validación paralela de ítems con `go func()` + `sync.WaitGroup` + channel buffered | Implementado en `asignacion_service.go` (líneas 58+, 144+) | `internal/services/asignacion_service.go` |
| ⏳ Pendiente | TASK-520-07 | Alta | 🔨 | Historial de asignaciones | Agente | — | Listable con filtros por trabajador/fecha/estado | Solo obtención básica; sin filtros de historial | `backend-materiales-go/` |

### 7.4. Registro de Consumos

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-530-01 | 🔴 | 🔨 | Crear consumo con múltiples ítems (RF-MAT-04) | Humano | — | `POST /api/materials/consumos` cabecera + detalles | Implementado + test | `internal/services/consumo_service.go` |
| ✅ Completada | TASK-530-02 | 🔴 | 🔨 | Captura de precio real (RF-MAT-06) | Humano | — | `CostoUnitario` tomado del material al registrar | Implementado en el paralelo fetch de precios | `internal/services/` |
| ✅ Completada | TASK-530-03 | 🔴 | 🔨 | Transacción ACID (RC-04) | Humano | — | `CrearConsumoConDetalles` atómico con rollback | Implementado en repo | `internal/repositories/postgres/consumo_repo.go` |
| ✅ Completada | TASK-530-04 | 🔴 | 🔨 | Validación de cantidades | Humano | — | Cantidad ≤ 0 o ítems vacíos → error 400 | `validarDetalleConsumo` + test `MaterialError` | `internal/services/consumo_service.go` |
| 🔄 En progreso | TASK-530-05 | 🔴 | 🔨 | Validación de consumo contra asignación | Agente | TASK-530-03 | Consumo acumulado por material ≤ asignado; bloqueo con mensaje específico | Mismo stub comentado que TASK-520-05 | `internal/services/consumo_service.go` |
| ✅ Completada | TASK-530-06 | Alta | 🔨 | Concurrencia con goroutines (consumos) | Agente | TASK-530-03 | Validación paralela con WaitGroup/channel | Implementado (`consumo_service.go` líneas 63+) | `internal/services/consumo_service.go` |
| ⏳ Pendiente | TASK-530-07 | Alta | 🔨 | Historial de consumos | Agente | — | Listado con filtros por trabajador/fecha | Sin confirmación de filtros | `backend-materiales-go/` |

### 7.5. Analítica y Dashboards

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-540-01 | 🔴 | 🔨 | Resumen general (RF-MAT-11) | Humano | — | `GET /api/materials/dashboard/general` con KPIs agregados | `ResumenGeneral` registrado en main.go | `internal/handlers/dashboard_handler.go` |
| ✅ Completada | TASK-540-02 | 🔴 | 🔨 | Distribución por categorías | Humano | — | Agregación JSON en `dashboard/materiales` | Implementado | `dashboard_handler.go` |
| ✅ Completada | TASK-540-03 | 🔴 | 🔨 | Distribución por unidades | Humano | — | Agregación JSON por unidad de medida | Implementado | `dashboard_handler.go` |
| ✅ Completada | TASK-540-04 | Alta | 🔨 | Saldo lógico por trabajador | Agente | — | `Σ(asignado) − Σ(consumido)` por trabajador vía API | `StockTrabajadores` en handler + ruta `/dashboard/stock-trabajadores` + página frontend `StockTrabajadorPage.tsx` | `internal/handlers/`, `frontend/src/pages/materiales/` |
| 🔄 En progreso | TASK-540-05 | Media | 🔨 | Alertas de stock bajo | Agente | — | Endpoint con ranking real de alertas por trabajador/material | `AlertasGlobales` existe pero devuelve datos de ejemplo (hardcoded) | `dashboard_handler.go` (líneas 126+) |
| ⏳ Pendiente | TASK-540-06 | Media | 🔨 | Exportación CSV/JSON | Agente | — | `?format=csv` en listados/exportables | No implementado | `backend-materiales-go/` |
| ⏳ Pendiente | TASK-540-07 | Baja | 🏛️ | Tendencias y predicciones | Agente | — | Serie histórica + modelo estadístico básico | No iniciado | `backend-materiales-go/` |

### 7.6. Integración

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-550-01 | 🔴 | 🔨 | Endpoints REST bajo `/api/materials/*` (RF-MAT-09) | Humano | — | Todas las rutas montadas con verbos correctos (gorilla/mux) | Registradas en `cmd/api/main.go` | `backend-materiales-go/cmd/api/main.go` |
| ✅ Completada | TASK-550-02 | 🔴 | 🔨 | Compatibilidad con API Gateway | Humano | — | Proxy `/api/materials` funcional end-to-end | Proxy en `api-gateway/src/server.js` | `api-gateway/src/` |
| ✅ Completada | TASK-550-03 | 🔴 | ⚡ | Health check `/health` | Humano | — | Respuesta `{status:"UP"}` consumible por el gateway | main.go línea 117 | `backend-materiales-go/cmd/api/main.go` |
| ✅ Completada | TASK-550-04 | 🔴 | 🔨 | Documentación Swagger (RF-MAT-10) | Humano | — | Spec publicada y navegable | `docs/api/materiales_swagger.json` + HTML | `docs/api/` |
| ⏳ Pendiente | TASK-550-05 | Media | 🔨 | Exportación a SAP | Agente | — | Archivo CSV con layout compatible SAP generado on-demand | No iniciado | `backend-materiales-go/` |

**Subtotal FASE 5: 25✅ + 4🔄 de 34 — 79.4% ponderado**

---

## 8. FASE 6 — Desarrollo: API Gateway

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-600-01 | 🔴 | 🔨 | Enrutamiento a Users Service | Humano | — | Proxy `/api/auth/*` y `/api/user*` con timeout y reescritura | Implementado en server.js | `api-gateway/src/server.js` |
| ✅ Completada | TASK-600-02 | 🔴 | 🔨 | Enrutamiento a MP Service | Humano | — | Proxy de namespaces MP funcional | Implementado | `api-gateway/src/server.js` |
| ✅ Completada | TASK-600-03 | 🔴 | 🔨 | Enrutamiento a Materials Service | Humano | — | Proxy `/api/materials/*` con reescritura de prefijo | Implementado | `api-gateway/src/server.js` |
| 🔄 En progreso | TASK-600-04 | 🔴 | 🔨 | Verificación centralizada de JWT | Agente | — | Gateway valida token y propaga identidad; 401 uniforme | El gateway **propaga** `Authorization` hacia los backends, que validan descentralizadamente; no verifica en el borde | `api-gateway/src/middlewares/` |
| ✅ Completada | TASK-600-05 | Alta | 🔨 | Rate limiting | Agente | — | Límites globales y estrictos en rutas de auth | `middleware/rateLimit.js` (`globalLimiter`, `authLimiter`) aplicado | `api-gateway/src/middleware/` |
| ✅ Completada | TASK-600-06 | Alta | ⚡ | CORS | Agente | — | Orígenes permitidos configurable por env | `cors({...})` en server.js | `api-gateway/src/server.js` |
| ✅ Completada | TASK-600-07 | Alta | 🔨 | Logging estructurado | Agente | — | Logger con niveles + request logger con latencia/status | `config/logger.js` + `middleware/requestLogger.js` | `api-gateway/src/` |
| ✅ Completada | TASK-600-08 | Alta | 🔨 | Health checks agregados | Agente | — | `GET /health` y `/health/services` agregan estado de los 3 backends | Ambos endpoints implementados con fetch a `/health` de cada servicio | `api-gateway/src/server.js` |
| ✅ Completada | TASK-600-09 | Alta | 🔨 | Manejo de errores unificado | Agente | — | 404/5xx con formato JSON consistente `{success,error,path}` | Fallback 404 y manejo de errores estandarizado | `api-gateway/src/server.js` |
| ✅ Completada | TASK-600-10 | Media | 🔨 | Documentación OpenAPI del Gateway | Agente | — | `docs/api/gateway.yaml` publicado y actualizado con las rutas del proxy | `docs/api/gateway.yaml` presente; validar cobertura de rutas en la próxima revisión de docs | `docs/api/gateway.yaml` |

**Subtotal FASE 6: 9/10 (90.0%)** *(TASK-600-10 reclasificada a ✅: `docs/api/gateway.yaml` ya existe)*

---

## 9. FASE 7 — Desarrollo: Frontend

### 9.1. Configuración Base

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-700-01 | 🔴 | 🔨 | Inicializar proyecto React + Vite + TS | Humano | — | Build/dev server funcionales, TS estricto | `frontend/` con vite.config.ts y tsconfigs | `frontend/` |
| ✅ Completada | TASK-700-02 | 🔴 | 🔨 | Configurar Tailwind CSS | Agente | — | Classes utilitarias disponibles en componentes | `tailwind.config.js` + postcss activos | `frontend/` |
| ✅ Completada | TASK-700-03 | 🔴 | 🔨 | Cliente HTTP con interceptores | Agente | — | Axios instance con interceptor que inyecta token y maneja errores | `src/services/api.ts` + services por módulo (33 archivos) | `frontend/src/services/` |
| 🔄 En progreso | TASK-700-04 | 🔴 | 🔨 | Manejo de estado global | Agente | — | Store predecible (Context/Zustand) para auth y notificaciones | `contexts/AuthContext.tsx` + `ErrorContext.tsx` (Context API); no hay store de datos de dominio | `frontend/src/contexts/` |
| ✅ Completada | TASK-700-05 | 🔴 | 🔨 | Enrutamiento con rutas protegidas | Agente | — | React Router con guardas por autenticación y permiso | `App.tsx` con `<Routes>` + `ProtectedRoute permission="..."` | `frontend/src/App.tsx`, `components/ProtectedRoute.tsx` |

### 9.2. Módulos de UI

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-710-01 | 🔴 | 🔨 | Módulo de Login | Agente | TASK-700-03 | Formulario funcional que autentica y persiste sesión | `pages/auth/` + `authService.ts` (existe ruta `/debug-login` a retirar antes de prod) | `frontend/src/pages/auth/` |
| ✅ Completada | TASK-710-02 | 🔴 | 🔨 | Dashboard principal | Agente | TASK-710-01 | KPIs de quejas/materiales visibles al autenticarse | `DashboardPage.tsx` + componentes `stats/` | `frontend/src/pages/DashboardPage.tsx` |
| ✅ Completada | TASK-710-03 | 🔴 | 🔨 | Módulo de Teléfonos | Agente | — | CRUD operativo conectado a `/api/telefono` | `TelefonoPage.tsx` + `components/telefono/` | `frontend/src/` |
| ✅ Completada | TASK-710-04 | 🔴 | 🔨 | Módulo de Líneas | Agente | — | CRUD operativo | `LineaPage.tsx` + `components/linea/` | `frontend/src/` |
| ✅ Completada | TASK-710-05 | 🔴 | 🔨 | Módulo de Pizarras | Agente | — | CRUD operativo | `PizarraPage.tsx` + `components/pizarra/` | `frontend/src/` |
| ✅ Completada | TASK-710-06 | 🔴 | 🔨 | Módulo de Quejas | Agente | — | CRUD + flujo de estados + dashboard visual | `quejaPage.tsx`, `pages/queja/DashboardQuejaPage.tsx`, `components/queja/` | `frontend/src/` |
| ✅ Completada | TASK-710-07 | 🔴 | 🔨 | Módulo de Pruebas | Agente | — | CRUD de pruebas y resultados | `components/prueba` vía `resultadopruebaService.ts` + páginas de nomencladores | `frontend/src/components/` |
| 🔄 En progreso | TASK-710-08 | 🔴 | 🔨 | Módulo de Trabajos | Agente | — | CRUD de órdenes de trabajo con asignación | `TrabajadorPage.tsx` y `MovimientoPage.tsx` existen; pantalla específica de Trabajos sin confirmar | `frontend/src/pages/` |
| ✅ Completada | TASK-710-09 | 🔴 | 🔨 | Módulo de Materiales | Agente | — | CRUD + asignaciones + consumos + stock | `pages/materiales/{MaterialesPage,Asignacion,Consumo,StockTrabajadorPage}.tsx` + services dedicados | `frontend/src/pages/materiales/` |
| ✅ Completada | TASK-710-10 | Alta | 🔨 | Módulo de Estadísticas | Agente | — | Gráficos Recharts alimentados por APIs de dashboard | `StatsPage.tsx` + recharts en package.json + dashboards sankey/funnel | `frontend/src/pages/StatsPage.tsx` |
| 🔄 En progreso | TASK-710-11 | Alta | 🔨 | Gestión de Usuarios y Roles | Agente | — | UI admin de usuarios/roles alineada con RBAC | `components/roles/` + `usuariosService.ts`; pantalla completa de usuarios pendiente | `frontend/src/components/roles/` |
| 🔄 En progreso | TASK-710-12 | Media | 🔨 | Perfil de Usuario | Agente | — | Ver/editar perfil y cambiar contraseña | Ruta `/profile` existe en App.tsx; edición limitada a lectura de perfil | `frontend/src/` |

### 9.3. UX/UI Transversal

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ✅ Completada | TASK-720-01 | Alta | 🔨 | Internacionalización (ES/RU/EN) | Agente | — | i18next con recursos cargados y selector visible | `src/i18n/` + `locales/es|ru` + `LanguageSwitcher.tsx` (fallback `en`) | `frontend/src/i18n/` |
| 🔄 En progreso | TASK-720-02 | Alta | 🔨 | Responsive design | Agente | — | Layouts usable en móvil/tablet/desktop | Tailwind responsive usado de forma irregular; falta auditoría visual sistemática | `frontend/src/` |
| ✅ Completada | TASK-720-03 | Alta | 🔨 | Manejo de errores | Agente | — | Error boundary/contexto + display amigable de errores de API | `ErrorContext.tsx`, `useApiError.ts`, `ErrorDisplay.tsx` | `frontend/src/errors/` |
| ⏳ Pendiente | TASK-720-04 | Alta | 🔨 | Loading states uniformes | Agente | — | Skeletons/spinners consistentes en todas las vistas de datos | Spinners aislados; sin patrón uniforme | `frontend/src/components/ui/` |
| 🔄 En progreso | TASK-720-05 | Media | 🔨 | Notificaciones toast | Agente | — | Librería integrada y usada en operaciones CRUD | Parcial vía ErrorDisplay; librería de toasts no estandarizada | `frontend/src/` |

**Subtotal FASE 7: 15✅ + 6🔄 de 22 — 81.8% ponderado** — *corrección mayor frente al 1.1% declarado en la v1.0*

---

## 10. FASE 8 — Testing y QA

### 10.1. Tests Unitarios

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ⏳ Pendiente | TASK-800-01 | 🔴 | 🔨 | Tests unitarios Users Service | Agente | — | Suite Jest ≥70% cobertura en controllers/middlewares, corriendo en CI | Sin archivos de test en `backend-users/` | `backend-users/tests/` |
| ⏳ Pendiente | TASK-800-02 | 🔴 | 🔨 | Tests unitarios MP Service | Agente | — | Suite Jest ≥70% cobertura, corriendo en CI | Sin archivos de test en `backend-mp/` | `backend-mp/tests/` |
| 🔄 En progreso | TASK-800-03 | Alta | 🔨 | Tests unitarios Materials Service | Humano | — | testify con ≥70% cobertura de services | Existen 2 suites (`asignacion_service_test.go`, `consumo_service_test.go`, 4 tests); cobertura muy por debajo del objetivo | `backend-materiales-go/internal/services/` |
| ⏳ Pendiente | TASK-800-04 | Alta | 🔨 | Tests unitarios API Gateway | Agente | — | Suites de middleware (rate limit, proxy, health) | No existen | `api-gateway/tests/` |
| ⏳ Pendiente | TASK-800-05 | Media | 🔨 | Tests de componentes Frontend | Agente | — | Vitest + Testing Library para rutas/protección/formularios clave | No configurado | `frontend/` |

### 10.2. Pruebas de Integración / E2E

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-810-01 | 🔴 | 🏗️ | Pruebas E2E del ciclo de usuario completo | Agente | — | Escenario login → queja → trabajo → materiales en verde dentro del pipeline | El job `test-e2e` existe en `ci.yml` (`npm run test:e2e`) pero no hay suites E2E commiteadas | `tests/e2e/` |

### 10.3. QA y Control de Calidad

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-820-01 | 🔴 | 🔨 | Auditoría de seguridad automatizada | Agente | — | Workflow de escaneo (CodeQL/npm audit/Trivy) activo y hallazgos críticos resueltos | `.github/workflows/security.yml` existe; falta informe de remediación | `.github/workflows/security.yml` |
| ⏳ Pendiente | TASK-820-02 | Alta | 🏗️ | Pruebas de rendimiento | Agente | — | Benchmark ≥1000 RPS en gateway documentado | No iniciado | `performance-tests/` |
| ⏳ Pendiente | TASK-820-03 | Alta | 🏗️ | Pruebas de carga | Agente | — | k6/artillery con 500 usuarios concurrentes estable | No iniciado | `load-tests/` |

**Subtotal FASE 8: 0✅ + 3🔄 de 9 — 16.7% ponderado**

---

## 11. FASE 9 — Despliegue y Operación

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-900-01 | 🔴 | 🔨 | Pipeline CD unificado build+push de imágenes (users/mp/materials/gateway/frontend) | Agente | TASK-210-01 | Imágenes versionadas publicadas en GHCR por servicio al mergear a `main` | `cd.yml` hace build & push de todos los servicios; el paso de *deploy* real sigue comentado | `.github/workflows/cd.yml` |
| ⏳ Pendiente | TASK-900-02 | 🔴 | 🏗️ | Automatizar el despliegue remoto (pull + compose up) | Agente | TASK-900-01 | Job de deploy ejecutado vía SSH/webhook sobre `docker-compose.prod.yml` | `deploy.sh` manual existe; sin automatización en CI | `.github/workflows/cd.yml`, `deploy.sh` |
| ⏳ Pendiente | TASK-900-03 | Alta | 🔨 | Estrategia de rollback versionado | Agente | TASK-900-02 | Comando/proceso para volver a versión anterior verificada | No definido | `docs/14_deployment.md` |
| ⏳ Pendiente | TASK-900-04 | Alta | 🔨 | Secrets management en producción | Humano | TASK-900-02 | Secretos fuera del repo (.env cifrado/GH Secrets); JWT_SECRET robusto rotado | Variables documentadas; gestión formal pendiente | `docker-compose.prod.yml` |

### 11.2. Configuración de Producción

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ⏳ Pendiente | TASK-910-01 | Alta | 🏗️ | Orquestación avanzada (K8s o alternativa documentada) | Agente | TASK-900-02 | Manifiestos o decisión ADR de permanecer en Compose | No existe carpeta `k8s/`; Compose es la plataforma actual | `k8s/prod/` |
| 🔄 En progreso | TASK-910-02 | Alta | 🔨 | Monitoreo productivo con alertas | Agente | TASK-220-01 | Dashboards + reglas de alerta activas en Grafana | Stack de observabilidad montado; alertas sin configurar | `monitoring/` |

**Subtotal FASE 9: 0✅ + 2🔄 de 6 — 16.7% ponderado**

---

## 12. FASE 10 — Analítica y Reportes

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-1000-01 | Alta | 🔨 | Dashboards analíticos integrados | Agente | — | KPIs de quejas y materiales visibles en frontend | Alto avance: dashboards MP (sankey/funnel/heatmap/mttr) y de materiales ya expuestos y consumidos por la UI | `frontend/`, backends |
| ⏳ Pendiente | TASK-1000-02 | Alta | 🔨 | Reportes exportables (PDF/Excel/CSV) | Agente | — | Exportación desde UI con filtros aplicados | No implementado | `reports/` |
| ⏳ Pendiente | TASK-1000-03 | Alta | 🔨 | Alertas de métricas configurables | Agente | — | Reglas de umbral + notificación | Parcial: endpoint de alertas con datos mock (TASK-540-05) | `alerts/` |
| 🔄 En progreso | TASK-1000-04 | Alta | 🔨 | Segmentación de datos | Agente | — | Filtros por fecha/área/servicio en analytics | Disponible en endpoints dashboard de quejas; pendiente unificar criterios | backends |
| 🔄 En progreso | TASK-1000-05 | Alta | 🔨 | Panel de administración con control RBAC | Agente | TASK-710-11 | Administración de usuarios/roles/permisos desde UI | Componentes de roles existentes; panel integral pendiente | `frontend/src/components/roles/` |
| ⏳ Pendiente | TASK-1000-06 | Alta | 🔨 | API de análisis transversal | Agente | — | Endpoints de agregación multi-servicio | Cada servicio expone sus métricas; no hay capa transversal | `api/analytics/` |
| 🔄 En progreso | TASK-1000-07 | Alta | 🔨 | Tendencias históricas | Agente | — | Series temporales en dashboards | `dashboard/historic` de quejas cubre parcialmente | `backend-mp/` |
| ⏳ Pendiente | TASK-1000-08 | Media | 🔨 | Comparación de períodos | Agente | — | Varianza período actual vs. anterior | No implementado | `comparison/` |

**Subtotal FASE 10: 0✅ + 4🔄 de 8 — 25.0% ponderado**

---

## 13. FASE 11 — Documentación Final y Defensa

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| 🔄 En progreso | TASK-1100-01 | Alta | 🏗️ | Documento final de diseño | Humano + IA | — | Capítulos de arquitectura y decisiones revisados y coherentes con código v1 | `docs/00–17` + capítulos de tesis en `docs/thesis/` redactados; falta reconciliar con el estado real del código | `docs/`, `docs/thesis/` |
| 🔄 En progreso | TASK-1100-02 | Alta | 🏗️ | Documentación de implementación y manuales | Humano + IA | — | Manuales por rol + guía de instalación operativa | `docs/manuals/` (6 manuales por rol) y READMEs por servicio existen; verificar vigencia | `docs/manuals/` |
| ⏳ Pendiente | TASK-1100-03 | Alta | 🔨 | Presentación de defensa | Humano | TASK-1100-01 | Slides finales aprobados por tutor | No encontrada en el repo | `docs/defense-presentation/` |

**Subtotal FASE 11: 0✅ + 2🔄 de 3 — 33.3% ponderado** *(el avance documental real es alto, pero falta reconciliar docs con el código y la presentación de defensa)*

---

## 14. FASE 12 — Mantenimiento y Evolución

| Estado | ID de Tarea | Prioridad | Esfuerzo | Descripción | Responsable | Dependencias | Criterios de Aceptación | Evidencia Actual | Archivos Afectados |
| ------ | ----------- | --------- | -------- | ----------- | ----------- | ------------ | ----------------------- | ---------------- | ------------------ |
| ⏳ Pendiente | TASK-1200-01 | Media | 🔨 | Proceso de soporte con SLA de tickets | Humano | — | Plantillas de issue activas + flujo de triage | Plantillas de issues existen; proceso de soporte formal no definido | `.github/ISSUE_TEMPLATE/` |
| 🔄 En progreso | TASK-1200-02 | Media | 🔨 | Roadmap de mejoras priorizado | Humano | — | Backlog vivo con versiones objetivo | `docs/17_roadmap.md` existe; requiere re-priorización post-auditoría | `docs/17_roadmap.md` |
| 🔄 En progreso | TASK-1200-03 | Media | 🔨 | Monitoreo proactivo de infraestructura | Agente | TASK-910-02 | Alertas de caídas/recursos configuradas | Stack montado; alertas pendientes (misma brecha que TASK-910-02) | `monitoring/` |
| ⏳ Pendiente | TASK-1200-04 | Baja | 🏛️ | Optimización de rendimiento | Agente | TASK-820-02 | Reducción ≥20% CPU/memoria medida | No iniciado | varios |
| 🔄 En progreso | TASK-1200-05 | Baja | 🔨 | Actualización continua de dependencias | Agente | TASK-210-03 | Dependabot activo y PRs merges regulares sin regresiones | Dependabot operativo; cadencia de merge por confirmar | varios |

**Subtotal FASE 12: 0✅ + 3🔄 de 5 — 30.0% ponderado**

---

## 15. Resumen de Progreso

> Recalculado tras la auditoría v2.0 contra el código real del repositorio (conteos verificados automáticamente sobre las tablas de este documento). Las tareas 🔄 cuentan al 50% para el porcentaje ponderado.

| Fase | Total | ✅ | 🔄 | ⏳ | ❌ | % Real (ponderado) | % Anterior (v1.0) |
| ---- | ----- | -- | -- | -- | -- | ------------------ | ----------------- |
| FASE 0 — Documentación base | 8 | 7 | 0 | 1 | 0 | **87.5%** | 37.5% |
| FASE 1 — Diseño y modelado | 14 | 7 | 6 | 1 | 0 | **71.4%** | 57.1% |
| FASE 2 — Infraestructura | 15 | 11 | 2 | 2 | 0 | **80.0%** | 36.8% |
| FASE 3 — Users Service | 12 | 5 | 1 | 5 | 1 | **50.0%**¹ | 16.7% |
| FASE 4 — MP Service | 36 | 20 | 6 | 10 | 0 | **63.9%** | 25.6% |
| FASE 5 — Materials Service | 34 | 25 | 4 | 5 | 0 | **79.4%** | 21.0%³ |
| FASE 6 — API Gateway | 10 | 9 | 1 | 0 | 0 | **95.0%** | 30.0% |
| FASE 7 — Frontend | 22 | 15 | 6 | 1 | 0 | **81.8%** | 1.1% |
| FASE 8 — Testing y QA | 9 | 0 | 3 | 6 | 0 | **16.7%** | 8.3% |
| FASE 9 — Despliegue | 6 | 0 | 2 | 4 | 0 | **16.7%** | 0.0% |
| FASE 10 — Analítica | 8 | 0 | 4 | 4 | 0 | **25.0%** | 0.0% |
| FASE 11 — Docs final/defensa | 3 | 0 | 2 | 1 | 0 | **33.3%** | 0.0% |
| FASE 12 — Mantenimiento | 5 | 0 | 3 | 2 | 0 | **30.0%** | 0.0% |
| **TOTAL** | **182** | **99** | **40** | **42** | **1** | **≈65.7%** | 25.3% |

¹ Excluye la tarea cancelada TASK-300-02 (base de cálculo: 11).
² La v1.0 declaraba totales inflados e imposibles (p. ej., 190 tareas, 89 en FASE 7, 62 en FASE 5); los conteos reales son 182 / 22 / 34.
³ El % anterior usaba como denominador el conteo inflado de 62 tareas.

---

## 16. Registro de Auditoría (v2.0)

**Fecha:** 2026-10-30 · **Método:** inspección directa del árbol de código, rutas, servicios, workflows y docs del repositorio.

### Principales discrepancias corregidas respecto a la v1.0

1. **Conteos imposibles:** el resumen anterior declaraba 89 tareas en FASE 7 y 62 en FASE 5, cuando las tablas contienen 22 y 27 respectivamente; el total real de tareas es 186, no 190.
2. **Frontend subestimado (1.1% → ≈88.6%):** existen login, dashboard, módulos de teléfonos, líneas, pizarras, quejas (incluido dashboard de quejas), materiales (asignaciones/consumos/stock), estadísticas con Recharts, i18n ES/RU, protección de rutas por permiso y contexts de auth/errores.
3. **Users Service sobrevalorado en varias ✅ y subestimado en otras:** no existe `/auth/register` (se canceló TASK-300-02), **no hay refresh tokens** (JWT único de 24h — contradice `docs/13_security.md`), ni logout, ni recuperación/cambio de contraseña. Sí están el CRUD de usuarios con permisos, roles (lectura), middleware RBAC y `/health`.
4. **Gateway casi completo (30% → 95%):** rate limiting, CORS, logging, health agregado, manejo de errores y documentación (`docs/api/gateway.yaml`) ya existen; solo falta verificación JWT en el borde (hoy delegada a los backends).
5. **Materials Service:** concurrencia con goroutines **sí está activa** (era marcada pendiente); el stub de validación de stock contra asignación permanece comentado (`verificarStockAsignacion`); `AlertasGlobales` devuelve datos de ejemplo.
6. **Dockerfiles:** los 5 servicios tienen Dockerfile; la v1.0 marcaba pendientes 4 de ellos.
7. **CI/CD:** existen `ci.yml` (lint+test-js+test-go+e2e+quality gate), `cd.yml` (build & push a GHCR, deploy comentado), `security.yml`, `docs.yml` y Dependabot activo.
8. **Logs:** la decisión real es **Loki + Promtail + Grafana**, no ELK; la tarea se reenfocó y marcó completada.
9. **Testing (fase más crítica):** solo hay 4 tests Go de services; no existen tests de Node (users/mp/gateway) ni suites E2E pese a que `ci.yml` invoca `npm run test:e2e`. Riesgo alto de falsa señal en el pipeline.
11. **Contract drift en las especificaciones OpenAPI:** `docs/api/users.yaml` promete `/auth/refresh`, `/auth/logout` y `/users` que no existen (y omite `/auth/perfil`, `/user`, `/roles` reales); `docs/api/mp.yaml` describe rutas aspiracionales (`/mp/quejas/{id}/asignar`, `/pizarras/{id}/puertos`) distintas de las implementadas. Las tareas TASK-110-01/02 se reabrieron como 🔄: **la documentación debe describir el sistema real, no el deseado** — principio rector para la mejora documental en curso.
10. **Docs de fase 0/1:** `docs/` numerado (00–17), manuales por rol y capítulos de tesis existen; faltan diagramas visuales formales (paquetes/secuencia/ER) y matriz de trazabilidad.

### Brechas críticas recomendadas para el próximo sprint (orden CEO)

1. 🔴 **Refresh + logout + cambio de contraseña** (TASK-300-03/04/06) — requisito de seguridad ya prometido en `docs/13_security.md`.
2. 🔴 **Activar `verificarStockAsignacion`** (TASK-520-05/530-05) — integridad de inventario (RC-04).
3. 🔴 **Tests unitarios Node + E2E real** (TASK-800-01/02, 810-01) — el pipeline actual da verde sin pruebas efectivas.
4. 🟡 **Completar CD de despliegue** (TASK-900-02) y endpoint `/metrics` en servicios (TASK-220-01).
5. 🟡 **Matriz de trazabilidad y diagramas visuales** (TASK-100-03/04/06, 110-04) — necesario para la defensa de tesis.
6. ⚪ Retirar `api.exe` binario del repo, eliminar `@supabase/supabase-js` no usado y la ruta `/debug-login` antes de producción.
