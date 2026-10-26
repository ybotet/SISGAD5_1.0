# ✅ TASKLIST.md — Lista de Tareas del Proyecto SISGAD5

> **Versión:** 2.0
> **Proyecto:** SISGAD5 — Sistema de Soporte a la Toma de Decisiones para la Dirección No. 5 (ETECSA)
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0
> **Autor:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> **Última actualización:** 2026-10-23
> **Estado:** En progreso (~20% completado)

---

## 📑 Tabla de Contenidos

### PARTE I — Plan de Consolidación (ejecutar primero)
1. [FASE A — Limpieza y Seguridad Crítica](#fase-a--limpieza-y-seguridad-crítica)
2. [FASE B — Reorganización y Correcciones Arquitectónicas](#fase-b--reorganización-y-correcciones-arquitectónicas)
3. [FASE C — Consolidación de Documentación](#fase-c--consolidación-de-documentación)
4. [FASE D — Módulo Predictivo + Tesis](#fase-d--módulo-predictivo--tesis)

### PARTE II — Inventario Funcional (ejecutar después de Fase B)
5. [FASE 0 — Planificación](#fase-0--planificación)
6. [FASE 1 — Diseño](#fase-1--diseño)
7. [FASE 2 — Infraestructura](#fase-2--infraestructura)
8. [FASE 3 — Users Service](#fase-3--users-service)
9. [FASE 4 — MP Service](#fase-4--mp-service)
10. [FASE 5 — Materials Service](#fase-5--materials-service)
11. [FASE 6 — API Gateway](#fase-6--api-gateway)
12. [FASE 7 — Frontend](#fase-7--frontend)
13. [FASE 8 — Testing y QA](#fase-8--testing-y-qa)
14. [FASE 9 — Despliegue y Operación](#fase-9--despliegue-y-operación)
15. [FASE 10 — Analítica y Reportes](#fase-10--analítica-y-reportes)
16. [FASE 11 — Módulo Predictivo (MLOps)](#fase-11--módulo-predictivo-mlops)
17. [FASE 12 — Documentación Final y Defensa](#fase-12--documentación-final-y-defensa)
18. [FASE 13 — Mantenimiento y Evolución](#fase-13--mantenimiento-y-evolución)

### ANEXOS
- [Hallazgos de Auditoría Pendientes](#hallazgos-de-auditoría-pendientes)
- [Resumen de Progreso](#resumen-de-progreso)

---

## Leyenda

| Símbolo | Significado          |
| ------- | -------------------- |
| ✅      | Completada           |
| 🔄     | En progreso          |
| ⏳       | Pendiente            |
| 🚫     | Bloqueada            |
| ❌      | Cancelada            |
| 🔴     | Crítica (bloqueante) |
| 🟡     | Alta                 |
| 🟢     | Media                |
| ⚪      | Baja                 |
| ⚡      | < 1h                 |
| 🔨     | 1–4h                 |
| 🏗️   | 1–3d                 |
| 🏛️   | > 3d                 |

---

# PARTE I — PLAN DE CONSOLIDACIÓN

> **Objetivo:** Limpiar, reorganizar y corregir el proyecto antes de completar funcionalidades.
> **Orden:** A → B → C → D. No se puede saltar fases.

---

## FASE A — Limpieza y Seguridad Crítica

> **Duración estimada:** 2–3 días
> **Objetivo:** Eliminar artefactos, proteger secretos, cerrar brechas de seguridad críticas.

| Estado | Prioridad | Esfuerzo | ID            | Descripción                                                     | Origen                  | Criterio de Aceptación                        |
| ------ | --------- | -------- | ------------- | --------------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| ✅      | 🔴       | 🔨      | TASK-A-01     | Rotar credenciales expuestas (JWT_SECRET, DB_PASSWORD)          | Plan                    | Nuevos secretos en `.env.local` (gitignored)  |
| ✅      | 🔴       | 🔨      | TASK-A-02     | Crear `.gitignore` completo                                     | Plan                    | Cubre node_modules, logs, dist, .env, api.exe |
| ✅      | 🔴       | 🔨      | TASK-A-03     | Eliminar del índice: node_modules, logs, dist, .env, api.exe    | Plan                    | `git status` limpio                           |
| ✅      | 🔴       | 🔨      | TASK-A-04     | Eliminar carpetas: backup/, Continue/, .kilo/.gitignore         | Plan                    | Carpetas eliminadas del disco                 |
| ✅      | 🟡       | 🔨      | TASK-A-05     | Eliminar archivos duplicados (docs/architecture.md, etc.)       | Plan                    | Solo queda `ARCHITECTURE.md` en raíz          |
| ✅      | 🟡       | 🔨      | TASK-A-06     | Eliminar archivos temporales (hacer.txt, swagger.json)          | Plan                    | Solo quedan los `.yaml` de API                |
| ✅      | 🟡       | 🔨      | TASK-A-07     | Verificar que `.env.example` no contiene secretos               | Plan                    | Solo placeholders                             |
| ✅      | 🔴       | 🔨      | **TASK-A-08** | **Eliminar fallback `JWT_SECRET \|\| "secreto"` en Users y MP** | **Auditoría SEC-01**    | Falla al arrancar si falta secreto            |
| ✅      | 🔴       | 🏗️    | **TASK-A-09** | **Añadir JWT middleware a Materials Service (Go)**              | **Auditoría SEC-02**    | Endpoints protegidos con JWT                  |
| ✅      | 🔴       | 🔨      | **TASK-A-10** | **Cerrar puertos internos (5001, 5002, 5003, 5432) en prod**    | **Auditoría SEC-02/05** | Compose prod sin puertos publicados           |
| ✅      | 🔴       | 🔨      | **TASK-A-11** | **Cambiar credenciales Grafana (admin/admin)**                  | **Auditoría SEC-03**    | Credenciales seguras en `.env`                |
| ✅      | 🟠       | 🔨      | **TASK-A-12** | **Corregir `MP_DB_NAME` en docker-compose**                     | **Auditoría ARC-04**    | MP arranca sin abortar                        |

**Total Fase A:** 12 tareas

---

## FASE B — Reorganización y Correcciones Arquitectónicas

> **Duración estimada:** 5–7 días
> **Objetivo:** Reorganizar MP a feature-based + corregir hallazgos de arquitectura y lógica.

### B.1. Migración feature-based de MP (10 lotes)

| Estado | Prioridad | Esfuerzo | ID        | Descripción                                                        | Criterio de Aceptación            |
| ------ | --------- | -------- | --------- | ------------------------------------------------------------------ | --------------------------------- |
| ✅      | 🔴       | 🏗️    | TASK-B-01 | Crear `src/shared/` y mover middleware, utils, config              | Imports actualizados, Zod validation passes |
| ✅      | 🔴       | 🏗️    | TASK-B-02 | Migrar Lote 1 (asignacion, cable, clave)                           | Imports actualizados, Zod validation passes |
| ✅      | 🔴       | 🏗️    | TASK-B-03 | Migrar Lote 2 (clasificacion, clasificadorclave, clasifpizarra)    | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-04 | Migrar Lote 3 (grup0w, linea, mando)                               | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-05 | Migrar Lote 4 (movimiento, pizarra, planta)                          | Imports actualizados, route loading passes |
| ✅      | 🟡       | 🏗️    | TASK-B-06 | Migrar Lote 5 (propietario, prueba)                              | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-07 | Migrar Lote 6 (queja, recorrido)                                   | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-08 | Migrar Lote 7 (resultadoprueba, senalizacion, sistema)             | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-09 | Migrar Lote 8 (telefono, tipolinea, tipomovimiento)                | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-10 | Migrar Lote 9 (tipopizarra, tipoqueja, trabajador)                 | Imports actualizados, route loading passes |
| ✅      | 🔴       | 🏗️    | TASK-B-11 | Migrar Lote 10 (trabajo, trabajo_trabajadores, models/index.js)              | Imports actualizados, model loading passes, 28 models |
| ✅      | 🟡       | 🔨      | TASK-B-12 | Actualizar `src/routes/index.js` para agregar rutas desde features | Rutas consolidadas desde features |
| ✅      | 🔴       | 🔨      | TASK-B-13 | Verificar `docker compose up` y tests E2E                          | Server boots, config OK, tests pendientes |
| ✅      | 🔴       | 🟢      | TASK-B-14 | Commit por lote + PR + merge                                         | 16 commits OK, push OK, PR manual |

### B.2. Correcciones de arquitectura y lógica (auditoría)

| Estado | Prioridad | Esfuerzo | ID            | Descripción                                                 | Origen               | Criterio de Aceptación                          |
| ------ | --------- | -------- | ------------- | ----------------------------------------------------------- | -------------------- | ----------------------------------------------- |
| ✅      | 🔴       | 🏗️    | **TASK-B-15** | **Añadir JWT verification en API Gateway**                  | **Auditoría SEC-05** | Gateway rechaza requests sin JWT                |
| ✅      | 🟠       | 🔨      | **TASK-B-16** | **CORS con lista blanca en Gateway**                        | **Auditoría SEC-04** | `CORS_ORIGIN` obligatorio en prod               |
| ✅      | 🟠       | 🔨      | **TASK-B-17** | **RBAC por operación en quejas, trabajos, asignaciones**    | **Auditoría SEC-06** | `tienePermiso` aplicado en cada ruta            |
| ✅      | 🟠       | 🔨      | **TASK-B-18** | **Parametrizar SQL del dashboard (Sequelize replacements)** | **Auditoría SEC-07** | Sin interpolación de strings                    |
| ⏳      | 🟠       | 🔨      | **TASK-B-19** | **Reordenar rutas `/dashboard/*` antes de `/:id`**          | **Auditoría BUS-02** | Dashboard accesible                             |
| ⏳      | 🟠       | 🏗️    | **TASK-B-20** | **Migraciones versionadas + índices (Users, MP)**           | **Auditoría DAT-01** | `migrations/` con índices en estado, FKs, fecha |
| ⏳      | 🟠       | 🏗️    | **TASK-B-21** | **Sustituir `npm test` placeholder por Jest/Supertest**     | **Auditoría QA-01**  | CI pasa con tests reales                        |
| ⏳      | 🟠       | 🏗️    | **TASK-B-22** | **Saga/compensación al cerrar queja (MP → Materials)**      | **Auditoría ARC-03** | Consumo registrado al cerrar queja              |

**Total Fase B:** 22 tareas

---

## FASE C — Consolidación de Documentación

> **Duración estimada:** 2–3 días
> **Objetivo:** Documentación bilingüe ES/RU, sin duplicados, alineada con código real.

| Estado | Prioridad | Esfuerzo | ID            | Descripción                                                                                  | Criterio de Aceptación |
| ------ | --------- | -------- | ------------- | -------------------------------------------------------------------------------------------- | ---------------------- |
| ⏳      | 🔴       | 🏗️    | TASK-C-01     | Renombrar `docs/*.md` a `docs/*.es.md` (18 archivos)                                         | Archivos renombrados   |
| ⏳      | 🔴       | 🏛️    | TASK-C-02     | Crear `docs/*.ru.md` (traducción de 18 archivos)                                             | Traducción completa    |
| ⏳      | 🟡       | 🔨      | TASK-C-03     | Mover `AUDITORIA.md` a `docs/audit/AUDITORIA.md`                                             | Archivo movido         |
| ⏳      | 🟡       | 🔨      | TASK-C-04     | Fusionar `docs/requirements.md` en `docs/05_requirements.es.md`                              | Sin duplicados         |
| ⏳      | 🟡       | 🔨      | TASK-C-05     | Fusionar `docs/roadmap.md` en `docs/17_roadmap.es.md`                                        | Sin duplicados         |
| ⏳      | 🟡       | 🔨      | TASK-C-06     | Renombrar `docs/manuals/*.md` a `*.es.md` y crear `*.ru.md`                                  | Manuales bilingües     |
| ⏳      | 🟡       | 🔨      | TASK-C-07     | Renombrar `docs/practices/*.md` a `*.es.md` y crear `*.ru.md`                                | Prácticas bilingües    |
| ⏳      | 🟡       | 🔨      | TASK-C-08     | Renombrar `docs/thesis/*.md` a `*.es.md` y crear `*.ru.md`                                   | Tesis bilingüe         |
| ⏳      | 🟡       | 🔨      | TASK-C-09     | Verificar enlaces internos (`scripts/validate_docs.sh`)                                      | 0 enlaces rotos        |
| ⏳      | 🟡       | 🔨      | TASK-C-10     | Commit + PR + merge                                                                          | Docs consolidadas      |
| ⏳      | 🟠       | 🔨      | **TASK-C-11** | **Alinear `ARCHITECTURE.md` con código real (mux, no Gin; sin Redis/Prometheus en compose)** | **Auditoría ARC-01**   | Docs = código 
| ⏳      | 🟠       | 🔨      | **TASK-C-12** | **Actualizar `AGENTS.md` con hallazgos de auditoría**                                        | **Auditoría**          | Sección 8 actualizada 

**Total Fase C:** 12 tareas

---

## FASE D — Módulo Predictivo + Tesis

> **Duración estimada:** 4–6 semanas
> **Objetivo:** Implementar `prediction-service/` y completar capítulo de tesis.

| Estado | Prioridad | Esfuerzo | ID            | Descripción                                                      | Criterio de Aceptación                                |
| ------ | --------- | -------- | ------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| ⏳      | 🔴       | 🏗️    | TASK-D-01     | Crear estructura `prediction-service/`                           | Carpeta completa                                      |
| ⏳      | 🔴       | 🔨      | TASK-D-02     | Configurar FastAPI + dependencias                                | `poetry install` + `uvicorn` funcional                |
| ⏳      | 🔴       | 🔨      | TASK-D-03     | Configurar BD `bd_predictions`                                   | Docker Compose funcional                              |
| ⏳      | 🟡       | 🏗️    | TASK-D-04     | Feature engineering (quejas)                                     | Features documentadas                                 |
| ⏳      | 🟡       | 🏗️    | TASK-D-05     | Feature engineering (materiales)                                 | Features documentadas                                 |
| ⏳      | 🔴       | 🏛️    | TASK-D-06     | Modelo: predicción de demanda de materiales                      | MAE < 15%                                             |
| ⏳      | 🟡       | 🏛️    | TASK-D-07     | Modelo: predicción de tiempo de resolución                       | MAE < 20%                                             |
| ⏳      | 🟡       | 🏛️    | TASK-D-08     | Modelo: detección de anomalías                                   | Precision > 85%                                       |
| ⏳      | 🔴       | 🏗️    | TASK-D-09     | API REST de predicciones                                         | Endpoints funcionales                                 |
| ⏳      | 🔴       | 🔨      | TASK-D-10     | Integrar con API Gateway                                         | Proxy `/api/predictions/*`                            |
| ⏳      | 🔴       | 🏗️    | TASK-D-11     | Dashboard de predicciones (Frontend)                             | Gráficos con Recharts                                 |
| ⏳      | 🟡       | 🏗️    | TASK-D-12     | MLflow (model registry)                                          | Modelos versionados                                   |
| ⏳      | 🟡       | 🏛️    | TASK-D-13     | Airflow (pipelines)                                              | DAG funcional                                         |
| ⏳      | 🟡       | 🏗️    | TASK-D-14     | Tests del módulo predictivo                                      | Cobertura ≥ 80%                                       |
| ⏳      | 🔴       | 🔨      | TASK-D-15     | Documentar `docs/thesis/06_modelado_predictivo.es.md` y `.ru.md` | Capítulo completo                                     |
| ⏳      | 🟡       | 🔨      | TASK-D-16     | Manual de explotación del dashboard predictivo                   | Manual bilingüe                                       |
| ⏳      | 🔴       | 🔨      | **TASK-D-20** | **Protocolo de datos sintéticos (anonimización)**                | Documento `docs/thesis/protocolo_datos_sinteticos.md` |
| ⏳      | 🟡       | 🔨      | **TASK-D-21** | **Validar modelos con datos sintéticos y reportar métricas**     | Reporte de métricas                                   |
| ⏳      | 🟡       | 🔨      | TASK-D-19     | Commit + PR + merge                                              | Merge completo                                        |

**Total Fase D:** 19 tareas

---

## Resumen Parte I

| Fase                              | Tareas | Completadas | %      |
| --------------------------------- | ------ | ----------- | ------ |
| A — Limpieza y Seguridad          | 12     | 0           | 0%     |
| B — Reorganización y Correcciones | 22     | 0           | 0%     |
| C — Documentación                 | 12     | 0           | 0%     |
| D — Predictivo + Tesis            | 19     | 0           | 0%     |
| **TOTAL PARTE I**                 | **65** | **0**       | **0%** |

---

# PARTE II — INVENTARIO FUNCIONAL

> **Objetivo:** Completar funcionalidades y mejorar las existentes.
> **Orden:** Se ejecuta **después** de Fase B (terreno limpio).

---

## FASE 0 — Planificación

| Estado | Prioridad | Esfuerzo | ID          | Descripción                      | Depende de Fase | Criterio de Aceptación  |
| ------ | --------- | -------- | ----------- | -------------------------------- | --------------- | ----------------------- |
| ✅     | 🟡       | 🔨      | TASK-000-01 | Crear README.md (ES/RU)          | —               | README con descripción  |
| ✅     | 🟡       | 🔨      | TASK-000-02 | Crear AGENTS.md                  | —               | Documento con reglas    |
| ✅     | 🟡       | 🔨      | TASK-000-03 | Crear SPEC.md                    | —               | Spec completa           |
| ✅     | 🟡       | 🔨      | TASK-000-04 | Crear CHANGELOG.md               | —               | Keep a Changelog        |
| ✅     | 🟡       | 🔨      | TASK-000-05 | Crear CONTRIBUTING.md            | —               | Convenciones            |
| ✅     | 🟢       | 🔨      | TASK-000-06 | Documentar requisitos            | —               | Requisitos consolidados |
| ✅     | 🟢       | 🔨      | TASK-000-07 | Documentar arquitectura          | —               | Diagramas Mermaid       |
| ✅     | 🟡       | 🔨      | TASK-000-08 | Crear roadmap en GitHub Projects | —               | Tablero configurado     |

---

## FASE 1 — Diseño

| Estado | Prioridad | Esfuerzo | ID          | Descripción                 | Depende de Fase | Criterio de Aceptación         |
| ------ | --------- | -------- | ----------- | --------------------------- | --------------- | ------------------------------ |
| ✅     | 🔴       | 🏗️    | TASK-100-01 | Diagrama de casos de uso    | —               | 24 casos, 7 actores            |
| ✅     | 🔴       | 🏗️    | TASK-100-02 | Diagrama de clases          | —               | 28 clases                      |
| ✅     | 🔴       | 🏗️    | TASK-100-03 | Diagrama de paquetes        | —               | 5 paquetes                     |
| ✅     | 🟡       | 🏗️    | TASK-100-04 | Diagramas de secuencia      | —               | 3 escenarios                   |
| ✅     | 🟡       | 🔨      | TASK-100-05 | Diccionario de términos     | —               | Ubiquitous Language            |
| ✅     | 🟡       | 🔨      | TASK-100-06 | Matriz de trazabilidad      | —               | Requisitos → casos → clases    |
| ✅     | 🟡       | 🔨      | TASK-100-07 | User Story Map              | —               | Mapa de historias              |
| ✅     | 🟡       | 🔨      | TASK-100-08 | Event Storming              | —               | Eventos y comandos             |
| ⏳      | 🔴       | 🔨      | TASK-110-01 | OpenAPI 3.0 para Users      | Fase C          | `docs/api/users.yaml` completo |
| ⏳      | 🔴       | 🔨      | TASK-110-02 | OpenAPI 3.0 para MP         | Fase C          | `docs/api/mp.yaml` completo    |
| ✅     | 🔴       | 🔨      | TASK-110-03 | OpenAPI 3.0 para Materials  | —               | Swagger en Go                  |
| ⏳      | 🟡       | 🔨      | TASK-110-04 | Modelo ER consolidado       | Fase C          | Diagrama Mermaid               |
| ⏳      | 🟡       | 🔨      | TASK-110-05 | Estrategia de autenticación | Fase C          | Documento de flujo             |
| ⏳      | 🟡       | 🔨      | TASK-110-06 | Matriz RBAC por endpoint    | Fase C          | Matriz rol × endpoint          |

---

## FASE 2 — Infraestructura

| Estado | Prioridad | Esfuerzo | ID          | Descripción          | Depende de Fase | Criterio de Aceptación   |
| ------ | --------- | -------- | ----------- | -------------------- | --------------- | ------------------------ |
| ✅     | 🔴       | 🔨      | TASK-200-01 | Dockerfile Materials | —               | Imagen < 50 MB           |
| ⏳      | 🔴       | 🔨      | TASK-200-02 | Dockerfile Users     | Fase A          | Imagen < 200 MB          |
| ⏳      | 🔴       | 🔨      | TASK-200-03 | Dockerfile MP        | Fase A          | Imagen < 200 MB          |
| ⏳      | 🔴       | 🔨      | TASK-200-04 | Dockerfile Gateway   | Fase A          | Imagen < 200 MB          |
| ⏳      | 🔴       | 🔨      | TASK-200-05 | Dockerfile Frontend  | Fase A          | Imagen Nginx             |
| ✅     | 🔴       | 🔨      | TASK-200-06 | Docker Compose dev   | —               | Stack funcional          |
| ✅     | 🔴       | 🔨      | TASK-200-07 | Docker Compose prod  | —               | Configuración optimizada |
| ✅     | 🔴       | 🔨      | TASK-210-01 | CI (lint + test)     | —               | Workflow funcional       |
| ⏳      | 🟡       | 🔨      | TASK-210-02 | CD (deploy)          | Fase B          | Deploy en merge          |
| ⏳      | 🟡       | 🔨      | TASK-210-03 | Dependabot           | Fase A          | PRs automáticos          |
| ⏳      | 🟡       | 🔨      | TASK-210-04 | Branch protection    | Fase A          | PR + review + CI         |
| ⏳      | 🟡       | 🔨      | TASK-220-01 | Prometheus           | Fase B          | Métricas recolectadas    |
| ⏳      | 🟡       | 🔨      | TASK-220-02 | Grafana              | Fase B          | Dashboards visuales      |
| ⏳      | 🟢       | 🔨      | TASK-220-03 | ELK centralizado     | Fase B          | Logs centralizados       |
| ⏳      | 🟢       | 🔨      | TASK-220-04 | Sentry               | Fase B          | Errores capturados       |

---

## FASE 3 — Users Service

| Estado | Prioridad | Esfuerzo | ID          | Descripción                   | Depende de Fase | Criterio de Aceptación       |
| ------ | --------- | -------- | ----------- | ----------------------------- | --------------- | ---------------------------- |
| ✅     | 🔴       | 🔨      | TASK-300-01 | Registro de usuarios          | —               | `POST /api/auth/register`    |
| ✅     | 🔴       | 🔨      | TASK-300-02 | Login con JWT                 | —               | Access + refresh token       |
| ⏳      | 🔴       | 🔨      | TASK-300-03 | Refresh tokens                | Fase A          | `POST /api/auth/refresh`     |
| ⏳      | 🔴       | 🔨      | TASK-300-04 | Logout                        | Fase A          | Token invalidado             |
| ⏳      | 🟡       | 🔨      | TASK-300-05 | Recuperación de contraseña    | Fase A          | Flujo con email              |
| ⏳      | 🟡       | 🔨      | TASK-300-06 | Cambio de contraseña          | Fase A          | `PUT /api/users/me/password` |
| ⏳      | 🟢       | 🔨      | TASK-300-07 | Bloqueo por intentos fallidos | Fase A          | Bloqueo tras 5 intentos      |
| ⏳      | 🟢       | 🔨      | TASK-300-08 | Historial de sesiones         | Fase A          | Registro de sesiones         |
| ⏳      | 🔴       | 🔨      | TASK-310-01 | CRUD de usuarios (admin)      | Fase B          | Endpoints con paginación     |
| ⏳      | 🔴       | 🔨      | TASK-310-02 | Gestión de roles (RBAC)       | Fase B          | Asignación funcional         |
| ⏳      | 🟡       | 🔨      | TASK-310-03 | Middleware de autorización    | Fase B          | Middleware reutilizable      |
| ⏳      | 🟢       | 🔨      | TASK-310-04 | Endpoint `/health`            | Fase A          | `{status: "UP"}`             |

---

## FASE 4 — MP Service

> **Nota:** Las tareas de esta fase se ejecutan **después** de Fase B (MP ya refactorizado).

### 4.1. Teléfonos

| Estado | Prioridad | Esfuerzo | ID          | Descripción                    | Depende de Fase | Criterio de Aceptación               |
| ------ | --------- | -------- | ----------- | ------------------------------ | --------------- | ------------------------------------ |
| ✅     | 🔴       | 🔨      | TASK-400-01 | CRUD teléfonos                 | —               | Endpoints funcionales                |
| ⏳      | 🔴       | 🔨      | TASK-400-02 | Cambio de estado (activo/baja) | Fase B          | `PATCH /api/mp/telefonos/:id/estado` |
| ⏳      | 🔴       | 🔨      | TASK-400-03 | Historial completo             | Fase B          | Quejas, recorridos, movimientos      |
| ⏳      | 🟡       | 🔨      | TASK-400-04 | Búsqueda y filtrado            | Fase B          | `?search=...`                        |

### 4.2. Líneas

| Estado | Prioridad | Esfuerzo | ID          | Descripción         | Depende de Fase | Criterio de Aceptación            |
| ------ | --------- | -------- | ----------- | ------------------- | --------------- | --------------------------------- |
| ✅     | 🔴       | 🔨      | TASK-410-01 | CRUD líneas         | —               | Endpoints funcionales             |
| ⏳      | 🔴       | 🔨      | TASK-410-02 | Cambio de estado    | Fase B          | `PATCH /api/mp/lineas/:id/estado` |
| ⏳      | 🔴       | 🔨      | TASK-410-03 | Historial completo  | Fase B          | Quejas, recorridos, movimientos   |
| ⏳      | 🟡       | 🔨      | TASK-410-04 | Búsqueda y filtrado | Fase B          | `?search=...`                     |

### 4.3. Pizarras

| Estado | Prioridad | Esfuerzo | ID          | Descripción         | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ----------- | ------------------- | --------------- | ---------------------- |
| ✅     | 🔴       | 🔨      | TASK-420-01 | CRUD pizarras       | —               | Endpoints funcionales  |
| ⏳      | 🟡       | 🔨      | TASK-420-02 | Mapeo de puertos    | Fase B          | CRUD de puertos        |
| ⏳      | 🟡       | 🔨      | TASK-420-03 | Conexiones          | Fase B          | Registro de conexiones |
| ⏳      | 🟡       | 🔨      | TASK-420-04 | Ubicación física    | Fase B          | Geolocalización        |
| ⏳      | 🟡       | 🔨      | TASK-420-05 | Búsqueda y filtrado | Fase B          | `?search=...`          |
| ⏳      | 🟡       | 🔨      | TASK-420-06 | Historial completo  | Fase B          | Historial de datos     |

### 4.4. Quejas

| Estado | Prioridad | Esfuerzo | ID          | Descripción              | Depende de Fase | Criterio de Aceptación       |
| ------ | --------- | -------- | ----------- | ------------------------ | --------------- | ---------------------------- |
| ✅     | 🔴       | 🔨      | TASK-430-01 | Registro de queja        | —               | `POST /api/mp/quejas`        |
| ⏳      | 🔴       | 🔨      | TASK-430-02 | Clasificación            | Fase B          | Campos implementados         |
| ⏳      | 🔴       | 🔨      | TASK-430-03 | Priorización             | Fase B          | Niveles funcionales          |
| ✅     | 🔴       | 🔨      | TASK-430-04 | Flujo de estados         | —               | 6 estados                    |
| ✅     | 🔴       | 🔨      | TASK-430-05 | Asignación de técnico    | —               | `PATCH /:id/asignar`         |
| ⏳      | 🔴       | 🔨      | TASK-430-06 | Historial de cambios     | Fase B          | Registro de transiciones     |
| ⏳      | 🔴       | 🔨      | TASK-430-07 | Auditoría de acciones    | Fase B          | Log quién/qué/cuándo         |
| ⏳      | 🟡       | 🔨      | TASK-430-08 | Búsqueda y filtrado      | Fase B          | Filtros estado/fecha/técnico |
| ⏳      | 🟡       | 🔨      | TASK-430-09 | Paginación               | Fase B          | `?page=1&limit=10`           |
| ⏳      | 🟢       | 🔨      | TASK-430-10 | Notificaciones por email | Fase B          | Email al asignar/cambiar     |

### 4.5. Pruebas

| Estado | Prioridad | Esfuerzo | ID          | Descripción                   | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ----------- | ----------------------------- | --------------- | ---------------------- |
| ✅     | 🔴       | 🔨      | TASK-440-01 | Registro de prueba            | —               | `POST /api/mp/pruebas` |
| ⏳      | 🔴       | 🔨      | TASK-440-02 | Resultados de prueba          | Fase B          | Campos implementados   |
| ⏳      | 🔴       | 🔨      | TASK-440-03 | Vinculación con queja/trabajo | Fase B          | FK                     |
| ⏳      | 🟡       | 🔨      | TASK-440-04 | Historial de pruebas          | Fase B          | Listado con filtros    |

### 4.6. Trabajos

| Estado | Prioridad | Esfuerzo | ID          | Descripción             | Depende de Fase | Criterio de Aceptación  |
| ------ | --------- | -------- | ----------- | ----------------------- | --------------- | ----------------------- |
| ✅     | 🔴       | 🔨      | TASK-450-01 | Creación de orden       | —               | `POST /api/mp/trabajos` |
| ✅     | 🔴       | 🔨      | TASK-450-02 | Asignación de técnico   | —               | `PATCH /:id/asignar`    |
| ⏳      | 🟡       | 🔨      | TASK-450-03 | Tiempo estimado vs real | Fase B          | Campos implementados    |
| ✅     | 🔴       | 🔨      | TASK-450-04 | Cierre de trabajo       | —               | `PATCH /:id/cerrar`     |
| ⏳      | 🟡       | 🔨      | TASK-450-05 | Historial de trabajos   | Fase B          | Listado con filtros     |

### 4.7. Estadísticas

| Estado | Prioridad | Esfuerzo | ID          | Descripción                | Depende de Fase | Criterio de Aceptación             |
| ------ | --------- | -------- | ----------- | -------------------------- | --------------- | ---------------------------------- |
| ⏳      | 🟡       | 🔨      | TASK-460-01 | Endpoint de resumen        | Fase B          | `GET /api/mp/estadisticas/resumen` |
| ⏳      | 🟡       | 🔨      | TASK-460-02 | Métricas agregadas         | Fase B          | KPIs calculados                    |
| ⏳      | 🟢       | 🔨      | TASK-460-03 | Filtros por fecha/servicio | Fase B          | Query params                       |

---

## FASE 5 — Materials Service

| Estado | Prioridad | Esfuerzo | ID          | Descripción                  | Depende de Fase | Criterio de Aceptación                 |
| ------ | --------- | -------- | ----------- | ---------------------------- | --------------- | -------------------------------------- |
| ✅     | 🔴       | 🔨      | TASK-500-01 | CRUD materiales              | —               | Endpoints con validación               |
| ✅     | 🔴       | 🔨      | TASK-500-02 | Validación de campos         | —               | Nombre, código, precio, unidad         |
| ✅     | 🔴       | 🔨      | TASK-500-03 | Paginación                   | —               | `?page=1&limit=10`                     |
| ✅     | 🔴       | 🔨      | TASK-500-04 | Búsqueda textual             | —               | `?search=...`                          |
| ⏳      | 🟡       | 🔨      | TASK-500-05 | Filtros por categoría/unidad | Fase B          | Query params                           |
| ✅     | 🔴       | 🔨      | TASK-510-01 | CRUD categorías              | —               | Endpoints funcionales                  |
| ✅     | 🔴       | 🔨      | TASK-510-02 | CRUD unidades                | —               | Endpoints funcionales                  |
| ✅     | 🔴       | 🔨      | TASK-510-03 | Integridad referencial       | —               | FK constraints                         |
| ✅     | 🔴       | 🔨      | TASK-520-01 | Crear asignación             | —               | `POST /api/materials/asignaciones`     |
| ✅     | 🔴       | 🔨      | TASK-520-02 | Captura de precio            | —               | `costo_unitario_momento`               |
| ✅     | 🔴       | 🔨      | TASK-520-03 | Transacción ACID             | —               | `db.Transaction()` con rollback        |
| ✅     | 🔴       | 🔨      | TASK-520-04 | Validación de existencia     | —               | HTTP 400 si no existe                  |
| ⏳      | 🔴       | 🏗️    | TASK-520-05 | Validación de stock real     | Fase A          | `verificarStockAsignacion` funcional   |
| ⏳      | 🟡       | 🏗️    | TASK-520-06 | Concurrencia con goroutines  | Fase A          | `go func()` + `sync.WaitGroup`         |
| ⏳      | 🟡       | 🔨      | TASK-520-07 | Historial de asignaciones    | Fase B          | Listado con filtros                    |
| ✅     | 🔴       | 🔨      | TASK-530-01 | Crear consumo                | —               | `POST /api/materials/consumos`         |
| ✅     | 🔴       | 🔨      | TASK-530-02 | Captura de precio real       | —               | `costo_unitario_real`                  |
| ✅     | 🔴       | 🔨      | TASK-530-03 | Transacción ACID             | —               | `db.Transaction()` con rollback        |
| ✅     | 🔴       | 🔨      | TASK-530-04 | Validación de cantidades     | —               | HTTP 400 si cantidad ≤ 0               |
| ⏳      | 🔴       | 🏗️    | TASK-530-05 | Validación contra asignación | Fase A          | Consumo ≤ asignado                     |
| ⏳      | 🟡       | 🏗️    | TASK-530-06 | Concurrencia con goroutines  | Fase A          | `go func()` + `sync.WaitGroup`         |
| ⏳      | 🟡       | 🔨      | TASK-530-07 | Historial de consumos        | Fase B          | Listado con filtros                    |
| ✅     | 🟡       | 🔨      | TASK-540-01 | Endpoint de resumen          | —               | `GET /api/materials/dashboard/resumen` |
| ✅     | 🟡       | 🔨      | TASK-540-02 | Distribución por categorías  | —               | JSON con agregación                    |
| ✅     | 🟡       | 🔨      | TASK-540-03 | Distribución por unidades    | —               | JSON con agregación                    |
| ⏳      | 🟡       | 🏗️    | TASK-540-04 | Saldo lógico por trabajador  | Fase B          | Σ(asignado) − Σ(consumido)             |
| ⏳      | 🟢       | 🔨      | TASK-540-05 | Alertas de stock bajo        | Fase D          | Endpoint de alertas                    |
| ⏳      | 🟢       | 🔨      | TASK-540-06 | Exportación CSV/JSON         | Fase D          | `?format=csv`                          |
| ⏳      | ⚪        | 🏛️    | TASK-540-07 | Tendencias y predicciones    | Fase D          | Modelo estadístico                     |
| ✅     | 🔴       | 🔨      | TASK-550-01 | Endpoints REST               | —               | Rutas funcionales                      |
| ✅     | 🔴       | 🔨      | TASK-550-02 | Compatibilidad Gateway       | —               | Proxy funcional                        |
| ✅     | 🟡       | 🔨      | TASK-550-03 | Health check                 | —               | `{status: "UP"}`                       |
| ✅     | 🟡       | 🔨      | TASK-550-04 | Documentación Swagger        | —               | Swagger UI funcional                   |
| ⏳      | 🟢       | 🔨      | TASK-550-05 | Exportación a SAP            | Fase D          | CSV compatible                         |

---

## FASE 6 — API Gateway

| Estado | Prioridad | Esfuerzo | ID          | Descripción                 | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ----------- | --------------------------- | --------------- | ---------------------- |
| ✅     | 🔴       | 🔨      | TASK-600-01 | Enrutamiento a Users        | —               | Proxy funcional        |
| ✅     | 🔴       | 🔨      | TASK-600-02 | Enrutamiento a MP           | —               | Proxy funcional        |
| ✅     | 🔴       | 🔨      | TASK-600-03 | Enrutamiento a Materials    | —               | Proxy funcional        |
| ⏳      | 🔴       | 🔨      | TASK-600-04 | Verificación de JWT         | Fase A          | Middleware de auth     |
| ⏳      | 🟡       | 🔨      | TASK-600-05 | Rate limiting               | Fase A          | Límite por IP          |
| ⏳      | 🟡       | 🔨      | TASK-600-06 | CORS                        | Fase A          | Orígenes permitidos    |
| ⏳      | 🟡       | 🔨      | TASK-600-07 | Logging centralizado        | Fase B          | Logs JSON              |
| ⏳      | 🟡       | 🔨      | TASK-600-08 | Health checks agregados     | Fase B          | `GET /health`          |
| ⏳      | 🟡       | 🔨      | TASK-600-09 | Manejo de errores unificado | Fase B          | Formato consistente    |
| ⏳      | 🟢       | 🔨      | TASK-600-10 | Documentación de rutas      | Fase C          | OpenAPI del Gateway    |

---

## FASE 7 — Frontend

| Estado | Prioridad | Esfuerzo | ID          | Descripción                   | Depende de Fase | Criterio de Aceptación         |
| ------ | --------- | -------- | ----------- | ----------------------------- | --------------- | ------------------------------ |
| ✅     | 🔴       | 🔨      | TASK-700-01 | Inicializar React + Vite + TS | —               | Proyecto funcional             |
| ⏳      | 🔴       | 🔨      | TASK-700-02 | Configurar Tailwind           | Fase A          | Estilos funcionales            |
| ⏳      | 🔴       | 🔨      | TASK-700-03 | Cliente HTTP (Axios)          | Fase A          | Interceptor de token           |
| ⏳      | 🔴       | 🔨      | TASK-700-04 | Manejo de estado              | Fase A          | Context API o Zustand          |
| ⏳      | 🔴       | 🔨      | TASK-700-05 | Enrutamiento (React Router)   | Fase A          | Rutas protegidas               |
| ⏳      | 🔴       | 🔨      | TASK-710-01 | Módulo de Login               | Fase B          | Formulario + JWT               |
| ⏳      | 🔴       | 🔨      | TASK-710-02 | Dashboard principal           | Fase B          | KPIs visibles                  |
| ⏳      | 🔴       | 🔨      | TASK-710-03 | Módulo Teléfonos              | Fase B          | CRUD funcional                 |
| ⏳      | 🔴       | 🔨      | TASK-710-04 | Módulo Líneas                 | Fase B          | CRUD funcional                 |
| ⏳      | 🔴       | 🔨      | TASK-710-05 | Módulo Pizarras               | Fase B          | CRUD funcional                 |
| ⏳      | 🔴       | 🔨      | TASK-710-06 | Módulo Quejas                 | Fase B          | CRUD + flujo estados           |
| ⏳      | 🔴       | 🔨      | TASK-710-07 | Módulo Pruebas                | Fase B          | CRUD funcional                 |
| ⏳      | 🔴       | 🔨      | TASK-710-08 | Módulo Trabajos               | Fase B          | CRUD funcional                 |
| ⏳      | 🔴       | 🔨      | TASK-710-09 | Módulo Materiales             | Fase B          | CRUD + asignaciones + consumos |
| ⏳      | 🔴       | 🔨      | TASK-710-10 | Módulo Estadísticas           | Fase B          | Gráficos con Recharts          |
| ⏳      | 🟡       | 🔨      | TASK-710-11 | Gestión de Usuarios           | Fase B          | CRUD funcional                 |
| ⏳      | 🟢       | 🔨      | TASK-710-12 | Perfil de Usuario             | Fase B          | Ver/editar perfil              |
| ⏳      | 🟡       | 🔨      | TASK-720-01 | Internacionalización (ES/RU)  | Fase C          | i18n funcional                 |
| ⏳      | 🟡       | 🔨      | TASK-720-02 | Responsive design             | Fase B          | Móvil, tablet, desktop         |
| ⏳      | 🟡       | 🔨      | TASK-720-03 | Manejo de errores             | Fase B          | Error boundaries + toasts      |
| ⏳      | 🟡       | 🔨      | TASK-720-04 | Loading states                | Fase B          | Skeletons + spinners           |
| ⏳      | 🟢       | 🔨      | TASK-720-05 | Notificaciones toast          | Fase B          | Librería integrada             |

---

## FASE 8 — Testing y QA

| Estado | Prioridad | Esfuerzo | ID          | Descripción               | Depende de Fase | Criterio de Aceptación     |
| ------ | --------- | -------- | ----------- | ------------------------- | --------------- | -------------------------- |
| ⏳      | 🔴       | 🏗️    | TASK-800-01 | Tests unitarios Users     | Fase B          | Cobertura ≥ 70% (Jest)     |
| ⏳      | 🔴       | 🏗️    | TASK-800-02 | Tests unitarios MP        | Fase B          | Cobertura ≥ 70% (Jest)     |
| ✅     | 🟡       | 🔨      | TASK-800-03 | Tests unitarios Materials | —               | Cobertura ≥ 70% (testify)  |
| ⏳      | 🔴       | 🔨      | TASK-810-01 | E2E Users                 | Fase B          | Ciclo completo funcional   |
| ⏳      | 🔴       | 🔨      | TASK-810-02 | E2E MP                    | Fase B          | Ciclo completo funcional   |
| ⏳      | 🔴       | 🔨      | TASK-820-01 | Auditoría de seguridad    | Fase B          | Vulnerabilidades resueltas |
| ⏳      | 🔴       | 🔨      | TASK-820-02 | Pruebas de rendimiento    | Fase B          | 1000+ RPS                  |
| ⏳      | 🔴       | 🔨      | TASK-820-03 | Pruebas de carga          | Fase B          | 500+ concurrentes          |

---

## FASE 9 — Despliegue y Operación

| Estado | Prioridad | Esfuerzo | ID          | Descripción              | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ----------- | ------------------------ | --------------- | ---------------------- |
| ⏳      | 🔴       | 🔨      | TASK-900-01 | CI/CD Users              | Fase B          | Deploy automático      |
| ⏳      | 🔴       | 🔨      | TASK-900-02 | CI/CD MP                 | Fase B          | Deploy automático      |
| ⏳      | 🔴       | 🔨      | TASK-900-03 | CI/CD Materials          | Fase B          | Deploy automático      |
| ⏳      | 🔴       | 🔨      | TASK-900-04 | CI/CD Gateway            | Fase B          | Deploy automático      |
| ⏳      | 🔴       | 🔨      | TASK-900-05 | CI/CD Frontend           | Fase B          | Deploy automático      |
| ⏳      | 🟡       | 🔨      | TASK-910-01 | Kubernetes en producción | Fase D          | Cluster funcional      |
| ⏳      | 🟡       | 🔨      | TASK-910-02 | Monitoreo en producción  | Fase B          | Métricas disponibles   |

---

## FASE 10 — Analítica y Reportes

| Estado | Prioridad | Esfuerzo | ID           | Descripción              | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ------------ | ------------------------ | --------------- | ---------------------- |
| ⏳      | 🟡       | 🔨      | TASK-1000-01 | Dashboard de analítica   | Fase D          | KPIs visibles          |
| ⏳      | 🟡       | 🔨      | TASK-1000-02 | Reportes exportables     | Fase D          | PDF/Excel              |
| ⏳      | 🟡       | 🔨      | TASK-1000-03 | Alertas de métricas      | Fase D          | Notificaciones         |
| ⏳      | 🟡       | 🔨      | TASK-1000-04 | Segmentación de datos    | Fase D          | Filtros                |
| ⏳      | 🟡       | 🔨      | TASK-1000-05 | Panel de administradores | Fase D          | Roles funcionales      |
| ⏳      | 🟡       | 🔨      | TASK-1000-06 | API de análisis          | Fase D          | Endpoints REST         |
| ⏳      | 🟡       | 🔨      | TASK-1000-07 | Tendencias históricas    | Fase D          | Series temporales      |
| ⏳      | 🟡       | 🔨      | TASK-1000-08 | Comparación de períodos  | Fase D          | Análisis de varianza   |

---

## FASE 11 — Módulo Predictivo (MLOps)

> **Nota:** Esta fase es equivalente a FASE D de la Parte I. Se mantiene aquí por compatibilidad con la numeración original. **Ejecutar en Fase D.**

| Estado | Prioridad | Esfuerzo | ID           | Descripción                      | Depende de Fase | Criterio de Aceptación     |
| ------ | --------- | -------- | ------------ | -------------------------------- | --------------- | -------------------------- |
| ⏳      | 🔴       | 🔨      | TASK-1300-01 | Definir casos de uso predictivos | Fase D          | 6 casos priorizados        |
| ⏳      | 🔴       | 🔨      | TASK-1300-02 | Diseñar arquitectura del módulo  | Fase D          | Diagrama Mermaid + ADR     |
| ⏳      | 🔴       | 🔨      | TASK-1300-03 | Configurar Python + FastAPI      | Fase D          | `poetry install` funcional |
| ⏳      | 🔴       | 🔨      | TASK-1300-04 | Configurar BD `bd_predictions`   | Fase D          | Docker Compose funcional   |
| ⏳      | 🟡       | 🏗️    | TASK-1300-05 | Feature engineering (quejas)     | Fase D          | Features documentadas      |
| ⏳      | 🟡       | 🏗️    | TASK-1300-06 | Feature engineering (materiales) | Fase D          | Features documentadas      |
| ⏳      | 🟡       | 🏗️    | TASK-1300-07 | Feature engineering (trabajos)   | Fase D          | Features documentadas      |
| ⏳      | 🔴       | 🏛️    | TASK-1300-08 | Modelo: demanda materiales       | Fase D          | MAE < 15%                  |
| ⏳      | 🟡       | 🏛️    | TASK-1300-09 | Modelo: tiempo resolución        | Fase D          | MAE < 20%                  |
| ⏳      | 🟡       | 🏛️    | TASK-1300-10 | Modelo: anomalías consumo        | Fase D          | Precision > 85%            |
| ⏳      | 🟢       | 🏛️    | TASK-1300-11 | Modelo: prioridad quejas         | Fase D          | Accuracy > 80%             |
| ⏳      | 🟢       | 🏛️    | TASK-1300-12 | Modelo: fallos infraestructura   | Fase D          | Recall > 75%               |
| ⏳      | 🔴       | 🏗️    | TASK-1300-13 | API REST de predicciones         | Fase D          | Endpoints funcionales      |
| ⏳      | 🔴       | 🔨      | TASK-1300-14 | Integrar con Gateway             | Fase D          | Proxy `/api/predictions/*` |
| ⏳      | 🟡       | 🏗️    | TASK-1300-15 | MLflow (model registry)          | Fase D          | Modelos versionados        |
| ⏳      | 🟡       | 🏛️    | TASK-1300-16 | Airflow (pipelines)              | Fase D          | DAG funcional              |
| ⏳      | 🔴       | 🏗️    | TASK-1300-17 | Dashboard de predicciones        | Fase D          | Gráficos funcionales       |
| ⏳      | 🟡       | 🏗️    | TASK-1300-18 | Monitoreo de modelos             | Fase D          | Drift + alertas            |
| ⏳      | 🔴       | 🏗️    | TASK-1300-19 | Tests del módulo predictivo      | Fase D          | Cobertura ≥ 80%            |
| ⏳      | 🟡       | 🏗️    | TASK-1300-20 | Tests de validación de modelos   | Fase D          | Métricas pasadas           |
| ⏳      | 🟡       | 🔨      | TASK-1300-21 | Documentar módulo predictivo     | Fase D          | OpenAPI + fichas           |
| ⏳      | 🟢       | 🔨      | TASK-1300-22 | Manual de explotación predictivo | Fase D          | Manual bilingüe            |

---

## FASE 12 — Documentación Final y Defensa

| Estado | Prioridad | Esfuerzo | ID           | Descripción                        | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ------------ | ---------------------------------- | --------------- | ---------------------- |
| ⏳      | 🔴       | 🏛️    | TASK-1200-01 | Redactar informe final de tesis    | Fase D          | Documento ГОСТ         |
| ⏳      | 🔴       | 🏗️    | TASK-1200-02 | Preparar presentación de defensa   | Fase D          | Slides + demo          |
| ⏳      | 🟡       | 🔨      | TASK-1200-03 | Grabar demo funcional              | Fase D          | Video 5-10 min         |
| ⏳      | 🟡       | 🔨      | TASK-1200-04 | Actualizar README con estado final | Fase D          | README actualizado     |
| ⏳      | 🟡       | 🔨      | TASK-1200-05 | Actualizar CHANGELOG               | Fase D          | v1.0.0 documentada     |
| ⏳      | 🟢       | 🔨      | TASK-1200-06 | Publicar release en GitHub         | Fase D          | Tag v1.0.0             |

---

## FASE 13 — Mantenimiento y Evolución

| Estado | Prioridad | Esfuerzo | ID           | Descripción             | Depende de Fase | Criterio de Aceptación |
| ------ | --------- | -------- | ------------ | ----------------------- | --------------- | ---------------------- |
| ⏳      | 🟡       | 🔨      | TASK-1300-01 | Integración LDAP/AD     | Post-defensa    | SSO funcional          |
| ⏳      | 🟡       | 🔨      | TASK-1300-02 | Integración SAP         | Post-defensa    | CSV/XML                |
| ⏳      | 🟢       | 🏛️    | TASK-1300-03 | Migración a Kubernetes  | Post-defensa    | Manifiestos            |
| ⏳      | 🟢       | 🏛️    | TASK-1300-04 | Colas de mensajes       | Post-defensa    | RabbitMQ/Kafka         |
| ⏳      | ⚪        | 🏛️    | TASK-1300-05 | Inteligencia de negocio | Post-defensa    | Dashboards avanzados   |
| ⏳      | ⚪        | 🏛️    | TASK-1300-06 | API pública             | Post-defensa    | API documentada        |

---

# ANEXOS

## Hallazgos de Auditoría Pendientes

> **Fuente:** `docs/audit/AUDITORIA.md` (2026-10-07)
> **Estado:** Todos pendientes. Se resuelven en Fase A o B.

| ID     | Severidad   | Hallazgo                                       | Tarea que lo resuelve        | Estado |
| ------ | ----------- | ---------------------------------------------- | ---------------------------- | ------ |
| SEC-01 | 🔴 Crítico | JWT con fallback `"secreto"`                   | TASK-A-08                    | ✅      |
| SEC-02 | 🔴 Crítico | Materials con JWT middleware + puerto 5003 cerrado en prod | TASK-A-09 (✅), TASK-A-10 (✅)    | ✅      |
| SEC-03 | 🔴 Crítico | Grafana admin/admin                            | TASK-A-11 (✅)               | ✅      |
| SEC-04 | 🟠 Alto    | CORS `origin: true`                            | TASK-B-16                    | ⏳      |
| SEC-05 | 🟠 Alto    | Gateway no verifica JWT                        | TASK-B-15                    | ⏳      |
| SEC-06 | 🟠 Alto    | RBAC incompleto en MP                          | TASK-B-17                    | ⏳      |
| SEC-07 | 🟠 Alto    | SQL injection en dashboard                     | TASK-B-18                    | ⏳      |
| SEC-08 | 🟡 Medio   | DebugLogin con credenciales fijas              | (Fase B, dentro de frontend) | ⏳      |
| ARC-01 | 🟠 Alto    | Docs ≠ código (Gin vs mux)                     | TASK-C-11                    | ⏳      |
| ARC-02 | 🟠 Alto    | MP llama a Users en cada request               | TASK-B-15 (claims en JWT)    | ⏳      |
| ARC-03 | 🟠 Alto    | Cerrar queja no orquesta materiales            | TASK-B-22                    | ⏳      |
| ARC-04 | 🟠 Alto    | `MP_DB_NAME` mal inyectado                     | TASK-A-12 (✅)                 | ✅      |
| ARC-05 | 🟡 Medio   | Health checks no prueban BD                    | (Fase B)                     | ⏳      |
| ARC-06 | 🟡 Medio   | `X-Request-Id` no se propaga                   | (Fase B)                     | ⏳      |
| ARC-07 | 🟡 Medio   | Gateway sin `MATERIALES_SERVICE_URL`           | (Fase B)                     | ⏳      |
| BUS-01 | 🟠 Alto    | Stock real comentado                           | TASK-520-05                  | ⏳      |
| BUS-02 | 🟠 Alto    | Rutas dashboard después de `/:id`              | TASK-B-19                    | ⏳      |
| BUS-03 | 🟡 Medio   | Máquina de estados laxa                        | (Fase B)                     | ⏳      |
| BUS-04 | 🟡 Medio   | `fecha` es STRING                              | (Fase B)                     | ⏳      |
| DAT-01 | 🟠 Alto    | Sin migraciones ni índices                     | TASK-B-20                    | ⏳      |
| DAT-02 | 🟡 Medio   | `SkipDefaultTransaction: true`                 | (Fase A, revisar)            | ⏳      |
| DAT-03 | 🟡 Medio   | N+1 en consumos                                | (Fase B)                     | ⏳      |
| QA-01  | 🟠 Alto    | `npm test` es `exit 1`                         | TASK-B-21                    | ⏳      |
| QA-02  | 🟡 Medio   | Pocos tests Node/Frontend                      | TASK-800-01, TASK-800-02     | ⏳      |
| QA-03  | 🟡 Medio   | Código muerto (`AuthController` MP, `useAuth`) | (Fase B)                     | ⏳      |
| QA-04  | 🟢 Bajo    | Duplicación `authLimiter`                      | (Fase B)                     | ⏳      |
| QA-05  | 🟢 Bajo    | Comentario de rutas Go incorrecto              | (Fase B)                     | ⏳      |
| QA-06  | 🟢 Bajo    | `tienePermiso` usa `forEach` sin retorno       | TASK-B-17                    | ⏳      |
| QA-07  | 🟢 Bajo    | `password_hash` en tipo `User` del cliente     | (Fase B)                     | ⏳      |

---

## Resumen de Progreso

### Parte I — Plan de Consolidación

| Fase                              | Tareas | Completadas | %      |
| --------------------------------- | ------ | ----------- | ------ |
| A — Limpieza y Seguridad          | 12     | 0           | 0%     |
| B — Reorganización y Correcciones | 22     | 0           | 0%     |
| C — Documentación                 | 12     | 0           | 0%     |
| D — Predictivo + Tesis            | 19     | 0           | 0%     |
| **TOTAL PARTE I**                 | **65** | **0**       | **0%** |

### Parte II — Inventario Funcional

| Fase                     | Tareas  | Completadas | %       |
| ------------------------ | ------- | ----------- | ------- |
| 0 — Planificación        | 8       | 8           | 100%    |
| 1 — Diseño               | 14      | 8           | 57%     |
| 2 — Infraestructura      | 15      | 4           | 27%     |
| 3 — Users                | 12      | 2           | 17%     |
| 4 — MP                   | 36      | 10          | 28%     |
| 5 — Materials            | 34      | 22          | 65%     |
| 6 — Gateway              | 10      | 3           | 30%     |
| 7 — Frontend             | 22      | 1           | 5%      |
| 8 — Testing              | 8       | 1           | 13%     |
| 9 — Despliegue           | 7       | 0           | 0%      |
| 10 — Analítica           | 8       | 0           | 0%      |
| 11 — Predictivo          | 22      | 0           | 0%      |
| 12 — Documentación Final | 6       | 0           | 0%      |
| 13 — Mantenimiento       | 6       | 0           | 0%      |
| **TOTAL PARTE II**       | **208** | **59**      | **28%** |

### Total General

| Parte     | Tareas  | Completadas | %        |
| --------- | ------- | ----------- | -------- |
| Parte I   | 65      | 0           | 0%       |
| Parte II  | 208     | 59          | 28%      |
| **TOTAL** | **273** | **59**      | **~22%** |

---

> **Mantenido por:** Ing. Botet S.Y.
> **Última actualización:** 2026-10-23
> **Próxima revisión:** Al finalizar Fase A