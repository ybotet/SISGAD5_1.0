# Requisitos Funcionales y No Funcionales - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Requisitos Funcionales (RF)

### 1.1 Autenticación y Autorización (Users Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-AUTH-01 | Registro de usuarios | Crear usuario con email, password, roles iniciales | 🔴 Crítica | UC-01 |
| RF-AUTH-02 | Login JWT | Autenticar y retornar access_token (15min) + refresh_token (7d) | 🔴 Crítica | UC-02 |
| RF-AUTH-03 | Refresh Token | Renovar access_token usando refresh_token válido | 🔴 Crítica | UC-03 |
| RF-AUTH-04 | Logout | Invalidar refresh_token en BD | 🔴 Crítica | UC-04 |
| RF-AUTH-05 | Recuperación contraseña | Flujo email → token temporal → nueva contraseña | 🟡 Alta | UC-08 |
| RF-AUTH-06 | Cambio contraseña | Usuario autenticado cambia su password | 🟡 Alta | UC-08 |
| RF-AUTH-07 | Bloqueo por intentos | Bloquear cuenta tras 5 intentos fallidos (15 min) | 🟢 Media | - |
| RF-AUTH-08 | Historial sesiones | Registrar IP, user-agent, última actividad | 🟢 Media | - |

### 1.2 Gestión de Usuarios y Roles (Users Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-USR-01 | CRUD Usuarios (Admin) | Listar (paginado), crear, leer, actualizar, eliminar | 🔴 Crítica | UC-05 |
| RF-USR-02 | CRUD Roles | Crear, leer, actualizar, eliminar roles | 🔴 Crítica | UC-06 |
| RF-USR-03 | Asignar roles | Vincular/desvincular roles a usuarios | 🔴 Crítica | UC-07 |
| RF-USR-04 | Middleware RBAC | Validar permisos por endpoint | 🔴 Crítica | - |
| RF-USR-05 | Health Check | GET /health → {status: "UP"} | 🟡 Alta | - |

### 1.3 Gestión de Infraestructura MP (MP Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MP-01 | CRUD Teléfonos | Crear, leer, actualizar, eliminar con datos cliente | 🔴 Crítica | UC-09 |
| RF-MP-02 | Estado Teléfono | Cambiar activo/baja con fecha | 🔴 Crítica | UC-09 |
| RF-MP-03 | Historial Teléfono | Quejas, recorridos, movimientos | 🔴 Crítica | UC-13 |
| RF-MP-04 | Búsqueda Teléfonos | Filtros: búsqueda textual, estado, cliente | 🟡 Alta | UC-12 |
| RF-MP-05 | CRUD Líneas | Crear, leer, actualizar, eliminar | 🔴 Crítica | UC-10 |
| RF-MP-06 | Estado Línea | Cambiar activo/baja con fecha | 🔴 Crítica | UC-10 |
| RF-MP-07 | Historial Línea | Quejas, recorridos, movimientos | 🔴 Crítica | UC-13 |
| RF-MP-08 | Búsqueda Líneas | Filtros: búsqueda textual, estado | 🟡 Alta | UC-12 |
| RF-MP-09 | CRUD Pizarras | Crear, leer, actualizar, eliminar | 🔴 Crítica | UC-11 |
| RF-MP-10 | Mapeo Puertos | CRUD puertos por pizarra | 🟡 Alta | UC-11 |
| RF-MP-11 | Conexiones | Entrantes/salientes por puerto | 🟡 Alta | UC-11 |
| RF-MP-12 | Ubicación Física | Geolocalización (lat, lng, dirección) | 🟡 Alta | UC-11 |
| RF-MP-13 | Búsqueda Pizarras | Filtros: búsqueda textual, ubicación | 🟡 Alta | UC-12 |

### 1.4 Gestión de Quejas (MP Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MP-14 | Registro Queja | POST /quejas con clasificación obligatoria | 🔴 Crítica | UC-14 |
| RF-MP-15 | Clasificación | Tipo/Servicio/Ubicación (claves jerárquicas) | 🔴 Crítica | UC-14 |
| RF-MP-16 | Priorización | Niveles 1-4 con reglas de cálculo automático | 🔴 Crítica | UC-14 |
| RF-MP-17 | Flujo Estados | Abierta→Probada→Asignada→Pendiente→Resuelta→Cerrada | 🔴 Crítica | UC-15 |
| RF-MP-18 | Asignar Técnico | PATCH /quejas/:id/asignar con validación rol | 🔴 Crítica | UC-16 |
| RF-MP-19 | Historial Cambios | Registro automático de transiciones de estado | 🔴 Crítica | UC-15 |
| RF-MP-20 | Auditoría Acciones | Log: quién, qué, cuándo, IP | 🔴 Crítica | - |
| RF-MP-21 | Búsqueda Quejas | Filtros: estado, fecha, técnico, prioridad, tipo | 🟡 Alta | UC-12 |
| RF-MP-22 | Paginación | ?page=1&limit=10 en listados | 🟡 Alta | UC-12 |
| RF-MP-23 | Notificaciones Email | Al asignar/cambiar estado (configurable) | 🟢 Media | - |

