# 🎯 PROMPTS.md — Sistema de Prompts por Tarea para SISGAD5

> **Proyecto:** SISGAD5 — Sistema de Soporte a la Toma de Decisiones
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0
> **Autor:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> **Herramienta:** Kilo Code + agentes en `.agents/agents/`
> **Última actualización:** 2026-10-23

---

## 📑 Tabla de Contenidos

1. [Cómo usar este archivo](#1-cómo-usar-este-archivo)
2. [Plantilla base (cualquier tarea)](#2-plantilla-base-cualquier-tarea)
3. [Fase A — Limpieza y Seguridad](#3-fase-a--limpieza-y-seguridad)
4. [Fase B — Reorganización y Correcciones](#4-fase-b--reorganización-y-correcciones)
5. [Fase C — Documentación](#5-fase-c--documentación)
6. [Fase D — Módulo Predictivo](#6-fase-d--módulo-predictivo)
7. [Parte II — Inventario Funcional](#7-parte-ii--inventario-funcional)
8. [Cierre de tarea (memoria)](#8-cierre-de-tarea-memoria)
9. [Verificación (QA)](#9-verificación-qa)
10. [Plantillas de reporte](#10-plantillas-de-reporte)

---

## 1. Cómo usar este archivo

### Flujo de 7 pasos
1. Abrir TASKLIST.md → identificar la tarea (ej. TASK-A-01).
2. Abrir AGENTS.md sección 9 → identificar el agente recomendado.
3. Abrir PROMPTS.md → copiar el prompt de la fase/tipo.
4. Rellenar placeholders ([TASK-XXX], [archivo], etc.).
5. Ejecutar en Kilo Code con el agente seleccionado.
6. Al terminar, ejecutar el prompt de "Cierre de tarea" (sección 8).
7. Marcar la tarea como completada en TASKLIST.md y hacer commit.


### Placeholders comunes

| Placeholder     | Descripción            | Ejemplo                                           |
| --------------- | ---------------------- | ------------------------------------------------- |
| `[TASK-XXX-YY]` | ID de la tarea         | `TASK-A-01`                                       |
| `[Nombre]`      | Nombre de la tarea     | "Rotar credenciales"                              |
| `[Módulo]`      | Módulo afectado        | "Users Service"                                   |
| `[Archivo]`     | Ruta del archivo       | `backend-users/src/controllers/AuthController.js` |
| `[Criterio]`    | Criterio de aceptación | "Falla al arrancar si falta JWT_SECRET"           |

### Archivos de contexto (el agente los lee)

- `AGENTS.md` (obligatorio, sección 8: deuda técnica activa)
- `SPEC.md`
- `ARCHITECTURE.md`
- `memory.md` (índice)
- `TASKLIST.md` (tarea actual)

---

## 2. Plantilla base (cualquier tarea)

Usa esta plantilla si no hay una específica para tu tarea.

[ROL]
Actúa como el agente especializado que corresponde a esta tarea. Sigue estrictamente las reglas de `AGENTS.md` (especialmente sección 8: Deuda Técnica Activa) y la arquitectura de `ARCHITECTURE.md`.

[CONTEXTO]
Proyecto: SISGAD5. Tarea: [TASK-XXX-YY] — [Nombre de la tarea].
Lee `AGENTS.md`, `SPEC.md`, `ARCHITECTURE.md` y `memory.md` (índice) antes de comenzar.

[TAREA]
Implementa la tarea según el criterio de aceptación del TASKLIST.md:
- **Descripción:** [copiar del TASKLIST]
- **Criterio de aceptación:** [copiar del TASKLIST]
- **Archivos afectados:** [copiar del TASKLIST]
- **Dependencias:** [copiar del TASKLIST]

[RESTRICCIONES]
- No violes las reglas de oro de AGENTS.md.
- No introduzcas nuevos hallazgos de la auditoría (AGENTS.md sección 8).
- Si encuentras un problema no contemplado, documéntalo en `docs/memory/[fecha].md` y detente.
- Usa Conventional Commits.
- Comenta las funciones en español.

[FORMATO DE SALIDA]
1. Código implementado (bloques con ruta de archivo).
2. Tests (si aplica).
3. Resumen de cambios (qué, por qué, dónde).
4. Entrada para `docs/memory/[fecha].md`.

---

## 3. Fase A — Limpieza y Seguridad
### 3.1. Prompt para TASK-A-01: Rotar credenciales

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-01, SEC-02, SEC-03).

[CONTEXTO]
Tarea: TASK-A-01 — Rotar credenciales expuestas (JWT_SECRET, DB_PASSWORD).
Hallazgos: SEC-01 (JWT fallback), SEC-02 (Materials sin JWT), SEC-03 (Grafana admin/admin).

[TAREA]
1. Genera nuevo `JWT_SECRET` con `openssl rand -base64 64`.
2. Genera nuevo `DB_PASSWORD` seguro.
3. Crea `.env.local` (gitignored) con los nuevos valores.
4. Verifica que `.env.example` solo tenga placeholders (`your-secret-here`).
5. Documenta en `docs/memory/[fecha de hoy].md` los nuevos valores (sin exponerlos, solo referencia).
6. Avisa al humano para que actualice PostgreSQL.

[RESTRICCIONES]
- No subas `.env.local` al repo.
- No expongas los valores reales en el chat ni en logs.
- Si no puedes generar los valores, pide al humano que los genere.

[FORMATO]
1. Comandos ejecutados (sin mostrar valores).
2. Contenido de `.env.example` (con placeholders).
3. Entrada de memoria.

---

### 3.2. Prompt para TASK-A-02: Crear .gitignore

Agente: project-auditor

[ROL]
Actúa como `project-auditor`. Sigue `AGENTS.md` sección 8.

[CONTEXTO]
Tarea: TASK-A-02 — Crear `.gitignore` completo.
Problema: El repo tiene versionados node_modules, logs, dist, .env, api.exe, backup/, Continue/.

[TAREA]
1. Crea/actualiza `.gitignore` en la raíz con:
   - Dependencias: `node_modules/`, `**/node_modules/`, `vendor/`
   - Build: `dist/`, `build/`, `coverage/`, `*.exe`, `api.exe`
   - Secretos: `.env`, `.env.*`, `! .env.example`, `**/.env`
   - Logs: `logs/`, `**/logs/`, `*.log`, `*.log.gz`
   - Temporales: `backup/`, `Continue/`, `*.bak`, `*.tmp`
   - IDE: `.vscode/`, `.idea/`, `.kilo/.gitignore`
   - Python: `__pycache__/`, `*.pkl`, `.venv/`
   - Datos: `prediction-service/data/`
2. Verifica que `.env.example` NO esté ignorado.
3. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Contenido del `.gitignore`.
2. Verificación (qué se ignora, qué no).
3. Entrada de memoria.

---

### 3.3. Prompt para TASK-A-03 a A-06: Limpieza de artefactos

Agente: project-auditor

[ROL]
Actúa como `project-auditor`.

[CONTEXTO]
Tarea: [TASK-A-03 / A-04 / A-05 / A-06] — Limpieza de artefactos.
Archivos/carpetas a eliminar: [lista del TASKLIST].

[TAREA]
1. Ejecuta `git rm -r --cached` sobre los archivos/carpetas indicados (sin borrar del disco).
2. Verifica que `git status` esté limpio.
3. Verifica que el repo se aligera (`du -sh .git`).
4. Documenta en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No borres archivos del disco sin confirmación del humano.
- Si un archivo está referenciado en otro lugar, detente y documenta.

[FORMATO]
1. Comandos ejecutados.
2. `git status` resultante.
3. Entrada de memoria.
---
### 3.4. Prompt para TASK-A-08: Eliminar fallback JWT_SECRET

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-01, crítico).

[CONTEXTO]
Tarea: TASK-A-08 — Eliminar fallback `JWT_SECRET || "secreto"` en Users y MP.
Archivos:
- `backend-users/src/controllers/AuthController.js` (líneas ~120-126)
- `backend-mp/src/controllers/AuthController.js` (líneas ~106-112)

[TAREA]
1. Busca todas las ocurrencias de `JWT_SECRET || "secreto"` o similares.
2. Reemplaza por validación que falle al arrancar:
   ```js
   if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
     throw new Error('JWT_SECRET must be defined and at least 32 chars');
   }

3. Añade la validación en src/config/env.js (o equivalente) si no existe.
4. Verifica que .env.example tenga JWT_SECRET=your-secret-here.
5. Ejecuta tests existentes.
6. Documenta en docs/memory/[fecha de hoy].md.

[RESTRICCIONES]

- No cambies el flujo de login, solo la validación del secreto.
- Si no hay tests, documenta que faltan.

[FORMATO]

1. Código corregido (bloques con ruta).
2. Resultado de tests.
3. Entrada de memoria.

---
### 3.5. Prompt para TASK-A-09: JWT en Materials (Go)

**Agente:** `security-fixer`

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-02, crítico) y la skill `security-go-middleware`.

[CONTEXTO]
Tarea: TASK-A-09 — Añadir JWT middleware a Materials Service (Go).
Archivo: `backend-materiales-go/cmd/api/main.go` (líneas ~116-177).

[TAREA]
1. Crea `internal/middleware/auth.go` con validación JWT (usando `golang-jwt/jwt`).
2. Aplica el middleware a todas las rutas excepto `/health`.
3. Añade `JWT_SECRET` a `.env.example` y `internal/config/`.
4. Verifica que sin token, las rutas devuelven 401.
5. Verifica que con token válido, las rutas funcionan.
6. Documenta en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No cambies la lógica de negocio, solo añade auth.
- Usa `golang-jwt/jwt/v5`.
- Comenta las funciones en español.

[FORMATO]
1. Código del middleware + integración en main.go.
2. Tests (si aplica).
3. Entrada de memoria.
---
### 3.6. Prompt para TASK-A-10: Cerrar puertos internos

Agente: security-fixer
[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-02/SEC-05).

[CONTEXTO]
Tarea: TASK-A-10 — Cerrar puertos internos (5001, 5002, 5003, 5432) en prod.
Archivo: `docker-compose.prod.yml`.

[TAREA]
1. En `docker-compose.prod.yml`, elimina los mapeos de puertos internos:
   - `5001:5001` (Users)
   - `5002:5002` (MP)
   - `5003:5003` (Materials)
   - `5432:5432` (PostgreSQL)
2. Deja solo el puerto del Gateway (5000) y del Frontend (5004) expuestos.
3. Verifica que los servicios se comunican por la red interna de Docker.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No rompas `docker-compose.yml` (dev); solo `prod`.
- Verifica que el Gateway puede alcanzar los servicios por nombre DNS (`backend-users`, etc.).

[FORMATO]
1. Diff de `docker-compose.prod.yml`.
2. Verificación de comunicación interna.
3. Entrada de memoria.
---
### 3.7. Prompt para TASK-A-11: Grafana creds

Agente: security-fixer
[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-03, crítico).

[CONTEXTO]
Tarea: TASK-A-11 — Cambiar credenciales Grafana (admin/admin).
Archivo: `docker-compose.yml` (líneas ~192-199).

[TAREA]
1. Reemplaza `GF_SECURITY_ADMIN_PASSWORD: admin` por `${GRAFANA_ADMIN_PASSWORD}`.
2. Añade `GRAFANA_ADMIN_PASSWORD` a `.env.example` (placeholder).
3. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Diff del compose.
2. Contenido de `.env.example`.
3. Entrada de memoria.

---

### 3.8. Prompt para TASK-A-12: MP_DB_NAME

Agente: consistency-fixer

[ROL]
Actúa como `consistency-fixer`. Sigue `AGENTS.md` sección 8 (ARC-04).

[CONTEXTO]
Tarea: TASK-A-12 — Corregir `MP_DB_NAME` en docker-compose.
Archivos:
- `docker-compose.yml` (línea ~70)
- `backend-mp/src/config/env.js` (línea ~23)
- `backend-mp/src/config/database.js` (líneas ~22-23)

[TAREA]
1. En `docker-compose.yml`, cambia `DB_NAME=${MP_DB_NAME}` por `MP_DB_NAME=${MP_DB_NAME}` (o el nombre correcto según el schema Zod).
2. Verifica que `backend-mp` arranca sin abortar.
3. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Diff del compose.
2. Verificación de arranque.
3. Entrada de memoria.
---

## 4. Fase B — Reorganización y Correcciones
### 4.1. Prompt para TASK-B-01 a B-14: Migración feature-based

Agente: refactor-fixer

[ROL]
Actúa como `refactor-fixer`. Sigue `AGENTS.md` sección 8 y el plan de migración en `docs/migrations/backend-mp-feature-based.md`.

[CONTEXTO]
Tarea: [TASK-B-XX] — Migrar Lote [N] ([entidades]) a feature-based.
Plan: `docs/migrations/backend-mp-feature-based.md` (Lote [N]).
Archivos: `backend-mp/src/controllers/`, `routes/`, `models/`, `validations/`.

[TAREA]
1. Sigue el mapeo del plan para el Lote [N].
2. Crea `src/features/[entidad]/` para cada entidad del lote.
3. Mueve archivos con `git mv`.
4. Actualiza imports en los archivos movidos y en `routes/index.js`.
5. Ejecuta tests y verifica que `docker compose up` funciona.
6. Documenta en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No cambies lógica de negocio, solo estructura.
- Si un import no se puede resolver, detente y documenta.
- Un commit por lote.

[FORMATO]
1. Archivos movidos (tabla: origen → destino).
2. Imports actualizados.
3. Resultado de tests.
4. Entrada de memoria.

---

### 4.2. Prompt para TASK-B-15: JWT en Gateway

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-05, ARC-02).

[CONTEXTO]
Tarea: TASK-B-15 — Añadir JWT verification en API Gateway.
Archivo: `api-gateway/src/server.js` (líneas ~86-140).

[TAREA]
1. Añade middleware de verificación JWT en el Gateway.
2. Excluye rutas públicas: `/api/auth/login`, `/api/auth/register`, `/health`.
3. Propaga claims (userId, roles) en headers `X-User-Id`, `X-User-Roles` a los servicios.
4. Verifica que sin token, las rutas protegidas devuelven 401.
5. Documenta en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No dupliques la lógica de Users; solo verifica la firma.
- Usa `jsonwebtoken`.

[FORMATO]
1. Código del middleware.
2. Verificación con/sin token.
3. Entrada de memoria.

--- 

### 4.3. Prompt para TASK-B-16: CORS lista blanca

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-04).

[CONTEXTO]
Tarea: TASK-B-16 — CORS con lista blanca en Gateway.
Archivo: `api-gateway/src/server.js` (líneas ~23-40).

[TAREA]
1. Reemplaza `origin: true` por lista blanca desde `CORS_ORIGIN` (env var).
2. Si `CORS_ORIGIN` no está definido en producción, falla al arrancar.
3. Activa CSP de Helmet en producción.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código corregido.
2. Verificación con/sin origen permitido.
3. Entrada de memoria.

---
### 4.4. Prompt para TASK-B-17: RBAC en MP

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-06).

[CONTEXTO]
Tarea: TASK-B-17 — RBAC por operación en quejas, trabajos, asignaciones.
Archivos: `backend-mp/src/routes/queja.js`, `trabajo.js`, `asignacion.js`.

[TAREA]
1. Aplica `tienePermiso` en cada ruta protegida:
   - `quejas.crear`, `quejas.cerrar`, `quejas.asignar`
   - `trabajos.crear`, `trabajos.cerrar`
   - `asignaciones.crear`, `asignaciones.eliminar`
2. Corrige `tienePermiso` en `middleware/permissions.js` (usa `forEach` sin retorno).
3. Verifica que sin permiso, devuelve 403.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código corregido en rutas y middleware.
2. Tests de permisos.
3. Entrada de memoria.

---
### 4.5. Prompt para TASK-B-18: SQL injection

Agente: security-fixer

[ROL]
Actúa como `security-fixer`. Sigue `AGENTS.md` sección 8 (SEC-07).

[CONTEXTO]
Tarea: TASK-B-18 — Parametrizar SQL del dashboard (Sequelize replacements).
Archivo: `backend-mp/src/controllers/QuejaController.js` (líneas ~830-838).

[TAREA]
1. Reemplaza la interpolación de fechas en el string SQL por `replacements`.
2. Verifica que `normalizeDateRange` se usa correctamente.
3. Añade tests que validen que no hay inyección.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código corregido.
2. Tests.
3. Entrada de memoria.

---
### 4.6. Prompt para TASK-B-19: Reordenar rutas dashboard

Agente: refactor-fixer

[ROL]
Actúa como `refactor-fixer`. Sigue `AGENTS.md` sección 8 (BUS-02).

[CONTEXTO]
Tarea: TASK-B-19 — Reordenar rutas `/dashboard/*` antes de `/:id`.
Archivo: `backend-mp/src/routes/queja.js` (líneas ~20, 45-53).

[TAREA]
1. Mueve las rutas `GET /dashboard/*` antes de `GET /:id`.
2. Verifica que `GET /dashboard/resumen` funciona.
3. Verifica que `GET /:id` sigue funcionando para IDs válidos.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código reordenado.
2. Verificación de ambas rutas.
3. Entrada de memoria.

---
### 4.7. Prompt para TASK-B-20: Migraciones

Agente: db-migration-specialist

[ROL]
Actúa como `db-migration-specialist`. Sigue `AGENTS.md` sección 8 (DAT-01) y la skill `sequelize-migrations`.

[CONTEXTO]
Tarea: TASK-B-20 — Migraciones versionadas + índices (Users, MP).
Problema: No hay `migrations/`, se usa `sequelize.sync({ force: false })`, sin índices.

[TAREA]
1. Crea `migrations/` en `backend-users` y `backend-mp`.
2. Genera migraciones para las tablas existentes (sin perder datos).
3. Añade índices en: `estado`, FKs, `fecha`.
4. Reemplaza `sequelize.sync({ force: false })` por `sequelize.sync({ alter: false })` + migraciones.
5. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Archivos de migración.
2. Índices añadidos.
3. Entrada de memoria.

---
### 4.8. Prompt para TASK-B-21: Tests JS

Agente: test-initializer

[ROL]
Actúa como `test-initializer`. Sigue `AGENTS.md` sección 8 (QA-01) y la skill `jest-supertest-setup`.

[CONTEXTO]
Tarea: TASK-B-21 — Sustituir `npm test` placeholder por Jest/Supertest.
Problema: `backend-users/package.json:10` y `backend-mp/package.json:10` tienen `"test": "exit 1"`.

[TAREA]
1. Configura Jest + Supertest en `backend-users` y `backend-mp`.
2. Crea tests básicos para los endpoints críticos (auth, quejas, trabajos).
3. Verifica que `npm test` pasa.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Configuración de Jest.
2. Tests creados.
3. Resultado de `npm test`.
4. Entrada de memoria.

---
### 4.9. Prompt para TASK-B-22: Saga MP → Materials

Agente: integration-specialist

[ROL]
Actúa como `integration-specialist`. Sigue `AGENTS.md` sección 8 (ARC-03) y la skill `microservices-saga-pattern`.

[CONTEXTO]
Tarea: TASK-B-22 — Saga/compensación al cerrar queja (MP → Materials).
Problema: Cerrar queja solo actualiza MP, no registra consumo en Materials.

[TAREA]
1. Diseña la saga: al cerrar queja, llamar a Materials para registrar consumo.
2. Implementa compensación si Materials falla (revertir cierre o marcar pendiente).
3. Añade timeout y retry con backoff.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Diagrama de la saga (Mermaid).
2. Código implementado.
3. Tests.
4. Entrada de memoria.

---
## 5. Fase C — Documentación
### 5.1. Prompt para TASK-C-01 a C-10: Traducción bilingüe

Agente: docs-writer

[ROL]
Actúa como `docs-writer`. Sigue `AGENTS.md` sección 9 y la skill `report-generation`.

[CONTEXTO]
Tarea: [TASK-C-XX] — [Renombrar/traducir] `docs/[archivo].md`.
Convención: archivos paralelos `.es.md` / `.ru.md`.

[TAREA]
1. Renombra `docs/[archivo].md` a `docs/[archivo].es.md`.
2. Crea `docs/[archivo].ru.md` con la traducción fiel al ruso.
3. Actualiza enlaces internos en otros documentos.
4. Actualiza `docs/00_index.es.md` y `.ru.md`.
5. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Archivos creados/renombrados.
2. Verificación de enlaces.
3. Entrada de memoria.

---
### 5.2. Prompt para TASK-C-11: Alinear ARCHITECTURE.md

Agente: docs-writer

[ROL]
Actúa como `docs-writer`. Sigue `AGENTS.md` sección 8 (ARC-01) y la skill `sisgad5-architecture`.

[CONTEXTO]
Tarea: TASK-C-11 — Alinear `ARCHITECTURE.md` con código real.
Problema: Docs dicen Gin, pero es gorilla/mux. Docs dicen Redis/Prometheus, pero no están en compose.

[TAREA]
1. Corrige `ARCHITECTURE.md`:
   - Materials: gorilla/mux (no Gin).
   - Redis: marcar como "planificado" o eliminar.
   - Prometheus: marcar como "planificado" o eliminar.
   - Prediction Service: añadir (ya está en SPEC.md).
2. Verifica que los diagramas Mermaid reflejan la realidad.
3. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Diff de `ARCHITECTURE.md`.
2. Diagramas actualizados.
3. Entrada de memoria.

---
### 5.3. Prompt para TASK-C-12: Actualizar AGENTS.md

Agente: docs-writer

[ROL]
Actúa como `docs-writer`. Sigue `AGENTS.md` sección 8.

[CONTEXTO]
Tarea: TASK-C-12 — Actualizar `AGENTS.md` con hallazgos de auditoría.
Problema: La sección 8 debe reflejar el estado actual de la deuda técnica.

[TAREA]
1. Revisa `docs/audit/AUDITORIA.md`.
2. Actualiza la sección 8 de `AGENTS.md`:
   - Marca hallazgos resueltos (✅).
   - Añade nuevos hallazgos si los hay.
   - Actualiza la tabla de "Prohibido mientras tanto".
3. Si todos los hallazgos están resueltos, mueve la sección a `docs/audit/AUDITORIA.md` (histórico) y elimínala de `AGENTS.md`.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Diff de `AGENTS.md`.
2. Estado de hallazgos.
3. Entrada de memoria.

---
## 6. Fase D — Módulo Predictivo
### 6.1. Prompt para TASK-D-01 a D-03: Setup

Agente: ml-engineer

[ROL]
Actúa como `ml-engineer`. Sigue `AGENTS.md` sección 3.4 y la skill `ml-modeling`.

[CONTEXTO]
Tarea: [TASK-D-01 / D-02 / D-03] — [Crear estructura / Configurar FastAPI / Configurar bd_predictions].

[TAREA]
1. Crea `prediction-service/` con estructura:

app/
├── main.py
├── config.py
├── api/v1/
├── core/features/
├── core/models/
├── core/training/
├── core/evaluation/
├── db/
├── schemas/
└── utils/
text

2. Configura `requirements.txt` o `pyproject.toml` con: fastapi, uvicorn, scikit-learn, xgboost, prophet, pandas, numpy, mlflow, sqlalchemy, pydantic.
3. Configura `bd_predictions` en `docker-compose.yml`.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Estructura creada.
2. Dependencias.
3. Entrada de memoria.

---
### 6.2. Prompt para TASK-D-04 a D-07: Feature engineering

Agente: ml-engineer

[ROL]
Actúa como `ml-engineer`. Sigue `AGENTS.md` sección 3.4.

[CONTEXTO]
Tarea: [TASK-D-04 / D-05 / D-06 / D-07] — Feature engineering ([quejas/materiales/trabajos]).
Datos: sintéticos (anonimizados de datos reales).

[TAREA]
1. Crea `app/core/features/[entidad].py`.
2. Define features:
   - Quejas: prioridad, estado, técnico, ubicación, tipo.
   - Materiales: categoría, costo, consumo histórico, estacionalidad.
   - Trabajos: duración, técnico, tipo de falla.
3. Documenta cada feature (nombre, tipo, fuente, transformación).
4. Genera script de anonimización de datos reales.
5. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código de features.
2. Documentación de features.
3. Script de anonimización.
4. Entrada de memoria.

---
### 6.3. Prompt para TASK-D-08 a D-12: Modelos

Agente: ml-engineer

[ROL]
Actúa como `ml-engineer`. Sigue `AGENTS.md` sección 3.4.

[CONTEXTO]
Tarea: [TASK-D-08 / D-09 / D-10 / D-11 / D-12] — Modelo: [demanda materiales / tiempo resolución / anomalías / prioridad quejas / fallos infraestructura].
Criterio: [MAE < 15% / MAE < 20% / Precision > 85% / Accuracy > 80% / Recall > 75%].

[TAREA]
1. Crea `app/core/training/train_[modelo].py`.
2. Entrena modelo (Prophet/XGBoost/RandomForest según caso).
3. Evalúa con métricas del criterio.
4. Serializa modelo en `models/` (gitignored).
5. Registra en MLflow (si disponible).
6. Documenta métricas en `docs/memory/[fecha de hoy].md`.

[RESTRICCIONES]
- No uses datos reales sin anonimizar.
- No escribas en `bd_materiales` (solo lectura).
- Versiona el modelo con SemVer.

[FORMATO]
1. Código de entrenamiento.
2. Métricas obtenidas.
3. Entrada de memoria.

---
### 6.4. Prompt para TASK-D-09 a D-11: API + integración

Agente: ml-engineer

[ROL]
Actúa como `ml-engineer`. Sigue `AGENTS.md` sección 3.4.

[CONTEXTO]
Tarea: [TASK-D-09 / D-10 / D-11] — [API REST / Integrar Gateway / Dashboard predicciones].

[TAREA]
1. Crea endpoints en `app/api/v1/predictions.py`:
   - `GET /api/predictions/demanda-materiales`
   - `GET /api/predictions/tiempo-resolucion/{queja_id}`
   - `GET /api/predictions/anomalias-consumo`
   - `GET /api/predictions/prioridad-queja/{queja_id}`
   - `GET /api/predictions/fallos-infraestructura`
2. Integra con Gateway (`api-gateway/src/routes/`).
3. Crea dashboard en `frontend/src/pages/Predictions/`.
4. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Código de endpoints.
2. Integración con Gateway.
3. Dashboard.
4. Entrada de memoria.

---
### 6.5. Prompt para TASK-D-20 a D-21: Datos sintéticos

Agente: ml-engineer

[ROL]
Actúa como `ml-engineer`. Sigue `AGENTS.md` sección 3.4.

[CONTEXTO]
Tarea: [TASK-D-20 / D-21] — [Protocolo de datos sintéticos / Validar modelos con datos sintéticos].

[TAREA]
1. Documenta el protocolo de anonimización en `docs/thesis/protocolo_datos_sinteticos.md`:
   - Qué se anonimiza (nombres, direcciones, teléfonos).
   - Cómo se genera (Faker, muestreo estadístico).
   - Cómo se valida (distribución similar a real).
2. Genera dataset sintético.
3. Valida modelos con el dataset.
4. Reporta métricas en `docs/thesis/06_modelado_predictivo.es.md` y `.ru.md`.
5. Documenta en `docs/memory/[fecha de hoy].md`.

[FORMATO]
1. Protocolo documentado.
2. Dataset generado (resumen).
3. Métricas.
4. Entrada de memoria.

---
## 7. Parte II — Inventario Funcional

Para las tareas de la Parte II (Fases 0–13), usa la plantilla base (sección 2) con el agente recomendado en AGENTS.md sección 9:
Fase	Agente
0–2	backend-developer / consistency-fixer
3 (Users)	backend-developer
4 (MP)	backend-developer
5 (Materials)	backend-developer (skill gorm-performance)
6 (Gateway)	backend-developer
7 (Frontend)	frontend-developer
8 (Testing)	test-initializer
9 (Deploy)	backend-developer
10 (Analytics)	backend-developer
11 (Predictivo)	ml-engineer
12–13	docs-writer / backend-developer

---
Para cada tarea de redacción (TASK-1400-01 a 1400-09), usa este prompt con el agente docs-writer:

[ROL]
Actúa como `docs-writer`. Sigue `AGENTS.md` y `docs/thesis/ESTRUCTURA_INFORME.es.md`.

[CONTEXTO]
Tarea: [TASK-1400-XX] — Redactar sección [X.X.X] del informe de práctica.
Fuente: [archivo de referencia].
Idioma: español (luego se traduce al ruso).

[TAREA]
1. Lee la fuente indicada.
2. Redacta la sección en español, con:
   - Introducción al tema.
   - Desarrollo (tablas, listas, diagramas Mermaid si aplica).
   - Conclusiones parciales.
3. Cita fuentes en formato ГОСТ 7.0.5-2008.
4. Guarda en `docs/thesis/informe_practica/[seccion].es.md`.

[RESTRICCIONES]
- No inventes datos. Si falta información, marca `[TODO: ...]`.
- Usa tablas para comparativas.
- Usa Mermaid para diagramas.

[FORMATO]
1. Contenido redactado.
2. Referencias usadas.
3. `[TODO]` pendientes.

---
Flujo de traducción (TASK-1420-01)

[ROL]
Actúa como `docs-writer` bilingüe (ES/RU).

[CONTEXTO]
Tarea: TASK-1420-01 — Traducir informe completo al ruso.
Fuente: `docs/thesis/informe_practica/*.es.md`.

[TAREA]
1. Traduce cada sección al ruso, manteniendo:
   - Estructura y numeración.
   - Tablas y diagramas.
   - Referencias ГОСТ.
2. Guarda en `docs/thesis/informe_practica/[seccion].ru.md`.

[RESTRICCIONES]
- Traducción técnica fiel, no literal.
- Mantén términos técnicos en inglés si son estándar (JWT, microservicios → микросервисы).
- Verifica formato ГОСТ en ruso.

[FORMATO]
1. Archivos traducidos.
2. Glosario de términos usados.

---

## 8. Cierre de tarea (memoria)

Ejecutar SIEMPRE al final de cada tarea.

[ROL]
Actúa como Technical Lead.

[TAREA]
Genera la entrada de memoria para la tarea [TASK-XXX-YY] completada.

[FORMATO]
### [Fecha] — [TASK-XXX-YY]: [Nombre]

**Tipo:** [Implementación / Refactorización / Bugfix / Decisión]
**Estado:** ✅ Completada

#### Qué se hizo
- [1-2 líneas]

#### Por qué se hizo de esa forma
- [Justificación]

#### Dónde están los cambios
- `ruta/archivo1`
- `ruta/archivo2`

#### Qué hemos aprendido
- [Lección]

#### Dependencias desbloqueadas
- [Tareas]

---

Añade también la línea al índice `memory.md`:

| [Fecha] | [TASK-XXX-YY] | [Resumen] | [ver](docs/memory/[fecha].md#task-xxx-yy) |

---
## 9. Verificación (QA)

Ejecutar después de tareas críticas (A, B, D).

[ROL]
Actúa como QA Engineer.

[CONTEXTO]
Tarea completada: [TASK-XXX-YY].

[TAREA]
Verifica:
1. Criterio de aceptación cumplido.
2. Tests existentes pasan.
3. No se introdujeron hallazgos nuevos de auditoría (AGENTS.md sección 8).
4. No se violaron reglas de oro.
5. Código comentado en español.
6. Conventional Commits usados.

[FORMATO]
| Check | Estado |
|---|---|
| Criterio de aceptación | ✅ / ❌ |
| Tests pasan | ✅ / ❌ |
| Sin hallazgos nuevos | ✅ / ❌ |
| Reglas de oro | ✅ / ❌ |
| Comentarios en español | ✅ / ❌ |
| Conventional Commits | ✅ / ❌ |

Si hay ❌, propón corrección.

---
## 10. Plantillas de reporte
### 10.1. Reporte de tarea completada

## 📌 Reporte — [TASK-XXX-YY]: [Nombre]

**Módulo:** [Módulo]
**Agente:** [agente]
**Estado:** ✅ Completada

### Cambios
- [cambio 1]
- [cambio 2]

### Archivos modificados
- `ruta/archivo1`
- `ruta/archivo2`

### Tests
- [ ] Test unitario: [nombre]
- [ ] Test integración: [nombre]

### Evidencia
[Capturas, logs, fragmentos]

### Próximos pasos
- [Siguiente tarea recomendada]

---
### 10.2. Reporte de bloqueo

## 🚫 Bloqueo — [TASK-XXX-YY]: [Nombre]

**Motivo:** [descripción]
**Archivo:** [ruta]
**Error:** [mensaje]

### Alternativas propuestas
1. [Alternativa 1]
2. [Alternativa 2]

### Decisión requerida
[Qué necesita el humano para desbloquear]

    Mantenido por: Ing. Botet S.Y.
    Última actualización: 2026-10-23
    Licencia: Uso académico — Tesis de Maestría RTU MIREA