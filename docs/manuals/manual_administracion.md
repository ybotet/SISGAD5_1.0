# Manual Administrativo (SISGAD5)

> **Versión:** 1.0  
> **Público:** Jefes de Área, Coordinadores, Administradores  
> **Última actualización:** Septiembre 2026

---

## 1. Introducción

Este manual está dirigido a usuarios con perfiles de jefe, coordinador o administrador del sistema SISGAD5. Describe las funcionalidades de gestión, administración de usuarios y reportes.

## 2. Roles y Permisos

### Roles Disponibles

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| **Operador** | Registra quejas y gestiona infraestructura MP | CRUD quejas, pruebas, trabajos (restringido) |
| **Técnico** | Ejecuta pruebas y trabajos en campo | Registrar pruebas, cerrar trabajos, consumir materiales |
| **Analista MP** | Administra materiales y dashboards | CRUD materiales, asignaciones, consumos, dashboard full |
| **Jefe** | Supervisa operaciones | Asignar técnicos, cerrar quejas, reportes |
| **Admin** | Control total del sistema | CRUD usuarios, roles, permisos |

### Cómo Asignar Roles

1. Navegar a **Usuarios** → **Listar Usuarios**
2. Hacer clic en un usuario
3. Ir a pestaña **Roles**
4. Seleccionar rol(es) apropiado(s)
5. Hacer clic en **Guardar**

## 3. Gestión de Usuarios

### 3.1. Crear Usuario
1. Navegar a **Usuarios** → **Crear Usuario**
2. Completar formulario:
   - Nombre, apellido, email
   - Asignar rol inicial
   - Configurar password (se enviará enlace para primera sesión)
3. Hacer clic en **Crear**

### 3.2. Listar y Buscar Usuarios
- Usar filtros: nombre, email, rol, estado activo/bloqueado
- Paginación configurable (10, 25, 50, 100 por página)

### 3.3. Asignar Roles
- Un usuario puede tener múltiples roles
- Los permisos se combinan (union)

### 3.4. Bloquear/Desbloquear Usuario
- En detalle de usuario → acción **Bloquear**
- El usuario permanecerá bloqueado hasta desbloqueo manual o expiración del tiempo

## 4. Dashboard Analítico

### 4.1. KPIs Principales (MP)
| Métrica | Descripción | Fórmula |
|---------|-------------|---------|
| Quejas Creadas | Total por día/período | COUNT(quejas) GROUP BY fecha |
| Quejas Cerradas | Quejas con estado "Cerrada" | COUNT WHERE estado = Cerrada |
| Trabajos Cerrados | Órdenes completadas | COUNT(trabajos WHERE estado = Cerrada) |
| Pruebas Realizadas | Pruebas registradas | COUNT(pruebas) |
| Tiempo Promedio Cierre | Avg tiempo Abierta → Cerrada | AVG(fecha_cierre - fecha_apertura) |
| Prioridad Distribution | Distribución por prioridad | COUNT GROUP BY prioridad |

### 4.2. KPIs Materiales
| Métrica | Descripción |
|---------|-------------|
| Asignaciones/Mes | Total asignaciones creadas |
| Consumos/Mes | Total consumos registrados |
| Costo Total | Suma de todos los consumos |
| Stock Bajo Alertas | Materiales con saldo < mínimo |

### 4.3. Cómo Filtrar Dashboard
- **Rango de fechas:** Click en calendario → seleccionar período
- **Servicio:** Dropdown para filtrar por servicio
- **Prioridad:** Checkboxes para prioridades específicas
- **Exportar:** Botón CSV/PDF para reportes

## 5. Reportes y Exportaciones

### 5.1. Generar Reporte de Quejas
1. Navegar a **MP** → **Reportes** → **Quejas**
2. Configurar filtros:
   - Fecha desde / hasta
   - Servicio
   - Estado
   - Prioridad
   - Técnico
3. Ejecutar → Exportar a CSV o PDF

### 5.2. Reporte de Materiales
1. Navegar a **Materiales** → **Reportes**
2. Seleccionar tipo: Stock, Asignaciones, Consumos
3. Configurar filtros y exportar

### 5.3. Exportar Dashboard
- Cada dashboard tiene botón **Exportar** (CSV, PDF, PNG)

## 6. Configuración del Sistema

### 6.1. Tipos de Queja
| Tipo | Peso Prioridad | Descripción |
|------|----------------|-------------|
| Falla de Señal | 4 | Sin señal o señal degradada |
| Corte de Cable | 3 | Cable físicamente cortado |
| Problema de Equipo | 3 | Falla en equipo (ONT, router) |
| Nueva Instalación | 2 | Instalación nueva |
| Requerimiento | 1 | Mejora o requerimiento |

### 6.2. Servicios
- Configurables con peso de prioridad
- Cada servicio puede tener SLA asociado

### 6.3. Ubicaciones
- Jerarquía: País → Departamento → Municipio → Sector
- Cada nivel tiene peso de prioridad configurable

## 7. Configuración de Stock Mínimo

1. Navegar a **Materiales** → **Catálogo**
2. Editar material → campo **Stock Mínimo**
3. Al caer por debajo, se genera alerta en dashboard

## 8. Buenas Prácticas Administrativas

1. **Revisar dashboard diario:** Verificar alertas de stock bajo y quejas críticas
2. **Auditar usuarios inactivos:** Revisar mensualmente usuarios no activos
3. **Validar cierres:** Antes de cerrar quejas, verificar pruebas y trabajos asociados
4. **Reportes semanales:** Generar reportes de productividad por técnico
5. **Backup de configuraciones:** Guardar exportaciones de configuración crítica

## 9. Preguntas Frecuentes (Admin)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Puedo tener múltiples roles? | Sí, los permisos se unen |
| ¿Se puede cambiar el nombre de un material? | Sí, pero se recomienda crear uno nuevo y deprecar el viejo |
| ¿Qué pasa si cierro una queja sin prueba? | El sistema validará la regla BR-12 |
| ¿Puedo exportar todo el catálogo? | Sí, desde **Materiales** → **Exportar** |
| ¿Cómo reviso quién hizo qué? | **Auditoría** en detalle de queja/trabajo/material |

## 10. Referencias

- [Manual de Explotación](manual_explotacion_general.md)
- [Manual Técnico](manual_tecnico.md)
- [Manual Operativo](manual_operativo.md)
- [Tesis - Fundamentos](../thesis/02_state_of_art.md)
