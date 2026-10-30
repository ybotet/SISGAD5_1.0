#  AGENTS.md — Reglas de Oro del Proyecto SISGAD5

> **Propósito:** Contrato global del proyecto. Kilo Code lo carga automáticamente en cada sesión.
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0
> **Autor:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> **Versión:** 2.0

---

## 1. Contexto del Proyecto

SISGAD5 es un **sistema de soporte a la toma de decisiones (DSS)** para la gestión operativa de la Dirección No. 5 (DAG5) de ETECSA (Cuba). Reemplaza un sistema heredado en Microsoft Access.

**Capacidades integradas:**
- **A. Gestión operativa transaccional:** microservicios con ACID y concurrencia.
- **B. Visualización para decidir:** dashboards interactivos.
- **C. Predicción para anticipar:** modelado predictivo (ML).

---

## 2. Stack Tecnológico

| Componente         | Tecnología                                                 | Puerto |
| ------------------ | ---------------------------------------------------------- | ------ |
| Frontend           | React 18 + Vite + TypeScript + Tailwind                    | 5004   |
| API Gateway        | Node.js + Express + http-proxy-middleware                  | 5000   |
| Users Service      | Node.js + Express + Sequelize                              | 5001   |
| MP Service         | Node.js + Express + Sequelize + Zod                        | 5002   |
| Materials Service  | Go + gorilla/mux + GORM                                    | 5003   |
| Prediction Service | Python 3.11+ + FastAPI + scikit-learn                      | 5005   |
| PostgreSQL         | 17+ (3 BD: bd_users, bd_mp, bd_materiales, bd_predictions) | 5432   |
| Redis              | 7+                                                         | 6379   |

---

## 3. Reglas de Oro (inviolables)

### 3.1. Arquitectura
- ❌ **Prohibido** acceder directamente a la BD de otro microservicio.
- ❌ **Prohibido** mezclar lógica de negocio entre microservicios.
- ❌ **Prohibido** que el frontend se comunique directamente con un microservicio (solo con el Gateway).
- ✅ **Obligatorio** que cada microservicio sea dueño exclusivo de su BD.
- ✅ **Obligatorio** comunicación REST/JSON entre servicios.

### 3.2. Seguridad
- ❌ **Prohibido** subir secretos o credenciales al código (usar `.env.local` gitignored).
- ❌ **Prohibido** versionar `.env`, `.env.docker`, `.env.production` (solo `.env.example`).
- ✅ **Obligatorio** validar entradas en todos los endpoints.
- ✅ **Obligatorio** usar códigos HTTP semánticos (400, 401, 403, 404, 409, 500).

### 3.3. Integridad de datos
- ✅ **Obligatorio** transacciones ACID en operaciones críticas (asignaciones, consumos, cambios de estado).
- ✅ **Obligatorio** trazabilidad financiera (precio congelado en momento de operación).
- ✅ **Obligatorio** auditoría de acciones (quién, qué, cuándo).

### 3.4. Predicción
- ❌ **Prohibido** escribir en `bd_mp` o `bd_materiales` desde Prediction Service (solo lectura).
- ❌ **Prohibido** subir modelos entrenados al repositorio (usar MLflow o DVC).
- ❌ **Prohibido** usar datos reales de producción sin anonimizar.
- ✅ **Obligatorio** versionar modelos con SemVer.
- ✅ **Obligatorio** documentar features, algoritmos y métricas de cada modelo.

---

## 4. Convenciones de Código

| Lenguaje              | Convención                              | Ejemplo                 |
| --------------------- | --------------------------------------- | ----------------------- |
| JavaScript/TypeScript | camelCase                               | `asignacionService.js`  |
| Go                    | snake_case                              | `asignacion_service.go` |
| Python                | snake_case                              | `asignacion_service.py` |
| Base de datos         | snake_case                              | `tb_asignaciones`       |
| Archivos Markdown     | snake_case con prefijo                  | `01_introduction.es.md` |
| Tests                 | `*.test.js` / `*_test.go` / `test_*.py` | `auth.test.js`          |

**Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).

**Ramas:** `feature/nombre`, `fix/nombre`, `refactor/nombre`, `docs/nombre`.

---

## 5. Archivos de Referencia (leer antes de implementar)

| Archivo           | Cuándo leerlo                                              |
| ----------------- | ---------------------------------------------------------- |
| `SPEC.md`         | Antes de implementar cualquier funcionalidad               |
| `ARCHITECTURE.md` | Antes de tocar arquitectura o comunicación entre servicios |
| `TASKLIST.md`     | Para identificar la tarea actual                           |
| `PROMPTS.md`      | Para elegir el prompt de la fase correcta                  |
| `memory.md`       | Al inicio y al final de cada tarea                         |
| `docs/`           | Para contexto funcional detallado                          |

