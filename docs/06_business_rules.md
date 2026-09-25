# Reglas de Negocio - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Reglas de Autenticación y Autorización

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-AUTH-01 | **Password Policy** | Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial |
| RN-AUTH-02 | **Bloqueo Cuenta** | 5 intentos fallidos → bloqueo 15 minutos |
| RN-AUTH-03 | **Rotación Refresh Token** | Cada uso invalida el anterior (rotación + detección de robo) |
| RN-AUTH-04 | **Expiración Access Token** | 15 minutos (configurable via env) |
| RN-AUTH-05 | **Expiración Refresh Token** | 7 días (configurable via env) |
| RN-AUTH-06 | **Sesiones Concurrentes** | Máximo 5 sesiones activas por usuario |
| RN-AUTH-07 | **RBAC Estricto** | Acceso denegado por defecto (deny-by-default) |

---

## 2. Reglas de Infraestructura MP

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-MP-01 | **Unicidad Teléfono** | Número de teléfono único en BD |
| RN-MP-02 | **Unicidad Línea** | Número de línea único en BD |
| RN-MP-03 | **Pizarra-Puerto** | Puerto único por pizarra (compuesto: pizarra_id + numero_puerto) |
| RN-MP-04 | **Cliente Requerido** | Teléfono/Línea/Pizarra deben tener cliente asociado |
| RN-MP-05 | **Baja Lógica** | Cambio a "baja" no elimina, solo marca estado + fecha_baja |
| RN-MP-06 | **Integridad Historial** | Nunca eliminar registros de historial (solo append) |

---

## 3. Reglas de Quejas

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-QUE-01 | **Clasificación Obligatoria** | Toda queja debe tener: tipo_queja, servicio, ubicacion (claves FK) |
| RN-QUE-02 | **Prioridad Automática** | Calculada por: tipo_queja.peso + servicio.peso + ubicacion.peso + antigüedad |
| RN-QUE-03 | **Flujo Estados Estricto** | Solo transiciones permitidas: Abierta→Probada→Asignada→Pendiente→Resuelta→Cerrada |
| RN-QUE-04 | **No Saltar Estados** | Prohibido: Abierta→Asignada, Probada→Resuelta, etc. |
| RN-QUE-05 | **Asignación Requiere Técnico** | Solo usuarios con rol "Técnico" pueden ser asignados |
| RN-QUE-06 | **Cierre Requiere Prueba** | Estado "Cerrada" solo si existe prueba asociada con resultado exitoso |
| RN-QUE-07 | **Reapertura** | Queja "Cerrada" puede reabrirse → vuelve a "Abierta" (nuevo num_reporte) |
| RN-QUE-08 | **Auditoría Inmutable** | Cada transición registra: usuario_id, estado_anterior, estado_nuevo, timestamp, IP |

---

## 4. Reglas de Pruebas

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-PRU-01 | **Vinculación Obligatoria** | Prueba debe vincularse a queja_id Y/O trabajo_id (al menos uno) |
| RN-PRU-02 | **Resultado Binario** | Campo "exitoso": true/false (sin estados intermedios) |
| RN-PRU-03 | **Técnico Validador** | Solo el técnico asignado a la queja/trabajo puede registrar la prueba |

---

## 5. Reglas de Trabajos

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-TRA-01 | **Tiempo Real ≤ Estimado × 2** | Alerta si tiempo real excede 2x estimado (no bloquea) |
| RN-TRA-02 | **Cierre Requiere Tiempo Real** | Campo real_horas obligatorio al cerrar |
| RN-TRA-03 | **Un Técnico por Trabajo** | Un trabajo tiene un único técnico asignado |
| RN-TRA-04 | **Trabajo Deriva de Queja** | Opcional: trabajo_id en queja para trazabilidad |

---

## 6. Reglas de Materiales

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-MAT-01 | **Código Único Material** | Código alfanumérico único (ej: MAT-001, CAB-UTP-CAT6) |
| RN-MAT-02 | **Precio Positivo** | precio_unitario > 0 en catálogo |
| RN-MAT-03 | **Categoría/Unidad Obligatoria** | FK no nulas en material |
| RN-MAT-04 | **Integridad Referencial** | No eliminar categoría/unidad si tiene materiales (RESTRICT) |
| RN-MAT-05 | **Asignación Atómica** | Todos los ítems se asignan o ninguno (transacción) |
| RN-MAT-06 | **Precio Momento Congelado** | costo_unitario_momento no cambia tras crear asignación |
| RN-MAT-07 | **Consumo ≤ Asignación Pendiente** | Σ(consumos) ≤ Σ(asignaciones) - Σ(consumos_previos) por material/trabajador |
| RN-MAT-08 | **Consumo Atómico** | Todos los ítems se consumen o ninguno (transacción) |
| RN-MAT-09 | **Stock Lógico No Negativo** | Saldo = Asignado - Consumido ≥ 0 siempre |
| RN-MAT-10 | **Trabajador Válido** | Solo usuarios con rol "Técnico" o "Analista" pueden recibir asignaciones |

---

## 7. Reglas de Dashboard y Analítica

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-DASH-01 | **KPIs Tiempo Real** | Dashboards consultan BD directamente (sin caché > 5 min) |
| RN-DASH-02 | **Exportación Respeta Filtros** | CSV/JSON incluye solo registros filtrados |
| RN-DASH-03 | **Alertas Configurables** | Umbrales de stock bajo por material/categoría |

---

## 8. Reglas Técnicas Transversales

| ID | Regla | Descripción |
|----|-------|-------------|
| RN-TEC-01 | **Soft Delete** | Nunca DELETE físico; usar deleted_at / estado = 'baja' |
| RN-TEC-02 | **Timestamps** | created_at, updated_at obligatorios en todas las tablas |
| RN-TEC-03 | **Versionado Optimista** | Campo version (integer) para detectar conflictos concurrentes |
| RN-TEC-04 | **IDs Únicos** | UUID v4 para entidades principales, integer autoincremental para catálogos |
| RN-TEC-05 | **Paginación Estándar** | ?page=1&limit=10 (max 100) en todos los listados |
| RN-TEC-06 | **Ordenación Estándar** | ?sortBy=campo&sortOrder=ASC|DESC |
| RN-TEC-07 | **Búsqueda Estándar** | ?search=texto busca en campos relevantes por entidad |
| RN-TEC-08 | **Respuesta Estándar** | {success: bool, data: T, pagination?, error?} |

---

## 9. Matriz de Validación de Reglas

| Regla | Servicio | Endpoint | Validación en |
|-------|----------|----------|---------------|
| RN-AUTH-01 | Users | POST /auth/register | Validator (Zod) |
| RN-AUTH-02 | Users | POST /auth/login | Middleware |
| RN-QUE-03 | MP | PATCH /quejas/:id | Service (state machine) |
| RN-QUE-06 | MP | PATCH /quejas/:id/cerrar | Service |
| RN-MAT-05 | Materials | POST /asignaciones | DB Transaction |
| RN-MAT-07 | Materials | POST /consumos | Service + DB Constraint |
| RN-MAT-08 | Materials | POST /consumos | DB Transaction |

---

## 10. Referencias

- [Requisitos](05_requirements.md)
- [Modelo de Dominio](07_domain_model.md)
- [Máquinas de Estado](09_state_machines.md)
- [Event Storming](../practices/practice_03_event_storming.md)