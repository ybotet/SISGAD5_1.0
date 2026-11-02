# Matriz RBAC (Roles × Permisos × Endpoints) - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Roles del Sistema

| Rol | Código | Descripción | Nivel |
|-----|--------|-------------|-------|
| **Administrador** | `admin` | Acceso total al sistema, gestión de usuarios y configuración | 1 (Máximo) |
| **Técnico** | `tecnico` | Ejecución de trabajos de campo, pruebas, consumos de materiales | 2 |
| **Operador** | `operador` | Registro y clasificación de quejas, gestión de infraestructura | 2 |
| **Jefe** | `jefe` | Supervisión, asignación de técnicos, aprobación de cierres | 2 |
| **Analista** | `analista` | Gestión de catálogo de materiales, asignaciones, dashboard | 2 |
| **Director** | `director` | Solo lectura: dashboards ejecutivos, KPIs estratégicos | 3 (Solo lectura) |
| **Auditor** | `auditor` | Solo lectura: trazabilidad, logs de auditoría, historiales | 3 (Solo lectura) |

---

## 2. Permisos por Recurso y Acción

### Formato: `recurso:accion`

| Recurso | create | read | update | delete | Acciones Especiales |
|---------|--------|------|--------|--------|---------------------|
| **users** | ✅ | ✅ | ✅ | ✅ (soft) | `assign_roles` |
| **roles** | ✅ | ✅ | ✅ | ✅ | `assign_permisos` |
| **permisos** | ✅ | ✅ | ❌ | ❌ | - |
| **sesiones** | ❌ | ✅ (own) | ❌ | ✅ (revoke own) | - |
| **auth** | register, login, refresh, logout, forgot, reset | - | - | - | - |

| Recurso | create | read | update | delete | Acciones Especiales |
|---------|--------|------|--------|--------|---------------------|
| **telefonos** | ✅ | ✅ | ✅ | ✅ (soft) | `cambiar_estado`, `historial` |
| **lineas** | ✅ | ✅ | ✅ | ✅ (soft) | `cambiar_estado`, `historial` |
| **pizarras** | ✅ | ✅ | ✅ | ✅ (soft) | `puertos`, `historial`, `ubicacion` |
| **puertos** | ✅ | ✅ | ✅ | ✅ | - |
| **quejas** | ✅ | ✅ | ✅ | ❌ | `asignar`, `cambiar_estado`, `historial`, `auditoria` |
| **pruebas** | ✅ | ✅ | ✅ (own) | ❌ | - |
| **trabajos** | ✅ | ✅ | ✅ | ❌ | `asignar`, `cerrar` |
| **estadisticas_mp** | ❌ | ✅ | ❌ | ❌ | - |
| **catalogos_mp** | ❌ (admin) | ✅ | ❌ (admin) | ❌ (admin) | - |

| Recurso | create | read | update | delete | Acciones Especiales |
|---------|--------|------|--------|--------|---------------------|
| **materiales** | ✅ | ✅ | ✅ | ✅ (soft) | `buscar`, `paginar` |
| **categorias** | ✅ | ✅ | ✅ | ✅ (soft, RESTRICT) | - |
| **unidades** | ✅ | ✅ | ✅ | ✅ (soft, RESTRICT) | - |
| **asignaciones** | ✅ | ✅ | ✅ (estado/obs) | ❌ | `items`, `validar_stock` |
| **consumos** | ✅ | ✅ | ❌ | ❌ | `validar_vs_asignacion` |
| **dashboard_mat** | ❌ | ✅ | ❌ | ❌ | `exportar`, `alertas` |

---

## 3. Matriz Completa: Rol × Permiso

