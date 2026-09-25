# ✅ TASKLIST.md — Lista de Tareas del Proyecto SISGAD5

> **Versión:** 1.0
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

---

## 1. Leyenda y Convenciones

### Estados de Tarea
| Símbolo | Significado            |
| ------- | ---------------------- |
| ✅      | Completada             |
| 🔄      | En progreso            |
| ⏳      | Pendiente              |
| 🚫      | Bloqueada              |
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
```
- ✅ 🔴 ⚡ **TASK-XXX-YY** — Descripción breve
  - **Módulo:** Nombre del módulo
  - **Responsable:** Agente / Humano
  - **Dependencias:** TASK-XXX-ZZ
  - **Criterio de aceptación:** Descripción verificable
  - **Archivos afectados:** `ruta/al/archivo`
```

---

## 2. FASE 0 — Planificación y Documentación Base

### 2.1. Documentación del Proyecto

| Estado     | Prioridad | Esfuerzo  | ID de Tarea | Descripción                                         | Módulo        | Responsable | Dependencias | Criterio de Aceptación                                  | Archivos Afectados          |
| ---------- | --------- | --------- | ----------- | --------------------------------------------------- | ------------- | ----------- | ------------ | ------------------------------------------------------- | --------------------------- |
| ✅ Completada | Alta      | 1–4 horas | TASK-000-01 | Crear README.md principal (ES/RU)                   | Documentación | Humano      |              | README con descripción, arquitectura, stack y enlaces   | `README.md`, `README.es.md` |
| ✅ Completada | Alta      | 1–4 horas | TASK-000-02 | Crear AGENT.md con instrucciones para agentes de IA | Documentación | Humano + IA |              | Documento con contexto, reglas y formato de reporte     | `AGENT.md`                  |
| ✅ Completada | Alta      | 1–4 horas | TASK-000-03 | Crear SPEC.md con especificación técnica completa   | Documentación | Humano + IA |              | SPEC con arquitectura, módulos, contratos y roadmap     | `SPEC.md`                   |
| ✅ Completada | Alta      | 1–4 horas | TASK-000-04 | Crear CHANGELOG.md                                  | Documentación | Agente      |              | Formato Keep a Changelog + SemVer                       | `CHANGELOG.md`            |
| ✅ Completada | Alta      | 1–4 horas | TASK-000-05 | Crear CONTRIBUTING.md con convenciones              | Documentación | Agente      |              | Convenciones de ramas, commits, PRs                     | `CONTRIBUTING.md`        |
| ⏳ Pendiente  | Media     | 1–4 horas | TASK-000-06 | Documentar requisitos en `/docs/requirements.md`    | Documentación | Agente      |              | Requisitos funcionales y no funcionales consolidados    | `docs/requirements.md`      |
| ⏳ Pendiente  | Media     | 1–4 horas | TASK-000-07 | Documentar arquitectura en `/docs/architecture.md`  | Documentación | Agente      |              | Diagramas Mermaid + decisiones arquitectónicas          | `docs/architecture.md`      |
| ⏳ Pendiente  | Alta      | 1–4 horas | TASK-000-08 | Crear roadmap de desarrollo en GitHub Projects      | Gestión       | Humano      |              | Tablero con columnas Backlog, In Progress, Review, Done | GitHub Projects             |

---

## 3. FASE 1 — Diseño y Modelado

### 3.1. Modelado del Sistema (Repositorio SISGAD5_doc)

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                    | Módulo   | Responsable | Dependencias | Criterio de Aceptación                           | Archivos Afectados            |
| ---------- | -------------------- | --------- | ----------- | ---------------------------------------------- | -------- | ----------- | ------------ | ------------------------------------------------ | ----------------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–3 días  | TASK-100-01 | Diagrama de casos de uso (24 casos, 7 actores) | Modelado | Humano      |              | Diagrama UML con relaciones include/extend       | `docs/03-07`, `diagrams/`     |
| ✅ Completada | Crítica (bloqueante) | 1–3 días  | TASK-100-02 | Diagrama de clases (28 clases, 5 contextos)    | Modelado | Humano      |              | Diagrama UML con atributos, métodos y relaciones | `docs/03-07`, `diagrams/`     |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–3 días  | TASK-100-03 | Diagrama de paquetes (5 paquetes)              | Modelado | Humano      |              | Diagrama UML con reglas de dependencia           | `docs/03-07`, `diagrams/`     |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–3 días  | TASK-100-04 | Diagramas de secuencia (3 escenarios críticos) | Modelado | Humano      |              | Diagramas UML con tablas de mensajes             | `docs/08`, `diagrams/`        |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-100-05 | Diccionario de términos (Ubiquitous Language)  | Modelado | Humano      |              | Términos del dominio unificados                  | `docs/04 Словарь терминов.md` |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-100-06 | Matriz de trazabilidad                         | Modelado | Humano      |              | Requisitos → Casos de uso → Clases               | `docs/`                       |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-100-07 | User Story Map                                 | Modelado | Humano      |              | Mapa de historias de usuario por actor           | `docs/02 Акторы.md`           |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-100-08 | Event Storming                                 | Modelado | Humano      |              | Eventos, comandos y agregados identificados      | `docs/04 Словарь терминов.md` |

