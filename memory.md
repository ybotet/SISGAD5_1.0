# 📅 Memoria — 2026-10-23

> Detalle completo de las decisiones y cambios del 2026-10-23.

---

## Índice de Tareas

| Fecha | Tarea | Resumen | Detalle |
| --- | --- | --- | --- |
| 2026-10-23 | TASK-A-01 | Rotación de credenciales expuestas (JWT_SECRET, DB_PASSWORD) | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-01-rotaci%C3%B3n-de-credenciales-expuestas) |
| 2026-10-23 | TASK-A-02 | Crear .gitignore completo (remover build artifacts versionados) | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-02-crear-gitignore-completo) |
| 2026-10-23 | TASK-A-03 | Eliminar del índice: node_modules, logs, dist, .env, api.exe | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-03-eliminar-del-%C3%ADndice-build-artifacts-y-secretos) |
| 2026-10-23 | TASK-A-04 | Eliminar carpetas: backup/, Continue/, .kilo/.gitignore | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-04-eliminar-carpetas-backup-continue-kilocreategitignore) |
| 2026-10-23 | TASK-A-05 | Eliminar archivos duplicados (docs/architecture.md, etc.) | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-05-eliminar-archivos-duplicados-de-docs) |
| 2026-10-23 | TASK-A-06 | Eliminar archivos temporales (hacer.txt, swagger.json) | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-06-eliminar-archivos-temporales) |
| 2026-10-23 | TASK-A-08 | Eliminar fallback `JWT_SECRET \|\| "secreto"` en Users y MP | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-08-eliminar-fallback-jwt_secret--secreto) |
| 2026-10-23 | TASK-A-09 | Añadir JWT middleware a Materials Service (Go) | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-09-a%C3%B1adir-jwt-middleware-a-materials-service-go) |
| 2026-10-23 | TASK-A-10 | Cerrar puertos internos (5001, 5002, 5003, 5432) en producción | [ver](docs/memory/2026-10-23.md#2026-10-23--task-a-10-cerrar-puertos-internos-en-producci%C3%B3n-docker-composeprodyml) |
| 2026-10-24 | TASK-A-11 | Cambiar credenciales Grafana (admin/admin) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-a-11-cambiar-credenciales-grafana-adminadmin) |
| 2026-10-24 | TASK-A-12 | Corregir `MP_DB_NAME` en docker-compose | [ver](docs/memory/2026-10-23.md#2026-10-24--task-a-12-corregir-mpdbname-en-docker-composeyaml) |
| 2026-10-24 | TASK-B-01 | Migrar backend-mp a feature-based (Lote 0: shared/) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-01-migrar-backend-mp-a-feature-based-lote-0-shared) |
| 2026-10-24 | TASK-B-02 | Migrar backend-mp a feature-based (Lote 1: asignacion, cable, clave) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-02-migrar-lote-1-asignacion-cable-clave) |
| 2026-10-24 | TASK-B-03 | Migrar Lote 2 (clasificacion, clasificadorclave, clasifpizarra) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-03-migrar-lote-2-clasificacion-clasificadorclave-clasifpizarra) |
| 2026-10-24 | TASK-B-04 | Migrar Lote 3 (grupow, linea, mando) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-04-migrar-lote-3-grupow-linea-mando) |
| 2026-10-24 | TASK-B-05 | Migrar Lote 4 (movimiento, pizarra, planta) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-05-migrar-lote-4-movimiento-pizarra-planta) |
| 2026-10-24 | TASK-B-06 | Migrar Lote 5 (propietario, prueba) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-06-migrar-lote-5-propietario-prueba) |
| 2026-10-24 | TASK-B-07 | Migrar Lote 6 (queja, recorrido) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-07-migrar-lote-6-queja-recorrido) |
| 2026-10-24 | TASK-B-08 | Migrar Lote 7 (resultadoprueba, senalizacion, sistema) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-08-migrar-lote-7-resultadoprueba-senalizacion-sistema) |
| 2026-10-24 | TASK-B-09 | Migrar Lote 8 (telefono, tipolinea, tipomovimiento) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-09-migrar-lote-8-telefono-tipolinea-tipomovimiento) |
| 2026-10-24 | TASK-B-10 | Migrar Lote 9 (tipopizarra, tipoqueja, trabajador) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-10-migrar-lote-9-tipopizarra-tipoqueja-trabajador) |
| 2026-10-24 | TASK-B-11 | Migrar Lote 10 (trabajo, trabajo_trabajadores, models/index.js) | [ver](docs/memory/2026-10-23.md#2026-10-24--task-b-11-migrar-lote-10-trabajo-trabajo_trabajadores-modelsindexjs) |
| 2026-10-26 | TASK-B-12 | Consolidar routes/index.js — rutas desde features | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-12-actualizar-srcroutesindexjs--rutas-consolidadas-desde-features) |
| 2026-10-26 | TASK-B-13 | Verificar docker compose up y tests E2E | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-13-verificar-docker-compose-up-y-tests-e2e) |
| 2026-10-26 | TASK-B-14 | Commit por lote + PR + merge | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-14-commit-por-lote--pr--merge) |
| 2026-10-26 | TASK-B-15 | JWT verification en API Gateway | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-15-jwt-verification-en-api-gateway) |
| 2026-10-26 | TASK-B-16 | CORS lista blanca en Gateway | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-16-cors-con-lista-blanca-en-api-gateway) |
| 2026-10-26 | TASK-B-17 | RBAC permisos en quejas/trabajos/asignaciones | [ver](docs/memory/2026-10-23.md#2026-10-26--task-b-17-rbac-permisos-en-quejas-trabajos-asignaciones) |

---

## Consolidación del Proyecto y Fusión de TASKLIST

**Tipo:** Decisión arquitectónica + reorganización

### Qué se hizo
- Se fusionaron dos TASKLIST: plan de consolidación (Fases A–D) + inventario funcional (Fases 0–13).
- Se incorporaron 15 hallazgos de auditoría como tareas nuevas (A-08 a A-12, B-15 a B-22, C-11 a C-12).
- Se decidió que `memory.md` es índice (< 200 líneas) y el detalle va en `docs/memory/`.
- Se decidió que los hallazgos de auditoría van en `AGENTS.md` sección 8 (deuda técnica activa temporal).

### Por qué se hizo de esa forma
- **Un solo TASKLIST:** Evita confusión sobre "fuente de verdad". Parte I (consolidación) primero; Parte II (funcional) después.
- **Auditoría integrada:** Los críticos (SEC-01, SEC-02, SEC-03) son bloqueantes.
- **AGENTS.md con deuda técnica:** Los agentes deben saber qué está roto para no empeorarlo.
- **memory.md como índice:** Evita saturación de contexto y alucinaciones.

### Dónde están los cambios
- `TASKLIST.md` — Fusionado (273 tareas)
- `AGENTS.md` — Sección 8 añadida
- `memory.md` — Este índice
- `docs/memory/2026-10-23.md` — Este detalle
- `docs/audit/AUDITORIA.md` — Movido desde raíz
- `docs/migrations/backend-mp-feature-based.md` — Movido desde raíz

### Qué se aprendió
- La auditoría reveló 3 críticos y 11 altos no contemplados.
- El acoplamiento MP → Users (ARC-02) es SPOF.
- El cierre de queja no orquesta materiales (ARC-03).

### Dependencias desbloqueadas
- TASK-A-01 a A-12 (Fase A) listas para ejecutar.

---

## ADR-004: Prediction Service en Python + FastAPI

**Decisión:** Crear `prediction-service/` como servicio aparte en Python 3.11+ + FastAPI.

**Justificación:**
- Ecosistema ML maduro en Python (scikit-learn, XGBoost, Prophet, TensorFlow).
- Ciclo de vida independiente (entrenamiento, versionado, despliegue).
- Escalabilidad separada.
- Aislamiento de fallos.

**Alternativas descartadas:**
- Node.js: ecosistema ML limitado.
- Go: ecosistema ML muy limitado.

**Consecuencias:**
- Nuevo lenguaje en el stack (Python).
- Nueva BD (`bd_predictions`).
- Servicios auxiliares: MLflow (model registry), Airflow (pipelines).
- 19 tareas nuevas en Fase D.

---

## ADR-005: Estructura Feature-Based en MP

**Decisión:** Reorganizar `backend-mp/src/` de capas (controllers/, routes/, models/, validations/) a features (asignacion/, cable/, clave/, ...).

**Justificación:**
- Mantenibilidad: todo lo de una entidad junto.
- Escalabilidad: añadir entidad = nueva carpeta.
- Alineación con `backend-materiales-go` (ya feature-based).

**Consecuencias:**
- 10 lotes de migración (Fase B).
- 22 tareas en Fase B (incluyendo correcciones de auditoría).

---

## ADR-006: Docs Bilingües ES/RU (Archivos Paralelos)

**Decisión:** Usar archivos paralelos `nombre.es.md` / `nombre.ru.md` en `docs/`.

**Justificación:**
- Cumple requisito de tesis bilingüe (RU para defensa, ES para publicaciones).
- Clara separación de idiomas.
- Fácil de mantener juntos.

**Alternativas descartadas:**
- Carpetas por idioma (`docs/es/`, `docs/ru/`): duplicación de estructura.
- Un archivo con dos secciones (`## ES` / `## RU`): archivos muy largos.

**Consecuencias:**
- 18 documentos × 2 idiomas = 36 archivos.
- Fase C (12 tareas) para traducción.

---

## ADR-007: Un Solo Repositorio (SISGAD5_1.0)

**Decisión:** Todo el proyecto vive en `SISGAD5_1.0`. `SISGAD5_doc` se archiva.

**Justificación:**
- Evita duplicación y confusión sobre "fuente de verdad".
- Facilita navegación y mantenimiento.
- Simplifica CI/CD.

**Consecuencias:**
- Migrar contenido de `SISGAD5_doc` a `docs/practices/` y `docs/diagrams/`.
- Nota de archivado en README de `SISGAD5_doc`.

---

## Lecciones Aprendidas

1. **Secretos en `.env`:** Riesgo crítico. Rotar y usar `.env.local`.
2. **Docs ≠ código:** Sincronizar `ARCHITECTURE.md` con realidad (mux vs Gin).
3. **SPOF MP → Users:** Resolver con claims en JWT.
4. **Cierre de queja sin materiales:** Implementar saga.
5. **Orden de rutas Express:** `/dashboard/*` antes de `/:id`.
6. **CI roto:** `npm test` con `exit 1` debe reemplazarse.
7. **Auditoría:** 28 hallazgos (3 críticos, 11 altos, 10 medios, 4 bajos).
8. **Predictivo aparte:** Python, no Node/Go.
9. **Datos sintéticos:** Anonimizar datos reales para entrenamiento.
10. **memory.md como índice:** Evita alucinaciones.

---

> **Mantenido por:** Agentes de IA + Ing. Botet S.Y.
> **Licencia:** Uso académico — Tesis de Maestría RTU MIREA