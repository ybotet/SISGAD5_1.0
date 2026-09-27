# Requisitos del Sistema SISGAD5

> ** proyecto:** SISGAD5 — Sistema de Información para la Gestión y Soporte de la Dirección No. 5
> ** versión:** 1.0
> ** autor:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> ** cliente:** Dirección No. 5 (DAG5) — ETECSA, Cuba
> ** fecha:** 2026-09-26
> ** estado:** Aprobado

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Requisitos Funcionales](#2-requisitos-funcionales)
3. [Requisitos No Funcionales](#3-requisitos-no-funcionales)
4. [Reglas de Negocio](#4-reglas-de-negocio)
5. [Casos de Uso Clave](#5-casos-de-uso-clave)
6. [Prioridades de Desarrollo](#6-prioridades-de-desarrollo)
7. [Restricciones](#7-restricciones)
8. [Referencias](#8-referencias)

---

## 1. Introducción

### 1.1 Propósito

Este documento consolida todos los requisitos funcionales (RF) y no funcionales (RNF) del sistema SISGAD5, una plataforma de microservicios que digitaliza y optimiza los procesos operativos de la Dirección No. 5 (DAG5) de ETECSA, Cuba.

### 1.2 Alcance del Sistema

#### Incluido en el Alcance
- Gestión de usuarios, roles y autenticación (JWT + RBAC)
- Gestión de teléfonos, líneas y pizarras
- Gestión de quejas, pruebas y trabajos
- Gestión de materiales (asignaciones y consumos)
- Dashboards analíticos con KPIs
- API Gateway centralizado
- Despliegue con Docker Compose
- Monitoreo con Prometheus + Grafana + Loki

#### Fuera del Alcance (Actual)
- Integración LDAP/Active Directory
- Integración con SAP ERP (exportación planificada)
- Analítica predictiva con ML (tesis)
- Aplicación móvil nativa
- Migración a Kubernetes (futuro v2.0)
- Colas de mensajes (RabbitMQ/Kafka) (futuro v2.0)

### 1.3 Actores del Sistema

| Actor | Descripción | Roles Asociados |
|-------|-------------|-----------------|
| **Administrador** | Gestión total del sistema | `admin` |
| **Técnico/Probador** | Registra quejas y pruebas | `probador` |
| **Editor** | Edita quejas, pruebas y trabajos | `editor` |
| **Visualizador** | Solo lectura | `visor` |
| **Admin Materiales** | Gestión completa de materiales | `admin_materiales` |

---

## 2. Requisitos Funcionales

### 2.1. Módulo de Autenticación (Users Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-AUTH-01 | Registro de usuarios | Permite crear nuevos usuarios con email, password hash, nombre | Alta |
| RF-AUTH-02 | Login con JWT | Devuelve access token (15 min) + refresh token (7 días) | Alta |
| RF-AUTH-03 | Refresh de tokens | Renueva access token usando refresh token válido | Alta |
| RF-AUTH-04 | Logout | Invalida refresh token en Redis | Media |
| RF-AUTH-05 | Recuperación de contraseña | Flujo completo con email (Mailjet) | Media |
| RF-AUTH-06 | Cambio de contraseña | `PUT /api/users/me/password` funcional | Media |

### 2.2. Gestión de Usuarios y Roles

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-USER-01 | CRUD de usuarios (admin) | Endpoints funcionales con paginación | Alta |
| RF-USER-02 | Gestión de roles (RBAC) | Asignación de roles: admin, probador, editor, visor, admin_materiales | Alta |
| RF-USER-03 | Middleware de autorización | Restricción de endpoints por rol | Alta |
| RF-USER-04 | Historial de sesiones | Registro de sesiones activas | Media |

### 2.3. Gestión de Teléfonos (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-TEL-01 | CRUD de teléfonos | Incluye datos del cliente | Alta |
| RF-MP-TEL-02 | Cambio de estado | `PATCH /api/mp/telefonos/:id/estado` | Alta |
| RF-MP-TEL-03 | Historial completo | Quejas, recorridos, movimientos | Media |
| RF-MP-TEL-04 | Búsqueda y filtrado | `GET /api/mp/telefonos?search=...` | Media |

### 2.4. Gestión de Líneas (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-LIN-01 | CRUD de líneas | Endpoints funcionales | Alta |
| RF-MP-LIN-02 | Estado operativo | `activo` / `baja` | Alta |
| RF-MP-LIN-03 | Historial completo | Quejas, recorridos, movimientos | Media |
| RF-MP-LIN-04 | Búsqueda y filtrado | `GET /api/mp/lineas?search=...` | Media |

### 2.5. Gestión de Pizarras (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-PIZ-01 | CRUD de pizarras | Endpoints funcionales | Alta |
| RF-MP-PIZ-02 | Mapeo de puertos | CRUD de puertos por pizarra | Media |
| RF-MP-PIZ-03 | Conexiones entrantes/salientes | Registro de conexiones | Media |
| RF-MP-PIZ-04 | Ubicación física | Geolocalización de pizarras | Media |
| RF-MP-PIZ-05 | Búsqueda y filtrado | `GET /api/mp/pizarras?search=...` | Media |
| RF-MP-PIZ-06 | Historial completo | Historial de todos los datos | Media |

### 2.6. Gestión de Quejas (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-QUE-01 | Registro de queja | `POST /api/mp/quejas` | Alta |
| RF-MP-QUE-02 | Clasificación | Tipo, servicio, ubicación | Alta |
| RF-MP-QUE-03 | Priorización | Cálculo automático de prioridad | Alta |
| RF-MP-QUE-04 | Flujo de estados | `Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada` | Alta |
| RF-MP-QUE-05 | Asignación de técnico | `PATCH /api/mp/quejas/:id/asignar` | Alta |
| RF-MP-QUE-06 | Historial de cambios | Registro de todas las transiciones | Alta |
| RF-MP-QUE-07 | Búsqueda y filtrado | Filtros por estado, fecha, técnico | Media |
| RF-MP-QUE-08 | Paginación | `?page=1&limit=10` | Media |
| RF-MP-QUE-09 | Notificaciones por email | Notificar al asignar/cambiar estado | Baja |

### 2.7. Gestión de Pruebas (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-PRU-01 | Registro de prueba | `POST /api/mp/pruebas` | Alta |
| RF-MP-PRU-02 | Resultados de prueba | Campos de resultado | Alta |
| RF-MP-PRU-03 | Vinculación con queja y trabajo | FK a queja y trabajo | Alta |
| RF-MP-PRU-04 | Historial de pruebas | Listado con filtros | Media |

### 2.8. Gestión de Trabajos (MP Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MP-TRA-01 | Creación de orden de trabajo | `POST /api/mp/trabajos` | Alta |
| RF-MP-TRA-02 | Asignación de técnico | `PATCH /api/mp/trabajos/:id/asignar` | Alta |
| RF-MP-TRA-03 | Tiempo estimado vs real | Campos de tiempo | Media |
| RF-MP-TRA-04 | Cierre de trabajo | `PATCH /api/mp/trabajos/:id/cerrar` | Alta |
| RF-MP-TRA-05 | Historial de trabajos | Listado con filtros | Media |

### 2.9. Gestión de Materiales (Materials Service)

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-MAT-01 | CRUD de materiales | Endpoints funcionales con validación | Alta |
| RF-MAT-02 | CRUD de categorías y unidades | Endpoints funcionales | Alta |
| RF-MAT-03 | Crear asignación con múltiples ítems | `POST /api/materials/asignaciones` | Alta |
| RF-MAT-04 | Crear consumo con múltiples ítems | `POST /api/materials/consumos` | Alta |
| RF-MAT-05 | Paginación | `?page=1&limit=10` | Alta |
| RF-MAT-06 | Captura de precios | `costo_unitario_momento` y `costo_unitario_real` | Alta |
| RF-MAT-07 | Búsqueda textual | `?search=...` | Alta |
| RF-MAT-08 | Filtros por categoría/unidad | Query params funcionales | Media |
| RF-MAT-09 | Endpoints REST bajo `/api/materials/*` | Rutas funcionales | Alta |
| RF-MAT-10 | Documentación Swagger | Swagger UI funcional | Alta |
| RF-MAT-11 | Endpoint de resumen general | `GET /api/materials/dashboard/resumen` | Alta |

### 2.10. Analítica y Dashboards

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-ANA-01 | Dashboard de KPIs | Parcial (MP y Materials) | Media |
| RF-ANA-02 | Tiempo promedio de resolución | Métrica agregada | Media |
| RF-ANA-03 | Porcentaje de quejas cerradas | Métrica agregada | Media |
| RF-ANA-04 | Consumo de materiales por técnico | Métrica agregada | Media |
| RF-ANA-05 | Consumo de materiales por trabajo | Métrica agregada | Media |
| RF-ANA-06 | Distribución por categorías | JSON con agregación | Alta |
| RF-ANA-07 | Distribución por unidades | JSON con agregación | Alta |
| RF-ANA-08 | Cálculo de saldo lógico por trabajador | Σ(asignado) − Σ(consumido) | Media |
| RF-ANA-09 | Alertas de stock bajo | Endpoint de alertas | Baja |
| RF-ANA-10 | Exportación CSV/JSON | `?format=csv` | Baja |

### 2.11. API Gateway

| ID | Requisito | Descripción | Prioridad |
|----|-----------|-------------|-----------|
| RF-GW-01 | Enrutamiento a Users Service | Proxy funcional | Alta |
| RF-GW-02 | Enrutamiento a MP Service | Proxy funcional | Alta |
| RF-GW-03 | Enrutamiento a Materials Service | Proxy funcional | Alta |
| RF-GW-04 | Verificación de JWT | Middleware de autenticación | Alta |
| RF-GW-05 | Rate limiting | Límite por IP y usuario | Media |
| RF-GW-06 | CORS | Configuración de orígenes permitidos | Media |
| RF-GW-07 | Logging centralizado | Logs estructurados JSON | Media |
| RF-GW-08 | Health checks agregados | `GET /health` agrega estado de todos | Media |
| RF-GW-09 | Manejo de errores unificado | Formato consistente | Media |
| RF-GW-10 | Health check individual | `GET /health` en cada servicio | Alta |

---

## 3. Requisitos No Funcionales

| ID | Categoría | Requisito | Métrica |
|----|-----------|-----------|---------|
| RNF-01 | Rendimiento | Tiempo de respuesta en lecturas | < 300 ms (p95) |
| RNF-02 | Rendimiento | Tiempo de respuesta en transacciones | < 800 ms (p95) |
| RNF-03 | Disponibilidad | Uptime en horario laboral | 99.5% (8:00–18:00, L–V) |
| RNF-04 | Concurrencia | Usuarios simultáneos | ≥ 20 sin degradación |
| RNF-05 | Integridad | Transacciones ACID | 100% en operaciones críticas |
| RNF-06 | Seguridad | Validación de entrada | 100% de endpoints |
| RNF-07 | Escalabilidad | Arquitectura stateless | Réplicas horizontales |
| RNF-08 | Mantenibilidad | Cobertura de tests | ≥ 70% |
| RNF-09 | Usabilidad | Responsive design | Móvil, tablet, desktop |
| RNF-10 | Internacionalización | Idiomas soportados | ES, RU |
| RNF-11 | Observabilidad | Health checks | Todos los servicios |
| RNF-12 | Recuperación | RTO / RPO | < 1 h / < 15 min |
| RNF-13 | Portabilidad | Sistema operativo | Ubuntu 22.04 LTS / Windows Server 2022 |

### 3.1 Requisitos de Hardware

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 núcleos @ 2.5 GHz | 4 núcleos @ 3.5 GHz |
| RAM | 4 GB | 8 GB |
| Disco | 20 GB SSD | 50 GB NVMe |
| Red | 10 Mbps | 100 Mbps |

### 3.2 Requisitos de Software

| Componente | Versión Mínima |
|------------|----------------|
| Docker | 24.0+ |
| Docker Compose | v2.20+ |
| PostgreSQL | 17.0+ |
| Node.js | 22.x |
| Go | 1.25+ |
| Redis | 7+ |

---

## 4. Reglas de Negocio

### 4.1. Prioridad de Quejas (BR-03)

```
prioridad_score = tipo_peso + servicio_peso + ubicacion_peso + (antiguedad_horas > 2 ? 1 : 0)

Mapeo:
  12-13 → Prioridad 1 (Urgente)
  9-11  → Prioridad 2 (Alta)
  6-8   → Prioridad 3 (Media)
  3-5   → Prioridad 4 (Baja)
```

### 4.2. FSM de Quejas (BR-04)

```
States: Reportada → Priorizada → Abierta → EnProgreso → {PendientePrueba | EnRevision | Cerrada}
Allowed transitions strictly enforced via Specification pattern.
```

### 4.3. Stock Concurrente (BR-08, BR-09, BR-10)

```
Pattern: Distributed Lock (Redis) + Transaction (PostgreSQL)
Lock ordering: Always acquire locks sorted by material_id (ascending)
Retry: Exponential backoff, max 3 attempts
```

### 4.4. Transacciones Críticas (RC-04)

| Operación | Regla |
|-----------|-------|
| Asignaciones | Deben usar `db.Transaction()` con rollback en caso de error |
| Consumos | Deben usar `db.Transaction()` con rollback en caso de error |
| Cierre de trabajo | Debe ser transaccional si involucra materiales |

### 4.5. Captura de Precios (RF-MAT-06)

| Operación | Campo | Comportamiento |
|-----------|-------|----------------|
| Asignación | `costo_unitario_momento` | Captura el precio en el momento de la asignación |
| Consumo | `costo_unitario_real` | Captura el precio real en el momento del consumo |

### 4.6. Saldo Lógico (RF-ANA-08)

```
saldo_logico_por_trabajador = Σ(asignado) − Σ(consumido)
```

---

## 5. Casos de Uso Clave

### CU-01: Recepción y cierre de queja

```
Actor: Técnico (probador)
1. El técnico registra una queja vía `POST /api/mp/quejas`
2. El sistema clasifica y prioriza automáticamente (BR-03)
3. El técnico asigna la queja a un técnico vía `PATCH /api/mp/quejas/:id/asignar`
4. El técnico realiza pruebas (registro inicial)
5. Se cierra la queja vía `PATCH /api/mp/quejas/:id/estado` → estado `Cerrada`
6. Si hay consumo de materiales, se registra en Materials Service
```

### CU-02: Asignación de materiales

```
Actor: Admin Materiales
1. El admin crea una asignación vía `POST /api/materials/asignaciones`
2. El sistema valida existencia de materiales (HTTP 400 si no existe)
3. El sistema captura `costo_unitario_momento` para cada ítem
4. La operación es transaccional ACID (RC-04)
5. Se aplica bloqueo distribuido con Redis para stock concurrente
```

### CU-03: Registro de consumo de materiales

```
Actor: Técnico (admin_materiales)
1. El técnico registra un consumo vía `POST /api/materials/consumos`
2. El sistema valida que consumo ≤ asignado
3. El sistema captura `costo_unitario_real`
4. La operación es transaccional ACID (RC-04)
5. Se decrementa el saldo lógico del trabajador
```

### CU-04: Autenticación y autorización

```
Actor: Cualquier usuario autenticado
1. El usuario hace login vía `POST /api/auth/login`
2. Users Service valida credenciales y devuelve JWT
3. El frontend almacena el token
4. El API Gateway valida el JWT en cada request
5. El Gateway verifica RBAC según el rol del usuario
6. Cada microservicio valida permisos de forma redundante
```

---

## 6. Prioridades de Desarrollo

### 🔴 Alta Prioridad (Bloqueantes para "Puerto Seguro")

1. Completar tests en Users y MP Service (unitarios + integración)
2. Implementar validación de stock real en Materials Service (actualmente stub)
3. Activar concurrencia en Materials Service (goroutines)
4. Completar frontend de todos los módulos (verificar integración)
5. Consolidar documentación (CHANGELOG, CONTRIBUTING, API docs)
6. Mapear permisos RBAC por endpoint

### 🟡 Media Prioridad (Mejoras)

1. Implementar notificaciones por email (Mailjet)
2. Añadir exportación CSV/JSON en todos los módulos
3. Configurar CD en GitHub Actions
4. Centralizar logs (ELK o similar)
5. Implementar tests E2E
6. Añadir alertas de stock bajo

### 🟢 Baja Prioridad (Futuro)

1. Analítica predictiva (tesis)
2. Integración LDAP/Active Directory
3. Integración SAP
4. Migración a Kubernetes
5. Colas de mensajes (RabbitMQ/Kafka)

---

## 7. Restricciones

1. **NUNCA** modificar la arquitectura sin consultar al autor
2. **NUNCA** introducir dependencias que rompan la compatibilidad
3. **NUNCA** acceder a BD de otro microservicio
4. **NUNCA** subir secretos o credenciales al código (usar variables de entorno)
5. **SIEMPRE** respetar los contratos de API existentes
6. **SIEMPRE** priorizar transacciones ACID en operaciones críticas
7. **SIEMPRE** documentar los cambios en el CHANGELOG
8. **SIEMPRE** ejecutar los tests antes de commitear
9. **SIEMPRE** usar Conventional Commits
10. **SIEMPRE** preguntar al autor si hay ambigüedad

### Restricciones Técnicas

| Restricción | Detalle |
|------------|---------|
| Arquitectura | Microservicios (no modificable) |
| BD | PostgreSQL 17+ (3 instancias separadas) |
| Comunicación | REST/JSON (solo protocolo permitido) |
| Auth | JWT (HS256/RS256) |
| Secrets | Variables de entorno (`.env`, gitignored) |
| Testing | Jest (70% Node), Testify (70% Go) |

---

## 8. Referencias

- [SPEC.md](./SPEC.md) — Especificación técnica completa
- [AGENT.md](./AGENT.md) — Instrucciones para agentes de IA
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Documentación de arquitectura
- [Tesis — Fundamentos](./docs/thesis/02_state_of_art.md)
- [Tesis — Metodología](./docs/thesis/03_methodology.md)
- [Tesis — Resultados](./docs/thesis/05_results.md)
- [ESTRUCTURA.md](./ESTRUCTURA.md) — Estructura del repositorio
- [Tareas del proyecto](./TASKLIST.md)
- [Changelog](./CHANGELOG.md)