| Permiso | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|---------|-------|---------|----------|------|----------|----------|---------|
| **Users Service** |
| users:create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users:read | ✅ | 👁️ (own) | 👁️ (own) | 👁️ | 👁️ (own) | 👁️ | 👁️ |
| users:update | ✅ | 👁️ (own profile) | 👁️ (own profile) | ❌ | 👁️ (own profile) | ❌ | ❌ |
| users:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users:assign_roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:read | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| roles:update | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:assign_permisos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| permisos:create | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| permisos:read | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| sesiones:read_own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sesiones:revoke_own | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| sesiones:read_all | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | ✅ |
| auth:register | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| auth:login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth:refresh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth:logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth:forgot_password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| auth:reset_password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MP Service** |
| telefonos:create | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| telefonos:read | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| telefonos:update | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| telefonos:delete | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| telefonos:cambiar_estado | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| telefonos:historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| lineas:create | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| lineas:read | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| lineas:update | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| lineas:delete | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| lineas:cambiar_estado | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| lineas:historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| pizarras:create | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| pizarras:read | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| pizarras:update | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| pizarras:delete | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| pizarras:puertos | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| pizarras:historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| pizarras:ubicacion | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| quejas:create | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| quejas:read | ✅ | ✅ (asignadas) | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| quejas:update | ✅ | ✅ (asignadas, estado) | ✅ (clasificación) | ✅ | ❌ | ❌ | ❌ |
| quejas:asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| quejas:cambiar_estado | ✅ | ✅ (siguiente válido) | ✅ (Probada) | ✅ | ❌ | ❌ | ❌ |
| quejas:historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ✅ |
| quejas:auditoria | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ |
| pruebas:create | ✅ | ✅ (asignadas) | ❌ | ✅ | ❌ | ❌ | ❌ |
| pruebas:read | ✅ | ✅ (propias) | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| pruebas:update | ✅ | ✅ (propias) | ❌ | ❌ | ❌ | ❌ | ❌ |
| trabajos:create | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:read | ✅ | ✅ (asignados) | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| trabajos:update | ✅ | ✅ (asignados) | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:cerrar | ✅ | ✅ (asignados) | ❌ | ✅ | ❌ | ❌ | ❌ |
| estadisticas_mp:read | ✅ | 👁️ | 👁️ | ✅ | 👁️ | ✅ | 👁️ |
| catalogos_mp:read | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| catalogos_mp:write | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Materials Service** |
| materiales:create | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| materiales:read | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| materiales:update | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| materiales:delete | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| materiales:buscar | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| materiales:paginar | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| categorias:create | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| categorias:read | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| categorias:update | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| categorias:delete | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| unidades:create | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| unidades:read | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| unidades:update | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| unidades:delete | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| asignaciones:create | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| asignaciones:read | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| asignaciones:update_estado | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | ❌ | ❌ |
| asignaciones:items | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| asignaciones:validar_stock | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| consumos:create | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| consumos:read | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| consumos:validar_vs_asignacion | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| dashboard_mat:read | ✅ | 👁️ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| dashboard_mat:exportar | ✅ | ❌ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| dashboard_mat:alertas | ✅ | ❌ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |

**Leyenda:** ✅ = Permitido | 👁️ = Solo lectura | ❌ = Denegado | (own) = Solo propios recursos | (asignadas) = Solo recursos asignados al usuario

---

## 4. Matriz: Rol × Endpoint (Resumen)

### Users Service

| Endpoint | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|----------|-------|---------|----------|------|----------|----------|---------|
| POST /api/auth/register | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /api/auth/login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/refresh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/forgot-password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /api/auth/reset-password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /api/auth/me/password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /api/users | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| POST /api/users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/users/:id | ✅ | 👁️ (own) | 👁️ (own) | 👁️ | 👁️ (own) | 👁️ | 👁️ |
| PUT /api/users/:id | ✅ | 👁️ (own) | 👁️ (own) | ❌ | 👁️ (own) | ❌ | ❌ |
| DELETE /api/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/users/:id/sessions | ✅ | 👁️ (own) | 👁️ (own) | 👁️ | 👁️ (own) | 👁️ | 👁️ |
| PUT /api/users/:id/roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/roles | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| POST /api/roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PUT /api/roles/:id/permisos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /api/permisos | ✅ | ❌ | ❌ | 👁️ | ❌ | 👁️ | 👁️ |
| GET /health | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### MP Service

| Endpoint | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|----------|-------|---------|----------|------|----------|----------|---------|
| GET /api/mp/telefonos | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| POST /api/mp/telefonos | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/telefonos/:id/estado | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/telefonos/:id/historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| GET /api/mp/lineas | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| POST /api/mp/lineas | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/lineas/:id/estado | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/pizarras | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| POST /api/mp/pizarras | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/pizarras/:id/puertos | ✅ | 👁️ | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| GET /api/mp/quejas | ✅ | ✅ (asignadas) | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| POST /api/mp/quejas | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/quejas/:id/asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/quejas/:id/estado | ✅ | ✅ (sig.) | ✅ (Prob.) | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/quejas/:id/historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ✅ |
| GET /api/mp/quejas/:id/auditoria | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ |
| POST /api/mp/pruebas | ✅ | ✅ (asig.) | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /api/mp/trabajos | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/trabajos/:id/asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/trabajos/:id/cerrar | ✅ | ✅ (asig.) | ❌ | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/estadisticas/resumen | ✅ | 👁️ | 👁️ | ✅ | 👁️ | ✅ | 👁️ |

### Materials Service

| Endpoint | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|----------|-------|---------|----------|------|----------|----------|---------|
| GET /api/materials/materiales | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/materiales | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| PUT /api/materials/materiales/:id | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/categorias | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/categorias | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| GET /api/materials/unidades | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/unidades | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| POST /api/materials/asignaciones | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/asignaciones | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/consumos | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/consumos | ✅ | ✅ (propias) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| GET /api/materials/dashboard/resumen | ✅ | 👁️ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| GET /api/materials/dashboard/exportar | ✅ | ❌ | ❌ | 👁️ | ✅ | ✅ | 👁️ |

---

## 5. Implementación en Middleware

