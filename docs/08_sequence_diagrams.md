# Diagramas de Secuencia - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Escenarios:** 3 críticos  
> **Fuente:** [SISGAD5_doc/docs/08](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Escenario 1: Flujo Completo de Queja (Crítico)

### Actores: Operador, Técnico, Jefe, Sistema

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐
│Operador │    │Sistema  │    │Técnico  │    │Jefe     │    │Materials │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬─────┘
     │              │              │              │              │
     │ POST /quejas │              │              │              │
     │─────────────>│              │              │              │
     │              │ Validar      │              │              │
     │              │ Clasificación│              │              │
     │              │ Calcular     │              │              │
     │              │ Prioridad    │              │              │
     │              │ Crear Queja  │              │              │
     │              │ (Abierta)    │              │              │
     │<─────────────│ 201 Created  │              │              │
     │              │              │              │              │
     │              │              │ GET /quejas  │              │
     │              │              │<─────────────│              │
     │              │              │ 200 OK       │              │
     │              │              │              │              │
     │              │              │ POST /pruebas│              │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ 201 Created  │              │
     │              │              │<─────────────│              │
     │              │              │              │              │
     │              │ PATCH /quejas│              │              │
     │              │ /:id/asignar │              │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │              │              │ PATCH /quejas│              │
     │              │              │ /:id (Probada)           │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ POST /trabajos             │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ PATCH /trabajos            │
     │              │              │ /:id/asignar               │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ PATCH /trabajos            │
     │              │              │ /:id/cerrar                │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │ POST /consumos             │
     │              │              │───────────────────────────>│
     │              │              │              │ 201 Created  │
     │              │              │<───────────────────────────│
     │              │              │              │              │
     │              │ PATCH /quejas│              │              │
     │              │ /:id (Cerrada)             │              │
     │              │─────────────>│              │              │
     │              │              │              │              │
     │<─────────────│ 200 OK       │              │              │
```

### Tabla de Mensajes

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Operador | Sistema | POST /api/mp/quejas | {tipo_queja, servicio, ubicacion, reportado_por, telefono_id} |
| 2 | Sistema | Operador | 201 Created | {queja: {id, num_reporte, estado: "Abierta", prioridad}} |
| 3 | Técnico | Sistema | GET /api/mp/quejas?estado=Abierta | - |
| 4 | Sistema | Técnico | 200 OK | [quejas] |
| 5 | Técnico | Sistema | POST /api/mp/pruebas | {queja_id, exitoso, mediciones, observaciones} |
| 6 | Sistema | Técnico | 201 Created | {prueba} |
| 7 | Operador/Jefe | Sistema | PATCH /api/mp/quejas/:id/asignar | {tecnico_id} |
| 8 | Sistema | - | 200 OK | {queja: {estado: "Asignada"}} |
| 9 | Técnico | Sistema | PATCH /api/mp/quejas/:id | {estado: "Probada"} |
| 10 | Jefe | Sistema | POST /api/mp/trabajos | {queja_id, descripcion, tiempo_estimado} |
| 11 | Jefe | Sistema | PATCH /api/mp/trabajos/:id/asignar | {tecnico_id} |
| 12 | Técnico | Sistema | PATCH /api/mp/trabajos/:id/cerrar | {tiempo_real} |
| 13 | Técnico | Sistema | POST /api/materials/consumos | {trabajo_id, items: [{material_id, cantidad, costo_unitario_real}]} |
| 14 | Sistema | Técnico | 201 Created | {consumo} |
| 15 | Operador/Jefe | Sistema | PATCH /api/mp/quejas/:id | {estado: "Cerrada"} |
| 16 | Sistema | Operador | 200 OK | {queja: {estado: "Cerrada"}} |

---

## 2. Escenario 2: Asignación y Consumo de Materiales (Crítico)

### Actores: Analista, Técnico, Sistema

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│Analista │    │Sistema  │    │Técnico  │    │MP Svc   │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │              │              │              │
     │ POST /asignaciones          │              │
     │ (multiples items)           │              │
     │─────────────>│              │              │
     │              │ Validar stock│              │
     │              │ (concurrente)│              │
     │              │ Transacción  │              │
     │              │ ACID         │              │
     │              │ Capturar     │              │
     │              │ precio momento           │
     │<─────────────│ 201 Created  │              │
     │              │              │              │
     │              │              │ POST /consumos           │
     │              │              │ (validar vs asignación)  │
     │              │              │─────────────>│              │
     │              │              │              │              │
     │              │              │              │ Validar      │
     │              │              │              │ Consumo ≤    │
     │              │              │              │ Asignación   │
     │              │              │              │ Transacción  │
     │              │              │              │ ACID         │
     │              │              │              │ Capturar     │
     │              │              │              │ precio real  │
     │              │              │<─────────────│ 201 Created  │
     │              │              │ 201 Created  │              │
     │              │              │<─────────────│              │
```

### Tabla de Mensajes

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Analista | Sistema | POST /api/materials/asignaciones | {trabajador_id, trabajo_id, items: [{material_id, cantidad}]} |
| 2 | Sistema | - | Validar existencia materiales | SELECT * FROM materiales WHERE id IN (...) |
| 3 | Sistema | - | Verificar stock (concurrente) | Goroutines por material |
| 4 | Sistema | - | Transacción: INSERT asignacion + items | db.Transaction() |
| 5 | Sistema | - | Capturar costo_unitario_momento | SELECT precio_unitario FROM materiales |
| 6 | Sistema | Analista | 201 Created | {asignacion, items: [{costo_unitario_momento}]} |
| 7 | Técnico | Sistema | POST /api/materials/consumos | {trabajador_id, trabajo_id, asignacion_id, items: [...]} |
| 8 | Sistema | - | Validar consumo ≤ asignación pendiente | Σ(consumos) ≤ Σ(asignaciones) - Σ(consumos_previos) |
| 9 | Sistema | - | Transacción: INSERT consumo + items | db.Transaction() |
| 10 | Sistema | - | Capturar costo_unitario_real | Input del técnico |
| 11 | Sistema | Técnico | 201 Created | {consumo, items: [{costo_unitario_real}]} |

---

## 3. Escenario 3: Autenticación y Acceso a Recurso Protegido (Crítico)

### Actores: Usuario, API Gateway, Users Service, MP Service

```
┌────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────┐
│Usuario │    │API Gateway │    │Users Service│    │MP Service│
└────┬───┘    └─────┬──────┘    └──────┬──────┘    └────┬────┘
     │              │                   │              │
     │ POST /auth/login                │              │
     │─────────────>│                   │              │
     │              │ POST /auth/login  │              │
     │              │─────────────────>│              │
     │              │                   │              │
     │              │ Validar credenciales           │
     │              │ Generar JWT + Refresh          │
     │              │ Guardar refresh en BD          │
     │              │<─────────────────│              │
     │<─────────────│ 200 OK            │              │
     │  {access,    │                   │              │
     │   refresh}   │                   │              │
     │              │                   │              │
     │ GET /mp/quejas                  │              │
     │ Authorization: Bearer <access>  │              │
     │─────────────>│                   │              │
     │              │ Verificar JWT     │              │
     │              │ (middleware)      │              │
     │              │ Extraer user_id,  │              │
     │              │ roles, permisos   │              │
     │              │                   │              │
     │              │ Proxy request     │              │
     │              │────────────────────────────────>│
     │              │                   │              │
     │              │                   │ 200 OK       │
     │              │<────────────────────────────────│
     │<─────────────│ 200 OK            │              │
     │  [quejas]    │                   │              │
     │              │                   │              │
     │ POST /auth/refresh              │              │
     │ (access expirado)               │              │
     │─────────────>│                   │              │
     │              │ POST /auth/refresh│              │
     │              │─────────────────>│              │
     │              │                   │ Rotar refresh │
     │              │                   │ Generar nuevo │
     │              │                   │ access + refresh│
     │              │<─────────────────│              │
     │<─────────────│ 200 OK            │              │
     │  {new_access,│                   │              │
     │   new_refresh}│                  │              │
```

### Tabla de Mensajes

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Usuario | Gateway | POST /api/auth/login | {email, password} |
| 2 | Gateway | Users | POST /api/auth/login | {email, password} |
| 3 | Users | - | Validar bcrypt, generar tokens | - |
| 4 | Users | Gateway | 200 OK | {access_token, refresh_token, user} |
| 5 | Gateway | Usuario | 200 OK | {access_token, refresh_token, user} |
| 6 | Usuario | Gateway | GET /api/mp/quejas | Header: Authorization: Bearer <access> |
| 7 | Gateway | - | Verificar JWT (firma, expiración) | - |
| 8 | Gateway | - | Extraer claims (user_id, roles) | - |
| 9 | Gateway | MP | GET /api/mp/quejas | Header: X-User-Id, X-User-Roles |
| 10 | MP | Gateway | 200 OK | [quejas filtradas por permisos] |
| 11 | Gateway | Usuario | 200 OK | [quejas] |
| 12 | Usuario | Gateway | POST /api/auth/refresh | {refresh_token} (access expirado) |
| 13 | Gateway | Users | POST /api/auth/refresh | {refresh_token} |
| 14 | Users | - | Verificar refresh en BD, rotar | DELETE old, INSERT new |
| 15 | Users | Gateway | 200 OK | {access_token, refresh_token} |
| 16 | Gateway | Usuario | 200 OK | {access_token, refresh_token} |

---

## 4. Diagramas Fuente

Ver archivos Mermaid en: [`docs/diagrams/sequence_diagrams/`](../diagrams/sequence_diagrams/)

- `01_flujo_queja_completo.mmd`
- `02_asignacion_consumo_materiales.mmd`
- `03_autenticacion_acceso_recurso.mmd`

---

## 5. Referencias

- [Casos de Uso](03_use_cases.md)
- [Modelo de Dominio](07_domain_model.md)
- [Máquinas de Estado](09_state_machines.md)
- [Estrategia de Seguridad](13_security.md)