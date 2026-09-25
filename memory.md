# memory.md — Memoria Persistente del Proyecto SISGAD5

> **Propósito:** Documentar decisiones clave, contexto histórico, y aprendizajes del equipo de desarrollo.
> **Última actualización:** Septiembre 2026

---

## 1. Historia del Proyecto

### Origen (2025)
- Proyecto iniciado como tesis de maestría en RTU MIREA (Moscú)
- Cliente: Dirección No. 5 (DAG5), ETECSA, Cuba
- Sistema heredado: "Mesa de Quejas" (Microsoft Access, 2000)
- Necesidad: Digitalizar todo el ciclo de gestión operativa

### Objetivo Principal
Desarrollar una plataforma de microservicios que permita digitalizar desde el reporte de una queja hasta la gestión de materiales, con analítica para toma de decisiones.

## 2. Decisiones Arquitectónicas Clave

| ID | Decisión | Justificación | Estado |
|----|----------|---------------|--------|
| D-01 | Microservicios (3 servicios + gateway) | Escalabilidad, aislamiento de fallos, equipos independientes | ✅ Adoptada |
| D-02 | Go para Materials Service | Concurrencia nativa para validación de stock | ✅ Adoptada |
| D-03 | Node.js para Auth y MP | Velocidad de desarrollo, ecosistema maduro | ✅ Adoptada |
| D-04 | React + Vite + TS para frontend | Bundling rápido, tipado estricto | ✅ Adoptada |
| D-05 | PostgreSQL (3 BDs separadas) | ACID, madurez, JSONB | ✅ Adoptada |
| D-06 | Redis para locks y rate limit | Atomicidad, rendimiento | ✅ Adoptada |
| D-07 | No usar colas (RabbitMQ) aún | MVP, simplificación; migrar en v2.0 | 🔄 Pendiente |
| D-08 | Swagger generado automáticamente | Autodoc en tiempo de build | ✅ Adoptada |

## 3. Reglas de Negocio Críticas

### Prioridad de Quejas (BR-03)
```
prioridad_score = tipo_peso + servicio_peso + ubicacion_peso + (antiguedad_horas > 2 ? 1 : 0)

Mapeo:
  12-13 → Prioridad 1 (Urgente)
  9-11  → Prioridad 2 (Alta)  
  6-8   → Prioridad 3 (Media)
  3-5   → Prioridad 4 (Baja)
```

### FSM de Quejas (BR-04)
```
States: Reportada → Priorizada → Abierta → EnProgreso → {PendientePrueba | EnRevision | Cerrada}
Allowed transitions strictly enforced via Specification pattern.
```

### Stock Concurrente (BR-08, BR-09, BR-10)
```
Pattern: Distributed Lock (Redis) + Transaction (PostgreSQL)
Lock ordering: Always acquire locks sorted by material_id (ascending)
Retry: Exponential backoff, max 3 attempts
```

## 4. Credenciales de Desarrollo

```env
# No usar en producción — estos son datos de DEV
ADMIN_USER=admin@sistema.cu
ADMIN_PASS=Admin123Dev!
JWT_SECRET=dev-secret-key-change-in-prod
```

## 5. Endpoints Críticos

| Endpoint | Servicio | Notas |
|----------|----------|-------|
| POST /api/auth/login | Users | Rate limited (5 attempts → 15min block) |
| POST /api/materials/asignaciones | Materials | Concurrency-safe, stock validation |
| POST /api/materials/consumos | Materials | Validation against assignment (BR-08) |
| POST /api/mp/quejas | MP | Priority calculation + classification |
| PATCH /api/mp/quejas/{id}/estado | MP | FSM validation |

## 6. Testing

| Herramienta | Uso | Cobertura objetivo |
|-------------|-----|-------------------|
| Jest + Supertest | Unit + API integration | 70% |
| Go testing + Testify | Unit + integration | 85% |
| Testcontainers | Integration con DB real | - |
| k6 | Load testing | Endpoints críticos |
| GitHub Actions | CI (on PR), CD (on merge) | 100% PRs |

## 7. Deploy

- **Staging**: Push a rama `staging/*` → deploy automático
- **Production**: Merge a `main` → CD manual (requiere approval)
- **Rollback**: `make rollback VERSION=x.y.z`

## 8. Troubleshooting Común

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|
| Login 500 | JWT_SECRET no configurado | Verificar .env en Users Service |
| Stock no decrementa | Lock Redis falló | Verificar Redis, revisar retry logs |
| Queja no cambia estado | FSM invalid transition | Ver BR-04, usar transición válida |
| Email no llega | Mailjet API key inválida | Verificar .env en MP Service |
| Slow queries | Índices faltantes | `EXPLAIN ANALYZE`, añadir índices |

## 9. Pendientes (To-Do)

- [ ] Implementar notificaciones por email (Mailjet)
- [ ] Activar alertas de stock bajo (background scheduler)
- [ ] Exportar dashboards (CSV/PDF)
- [ ] Migrar a RabbitMQ para eventos async
- [ ] Kubernetes deployment
- [ ] Mobile app (React Native)
- [ ] Análitica predictiva (ML)

## 10. Referencias

- [ESTRUCTURA.md](./ESTRUCTURA.md)
- [TASKLIST.md](./TASKLIST.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [SPEC.md](./SPEC.md)
- [Tesis completa](./docs/thesis/)

---

## 11. Registro de Cambios de Estructura (Reorganización 2026-09-25)

| Cambio | Detalle |
|--------|---------|
| Migración docs/ | Centralizada toda documentación en `docs/` con subcarpetas: `api/`, `diagrams/`, `thesis/`, `practices/`, `manuals/` |
| Migración monitoring/ | `docker-compose.yml` → `prometheus/prometheus.yml`, `promtail-config.yaml` → `loki/promtail-config.yaml`, `loki-config.yaml` → `loki/` |
| Migración swagger | `backend-mp/docs/*` → `docs/api/`, `backend-materiales-go/docs/*` → `docs/api/` |
| Creación workflows | `ci.yml`, `cd.yml`, `security.yml`, `docs.yml` en `.github/workflows/` |
| Creación root docs | `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `ARCHITECTURE.md`, `memory.md` |
| Remoción .env sensibles | `.env.docker`, `.env.production` untracked de git por seguridad |
| Actualización .gitignore | Añadido `!.env.example` para preservar template en versionamiento |
| Actualización docker-compose | Rutas de monitoring/ actualizadas tras reorganización |
| Actualización enlaces | README.md, AGENT.md, SPEC.md, TASKLIST.md referencias actualizadas