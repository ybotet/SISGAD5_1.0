# Matriz de Trazabilidad SISGAD5

> Generado automáticamente por: `scripts/gen-traceability.py`
> Fuentes: `docs/05_requirements.es.md` (Sección 1 y 4), `docs/03_use_cases.es.md`, `docs/api/*.yaml`, tests existentes
> Estado: Semi-automatizado - revisar manualmente antes de publicar
> Criterio: 'sin huérfanos' aplicado a requisitos v1; futuros se marcan GAP

## Resumen
- Requisitos totales: 72
- Casos de uso totales: 24
- Endpoints de API: 236
- Archivos de test: 16
- Requisitos SIN test (huérfanos): 12
- Tests SIN requisito (huérfanos): 1
- Endpoints SIN requisito (huérfanos): 2

## 1. Matriz Requisito → Caso de Uso → Endpoint → Test

| Requisito | Descripción | Prioridad | Caso de Uso | Endpoint(s) | Test(s) | Estado |
|-----------|-------------|-----------|-------------|-------------|---------|--------|
| RF-AUTH-01 | Crear usuario con email, password, roles iniciales | Crítica | UC-01 Registrar Usuario | POST /api/auth/register | auth.test.js | OK |
| RF-AUTH-02 | Autenticar y retornar access_token (15min) + refresh_to... | Crítica | UC-02 Iniciar Sesión | POST /api/auth/login | auth.test.js | OK |
| RF-AUTH-03 | Renovar access_token usando refresh_token válido | Crítica | UC-03 Renovar Token | POST /api/auth/refresh | auth.test.js | OK |
| RF-AUTH-04 | Invalidar refresh_token en BD | Crítica | UC-04 Cerrar Sesión | POST /api/auth/logout | auth.test.js | OK |
| RF-AUTH-05 | Flujo email → token temporal → nueva contraseña | Alta | UC-08 Recuperar Contraseña | - | - | HUERFANO-sin-test |
| RF-AUTH-06 | Usuario autenticado cambia su password | Alta | UC-08 Recuperar Contraseña | - | - | HUERFANO-sin-test |
| RF-AUTH-07 | Bloquear cuenta tras 5 intentos fallidos (15 min) | Media | -  | - | auth.test.js | GAP-sin-endpoint |
| RF-AUTH-08 | Registrar IP, user-agent, última actividad | Media | -  | - | auth.test.js | GAP-sin-endpoint |
| RF-MAT-01 | Nombre, código, precio, unidad, categoría obligatorios | Crítica | UC-21 Gestionar Catálogo Materiales | CRUD /api/materials/materiales/* | materiales_test.go | OK |
| RF-MAT-02 | Gestión independiente con integridad referencial | Crítica | UC-21 Gestionar Catálogo Materiales | CRUD /api/materials/categorias/* | categorias_test.go | OK |
| RF-MAT-03 | POST /asignaciones con array de ítems | Crítica | UC-22 Crear Asignación | POST /api/materials/asignaciones | asignacion_test.go | OK |
| RF-MAT-04 | POST /consumos con array de ítems | Crítica | UC-23 Registrar Consumo | POST /api/materials/consumos | consumo_test.go | OK |
| RF-MAT-05 | Query params en listados | Alta | UC-21 Gestionar Catálogo Materiales | GET /api/materials/*?filter= | materiales_test.go | OK |
| RF-MAT-06 | costo_unitario_momento (asignación) / costo_unitario_re... | Crítica | UC-22, UC-23  | — (precio capture) | asignacion_test.go | OK |
| RF-MAT-07 | ?search=... en nombre, código, descripción | Crítica | UC-21 Gestionar Catálogo Materiales | GET /api/materials/*?search= | materiales_test.go | OK |
| RF-MAT-08 | ?page=1&limit=10 | Crítica | UC-21 Gestionar Catálogo Materiales | GET /api/materials/*?page= | materiales_test.go | OK |
| RF-MAT-09 | db.Transaction() con rollback en error | Crítica | UC-22 Crear Asignación | POST /api/materials/asignaciones | asignacion_test.go | OK |
| RF-MAT-10 | db.Transaction() con rollback en error | Crítica | UC-23 Registrar Consumo | POST /api/materials/consumos | consumo_test.go | OK |
| RF-MAT-11 | HTTP 400 si material no existe | Crítica | UC-22, UC-23  | POST /api/materials/* | materiales_test.go | OK |
| RF-MAT-12 | HTTP 400 si cantidad ≤ 0 | Crítica | UC-22, UC-23  | POST /api/materials/* | asignacion_test.go | OK |
| RF-MAT-13 | Consumo ≤ Asignado (completar stub) | Crítica | UC-23 Registrar Consumo | POST /api/materials/consumos | consumo_test.go | OK |
| RF-MAT-14 | Consumo no puede exceder asignación pendiente | Crítica | UC-23 Registrar Consumo | POST /api/materials/consumos | consumo_test.go | OK |
| RF-MAT-15 | Goroutines + WaitGroup + Channels para validaciones | Alta | UC-22, UC-23  | POST /api/materials/* | concurrency_test.go | OK |
| RF-MAT-16 | GET /dashboard/resumen | Crítica | UC-24 Ver Dashboard Materiales | GET /api/materials/dashboard/resumen | dashboard_test.go | OK |
| RF-MAT-17 | Agregación por categoría | Crítica | UC-24 Ver Dashboard Materiales | GET /api/materials/dashboard/categorias | dashboard_test.go | OK |
| RF-MAT-18 | Agregación por unidad | Crítica | UC-24 Ver Dashboard Materiales | GET /api/materials/dashboard/unidades | dashboard_test.go | OK |
| RF-MAT-19 | Σ(asignado) − Σ(consumido) | Alta | UC-24 Ver Dashboard Materiales | GET /api/materials/dashboard/saldo | dashboard_test.go | OK |
| RF-MAT-20 | Endpoint de alertas configurables | Media | UC-24 Ver Dashboard Materiales | GET /api/materials/dashboard/alertas | dashboard_test.go | OK |
| RF-MAT-22 | Modelo estadístico básico | Baja | UC-24 Ver Dashboard Materiales | GET /api/mp/{proxy}, POST /api/mp/{proxy}, PUT /api/mp/{proxy} (+17) | - | HUERFANO-sin-test |
| RF-MAT-23 | Bajo /api/materials/* | Crítica | -  | - | - | HUERFANO-sin-test |
| RF-MAT-24 | Proxy funcional | Crítica | -  | GET /health, POST /api/auth/{proxy}, GET /api/users/{proxy} (+13) | - | HUERFANO-sin-test |
| RF-MAT-25 | GET /health → {status: "UP"} | Crítica | -  | GET /health, GET /health/services, GET /health (+1) | config_test.go, auth_test.go | OK |
| RF-MAT-26 | Documentación interactiva | Crítica | -  | - | - | HUERFANO-sin-test |
| RF-MAT-27 | CSV compatible con SAP | Media | -  | - | - | HUERFANO-sin-test |
| RF-MP-01 | Crear, leer, actualizar, eliminar con datos cliente | Crítica | UC-09 Gestionar Teléfonos | CRUD /api/mp/telefonos/* | telefonos.test.js | OK |
| RF-MP-02 | Cambiar activo/baja con fecha | Crítica | UC-09 Gestionar Teléfonos | PATCH /api/mp/telefonos/:id/estado | telefonos.test.js | OK |
| RF-MP-03 | Quejas, recorridos, movimientos | Crítica | UC-13 Ver Historial Completo | GET /api/mp/telefonos/:id/historial | telefonos.test.js | OK |
| RF-MP-04 | Filtros: búsqueda textual, estado, cliente | Alta | UC-12 Buscar y Filtrar | GET /api/mp/telefonos?search= | telefonos.test.js | OK |
| RF-MP-05 | Crear, leer, actualizar, eliminar | Crítica | UC-10 Gestionar Líneas | CRUD /api/mp/lineas/* | lineas.test.js | OK |
| RF-MP-06 | Cambiar activo/baja con fecha | Crítica | UC-10 Gestionar Líneas | GET /health, GET /linea, POST /linea (+13) | linea.test.js | OK |
| RF-MP-07 | Quejas, recorridos, movimientos | Crítica | UC-13 Ver Historial Completo | GET /linea, POST /linea, GET /linea/dashboard (+11) | historial.test.js, linea.test.js | OK |
| RF-MP-08 | Filtros: búsqueda textual, estado | Alta | UC-12 Buscar y Filtrar | GET /linea, POST /linea, GET /linea/dashboard (+9) | linea.test.js | OK |
| RF-MP-09 | Crear, leer, actualizar, eliminar | Crítica | UC-11 Gestionar Pizarras | GET /clasifpizarra, POST /clasifpizarra, GET /clasifpizarra/{id} (+12) | - | HUERFANO-sin-test |
| RF-MP-12 | Geolocalización (lat, lng, dirección) | Alta | UC-11 Gestionar Pizarras | PATCH /api/mp/pizarras/:id/ubicacion | pizarras.test.js | OK |
| RF-MP-13 | Filtros: búsqueda textual, ubicación | Alta | UC-12 Buscar y Filtrar | GET /clasifpizarra, POST /clasifpizarra, GET /clasifpizarra/{id} (+12) | historial.test.js | OK |
| RF-MP-14 | POST /quejas con clasificación obligatoria | Crítica | UC-14 Registrar Queja | POST /api/mp/quejas | quejas.test.js | OK |
| RF-MP-15 | Tipo/Servicio/Ubicación (claves jerárquicas) | Crítica | UC-14 Registrar Queja | — (incluido en Queja) | quejas.test.js | OK |
| RF-MP-16 | Niveles 1-4 con reglas de cálculo automático | Crítica | UC-14 Registrar Queja | — (automático) | quejas.test.js | OK |
| RF-MP-17 | Abierta→Probada→Asignada→Pendiente→Resuelta→Cerrada | Crítica | UC-15 Gestionar Flujo de Estados | PATCH /api/mp/quejas/:id/estado | quejas.test.js | OK |
| RF-MP-18 | PATCH /quejas/:id/asignar con validación rol | Crítica | UC-16 Asignar Técnico | PATCH /api/mp/quejas/:id/asignar | quejas.test.js | OK |
| RF-MP-19 | Registro automático de transiciones de estado | Crítica | UC-15 Gestionar Flujo de Estados | GET /api/mp/quejas/:id/historial | quejas.test.js | OK |
| RF-MP-20 | Log: quién, qué, cuándo, IP | Crítica | -  | — (logging) | audit.test.js | OK |
| RF-MP-21 | Filtros: estado, fecha, técnico, prioridad, tipo | Alta | UC-12 Buscar y Filtrar | GET /api/mp/quejas?filter= | quejas.test.js | OK |
| RF-MP-22 | ?page=1&limit=10 en listados | Alta | UC-12 Buscar y Filtrar | GET /api/mp/{proxy}, POST /api/mp/{proxy}, PUT /api/mp/{proxy} (+77) | queja.test.js | OK |
| RF-MP-23 | Al asignar/cambiar estado (configurable) | Media | -  | - | - | HUERFANO-sin-test |
| RF-MP-24 | POST /pruebas con resultado y observaciones | Crítica | UC-17 Registrar Prueba | POST /api/mp/pruebas | pruebas.test.js | OK |
| RF-MP-25 | Campos: exitoso, mediciones, observaciones | Crítica | UC-17 Registrar Prueba | — (campos resultado) | pruebas.test.js | OK |
| RF-MP-26 | FK a queja y/o trabajo obligatoria | Crítica | UC-17 Registrar Prueba | POST /api/mp/pruebas | pruebas.test.js | OK |
| RF-MP-27 | Listado con filtros por fecha, técnico, resultado | Alta | UC-17 Registrar Prueba | GET /api/mp/pruebas?filter= | pruebas.test.js | OK |
| RF-MP-28 | POST /trabajos con descripción, tiempo estimado | Crítica | UC-18 Crear Orden de Trabajo | POST /api/mp/trabajos | trabajos.test.js | OK |
| RF-MP-29 | PATCH /trabajos/:id/asignar | Crítica | UC-16 Asignar Técnico | PATCH /api/mp/trabajos/:id/asignar | trabajos.test.js | OK |
| RF-MP-30 | Campos: estimado_horas, real_horas | Alta | UC-19 Cerrar Trabajo | PUT /api/mp/trabajos/:id/tiempo | trabajos.test.js | OK |
| RF-MP-31 | PATCH /trabajos/:id/cerrar con tiempo real | Crítica | UC-19 Cerrar Trabajo | PATCH /api/mp/trabajos/:id/cerrar | trabajos.test.js | OK |
| RF-MP-32 | Listado con filtros | Alta | UC-19 Cerrar Trabajo | GET /consumos/trabajo/{id}, GET /trabajo, POST /trabajo (+13) | - | HUERFANO-sin-test |
| RF-MP-33 | GET /estadisticas/resumen con KPIs | Alta | UC-20 Ver Estadísticas MP | GET /api/mp/estadisticas/resumen | estadisticas.test.js | OK |
| RF-MP-34 | Por estado, prioridad, técnico, servicio | Alta | UC-20 Ver Estadísticas MP | GET /api/mp/estadisticas?group_by= | estadisticas.test.js | OK |
| RF-MP-35 | Query params funcionales | Media | UC-20 Ver Estadísticas MP | GET /, GET /api/predictions/{proxy}, GET /health (+5) | - | HUERFANO-sin-test |
| RF-USR-01 | Listar (paginado), crear, leer, actualizar, eliminar | Crítica | UC-05 Gestionar Usuarios | GET /api/users (paginado) | users.test.js | OK |
| RF-USR-02 | Crear, leer, actualizar, eliminar roles | Crítica | UC-06 Gestionar Roles | CRUD /api/roles/* | roles.test.js | OK |
| RF-USR-03 | Vincular/desvincular roles a usuarios | Crítica | UC-07 Asignar Roles a Usuario | POST /api/users/:id/roles | users.test.js | OK |
| RF-USR-04 | Validar permisos por endpoint | Crítica | -  | Todos | auth.middleware.test.js | OK |
| RF-USR-05 | GET /health → {status: "UP"} | Alta | -  | - | - | HUERFANO-sin-test |

## 2. Huérfanos Detectados

### 2.1 Requisitos SIN test asociado
| Requisito | Descripción | Caso de Uso |
|-----------|-------------|-------------|
| RF-AUTH-05 | Flujo email → token temporal → nueva contraseña | UC-08 |
| RF-AUTH-06 | Usuario autenticado cambia su password | UC-08 |
| RF-MAT-22 | Modelo estadístico básico | UC-24 |
| RF-MAT-23 | Bajo /api/materials/* | - |
| RF-MAT-24 | Proxy funcional | - |
| RF-MAT-26 | Documentación interactiva | - |
| RF-MAT-27 | CSV compatible con SAP | - |
| RF-MP-09 | Crear, leer, actualizar, eliminar | UC-11 |
| RF-MP-23 | Al asignar/cambiar estado (configurable) | - |
| RF-MP-32 | Listado con filtros | UC-19 |
| RF-MP-35 | Query params funcionales | UC-20 |
| RF-USR-05 | GET /health → {status: "UP"} | - |

### 2.2 Tests SIN requisito asociado
| Test | Notas |
|------|-------|
| backend-mp/tests/cierreSaga.test.js | revisar manualmente |

### 2.3 Endpoints SIN requisito asociado
| Método | Endpoint | Origen |
|--------|----------|--------|
| GET | /permisos | users.yaml |
| GET | /permisos/{id} | users.yaml |

## 3. Casos de Uso → Endpoints

| Caso de Uso | Nombre | Endpoints API |
|-------------|--------|---------------|
| UC-01 | Registrar Usuario | - |
| UC-02 | Iniciar Sesión | - |
| UC-03 | Renovar Token | - |
| UC-04 | Cerrar Sesión | - |
| UC-05 | Gestionar Usuarios | - |
| UC-06 | Gestionar Roles | - |
| UC-07 | Asignar Roles a Usuario | - |
| UC-08 | Recuperar Contraseña | - |
| UC-09 | Gestionar Teléfonos | - |
| UC-10 | Gestionar Líneas | - |
| UC-11 | Gestionar Pizarras | - |
| UC-12 | Buscar y Filtrar | - |
| UC-13 | Ver Historial Completo | - |
| UC-14 | Registrar Queja | - |
| UC-15 | Gestionar Flujo de Estados | - |
| UC-16 | Asignar Técnico | - |
| UC-17 | Registrar Prueba | - |
| UC-18 | Crear Orden de Trabajo | - |
| UC-19 | Cerrar Trabajo | - |
| UC-20 | Ver Estadísticas MP | - |
| UC-21 | Gestionar Catálogo Materiales | - |
| UC-22 | Crear Asignación | - |
| UC-23 | Registrar Consumo | - |
| UC-24 | Ver Dashboard Materiales | - |

## 4. Notas del Revisor

- HUERFANO-sin-test: requiere un test o justificación documentada.
- GAP-sin-endpoint: tiene test pero no endpoint definido (o viceversa).
- OK: tiene requisito, caso de uso, endpoint y test.
- Endpoints marcados como Planificado en los YAML no se cuentan como implementados.

---
*Generado por scripts/gen-traceability.py - Revisar y validar antes de commit.*