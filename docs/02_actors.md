# Actores del Sistema - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Fuente:** [SISGAD5_doc/docs/02 Акторы.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Resumen de Actores

| ID | Actor | Descripción | Responsabilidades Principales |
|----|-------|-------------|-------------------------------|
| A1 | **Administrador del Sistema** | Gestión completa de la plataforma | Usuarios, roles, permisos, configuración global |
| A2 | **Técnico de Campo** | Ejecución de trabajos en campo | Pruebas, órdenes de trabajo, consumos de materiales |
| A3 | **Operador de Mesa de Ayuda** | Primer contacto con quejas | Registro, clasificación, derivación de quejas |
| A4 | **Jefe de Departamento** | Supervisión operativa | Asignación de técnicos, seguimiento de KPIs |
| A5 | **Analista de Materiales** | Gestión de inventario | Catálogo, asignaciones, consumos, stock |
| A6 | **Director** | Visión estratégica | Dashboards ejecutivos, toma de decisiones |
| A7 | **Auditor** | Trazabilidad y cumplimiento | Historiales, logs de auditoría, reportes |

---

## 2. Detalle por Actor

### A1 - Administrador del Sistema
**Accesos:** Todos los módulos  
**Permisos:** CRUD completo en Users Service, configuración de RBAC  
**Casos de uso:** UC-01 a UC-08 (Gestión de usuarios y roles)

### A2 - Técnico de Campo
**Accesos:** MP Service (Quejas, Pruebas, Trabajos), Materials Service (Consumos)  
**Permisos:** Lectura/escritura en asignaciones propias  
**Casos de uso:** UC-09 a UC-16 (Ejecución técnica)

### A3 - Operador de Mesa de Ayuda
**Accesos:** MP Service (Quejas, Teléfonos, Líneas, Pizarras)  
**Permisos:** Crear, clasificar, derivar quejas  
**Casos de uso:** UC-17 a UC-20 (Gestión de quejas)

### A4 - Jefe de Departamento
**Accesos:** MP Service (Todos), Materials Service (Dashboard), Estadísticas  
**Permisos:** Asignar técnicos, cambiar estados, ver reportes  
**Casos de uso:** UC-21 a UC-23 (Supervisión)

### A5 - Analista de Materiales
**Accesos:** Materials Service (Todos), MP Service (Lectura)  
**Permisos:** CRUD catálogo, crear asignaciones/consumos  
**Casos de uso:** UC-24 (Gestión de materiales)

### A6 - Director
**Accesos:** Solo lectura - Dashboards y reportes ejecutivos  
**Permisos:** Visualización de KPIs, exportación de reportes  
**Casos de uso:** Consulta de métricas estratégicas

### A7 - Auditor
**Accesos:** Solo lectura - Logs de auditoría, historiales completos  
**Permisos:** Consulta de trazabilidad, exportación de evidencias  
**Casos de uso:** Verificación de cumplimiento

---

## 3. Matriz Actor × Módulo

| Módulo | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|--------|-------|---------|----------|------|----------|----------|---------|
| Autenticación | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Usuarios/Roles | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| Teléfonos | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Líneas | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Pizarras | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Quejas | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Pruebas | ✅ | ✅ | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| Trabajos | ✅ | ✅ | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| Materiales | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| Asignaciones | ✅ | ✅ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| Consumos | ✅ | ✅ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| Dashboard MP | ✅ | 👁️ | 👁️ | ✅ | 👁️ | ✅ | 👁️ |
| Dashboard Mat | ✅ | 👁️ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| Auditoría | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ |

**Leyenda:** ✅ = CRUD completo | 👁️ = Solo lectura | ❌ = Sin acceso

---

## 4. Historias de Usuario por Actor

Ver [User Story Map](../practices/practice_02_user_story_map.md)

---

## 5. Referencias

- [Casos de Uso](03_use_cases.md)
- [Matriz RBAC](12_rbac_matrix.md)
- [Event Storming](../practices/practice_03_event_storming.md)