### 3.2. Diseño de Contratos y Modelos

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                          | Módulo | Responsable | Dependencias | Criterio de Aceptación                                      | Archivos Afectados            |
| ---------- | -------------------- | --------- | ----------- | ---------------------------------------------------- | ------ | ----------- | ------------ | ----------------------------------------------------------- | ----------------------------- |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-110-01 | Diseñar contratos OpenAPI 3.0 para Users Service     | Diseño | Agente      | TASK-100-01  | Archivo `openapi.yaml` con todos los endpoints              | `docs/api/users.yaml`         |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-110-02 | Diseñar contratos OpenAPI 3.0 para MP Service        | Diseño | Agente      | TASK-100-01  | Archivo `openapi.yaml` con todos los endpoints              | `docs/api/mp.yaml`            |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-110-03 | Diseñar contratos OpenAPI 3.0 para Materials Service | Diseño | Humano      |              | Swagger implementado en Go                                  | `docs/api/materiales_swagger.json` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-110-04 | Modelo ER consolidado de las 3 BD                    | Diseño | Agente      |              | Diagrama Mermaid ER de `bd_users`, `bd_mp`, `bd_materiales` | `docs/11_data_model.md`       |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-110-05 | Diseñar estrategia de autenticación (JWT + Refresh)  | Diseño | Agente      |              | Documento con flujo detallado                               | `docs/13_security.md`         |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-110-06 | Mapear permisos RBAC por endpoint                    | Diseño | Agente      |              | Matriz rol × endpoint                                       | `docs/12_rbac_matrix.md`      |

---

## 4. FASE 2 — Infraestructura y Configuración

### 4.1. Docker y Contenerización

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                   | Módulo          | Responsable | Dependencias | Criterio de Aceptación                       | Archivos Afectados                 |
| ---------- | -------------------- | --------- | ----------- | --------------------------------------------- | --------------- | ----------- | ------------ | -------------------------------------------- | ---------------------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-200-01 | Dockerfile multi-stage para Materials Service | Infraestructura | Humano      |              | Imagen optimizada < 50 MB                    | `backend-materiales-go/Dockerfile` |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-200-02 | Dockerfile multi-stage para Users Service     | Infraestructura | Agente      |              | Imagen optimizada < 200 MB                   | `backend-users/Dockerfile`         |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-200-03 | Dockerfile multi-stage para MP Service        | Infraestructura | Agente      |              | Imagen optimizada < 200 MB                   | `backend-mp/Dockerfile`            |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-200-04 | Dockerfile multi-stage para API Gateway       | Infraestructura | Agente      |              | Imagen optimizada < 200 MB                   | `api-gateway/Dockerfile`           |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-200-05 | Dockerfile multi-stage para Frontend          | Infraestructura | Agente      |              | Imagen Nginx optimizada                      | `frontend/Dockerfile`              |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-200-06 | Docker Compose para desarrollo                | Infraestructura | Humano      |              | `docker compose up -d` levanta todo el stack | `docker-compose.yml`               |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-200-07 | Docker Compose para producción                | Infraestructura | Humano      |              | Configuración optimizada para prod           | `docker-compose.prod.yml`          |

### 4.2. CI/CD

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                            | Módulo | Responsable | Dependencias | Criterio de Aceptación                  | Archivos Afectados             |
| ---------- | -------------------- | --------- | ----------- | -------------------------------------- | ------ | ----------- | ------------ | --------------------------------------- | ------------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-210-01 | GitHub Actions CI (lint + test)        | CI/CD  | Humano      |              | Workflow ejecuta lint y test en cada PR | `.github/workflows/ci.yml`     |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-210-02 | GitHub Actions CD (deploy)             | CI/CD  | Agente      | TASK-210-01  | Workflow despliega en merge a `main`    | `.github/workflows/deploy.yml` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-210-03 | Configurar Dependabot                  | CI/CD  | Agente      |              | PRs automáticos para actualizaciones    | `.github/dependabot.yml`       |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-210-04 | Configurar branch protection en `main` | CI/CD  | Humano      |              | Requerir PR + review + CI passing       | GitHub Settings                |

### 4.3. Monitoreo y Logging

| Estado    | Prioridad | Esfuerzo  | ID de Tarea | Descripción                      | Módulo    | Responsable | Dependencias | Criterio de Aceptación                         | Archivos Afectados         |
| --------- | --------- | --------- | ----------- | -------------------------------- | --------- | ----------- | ------------ | ---------------------------------------------- | -------------------------- |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-220-01 | Configurar Prometheus            | Monitoreo | Agente      |              | Recolección de métricas de todos los servicios | `monitoring/prometheus/`   |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-220-02 | Configurar Grafana               | Monitoreo | Agente      |              | Dashboards visuales con KPIs                   | `monitoring/grafana/`      |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-220-03 | Centralizar logs (ELK o similar) | Monitoreo | Agente      |              | Logs de todos los servicios en un solo lugar   | `monitoring/elk/`          |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-220-04 | Configurar Sentry para errores   | Monitoreo | Agente      |              | Captura de excepciones en producción           | Configuración por servicio |

---

## 5. FASE 3 — Desarrollo: Users Service