### Users Service (middleware/roles.js)
```javascript
const requirePermission = (resource, action) => (req, res, next) => {
  const userPermissions = req.user.permissions; // ['users:read', 'quejas:create', ...]
  const required = `${resource}:${action}`;
  if (userPermissions.includes(required) || userPermissions.includes('*')) {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    error: { code: 'FORBIDDEN', message: `Permiso requerido: ${required}` } 
  });
};

// Uso en rutas
router.post('/quejas', authMiddleware, requirePermission('quejas', 'create'), quejaController.create);
router.patch('/quejas/:id/asignar', authMiddleware, requirePermission('quejas', 'asignar'), quejaController.asignar);
```

### API Gateway (middleware/auth.js)
```javascript
// Verificar JWT y extraer claims
const verifyJWT = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
      permissions: decoded.permissions
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Rate limiting por IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.ip
});
```

---

## 6. Permisos Predefinidos (Seed Data)

### Roles por Defecto
```sql
INSERT INTO roles (id, nombre, descripcion) VALUES
  (gen_random_uuid(), 'admin', 'Administrador del sistema - acceso total'),
  (gen_random_uuid(), 'tecnico', 'Técnico de campo - ejecuta trabajos y pruebas'),
  (gen_random_uuid(), 'operador', 'Operador de mesa de ayuda - registra y clasifica quejas'),
  (gen_random_uuid(), 'jefe', 'Jefe de departamento - supervisa y asigna'),
  (gen_random_uuid(), 'analista', 'Analista de materiales - gestiona catálogo y asignaciones'),
  (gen_random_uuid(), 'director', 'Director - vista ejecutiva de solo lectura'),
  (gen_random_uuid(), 'auditor', 'Auditor - trazabilidad y cumplimiento de solo lectura');
```

### Permisos por Defecto
```sql
INSERT INTO permisos (id, nombre, recurso, accion) VALUES
  -- Auth
  (gen_random_uuid(), 'auth:register', 'auth', 'register'),
  (gen_random_uuid(), 'auth:login', 'auth', 'login'),
  (gen_random_uuid(), 'auth:refresh', 'auth', 'refresh'),
  (gen_random_uuid(), 'auth:logout', 'auth', 'logout'),
  (gen_random_uuid(), 'auth:forgot_password', 'auth', 'forgot_password'),
  (gen_random_uuid(), 'auth:reset_password', 'auth', 'reset_password'),
  -- Users
  (gen_random_uuid(), 'users:create', 'users', 'create'),
  (gen_random_uuid(), 'users:read', 'users', 'read'),
  (gen_random_uuid(), 'users:update', 'users', 'update'),
  (gen_random_uuid(), 'users:delete', 'users', 'delete'),
  (gen_random_uuid(), 'users:assign_roles', 'users', 'assign_roles'),
  -- Roles
  (gen_random_uuid(), 'roles:create', 'roles', 'create'),
  (gen_random_uuid(), 'roles:read', 'roles', 'read'),
  (gen_random_uuid(), 'roles:update', 'roles', 'update'),
  (gen_random_uuid(), 'roles:delete', 'roles', 'delete'),
  (gen_random_uuid(), 'roles:assign_permisos', 'roles', 'assign_permisos'),
  -- Permisos
  (gen_random_uuid(), 'permisos:create', 'permisos', 'create'),
  (gen_random_uuid(), 'permisos:read', 'permisos', 'read'),
  -- Sesiones
  (gen_random_uuid(), 'sesiones:read_own', 'sesiones', 'read_own'),
  (gen_random_uuid(), 'sesiones:revoke_own', 'sesiones', 'revoke_own'),
  (gen_random_uuid(), 'sesiones:read_all', 'sesiones', 'read_all'),
  -- MP: Telefonos
  (gen_random_uuid(), 'telefonos:create', 'telefonos', 'create'),
  (gen_random_uuid(), 'telefonos:read', 'telefonos', 'read'),
  (gen_random_uuid(), 'telefonos:update', 'telefonos', 'update'),
  (gen_random_uuid(), 'telefonos:delete', 'telefonos', 'delete'),
  (gen_random_uuid(), 'telefonos:cambiar_estado', 'telefonos', 'cambiar_estado'),
  (gen_random_uuid(), 'telefonos:historial', 'telefonos', 'historial'),
  -- ... (resto de permisos MP)
  -- Materials
  (gen_random_uuid(), 'materiales:create', 'materiales', 'create'),
  (gen_random_uuid(), 'materiales:read', 'materiales', 'read'),
  (gen_random_uuid(), 'materiales:update', 'materiales', 'update'),
  (gen_random_uuid(), 'materiales:delete', 'materiales', 'delete'),
  (gen_random_uuid(), 'materiales:buscar', 'materiales', 'buscar'),
  (gen_random_uuid(), 'materiales:paginar', 'materiales', 'paginar'),
  -- ... (resto de permisos Materials)
```

---

## 7. Referencias

- [Estrategia de Seguridad](13_security.md)
- [Modelo de Dominio](07_domain_model.md)
- [Casos de Uso](03_use_cases.md)
- [Actores](02_actors.md)