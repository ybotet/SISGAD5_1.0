# Actores del Sistema - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Fuente:** [SISGAD5_doc/docs/02 Акторы.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Resumen de Actores

| ID  | Actor                         | Descripción                       | Responsabilidades Principales                          |
| --- | ----------------------------- | --------------------------------- | ------------------------------------------------------ |
| A1  | **Administrador del Sistema** | Gestión completa de la plataforma | Usuarios, roles, permisos, configuración global        |
| A2  | **Probador**                  | Primer contacto con quejas        | Registro, clasificación, derivación de quejas, Pruebas |
| A3  | **Editor**                    | Trabajo con nomencladores         | Corrección de errores, consolidación de estadísticas   |
| A4  | **Supervisor**                | Supervisión operativa             | Asignación de técnicos, seguimiento de KPIs            |
| A5  | **Analista de Materiales**    | Gestión de materiales             | Catálogo, asignaciones, consumos, stock                |
| A6  | **Director**                  | Visión estratégica                | Dashboards ejecutivos, toma de decisiones              |


---

## 2. Detalle por Actor

### A1 - Administrador del Sistema
**Accesos:** Todos los módulos  
**Permisos:** CRUD completo en Users Service, configuración de RBAC  
**Casos de uso:** UC-01 a UC-08 (Gestión de usuarios y roles)

### A2 - Probador
**Accesos:** MP Service (Quejas, Teléfonos, Líneas, Pizarras)  
**Permisos:** Crear, clasificar, derivar quejas  
**Casos de uso:** UC-09 a UC-15, UC-17 a UC-20 (Gestión de quejas)

### A3 - Editor
**Accesos:** MP Service (Quejas, Teléfonos, Líneas, Pizarras, Nomencladores).
**Permisos:** Crear, modificar y eliminar datos.
**Casos de uso:** UC-01 a UC-20

### A4 - Supervisor
**Accesos:** MP Service (Todos), Materials Service (Dashboard), Estadísticas  
**Permisos:** Asignar técnicos, cambiar estados, ver reportes  
**Casos de uso:** UC-16, UC-20, UC-21 a UC-23 (Supervisión), UC-24, 

### A5 - Analista de Materiales
**Accesos:** Materials Service (Todos), MP Service (Lectura)  
**Permisos:** CRUD catálogo, crear asignaciones/consumos  
**Casos de uso:** UC-21 a UC-24 (Gestión de materiales)

### A6 - Director
**Accesos:** Solo lectura - Dashboards y reportes ejecutivos  
**Permisos:** Visualización de KPIs, exportación de reportes  
**Casos de uso:** Consulta de métricas estratégicas


---

## 3. Matriz Actor × Módulo

| Módulo                     | Admin | Probador | Editor | Supervisor | Analista | Director |
| :------------------------- | :---- | :------- | :----- | :--------- | :------- | :------- |
| Autenticación              | ✅    | ✅       | ✅     | ✅         | ✅       | ✅       |
| Usuarios/Roles             | ✅    | ❌       | ❌     | ❌         | ❌       | ❌       |
| Teléfonos                  | ✅    | ✅       | ✅     | 👁️      | ❌       | ❌       |
| Líneas                     | ✅    | ✅       | ✅     | 👁️      | ❌       | ❌       |
| Pizarras                   | ✅    | ✅       | ✅     | 👁️      | ❌       | ❌       |
| Quejas                     | ✅    | ⚠️     | ✅     | ⚠️       | 👁️    | 👁️    |
| Pruebas                    | ✅    | ✅       | ✅     | 👁️      | ❌       | ❌       |
| Trabajos                   | ✅    | ⚠️     | ✅     | 👁️      | ❌       | 👁️    |
| Materiales                 | ✅    | 👁️    | ❌     | 👁️      | ✅       | 👁️    |
| Asignaciones de materiales | ✅    | ❌       | ❌     | 👁️      | ✅       | 👁️    |
| Consumos                   | ✅    | ❌       | ❌     | 👁️      | ✅       | 👁️    |
| Dashboard MP               | ✅    | 👁️    | 👁️  | ✅         | 👁️    | ✅       |
| Dashboard Mat              | ✅    | 👁️    | ❌     | ✅         | ✅       | ✅       |
| Auditoría                  | ✅    | 👁️    | 👁️  | ✅         | 👁️    | 👁️    | ✅

**Leyenda:** ✅ = CRUD completo | ⚠️ = Crud Parcial | 👁️ = Solo lectura | ❌ = Sin acceso

---

## 4. Historias de Usuario por Actor

Ver [User Story Map](practices/practice_02_user_story_map.es.md)

---

## 5. Referencias

- [Casos de Uso](03_use_cases.es.md)
- [Matriz RBAC](12_rbac_matrix.es.md)
- [Event Storming](practices/practice_03_event_storming.es.md)