### 5.1. Autenticación

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                 | Módulo | Responsable | Dependencias | Criterio de Aceptación                                 | Archivos Afectados   |
| ---------- | -------------------- | --------- | ----------- | ------------------------------------------- | ------ | ----------- | ------------ | ------------------------------------------------------ | -------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-300-01 | Implementar registro de usuarios            | Users  | Humano      |              | `POST /api/auth/register` funcional                    | `backend-users/src/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-300-02 | Implementar login con JWT                   | Users  | Humano      |              | `POST /api/auth/login` devuelve access + refresh token | `backend-users/src/` |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-300-03 | Implementar refresh tokens                  | Users  | Agente      |              | `POST /api/auth/refresh` renueva access token          | `backend-users/src/` |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-300-04 | Implementar logout (invalidación de tokens) | Users  | Agente      |              | `POST /api/auth/logout` invalida refresh token         | `backend-users/src/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-300-05 | Implementar recuperación de contraseña      | Users  | Agente      |              | Flujo completo con email                               | `backend-users/src/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-300-06 | Implementar cambio de contraseña            | Users  | Agente      |              | `PUT /api/users/me/password` funcional                 | `backend-users/src/` |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-300-07 | Implementar bloqueo por intentos fallidos   | Users  | Agente      |              | Bloqueo tras 5 intentos fallidos                       | `backend-users/src/` |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-300-08 | Implementar historial de sesiones           | Users  | Agente      |              | Registro de sesiones activas                           | `backend-users/src/` |

### 5.2. Gestión de Usuarios y Roles

| Estado    | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                    | Módulo | Responsable | Dependencias | Criterio de Aceptación                  | Archivos Afectados               |
| --------- | -------------------- | --------- | ----------- | ---------------------------------------------- | ------ | ----------- | ------------ | --------------------------------------- | -------------------------------- |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-310-01 | Implementar CRUD de usuarios (admin)           | Users  | Agente      |              | Endpoints funcionales con paginación    | `backend-users/src/`             |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-310-02 | Implementar gestión de roles (RBAC)            | Users  | Agente      |              | Asignación de roles funcional           | `backend-users/src/`             |
| ⏳ Pendiente | Alta                 | 1–4 horas | TASK-310-03 | Implementar middleware de autorización por rol | Users  | Agente      |              | Middleware reutilizable                 | `backend-users/src/middlewares/` |
| ⏳ Pendiente | Media                | 1–4 horas | TASK-310-04 | Implementar endpoint `/health`                 | Users  | Agente      |              | `GET /health` devuelve `{status: "UP"}` | `backend-users/src/`             |

---

## 6. FASE 4 — Desarrollo: MP Service

### 6.1. Gestión de Teléfonos

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                               | Módulo | Responsable | Dependencias | Criterio de Aceptación               | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | ----------------------------------------- | ------ | ----------- | ------------ | ------------------------------------ | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-400-01 | CRUD de teléfonos (con datos del cliente) | MP     | Humano      |              | Endpoints funcionales                | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-400-02 | Cambio de estado (`activo` / `baja`)      | MP     | Agente      |              | `PATCH /api/mp/telefonos/:id/estado` | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-400-03 | Historial completo del teléfono           | MP     | Agente      |              | Quejas, recorridos, movimientos      | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-400-04 | Búsqueda y filtrado de teléfonos          | MP     | Agente      |              | `GET /api/mp/telefonos?search=...`   | `backend-mp/src/`  |

### 6.2. Gestión de Líneas

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                          | Módulo | Responsable | Dependencias | Criterio de Aceptación            | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | ------------------------------------ | ------ | ----------- | ------------ | --------------------------------- | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-410-01 | CRUD de líneas                       | MP     | Humano      |              | Endpoints funcionales             | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-410-02 | Cambio de estado (`activo` / `baja`) | MP     | Agente      |              | `PATCH /api/mp/lineas/:id/estado` | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-410-03 | Historial completo de la línea       | MP     | Agente      |              | Quejas, recorridos, movimientos   | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-410-04 | Búsqueda y filtrado de líneas        | MP     | Agente      |              | `GET /api/mp/lineas?search=...`   | `backend-mp/src/`  |

### 6.3. Gestión de Pizarras

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                      | Módulo | Responsable | Dependencias | Criterio de Aceptación            | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | -------------------------------- | ------ | ----------- | ------------ | --------------------------------- | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-420-01 | CRUD de pizarras                 | MP     | Humano      |              | Endpoints funcionales             | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-420-02 | Mapeo de puertos                 | MP     | Agente      |              | CRUD de puertos por pizarra       | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-420-03 | Conexiones entrantes/salientes   | MP     | Agente      |              | Registro de conexiones            | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-420-04 | Ubicación física                 | MP     | Agente      |              | Geolocalización de pizarras       | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-420-05 | Búsqueda y filtrado de pizarras  | MP     | Agente      |              | `GET /api/mp/pizarras?search=...` | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-420-06 | Historial completo de la pizarra | MP     | Agente      |              | Historial de todos los datos      | `backend-mp/src/`  |

### 6.4. Gestión de Quejas

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                             | Módulo | Responsable | Dependencias | Criterio de Aceptación                                          | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | --------------------------------------- | ------ | ----------- | ------------ | --------------------------------------------------------------- | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-430-01 | Registro de queja                       | MP     | Humano      |              | `POST /api/mp/quejas` funcional                                 | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-430-02 | Clasificación (tipo/servicio/ubicación) | MP     | Agente      |              | Campos de clasificación implementados                           | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-430-03 | Priorización                            | MP     | Agente      |              | Niveles de prioridad funcionales                                | `backend-mp/src/`  |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-430-04 | Flujo de estados completo               | MP     | Humano      |              | `Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada` | `backend-mp/src/`  |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-430-05 | Asignación de técnico                   | MP     | Humano      |              | `PATCH /api/mp/quejas/:id/asignar`                              | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-430-06 | Historial de cambios                    | MP     | Agente      |              | Registro de todas las transiciones                              | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-430-07 | Auditoría de acciones                   | MP     | Agente      |              | Log de quién, qué, cuándo                                       | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-430-08 | Búsqueda y filtrado de quejas           | MP     | Agente      |              | Filtros por estado, fecha, técnico                              | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-430-09 | Paginación de quejas                    | MP     | Agente      |              | `?page=1&limit=10`                                              | `backend-mp/src/`  |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-430-10 | Notificaciones por email                | MP     | Agente      |              | Email al asignar/cambiar estado                                 | `backend-mp/src/`  |

### 6.5. Gestión de Pruebas

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                     | Módulo | Responsable | Dependencias | Criterio de Aceptación            | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | ------------------------------- | ------ | ----------- | ------------ | --------------------------------- | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-440-01 | Registro de prueba              | MP     | Humano      |              | `POST /api/mp/pruebas` funcional  | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-440-02 | Resultados de prueba            | MP     | Agente      |              | Campos de resultado implementados | `backend-mp/src/`  |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-440-03 | Vinculación con queja y trabajo | MP     | Agente      |              | FK a queja y trabajo              | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-440-04 | Historial de pruebas            | MP     | Agente      |              | Listado con filtros               | `backend-mp/src/`  |

### 6.6. Gestión de Trabajos

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                  | Módulo | Responsable | Dependencias | Criterio de Aceptación               | Archivos Afectados |
| ---------- | -------------------- | --------- | ----------- | ---------------------------- | ------ | ----------- | ------------ | ------------------------------------ | ------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-450-01 | Creación de orden de trabajo | MP     | Humano      |              | `POST /api/mp/trabajos` funcional    | `backend-mp/src/`  |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-450-02 | Asignación de técnico        | MP     | Humano      |              | `PATCH /api/mp/trabajos/:id/asignar` | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-450-03 | Tiempo estimado vs real      | MP     | Agente      |              | Campos de tiempo implementados       | `backend-mp/src/`  |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-450-04 | Cierre de trabajo            | MP     | Humano      |              | `PATCH /api/mp/trabajos/:id/cerrar`  | `backend-mp/src/`  |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-450-05 | Historial de trabajos        | MP     | Agente      |              | Listado con filtros                  | `backend-mp/src/`  |

### 6.7. Estadísticas (MP)

| Estado    | Prioridad | Esfuerzo  | ID de Tarea | Descripción                | Módulo | Responsable | Dependencias | Criterio de Aceptación             | Archivos Afectados |
| --------- | --------- | --------- | ----------- | -------------------------- | ------ | ----------- | ------------ | ---------------------------------- | ------------------ |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-460-01 | Endpoint de resumen        | MP     | Agente      |              | `GET /api/mp/estadisticas/resumen` | `backend-mp/src/`  |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-460-02 | Métricas agregadas         | MP     | Agente      |              | KPIs calculados                    | `backend-mp/src/`  |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-460-03 | Filtros por fecha/servicio | MP     | Agente      |              | Query params funcionales           | `backend-mp/src/`  |

---

## 7. FASE 5 — Desarrollo: Materials Service

### 7.1. Catálogo de Materiales

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                       | Módulo    | Responsable | Dependencias | Criterio de Aceptación               | Archivos Afectados       |
| ---------- | -------------------- | --------- | ----------- | --------------------------------- | --------- | ----------- | ------------ | ------------------------------------ | ------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-500-01 | CRUD de materiales (RF-MAT-01)    | Materials | Humano      |              | Endpoints funcionales con validación | `backend-materiales-go/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-500-02 | Validación de campos obligatorios | Materials | Humano      |              | Nombre, código, precio, unidad       | `backend-materiales-go/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-500-03 | Paginación (RF-MAT-08)            | Materials | Humano      |              | `?page=1&limit=10`                   | `backend-materiales-go/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-500-04 | Búsqueda textual (RF-MAT-07)      | Materials | Humano      |              | `?search=...`                        | `backend-materiales-go/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-500-05 | Filtros por categoría/unidad      | Materials | Agente      |              | Query params funcionales             | `backend-materiales-go/` |

### 7.2. Categorías y Unidades

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                            | Módulo    | Responsable | Dependencias | Criterio de Aceptación | Archivos Afectados                  |
| ---------- | -------------------- | --------- | ----------- | -------------------------------------- | --------- | ----------- | ------------ | ---------------------- | ----------------------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-510-01 | CRUD de categorías (RF-MAT-02)         | Materials | Humano      |              | Endpoints funcionales  | `backend-materiales-go/`            |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-510-02 | CRUD de unidades de medida (RF-MAT-02) | Materials | Humano      |              | Endpoints funcionales  | `backend-materiales-go/`            |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-510-03 | Integridad referencial                 | Materials | Humano      |              | FK constraints en BD   | `backend-materiales-go/migrations/` |

### 7.3. Asignación de Materiales

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                            | Módulo    | Responsable | Dependencias | Criterio de Aceptación                  | Archivos Afectados                         |
| ---------- | -------------------- | --------- | ----------- | ------------------------------------------------------ | --------- | ----------- | ------------ | --------------------------------------- | ------------------------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-520-01 | Crear asignación con múltiples ítems (RF-MAT-03)       | Materials | Humano      |              | `POST /api/materials/asignaciones`      | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-520-02 | Captura de precio en momento de asignación (RF-MAT-06) | Materials | Humano      |              | `costo_unitario_momento` guardado       | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-520-03 | Transacción ACID (RC-04)                               | Materials | Humano      |              | `db.Transaction()` con rollback         | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-520-04 | Validación de existencia de material                   | Materials | Humano      |              | HTTP 400 si no existe                   | `backend-materiales-go/`                   |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-520-05 | Validación de stock real (completar stub)              | Materials | Agente      | TASK-520-03  | `verificarStockAsignacion` funcional    | `backend-materiales-go/internal/services/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-520-06 | Activar concurrencia con goroutines                    | Materials | Agente      | TASK-520-03  | `go func()` + `sync.WaitGroup` + `chan` | `backend-materiales-go/internal/services/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-520-07 | Historial de asignaciones                              | Materials | Agente      |              | Listado con filtros                     | `backend-materiales-go/`                   |

### 7.4. Registro de Consumos

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                   | Módulo    | Responsable | Dependencias | Criterio de Aceptación                  | Archivos Afectados                         |
| ---------- | -------------------- | --------- | ----------- | --------------------------------------------- | --------- | ----------- | ------------ | --------------------------------------- | ------------------------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-530-01 | Crear consumo con múltiples ítems (RF-MAT-04) | Materials | Humano      |              | `POST /api/materials/consumos`          | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-530-02 | Captura de precio real (RF-MAT-06)            | Materials | Humano      |              | `costo_unitario_real` guardado          | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-530-03 | Transacción ACID (RC-04)                      | Materials | Humano      |              | `db.Transaction()` con rollback         | `backend-materiales-go/`                   |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-530-04 | Validación de cantidades                      | Materials | Humano      |              | HTTP 400 si cantidad ≤ 0                | `backend-materiales-go/`                   |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-530-05 | Validación contra asignación                  | Materials | Agente      | TASK-530-03  | Consumo ≤ asignado                      | `backend-materiales-go/internal/services/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-530-06 | Activar concurrencia con goroutines           | Materials | Agente      | TASK-530-03  | `go func()` + `sync.WaitGroup` + `chan` | `backend-materiales-go/internal/services/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-530-07 | Historial de consumos                         | Materials | Agente      |              | Listado con filtros                     | `backend-materiales-go/`                   |

### 7.5. Analítica y Dashboards

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                             | Módulo    | Responsable | Dependencias | Criterio de Aceptación                 | Archivos Afectados       |
| ---------- | -------------------- | --------- | ----------- | --------------------------------------- | --------- | ----------- | ------------ | -------------------------------------- | ------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-540-01 | Endpoint de resumen general (RF-MAT-11) | Materials | Humano      |              | `GET /api/materials/dashboard/resumen` | `backend-materiales-go/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-540-02 | Distribución por categorías             | Materials | Humano      |              | JSON con agregación                    | `backend-materiales-go/` |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-540-03 | Distribución por unidades               | Materials | Humano      |              | JSON con agregación                    | `backend-materiales-go/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-540-04 | Cálculo de saldo lógico por trabajador  | Materials | Agente      |              | Σ(asignado) − Σ(consumido)             | `backend-materiales-go/` |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-540-05 | Alertas de stock bajo                   | Materials | Agente      |              | Endpoint de alertas                    | `backend-materiales-go/` |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-540-06 | Exportación CSV/JSON                    | Materials | Agente      |              | `?format=csv`                          | `backend-materiales-go/` |
| ⏳ Pendiente  | Baja                 | > 3 días  | TASK-540-07 | Tendencias y predicciones               | Materials | Agente      |              | Modelo estadístico básico              | `backend-materiales-go/` |

### 7.6. Integración

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                        | Módulo    | Responsable | Dependencias | Criterio de Aceptación | Archivos Afectados            |
| ---------- | -------------------- | --------- | ----------- | -------------------------------------------------- | --------- | ----------- | ------------ | ---------------------- | ----------------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-550-01 | Endpoints REST bajo `/api/materials/*` (RF-MAT-09) | Materials | Humano      |              | Rutas funcionales      | `backend-materiales-go/`      |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-550-02 | Compatibilidad con API Gateway                     | Materials | Humano      |              | Proxy funcional        | `api-gateway/src/`            |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-550-03 | Health check `/health`                             | Materials | Humano      |              | `{status: "UP"}`       | `backend-materiales-go/`      |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-550-04 | Documentación Swagger (RF-MAT-10)                  | Materials | Humano      |              | Swagger UI funcional   | `docs/api/materiales_swagger.json` |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-550-05 | Exportación a SAP                                  | Materials | Agente      |              | CSV compatible con SAP | `backend-materiales-go/`      |

---

## 8. FASE 6 — Desarrollo: API Gateway

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                      | Módulo  | Responsable | Dependencias | Criterio de Aceptación               | Archivos Afectados             |
| ---------- | -------------------- | --------- | ----------- | -------------------------------- | ------- | ----------- | ------------ | ------------------------------------ | ------------------------------ |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-600-01 | Enrutamiento a Users Service     | Gateway | Humano      |              | Proxy funcional                      | `api-gateway/src/`             |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-600-02 | Enrutamiento a MP Service        | Gateway | Humano      |              | Proxy funcional                      | `api-gateway/src/`             |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-600-03 | Enrutamiento a Materials Service | Gateway | Humano      |              | Proxy funcional                      | `api-gateway/src/`             |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-600-04 | Verificación de JWT              | Gateway | Agente      |              | Middleware de autenticación          | `api-gateway/src/middlewares/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-600-05 | Rate limiting                    | Gateway | Agente      |              | Límite por IP                        | `api-gateway/src/middlewares/` |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-600-06 | CORS                             | Gateway | Agente      |              | Configuración de orígenes permitidos | `api-gateway/src/`             |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-600-07 | Logging centralizado             | Gateway | Agente      |              | Logs estructurados JSON              | `api-gateway/src/`             |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-600-08 | Health checks agregados          | Gateway | Agente      |              | `GET /health` agrega estado de todos | `api-gateway/src/`             |
| ⏳ Pendiente  | Alta                 | 1–4 horas | TASK-600-09 | Manejo de errores unificado      | Gateway | Agente      |              | Formato consistente de errores       | `api-gateway/src/`             |
| ⏳ Pendiente  | Media                | 1–4 horas | TASK-600-10 | Documentación de rutas           | Gateway | Agente      |              | OpenAPI del Gateway                  | `api-gateway/docs/`            |

---

## 9. FASE 7 — Desarrollo: Frontend

### 9.1. Configuración Base

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                                     | Módulo   | Responsable | Dependencias | Criterio de Aceptación         | Archivos Afectados            |
| ---------- | -------------------- | --------- | ----------- | ----------------------------------------------- | -------- | ----------- | ------------ | ------------------------------ | ----------------------------- |
| ✅ Completada | Crítica (bloqueante) | 1–4 horas | TASK-700-01 | Inicializar proyecto React + Vite + TS          | Frontend | Humano      |              | Proyecto funcional             | `frontend/`                   |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-700-02 | Configurar Tailwind CSS                         | Frontend | Agente      |              | Estilos funcionales            | `frontend/tailwind.config.js` |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-700-03 | Configurar cliente HTTP (Axios + interceptores) | Frontend | Agente      |              | Interceptor de token funcional | `frontend/src/services/`      |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-700-04 | Configurar manejo de estado                     | Frontend | Agente      |              | Context API o Zustand          | `frontend/src/store/`         |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-700-05 | Configurar enrutamiento (React Router)          | Frontend | Agente      |              | Rutas protegidas               | `frontend/src/router/`        |

### 9.2. Módulos de UI

| Estado    | Prioridad            | Esfuerzo  | ID de Tarea | Descripción            | Módulo   | Responsable | Dependencias | Criterio de Aceptación         | Archivos Afectados                 |
| --------- | -------------------- | --------- | ----------- | ---------------------- | -------- | ----------- | ------------ | ------------------------------ | ---------------------------------- |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-01 | Módulo de Login        | Frontend | Agente      |              | Formulario funcional + JWT     | `frontend/src/pages/Login/`        |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-02 | Dashboard principal    | Frontend | Agente      |              | KPIs visibles                  | `frontend/src/pages/Dashboard/`    |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-03 | Módulo de Teléfonos    | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Telefonos/`    |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-04 | Módulo de Líneas       | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Lineas/`       |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-05 | Módulo de Pizarras     | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Pizarras/`     |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-06 | Módulo de Quejas       | Frontend | Agente      |              | CRUD + flujo de estados        | `frontend/src/pages/Quejas/`       |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-07 | Módulo de Pruebas      | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Pruebas/`      |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-08 | Módulo de Trabajos     | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Trabajos/`     |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-09 | Módulo de Materiales   | Frontend | Agente      |              | CRUD + asignaciones + consumos | `frontend/src/pages/Materiales/`   |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-710-10 | Módulo de Estadísticas | Frontend | Agente      |              | Gráficos con Recharts          | `frontend/src/pages/Estadisticas/` |
| ⏳ Pendiente | Alta                 | 1–4 horas | TASK-710-11 | Gestión de Usuarios    | Frontend | Agente      |              | CRUD funcional                 | `frontend/src/pages/Usuarios/`     |
| ⏳ Pendiente | Media                | 1–4 horas | TASK-710-12 | Perfil de Usuario      | Frontend | Agente      |              | Ver/editar perfil              | `frontend/src/pages/Perfil/`       |

### 9.3. UX/UI Transversal

| Estado    | Prioridad | Esfuerzo  | ID de Tarea | Descripción                  | Módulo   | Responsable | Dependencias | Criterio de Aceptación    | Archivos Afectados   |
| --------- | --------- | --------- | ----------- | ---------------------------- | -------- | ----------- | ------------ | ------------------------- | -------------------- |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-720-01 | Internacionalización (ES/RU) | Frontend | Agente      |              | i18n funcional            | `frontend/src/i18n/` |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-720-02 | Responsive design            | Frontend | Agente      |              | Móvil, tablet, desktop    | `frontend/src/`      |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-720-03 | Manejo de errores            | Frontend | Agente      |              | Error boundaries + toasts | `frontend/src/`      |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-720-04 | Loading states               | Frontend | Agente      |              | Skeletons + spinners      | `frontend/src/`      |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-720-05 | Notificaciones toast         | Frontend | Agente      |              | Librería integrada        | `frontend/src/`      |

---

## 10. FASE 8 — Testing y QA

### 10.1. Tests Unitarios

| Estado     | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                       | Módulo  | Responsable | Dependencias | Criterio de Aceptación        | Archivos Afectados       |
| ---------- | -------------------- | --------- | ----------- | --------------------------------- | ------- | ----------- | ------------ | ----------------------------- | ------------------------ |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-800-01 | Tests unitarios Users Service     | Testing | Agente      |              | Cobertura ≥ 70% con Jest      | `backend-users/tests/`   |
| ⏳ Pendiente  | Crítica (bloqueante) | 1–4 horas | TASK-800-02 | Tests unitarios MP Service        | Testing | Agente      |              | Cobertura ≥ 70% con Jest      | `backend-mp/tests/`      |
| ✅ Completada | Alta                 | 1–4 horas | TASK-800-03 | Tests unitarios Materials Service | Testing | Humano      |              | Cobertura ≥ 70% con `testify` | `backend-materiales-go/` |

### 10.2. Pruebas de Integración

| Estado    | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                      | Módulo  | Responsable | Dependencias | Criterio de Aceptación              | Archivos Afectados |
| --------- | -------------------- | --------- | ----------- | -------------------------------- | ------- | ----------- | ------------ | ----------------------------------- | ------------------ |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-810-01 | Pruebas end-to-end Users Service | Testing | Agente      |              | Ciclo completo de usuario funcional | `tests/e2e/users/` |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-810-02 | Pruebas end-to-end MP Service    | Testing | Agente      |              | Ciclo completo de usuario funcional | `tests/e2e/mp/`    |

### 10.3. QA y Control de Calidad

| Estado    | Prioridad            | Esfuerzo  | ID de Tarea | Descripción            | Módulo  | Responsable | Dependencias | Criterio de Aceptación                        | Archivos Afectados   |
| --------- | -------------------- | --------- | ----------- | ---------------------- | ------- | ----------- | ------------ | --------------------------------------------- | -------------------- |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-820-01 | Auditoría de seguridad | Testing | Agente      |              | Todas las vulnerabilidades críticas resueltas | `security-audit/`    |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-820-02 | Pruebas de rendimiento | Testing | Agente      |              | 1000+ RPS objetivo                            | `performance-tests/` |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-820-03 | Pruebas de carga       | Testing | Agente      |              | 500+ concurrentes                             | `load-tests/`        |

---

## 11. FASE 9 — Despliegue y Operación

| Estado    | Prioridad            | Esfuerzo  | ID de Tarea | Descripción                           | Módulo     | Responsable | Dependencias | Criterio de Aceptación              | Archivos Afectados                       |
| --------- | -------------------- | --------- | ----------- | ------------------------------------- | ---------- | ----------- | ------------ | ----------------------------------- | ---------------------------------------- |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-900-01 | Pipeline CI/CD para Users Service     | Despliegue | Agente      |              | Implementación automática funcional | `.github/workflows/users-deploy.yml`     |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-900-02 | Pipeline CI/CD para MP Service        | Despliegue | Agente      |              | Implementación automática funcional | `.github/workflows/mp-deploy.yml`        |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-900-03 | Pipeline CI/CD para Materials Service | Despliegue | Agente      |              | Implementación automática funcional | `.github/workflows/materials-deploy.yml` |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-900-04 | Pipeline CI/CD para API Gateway       | Despliegue | Agente      |              | Implementación automática funcional | `.github/workflows/gateway-deploy.yml`   |
| ⏳ Pendiente | Crítica (bloqueante) | 1–4 horas | TASK-900-05 | Pipeline CI/CD para Frontend          | Despliegue | Agente      |              | Implementación automática funcional | `.github/workflows/frontend-deploy.yml`  |

### 11.2. Configuración de Producción

| Estado    | Prioridad | Esfuerzo  | ID de Tarea | Descripción                         | Módulo     | Responsable | Dependencias | Criterio de Aceptación | Archivos Afectados |
| --------- | --------- | --------- | ----------- | ----------------------------------- | ---------- | ----------- | ------------ | ---------------------- | ------------------ |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-910-01 | Configurar Kubernetes en producción | Despliegue | Agente      |              | Cluster funcional      | `k8s/prod/`        |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-910-02 | Configurar monitoreo en producción  | Despliegue | Agente      |              | Métricas disponibles   | `monitoring/prod/` |

---

## 12. FASE 10 — Analítica y Reportes

| Estado    | Prioridad | Esfuerzo  | ID de Tarea  | Descripción                         | Módulo    | Responsable | Dependencias | Criterio de Aceptación             | Archivos Afectados     |
| --------- | --------- | --------- | ------------ | ----------------------------------- | --------- | ----------- | ------------ | ---------------------------------- | ---------------------- |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-01 | Dashboard de analítica              | Analítica | Agente      |              | KPIs visibles                      | `analytics/dashboard/` |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-02 | Reportes exportables                | Analítica | Agente      |              | Exportación PDF/Excel funcional    | `reports/`             |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-03 | Alertas de métricas                 | Analítica | Agente      |              | Notificaciones configurables       | `alerts/`              |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-04 | Segmentación de datos               | Analítica | Agente      |              | Filtros por fecha/ámbito funcional | `segmentation/`        |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-05 | Panel de control de administradores | Analítica | Agente      |              | Roles y permisos funcionales       | `admin-panel/`         |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-06 | API de análisis                     | Analítica | Agente      |              | Endpoints REST funcionales         | `api/analytics/`       |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-07 | Tendencias históricas               | Analítica | Agente      |              | Series temporales funcionales      | `trends/`              |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1000-08 | Comparación de períodos             | Analítica | Agente      |              | Análisis de varianza funcional     | `comparison/`          |

---

## 13. FASE 11 — Documentación Final y Defensa

| Estado    | Prioridad | Esfuerzo  | ID de Tarea  | Descripción                     | Módulo        | Responsable | Dependencias | Criterio de Aceptación                 | Archivos Afectados           |
| --------- | --------- | --------- | ------------ | ------------------------------- | ------------- | ----------- | ------------ | -------------------------------------- | ---------------------------- |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1100-01 | Documento final de diseño       | Documentación | Humano + IA |              | Arquitectura y decisiones documentadas | `docs/final-design/`         |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1100-02 | Documentación de implementación | Documentación | Humano + IA |              | Código y procesos documentados         | `docs/implementation/`       |
| ⏳ Pendiente | Alta      | 1–4 horas | TASK-1100-03 | Presentación de defensa         | Documentación | Humano      |              | Slides funcionales                     | `docs/defense-presentation/` |

---

## 14. FASE 12 — Mantenimiento y Evolución

| Estado    | Prioridad | Esfuerzo  | ID de Tarea  | Descripción                   | Módulo        | Responsable | Dependencias | Criterio de Aceptación       | Archivos Afectados           |
| --------- | --------- | --------- | ------------ | ----------------------------- | ------------- | ----------- | ------------ | ---------------------------- | ---------------------------- |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-1200-01 | Sistema de soporte            | Mantenimiento | Agente      |              | Tickets resueltos en 24h     | `support/`                   |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-1200-02 | Plan de mejoras               | Mantenimiento | Agente      |              | Feature requests priorizados | `roadmap/`                   |
| ⏳ Pendiente | Media     | 1–4 horas | TASK-1200-03 | Monitoreo de infraestructura  | Mantenimiento | Agente      |              | Alertas configuradas         | `infrastructure-monitoring/` |
| ⏳ Pendiente | Baja      | > 3 días  | TASK-1200-04 | Optimización de rendimiento   | Mantenimiento | Agente      |              | CPU/Memoria reducidos 20%    | `optimization/`              |
| ⏳ Pendiente | Baja      | > 3 días  | TASK-1200-05 | Actualización de dependencies | Mantenimiento | Agente      |              | Security patches aplicados   | `dependencies/`              |

---

## 15. Resumen de Progreso

| Fase      | Total de Tareas | ✅ Completadas | ⏳ Pendientes | En Progreso | 🚫 Bloqueadas | Porcentaje Completado |
| --------- | --------------- | ----------- | ---------- | ----------- | ---------- | --------------------- |
| FASE 0    | 8               | 3           | 5          | 0           | 0          | 37.5%                 |
| FASE 1    | 14              | 3           | 11         | 0           | 0          | 21.4%                 |
| FASE 2    | 15              | 4           | 11         | 0           | 0          | 26.7%                 |
| FASE 3    | 12              | 2           | 10         | 0           | 0          | 16.7%                 |
| FASE 4    | 36              | 10          | 26         | 0           | 0          | 27.8%                 |
| FASE 5    | 34              | 22          | 12         | 0           | 0          | 64.7%                 |
| FASE 6    | 10              | 3           | 7          | 0           | 0          | 30.0%                 |
| FASE 7    | 22              | 1           | 21         | 0           | 0          | 4.5%                  |
| FASE 8    | 8               | 1           | 7          | 0           | 0          | 12.5%                 |
| FASE 9    | 7               | 0           | 7          | 0           | 0          | 0.0%                  |
| FASE 10   | 8               | 0           | 8          | 0           | 0          | 0.0%                  |
| FASE 11   | 3               | 0           | 3          | 0           | 0          | 0.0%                  |
| FASE 12   | 5               | 0           | 5          | 0           | 0          | 0.0%                  |
| **TOTAL** | **182**         | **49**      | **133**    | **0**       | **0**      | **26.9%**             |

---

*El TASKLIST.md ha sido transformado de formato de viñetas y casillas de verificación a formato de tabla para todas las fases (0-12), manteniendo toda la información original y estructurándola en un formato más fácil de leer y analizar.*