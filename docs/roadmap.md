# 📋 Roadmap de Desarrollo SISGAD5

> **Propósito:** Roadmap de desarrollo del proyecto SISGAD5, alineado con GitHub Projects y TASKLIST.md.
> **Board Columns:** Backlog → In Progress → Review → Done

---

## Tabla de Contenidos

1. [Fases de Desarrollo](#1-fases-de-desarrollo)
2. [Mapeo de Tareas a Columnas](#2-mapeo-de-tareas-a-columnas)
3. [Hitos y Entregables](#3-hitos-y-entregables)
4. [Cómo Usar GitHub Projects](#4-cómo-usar-github-projects)
5. [Referencias](#5-referencias)

---

## 1. Fases de Desarrollo

### FASE 0 — Planificación y Documentación Base
**Objetivo:** Consolidar toda la documentación del proyecto.

| Task ID | Descripción | Responsable | Estado |
|---------|-------------|-------------|--------|
| TASK-000-01 | Crear README.md principal (ES/RU) | Humano | ✅ Done |
| TASK-000-02 | Crear AGENT.md con instrucciones para agentes | Humano + IA | ✅ Done |
| TASK-000-03 | Crear SPEC.md con especificación técnica | Humano + IA | ✅ Done |
| TASK-000-04 | Crear CHANGELOG.md (Keep a Changelog + SemVer) | Agente | ✅ Done |
| TASK-000-05 | Crear CONTRIBUTING.md con convenciones | Agente | ✅ Done |
| TASK-000-06 | Documentar requisitos en `docs/requirements.md` | Agente | ✅ Done |
| TASK-000-07 | Documentar arquitectura en `docs/architecture.md` | Agente | ✅ Done |
| TASK-000-08 | Crear roadmap en GitHub Projects | Humano | 🔴 In Progress |

### FASE 1 — Diseño y Modelado
**Objetivo:** Definir el modelo de datos, casos de uso y contratos API.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-100-03 | Diagrama de paquetes (5 paquetes) | Humano | 🔴 |
| TASK-100-04 | Diagramas de secuencia (3 escenarios) | Humano | 🔴 |
| TASK-100-05 | Diccionario de términos | Humano | 🔴 |
| TASK-100-06 | Matriz de trazabilidad | Humano | 🔴 |
| TASK-100-07 | User Story Map | Humano | 🔴 |
| TASK-100-08 | Event Storming | Humano | 🔴 |
| TASK-110-01 | OpenAPI 3.0 Users Service | Agente | 🔴 |
| TASK-110-02 | OpenAPI 3.0 MP Service | Agente | 🔴 |
| TASK-110-04 | Modelo ER consolidado | Agente | 🟡 |
| TASK-110-05 | Estrategia JWT + Refresh | Agente | 🟡 |
| TASK-110-06 | Matriz RBAC por endpoint | Agente | 🟡 |

### FASE 2 — Infraestructura y Configuración
**Objetivo:** Contenerización, CI/CD y monitoreo.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-200-02 | Dockerfile Users Service | Agente | 🔴 |
| TASK-200-03 | Dockerfile MP Service | Agente | 🔴 |
| TASK-200-04 | Dockerfile API Gateway | Agente | 🔴 |
| TASK-200-05 | Dockerfile Frontend | Agente | 🔴 |
| TASK-210-02 | GitHub Actions CD (deploy) | Agente | 🟡 |
| TASK-210-03 | Configurar Dependabot | Agente | 🟡 |
| TASK-210-04 | Branch protection en `main` | Humano | 🟡 |
| TASK-220-01 | Configurar Prometheus | Agente | 🟡 |
| TASK-220-02 | Configurar Grafana | Agente | 🟡 |
| TASK-220-03 | Centralizar logs (ELK) | Agente | 🟢 |
| TASK-220-04 | Configurar Sentry | Agente | 🟢 |

### FASE 3 — Desarrollo: Users Service
**Objetivo:** Autenticación y gestión de usuarios.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-300-03 | Refresh tokens | Agente | 🔴 |
| TASK-300-04 | Logout | Agente | 🔴 |
| TASK-300-05 | Recuperación de contraseña | Agente | 🟡 |
| TASK-300-06 | Cambio de contraseña | Agente | 🟡 |
| TASK-300-07 | Bloqueo por intentos fallidos | Agente | 🟢 |
| TASK-300-08 | Historial de sesiones | Agente | 🟢 |
| TASK-310-01 | CRUD de usuarios | Agente | 🔴 |
| TASK-310-02 | Gestión de roles (RBAC) | Agente | 🔴 |
| TASK-310-03 | Middleware de autorización | Agente | 🟡 |
| TASK-310-04 | Endpoint `/health` | Agente | 🟡 |

### FASE 4 — Desarrollo: MP Service
**Objetivo:** Operaciones de quejas, pruebas y trabajos.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-400-02 | Cambio de estado teléfonos | Agente | 🔴 |
| TASK-400-03 | Historial completo teléfonos | Agente | 🟡 |
| TASK-400-04 | Búsqueda y filtrado teléfonos | Agente | 🟡 |
| TASK-410-02 | Cambio de estado líneas | Agente | 🔴 |
| TASK-410-03 | Historial completo líneas | Agente | 🟡 |
| TASK-410-04 | Búsqueda y filtrado líneas | Agente | 🟡 |
| TASK-420-02 | Mapeo de puertos | Agente | 🟡 |
| TASK-420-03 | Conexiones entrantes/salientes | Agente | 🟡 |
| TASK-420-04 | Ubicación física | Agente | 🟡 |
| TASK-420-05 | Búsqueda y filtrado pizarras | Agente | 🟡 |
| TASK-420-06 | Historial completo pizarra | Agente | 🟡 |
| TASK-430-02 | Clasificación quejas | Agente | 🔴 |
| TASK-430-03 | Priorización | Agente | 🔴 |
| TASK-430-06 | Historial de cambios | Agente | 🟡 |
| TASK-430-07 | Auditoría de acciones | Agente | 🟡 |
| TASK-430-08 | Búsqueda y filtrado quejas | Agente | 🟡 |
| TASK-430-09 | Paginación de quejas | Agente | 🟡 |
| TASK-430-10 | Notificaciones por email | Agente | 🟢 |
| TASK-440-02 | Resultados de prueba | Agente | 🔴 |
| TASK-440-03 | Vinculación con queja y trabajo | Agente | 🔴 |
| TASK-440-04 | Historial de pruebas | Agente | 🟡 |
| TASK-450-03 | Tiempo estimado vs real | Agente | 🟡 |
| TASK-450-05 | Historial de trabajos | Agente | 🟡 |
| TASK-460-01 | Endpoint de resumen | Agente | 🟡 |
| TASK-460-02 | Métricas agregadas | Agente | 🟡 |
| TASK-460-03 | Filtros por fecha/servicio | Agente | 🟢 |

### FASE 5 — Desarrollo: Materials Service
**Objetivo:** Gestión transaccional de materiales.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-500-05 | Filtros por categoría/unidad | Agente | 🟡 |
| TASK-520-05 | Validación de stock real | Agente | 🔴 |
| TASK-520-06 | Activar concurrencia (goroutines) | Agente | 🟡 |
| TASK-520-07 | Historial de asignaciones | Agente | 🟡 |
| TASK-530-05 | Validación contra asignación | Agente | 🔴 |
| TASK-530-06 | Activar concurrencia (goroutines) | Agente | 🟡 |
| TASK-530-07 | Historial de consumos | Agente | 🟡 |
| TASK-540-04 | Cálculo de saldo lógico | Agente | 🟡 |
| TASK-540-05 | Alertas de stock bajo | Agente | 🟢 |
| TASK-540-06 | Exportación CSV/JSON | Agente | 🟢 |
| TASK-540-07 | Tendencias y predicciones | Agente | ⚪ |
| TASK-550-05 | Exportación a SAP | Agente | 🟢 |

### FASE 6 — Desarrollo: API Gateway
**Objetivo:** Punto único de entrada.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-600-04 | Verificación de JWT | Agente | 🔴 |
| TASK-600-05 | Rate limiting | Agente | 🟡 |
| TASK-600-06 | CORS | Agente | 🟡 |
| TASK-600-07 | Logging centralizado | Agente | 🟡 |
| TASK-600-08 | Health checks agregados | Agente | 🟡 |
| TASK-600-09 | Manejo de errores unificado | Agente | 🟡 |
| TASK-600-10 | Documentación de rutas | Agente | 🟢 |

### FASE 7 — Desarrollo: Frontend
**Objetivo:** Interfaz de usuario.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-700-02 | Configurar Tailwind CSS | Agente | 🔴 |
| TASK-700-03 | Configurar cliente HTTP | Agente | 🔴 |
| TASK-700-04 | Configurar manejo de estado | Agente | 🔴 |
| TASK-700-05 | Configurar enrutamiento | Agente | 🔴 |
| TASK-710-01 | Módulo de Login | Agente | 🔴 |
| TASK-710-02 | Dashboard principal | Agente | 🔴 |
| TASK-710-03 | Módulo de Teléfonos | Agente | 🔴 |
| TASK-710-04 | Módulo de Líneas | Agente | 🔴 |
| TASK-710-05 | Módulo de Pizarras | Agente | 🔴 |
| TASK-710-06 | Módulo de Quejas | Agente | 🔴 |
| TASK-710-07 | Módulo de Pruebas | Agente | 🔴 |
| TASK-710-08 | Módulo de Trabajos | Agente | 🔴 |
| TASK-710-09 | Módulo de Materiales | Agente | 🔴 |
| TASK-710-10 | Módulo de Estadísticas | Agente | 🔴 |
| TASK-710-11 | Gestión de Usuarios | Agente | 🟡 |
| TASK-710-12 | Perfil de Usuario | Agente | 🟡 |
| TASK-720-01 | Internacionalización (ES/RU) | Agente | 🟡 |
| TASK-720-02 | Responsive design | Agente | 🟡 |
| TASK-720-03 | Manejo de errores | Agente | 🟡 |
| TASK-720-04 | Loading states | Agente | 🟡 |
| TASK-720-05 | Notificaciones toast | Agente | 🟢 |

### FASE 8 — Testing y QA
**Objetivo:** Garantizar calidad y cobertura.

| Task ID | Descripción | Responsable | Prioridad |
|---------|-------------|-------------|-----------|
| TASK-800-01 | Tests unitarios Users Service | Agente | 🔴 |
| TASK-800-02 | Tests unitarios MP Service | Agente | 🔴 |
| TASK-810-01 | Pruebas E2E Users Service | Agente | 🔴 |
| TASK-810-02 | Pruebas E2E MP Service | Agente | 🔴 |
| TASK-810-03 | Pruebas E2E Materials Service | Agente | 🔴 |
| TASK-810-04 | Pruebas de carga (k6) | Agente | 🟡 |

---

## 2. Mapeo de Tareas a Columnas

### Columna: Backlog
Todas las tareas pendientes (estado ⏳ en TASKLIST.md) están en esta columna.

### Columna: In Progress
Las tareas que el agente está implementando activamente.

### Columna: Review
Tareas completadas que están esperando revisión de código antes de ser cerradas.

### Columna: Done
Tareas completadas y revisadas (estado ✅ en TASKLIST.md).

---

## 3. Hitos y Entregables

### Hito 1: Fase 0 — Documentación Base
**Objetivo:** Tener documentación completa del proyecto.
- [x] README.md (ES/RU)
- [x] AGENT.md
- [x] SPEC.md
- [x] ARCHITECTURE.md
- [x] CHANGELOG.md
- [x] CONTRIBUTING.md
- [x] docs/requirements.md
- [x] docs/architecture.md
- [ ] GitHub Projects board configurado

### Hito 2: Fase 1 — Modelado
**Objetivo:** Tener completo el modelado del sistema.
- [ ] Diagrama de casos de uso
- [ ] Diagrama de clases
- [ ] Diagrama de paquetes
- [ ] Diagramas de secuencia
- [ ] Contratos OpenAPI
- [ ] Modelo ER consolidado
- [ ] Estrategia de autenticación
- [ ] Matriz RBAC

### Hito 3: Fase 2 — Infraestructura
**Objetivo:** Stack Docker y CI/CD operativos.
- [ ] Docker Compose dev/prod
- [ ] Dockerfiles para todos los servicios
- [ ] CI/CD pipeline completo
- [ ] Monitoreo configurado

### Hito 4: Puerto Seguro (MVP)
**Objetivo:** Sistema operativo con funcionalidad núcleo.
- [ ] Autenticación completa (login, refresh, logout)
- [ ] CRUD de materiales con transacciones ACID
- [ ] Gestión completa de quejas con FSM
- [ ] Tests unitarios ≥ 70%
- [ ] Docker compose funcional

### Hito 5: Tesis y Defensa
**Objetivo:** Completar tesis y defensa de maestría.
- [ ] Analítica predictiva implementada
- [ ] Documentación de tesis completa
- [ ] Tests E2E
- [ ] Deploy en producción

---

## 4. Cómo Usar GitHub Projects

### Configuración Inicial

Execute el script de configuración:

```bash
# Requiere GitHub CLI (gh) autenticado
bash scripts/setup-github-project.sh
```

### Columnas del Tablero

| Columna | Descripción |
|---------|-------------|
| **Backlog** | Tareas planificadas pero no iniciadas |
| **In Progress** | Tareas en desarrollo activo |
| **Review** | Tareas listas para revisión de código |
| **Done** | Tareas completadas |

### Automatización

El tablero incluye reglas de automatización:
- Al abrir un issue → se añade a Backlog
- Al cerrar un issue → se mueve a Done
- Al abrir un PR → se añade a Review
- Al mergear un PR → se mueve a Done

### Etiquetas

Las etiquetas se sincronizan con TASKLIST.md:

| Etiqueta | Color | Uso |
|----------|-------|-----|
| 🔴 Crítica (bloqueante) | Rojo | Tareas bloqueantes |
| 🟡 Alta | Naranja | Prioridad alta |
| 🟢 Media | Verde | Prioridad media |
| ⚪ Baja | Amarillo | Prioridad baja |
| Documentación | Morado | Tareas de documentación |
| Testing | Rosa | Tareas de testing |

---

## 5. Referencias

- [TASKLIST.md](../TASKLIST.md)
- [SPEC.md - Roadmap](../SPEC.md#12-roadmap-y-evolución)
- [AGENTS.md](../AGENTS.md)
- [docs/requirements.md](./requirements.md)
- [docs/architecture.md](./architecture.md)