### 1.5 Gestión de Pruebas (MP Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MP-24 | Registro Prueba | POST /pruebas con resultado y observaciones | 🔴 Crítica | UC-17 |
| RF-MP-25 | Resultados Prueba | Campos: exitoso, mediciones, observaciones | 🔴 Crítica | UC-17 |
| RF-MP-26 | Vinculación | FK a queja y/o trabajo obligatoria | 🔴 Crítica | UC-17 |
| RF-MP-27 | Historial Pruebas | Listado con filtros por fecha, técnico, resultado | 🟡 Alta | UC-17 |

### 1.6 Gestión de Trabajos (MP Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MP-28 | Crear Orden Trabajo | POST /trabajos con descripción, tiempo estimado | 🔴 Crítica | UC-18 |
| RF-MP-29 | Asignar Técnico | PATCH /trabajos/:id/asignar | 🔴 Crítica | UC-16 |
| RF-MP-30 | Tiempo Estimado vs Real | Campos: estimado_horas, real_horas | 🟡 Alta | UC-19 |
| RF-MP-31 | Cerrar Trabajo | PATCH /trabajos/:id/cerrar con tiempo real | 🔴 Crítica | UC-19 |
| RF-MP-32 | Historial Trabajos | Listado con filtros | 🟡 Alta | UC-19 |

### 1.7 Estadísticas MP (MP Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MP-33 | Resumen General | GET /estadisticas/resumen con KPIs | 🟡 Alta | UC-20 |
| RF-MP-34 | Métricas Agregadas | Por estado, prioridad, técnico, servicio | 🟡 Alta | UC-20 |
| RF-MP-35 | Filtros Fecha/Servicio | Query params funcionales | 🟢 Media | UC-20 |

### 1.8 Catálogo de Materiales (Materials Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MAT-01 | CRUD Materiales | Nombre, código, precio, unidad, categoría obligatorios | 🔴 Crítica | UC-21 |
| RF-MAT-02 | CRUD Categorías/Unidades | Gestión independiente con integridad referencial | 🔴 Crítica | UC-21 |
| RF-MAT-03 | Asignación Múltiples Ítems | POST /asignaciones con array de ítems | 🔴 Crítica | UC-22 |
| RF-MAT-04 | Consumo Múltiples Ítems | POST /consumos con array de ítems | 🔴 Crítica | UC-23 |
| RF-MAT-05 | Filtros Categoría/Unidad | Query params en listados | 🟡 Alta | UC-21 |
| RF-MAT-06 | Captura Precio Momento/Real | costo_unitario_momento (asignación) / costo_unitario_real (consumo) | 🔴 Crítica | UC-22, UC-23 |
| RF-MAT-07 | Búsqueda Textual | ?search=... en nombre, código, descripción | 🔴 Crítica | UC-21 |
| RF-MAT-08 | Paginación | ?page=1&limit=10 | 🔴 Crítica | UC-21 |

### 1.9 Transacciones y Validaciones (Materials Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MAT-09 | Transacción ACID Asignación | db.Transaction() con rollback en error | 🔴 Crítica | UC-22 |
| RF-MAT-10 | Transacción ACID Consumo | db.Transaction() con rollback en error | 🔴 Crítica | UC-23 |
| RF-MAT-11 | Validar Existencia Material | HTTP 400 si material no existe | 🔴 Crítica | UC-22, UC-23 |
| RF-MAT-12 | Validar Cantidades | HTTP 400 si cantidad ≤ 0 | 🔴 Crítica | UC-22, UC-23 |
| RF-MAT-13 | Validar Stock Real | Consumo ≤ Asignado (completar stub) | 🔴 Crítica | UC-23 |
| RF-MAT-14 | Validar vs Asignación | Consumo no puede exceder asignación pendiente | 🔴 Crítica | UC-23 |
| RF-MAT-15 | Concurrencia Go | Goroutines + WaitGroup + Channels para validaciones | 🟡 Alta | UC-22, UC-23 |