---

## 6. Flujo de Trabajo por Tarea
1. Leer AGENTS.md + SPEC.md + ARCHITECTURE.md + memory.md
2. Identificar tarea en TASKLIST.md
3. Copiar prompt de PROMPTS.md (fase correspondiente)
4. Implementar
5. Verificar (tests + seguridad)
6. Registrar en memory.md
7. Marcar tarea como completada en TASKLIST.md y actualizar las cantidades y porcientos en las tablas resumenes al final del TASKLIST.md
8. Commit con Conventional Commits


---

## 7. Restricciones Absolutas

1. **Nunca** modificar la arquitectura sin consultar al autor.
2. **Nunca** introducir dependencias que rompan compatibilidad.
3. **Nunca** eliminar tests existentes.
4. **Siempre** ejecutar tests antes de commitear.
5. **Siempre** documentar cambios en `CHANGELOG.md`.
6. **Siempre** preguntar al autor si hay ambigüedad o duda.
7. Para tomar alguna desición muestra las opciones y yo elijo.

---

## 8. Deuda Técnica Activa (Auditoría 2026-10-07)

> **⚠️ Esta sección es temporal.** Se elimina cuando todos los hallazgos estén resueltos.
> **Fuente completa:** `docs/audit/AUDITORIA.md`

### Hallazgos Críticos (🔴) — Resolver en Fase A

| ID     | Hallazgo                                                           | Tarea                | Prohibido mientras tanto                                 |
| ------ | ------------------------------------------------------------------ | -------------------- | -------------------------------------------------------- |
| SEC-01 | ✅ JWT con fallback `"secreto"`                                    | TASK-A-08            | Eliminado fallback; validación de arranque en Users y MP |
| SEC-02 | ✅ Materials con JWT middleware + puerto 5003 cerrado en prod      | TASK-A-09, A-10 (✅) | Materials accesible solo vía Gateway en prod             |
| SEC-03 | ✅ Grafana admin/admin reemplazado por `${GRAFANA_ADMIN_PASSWORD}` | TASK-A-11            | Usar contraseña externa, no hardcodeada                  |

### Hallazgos Altos (🟠) — Resolver en Fase B

| ID     | Hallazgo                                                                                       | Tarea         | Prohibido mientras tanto                                  |
| ------ | ---------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------- |
| SEC-04 | ✅ CORS con lista blanca                                                                       | TASK-B-16     | `CORS_ORIGIN` obligatorio en prod                         |
| SEC-05 | ✅ Gateway verifica JWT (middleware)                                                           | TASK-B-15     | N/A — resuelto                                            |
| SEC-06 | ✅ RBAC aplicado en MP                                                                         | TASK-B-17     | `tienePermiso` aplicado en quejas, trabajos, asignaciones |
| SEC-07 | ✅ Parametrizado con Sequelize replacements                                                    | TASK-B-18     | No interpolar strings en SQL                              |
| ARC-01 | ✅ Docs alineadas: gorilla/mux (no Gin), Prediction Service (5005), Redis/Prometheus "planned" | TASK-C-11     | Docs = código                                             |
| ARC-02 | ✅ Gateway propaga claims via headers                                                          | TASK-B-15     | N/A — mitigado (claims en JWT, no llamadas síncronas)     |
| ARC-03 | ✅ Cerrar queja orquesta consumo en Materials                                                  | TASK-B-22     | Saga con compensación — rollback si Materials falla       |
| ARC-04 | ✅ `MP_DB_NAME` corregido en docker-compose                                                    | TASK-A-12     | No asumir `DB_NAME=${MP_DB_NAME}` sin pasar la var         |
| BUS-01 | ⏳ Stock real comentado en Go — `verificarStockAsignacion` es placeholder                      | TASK-520-05   | No descontar stock sin validación; riesgo de stock negativo |
| BUS-02 | ✅ Rutas `/dashboard/*` antes de `/:id`                                                        | TASK-B-19     | No añadir rutas después de `/:id`                         |
| DAT-01 | ✅ Migraciones + índices creados                                                               | TASK-B-20     | No añadir modelos sin migración                           |
| QA-01  | ✅ `npm test` passes (27 MP + 11 Users)                                                        | TASK-B-21     | Confiar en CI                                             |

### Hallazgos Medios (🟡)

