# Casos de Uso - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Total:** 24 casos de uso  
> **Fuente:** [SISGAD5_doc/docs/03-07](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Diagrama de Casos de Uso

Ver diagrama fuente en: [`docs/diagrams/use_cases/`](../diagrams/use_cases/)

---

## 2. Lista de Casos de Uso

### Autenticación y Usuarios (UC-01 a UC-08)

| ID | Caso de Uso | Actor Principal | Descripción |
|----|-------------|-----------------|-------------|
| UC-01 | **Registrar Usuario** | Admin | Crear nuevo usuario con roles iniciales |
| UC-02 | **Iniciar Sesión** | Todos | Autenticación con email/password → JWT + Refresh |
| UC-03 | **Renovar Token** | Todos | Refresh token → nuevo access token |
| UC-04 | **Cerrar Sesión** | Todos | Invalidar refresh token |
| UC-05 | **Gestionar Usuarios** | Admin | CRUD usuarios, paginación, búsqueda |
| UC-06 | **Gestionar Roles** | Admin | CRUD roles, asignar permisos |
| UC-07 | **Asignar Roles a Usuario** | Admin | Vincular usuario ↔ roles |
| UC-08 | **Recuperar Contraseña** | Todos | Flujo email → token → nueva contraseña |

### Gestión de Infraestructura MP (UC-09 a UC-13)

| ID | Caso de Uso | Actor Principal | Descripción |
|----|-------------|-----------------|-------------|
| UC-09 | **Gestionar Teléfonos** | Operador/Admin | CRUD teléfonos, cambio estado, historial |
| UC-10 | **Gestionar Líneas** | Operador/Admin | CRUD líneas, cambio estado, historial |
| UC-11 | **Gestionar Pizarras** | Operador/Admin | CRUD pizarras, puertos, conexiones, ubicación |
| UC-12 | **Buscar y Filtrar Infraestructura** | Operador/Admin | Búsqueda unificada teléfonos/líneas/pizarras |
| UC-13 | **Ver Historial Completo** | Técnico/Jefe/Auditor | Quejas, recorridos, movimientos por elemento |

### Gestión de Quejas, Pruebas y Trabajos (UC-14 a UC-20)

| ID | Caso de Uso | Actor Principal | Descripción |
|----|-------------|-----------------|-------------|
| UC-14 | **Registrar Queja** | Operador | Crear queja con clasificación y prioridad |
| UC-15 | **Gestionar Flujo de Estados** | Operador/Técnico/Jefe | Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada |
| UC-16 | **Asignar Técnico** | Jefe/Operador | Asignar queja/prueba/trabajo a técnico |
| UC-17 | **Registrar Prueba** | Técnico | Registrar resultados de prueba, vincular a queja/trabajo |
| UC-18 | **Crear Orden de Trabajo** | Jefe/Técnico | Crear trabajo con tiempo estimado |
| UC-19 | **Cerrar Trabajo** | Técnico | Registrar tiempo real, cerrar orden |
| UC-20 | **Ver Estadísticas MP** | Jefe/Director | Resumen KPIs, filtros fecha/servicio |

### Gestión de Materiales (UC-21 a UC-24)

| ID | Caso de Uso | Actor Principal | Descripción |
|----|-------------|-----------------|-------------|
| UC-21 | **Gestionar Catálogo Materiales** | Analista/Admin | CRUD materiales, categorías, unidades, búsqueda, paginación |
| UC-22 | **Crear Asignación** | Analista/Técnico | Múltiples ítems, precio momento, validación stock, transacción ACID |
| UC-23 | **Registrar Consumo** | Técnico | Múltiples ítems, precio real, validación vs asignación, transacción ACID |
| UC-24 | **Ver Dashboard Materiales** | Analista/Jefe/Director | Resumen, distribución, saldo lógico, alertas, exportación |

---

## 3. Relaciones Include/Extend

### Include (Inclusión Obligatoria)
- UC-02 (Login) **includes** UC-03 (Renovar Token) - para sesiones largas
- UC-14 (Registrar Queja) **includes** UC-12 (Buscar Infraestructura) - para vincular teléfono/línea/pizarra
- UC-22 (Crear Asignación) **includes** UC-21 (Gestionar Catálogo) - para seleccionar materiales

### Extend (Extensión Opcional)
- UC-05 (Gestionar Usuarios) **extends** UC-07 (Asignar Roles) - opcional al crear usuario
- UC-15 (Gestionar Flujo) **extends** UC-16 (Asignar Técnico) - opcional según estado
- UC-18 (Crear Trabajo) **extends** UC-17 (Registrar Prueba) - si requiere prueba previa

---

## 4. Trazabilidad

| Caso de Uso | Requisitos | Clases de Dominio | Endpoints API |
|-------------|------------|-------------------|---------------|
| UC-01 a UC-08 | RF-AUTH-01 a RF-AUTH-08 | User, Rol, Permiso, Sesión | `/api/auth/*`, `/api/users/*` |
| UC-09 a UC-13 | RF-MP-01 a RF-MP-13 | Telefono, Linea, Pizarra, Puerto | `/api/mp/telefonos/*`, `/api/mp/lineas/*`, `/api/mp/pizarras/*` |
| UC-14 a UC-20 | RF-MP-14 a RF-MP-28 | Queja, Prueba, Trabajo, FlujoEstado | `/api/mp/quejas/*`, `/api/mp/pruebas/*`, `/api/mp/trabajos/*` |
| UC-21 a UC-24 | RF-MAT-01 a RF-MAT-11 | Material, Categoria, Unidad, Asignacion, Consumo | `/api/materials/*` |

---

## 5. Referencias

- [Actores](02_actors.md)
- [Modelo de Dominio](07_domain_model.md)
- [Diagramas de Secuencia](08_sequence_diagrams.md)
- [Matriz de Trazabilidad](../practices/practice_06_uml_dynamic.md)