### 1.10 Analítica y Dashboards (Materials Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MAT-16 | Resumen General | GET /dashboard/resumen | 🔴 Crítica | UC-24 |
| RF-MAT-17 | Distribución Categorías | Agregación por categoría | 🔴 Crítica | UC-24 |
| RF-MAT-18 | Distribución Unidades | Agregación por unidad | 🔴 Crítica | UC-24 |
| RF-MAT-19 | Saldo Lógico Trabajador | Σ(asignado) − Σ(consumido) | 🟡 Alta | UC-24 |
| RF-MAT-20 | Alertas Stock Bajo | Endpoint de alertas configurables | 🟢 Media | UC-24 |
| RF-MAT-21 | Exportación CSV/JSON | ?format=csv|json | 🟢 Media | UC-24 |
| RF-MAT-22 | Tendencias/Predicciones | Modelo estadístico básico | ⚪ Baja | UC-24 |

### 1.11 Integración (Materials Service)

| ID | Requisito | Descripción | Prioridad | Caso de Uso |
|----|-----------|-------------|-----------|-------------|
| RF-MAT-23 | Endpoints REST | Bajo /api/materials/* | 🔴 Crítica | - |
| RF-MAT-24 | API Gateway Compatible | Proxy funcional | 🔴 Crítica | - |
| RF-MAT-25 | Health Check | GET /health → {status: "UP"} | 🔴 Crítica | - |
| RF-MAT-26 | Swagger UI | Documentación interactiva | 🔴 Crítica | - |
| RF-MAT-27 | Exportación SAP | CSV compatible con SAP | 🟢 Media | - |

---

## 2. Requisitos No Funcionales (RNF)

| ID | Categoría | Requisito | Métrica/Objetivo |
|----|-----------|-----------|------------------|
| RNF-01 | Rendimiento | Latencia API | < 200ms p95 |
| RNF-02 | Rendimiento | Throughput | 1000+ RPS |
| RNF-03 | Rendimiento | Concurrencia | 500+ usuarios simultáneos |
| RNF-04 | Disponibilidad | Uptime | 99.9% |
| RNF-05 | Seguridad | Autenticación | JWT RS256 + Refresh rotation |
| RNF-06 | Seguridad | Autorización | RBAC por endpoint |
| RNF-07 | Seguridad | Datos sensibles | Bcrypt (password), HTTPS obligatorio |
| RNF-08 | Seguridad | Auditoría | Log inmutable de acciones críticas |
| RNF-09 | Escalabilidad | Horizontal | Stateless services, shared-nothing |
| RNF-10 | Mantenibilidad | Cobertura tests | ≥ 70% unitarios |
| RNF-11 | Mantenibilidad | Documentación | OpenAPI 3.0 + Swagger UI |
| RNF-12 | Operabilidad | Logs | JSON estructurado, centralizado (Loki) |
| RNF-13 | Operabilidad | Métricas | Prometheus + Grafana dashboards |
| RNF-14 | Operabilidad | Trazabilidad | Correlation IDs cross-service |
| RNF-15 | Portabilidad | Contenedores | Docker multi-stage < 200MB |
| RNF-16 | Compatibilidad | Navegadores | Chrome, Firefox, Edge (últimas 2 versiones) |
| RNF-17 | Accesibilidad | Frontend | WCAG 2.1 AA |
| RNF-18 | Internacionalización | ES/RU | i18n completo frontend |

---

## 3. Reglas de Negocio (RN)

Ver [Reglas de Negocio](06_business_rules.md)

---

## 4. Trazabilidad

| Requisito | Caso de Uso | Clase Dominio | Endpoint | Test |
|-----------|-------------|---------------|----------|------|
| RF-AUTH-01 | UC-01 | User, Rol | POST /api/auth/register | auth.test.js |
| RF-AUTH-02 | UC-02 | User, Sesión | POST /api/auth/login | auth.test.js |
| RF-MP-14 | UC-14 | Queja, Clave | POST /api/mp/quejas | quejas.test.js |
| RF-MAT-03 | UC-22 | Asignacion, AsignacionItem | POST /api/materials/asignaciones | asignacion_test.go |
| RF-MAT-04 | UC-23 | Consumo, ConsumoItem | POST /api/materials/consumos | consumo_test.go |

---

## 5. Referencias

- [Casos de Uso](03_use_cases.md)
- [Reglas de Negocio](06_business_rules.md)
- [Modelo de Dominio](07_domain_model.md)
- [Matriz RBAC](12_rbac_matrix.md)
- [Estrategia Seguridad](13_security.md)