| ID     | Hallazgo                                                                 | Tarea                | Prohibido mientras tanto                          |
| ------ | ------------------------------------------------------------------------ | ------------------- | ------------------------------------------------- |
| SEC-08 | ⏳ `DebugLogin` con credenciales fijas en frontend                       | (Fase B, frontend)  | No exponer DebugLogin en builds de producción     |
| ARC-05 | ⏳ Health checks no prueban PostgreSQL                                   | (Fase B)            | No asumir readiness sin ping a BD                 |
| ARC-06 | ⏳ `X-Request-Id` se genera por servicio, no se propaga en el proxy      | (Fase B)            | No añadir servicios sin propagación de trace ID   |
| ARC-07 | ⏳ Gateway no declara `MATERIALES_SERVICE_URL` ni `depends_on`           | (Fase B)            | No confiar en DNS implícito en prod               |
| BUS-03 | ⏳ Máquina de estados más laxa que SPEC (p.ej. `Probada → Resuelta`)    | (Fase B)            | No saltar estados en producción                   |
| BUS-04 | ⏳ `fecha` de queja es `STRING`, no `DATE`/`TIMESTAMP`                   | (Fase B)            | No añadir índices de fecha sin tipo correcto      |
| DAT-02 | ⏳ `SkipDefaultTransaction: true` en GORM                                | (Fase A, revisar)   | No escribir stock fuera de `Transaction()`        |
| DAT-03 | ⏳ N+1: carga de detalles de consumo en bucle                            | (Fase B)            | No usar loops de carga secundaria; usar `Preload` |
| QA-02  | ⏳ Pocos tests de Node/Frontend                                          | TASK-800-01, 800-02 | No confiar en CI sin cobertura ≥ 70%              |
| QA-03  | ⏳ Código muerto: `AuthController` MP, `useAuth` hook                    | (Fase B)            | No añadir más código muerto                       |

### Hallazgos Bajos (🟢)

| ID     | Hallazgo                                                                 | Tarea         | Prohibido mientras tanto                          |
| ------ | ------------------------------------------------------------------------ | ------------- | ------------------------------------------------- |
| QA-04  | ⏳ Duplicación de `authLimiter` en el gateway                            | (Fase B)      | No duplicar middleware                            |
| QA-05  | ⏳ Comentario de rutas Go dice `/api/v1/`; rutas son `/api/materiales`   | (Fase B)      | Alinear logs y docs                              |
| QA-06  | ✅ `tienePermiso` recorre roles en `forEach` sin retorno                 | TASK-B-17     | Limpiar `forEach` → `some()`/return explícito     |
| QA-07  | ⏳ Tipo `User` del hook muerto incluye `password_hash`                  | (Fase B)      | No modelar hashes en el cliente                   |

### Reglas derivadas de la auditoría

1. **Nunca** usar `JWT_SECRET || "secreto"`. Fallar al arrancar si falta.
2. **Nunca** añadir rutas antes de `/:id` (orden importa en Express).
3. **Nunca** interpolar strings en SQL. Usar `replacements` de Sequelize.
4. **Nunca** asumir que un servicio está autenticado sin verificar el middleware.
5. **Siempre** añadir `tienePermiso` en rutas nuevas.
6. **Siempre** crear migración al añadir/modificar modelo.
7. **Siempre** documentar en `memory.md` si se encuentra un nuevo hallazgo.

### Cómo actualizar esta sección

- Cuando una tarea se completa, marcar el hallazgo como resuelto (cambiar ⏳ a ✅).
- Cuando todos estén resueltos, mover la sección a `docs/audit/AUDITORIA.md` (histórico) y eliminar de `AGENTS.md`.


---

## 9. Mapeo Tarea → Agente Recomendado

> **Propósito:** Saber qué agente de `.agents/agents/` usar para cada tipo de tarea.
> **Regla:** Si no hay agente específico, usar el más cercano y documentar en `memory.md`.

### Fase A — Limpieza y Seguridad

| Tarea                                  | Agente              | Skill                    |
| -------------------------------------- | ------------------- | ------------------------ |
| TASK-A-01 (rotar credenciales)         | `security-fixer`    | `security-jwt-hardening` |
| TASK-A-02 (gitignore)                  | `project-auditor`   | `code-audit-methodology` |
| TASK-A-03, A-04, A-05, A-06 (limpieza) | `project-auditor`   | `code-audit-methodology` |
| TASK-A-07 (verificar .env.example)     | `security-fixer`    | `security-jwt-hardening` |
| TASK-A-08 (JWT fallback)               | `security-fixer`    | `security-jwt-hardening` |
| TASK-A-09 (JWT en Go)                  | `security-fixer`    | `security-go-middleware` |
| TASK-A-10 (cerrar puertos)             | `security-fixer`    | —                        |
| TASK-A-11 (Grafana creds)              | `security-fixer`    | —                        |
| TASK-A-12 (MP_DB_NAME)                 | `consistency-fixer` | `sisgad5-architecture`   |

### Fase B — Reorganización y Correcciones

| Tarea                           | Agente                    | Skill                        |
| ------------------------------- | ------------------------- | ---------------------------- |
| TASK-B-01 a B-14 (migración MP) | `refactor-fixer`          | `code-refactoring-tech-debt` |
| TASK-B-15 (JWT en Gateway)      | `security-fixer`          | `security-jwt-hardening`     |
| TASK-B-16 (CORS)                | `security-fixer`          | —                            |
| TASK-B-17 (RBAC)                | `security-fixer`          | `security-jwt-hardening`     |
| TASK-B-18 (SQL injection)       | `security-fixer`          | `sequelize-migrations`       |
| TASK-B-19 (rutas dashboard)     | `refactor-fixer`          | `code-refactoring-tech-debt` |
| TASK-B-20 (migraciones)         | `db-migration-specialist` | `sequelize-migrations`       |
| TASK-B-21 (tests JS)            | `test-initializer`        | `jest-supertest-setup`       |
| TASK-B-22 (saga)                | `integration-specialist`  | `microservices-saga-pattern` |

### Fase C — Documentación

| Tarea                            | Agente        | Skill                  |
| -------------------------------- | ------------- | ---------------------- |
| TASK-C-01 a C-10 (traducción)    | `docs-writer` | `report-generation`    |
| TASK-C-11 (alinear ARCHITECTURE) | `docs-writer` | `sisgad5-architecture` |
| TASK-C-12 (actualizar AGENTS)    | `docs-writer` | `sisgad5-architecture` |

### Fase D — Predictivo

| Tarea                                 | Agente        | Skill                              |
| ------------------------------------- | ------------- | ---------------------------------- |
| TASK-D-01 a D-03 (setup)              | `ml-engineer` | `ml-modeling` (nuevo)              |
| TASK-D-04 a D-08 (features + modelos) | `ml-engineer` | `ml-modeling`                      |
| TASK-D-09 a D-11 (API + integración)  | `ml-engineer` | `ml-modeling`                      |
| TASK-D-12 a D-13 (MLOps)              | `ml-engineer` | `ml-modeling`                      |
| TASK-D-14 a D-16 (tests + docs)       | `ml-engineer` | `ml-modeling`, `report-generation` |
| TASK-D-20 a D-21 (datos sintéticos)   | `ml-engineer` | `ml-modeling`                      |

### Parte II — Inventario Funcional

| Tarea                    | Agente               | Skill                                         |
| ------------------------ | -------------------- | --------------------------------------------- |
| TASK-300-* (Users)       | `backend-developer`  | —                                             |
| TASK-400-* (MP)          | `backend-developer`  | —                                             |
| TASK-500-* (Materials)   | `backend-developer`  | `gorm-performance`                            |
| TASK-600-* (Gateway)     | `backend-developer`  | —                                             |
| TASK-700-* (Frontend)    | `frontend-developer` | —                                             |
| TASK-800-* (Tests)       | `test-initializer`   | `jest-supertest-setup`, `go-testing-patterns` |
| TASK-1300-* (Predictivo) | `ml-engineer`        | `ml-modeling`                                 |

### Skills nuevos necesarios

| Skill         | Propósito                                               | Ubicación                             |
| ------------- | ------------------------------------------------------- | ------------------------------------- |
| `ml-modeling` | Patrones de ML (features, training, evaluation, MLflow) | `.agents/skills/ml-modeling/SKILL.md` |

### Cómo invocar un agente en Kilo Code

1. Abre Kilo Code en VS Code.
2. Selecciona el agente en el selector de modos (ej. `refactor-fixer`).
3. Copia el prompt de la tarea (de `PROMPTS.md`).
4. Rellena los placeholders (`[TASK-XXX]`, `[archivo]`, etc.).
5. Ejecuta.
6. Al terminar, pide al agente que actualice `memory.md` (índice + detalle).
7. Revisa, haz commit, marca la tarea en `TASKLIST.md`.

---

> **Última actualización:** 2026-10-29
> **Mantenido por:** Ing. Botet S.Y.
> **Licencia:** Uso académico — Tesis de Maestría RTU MIREA