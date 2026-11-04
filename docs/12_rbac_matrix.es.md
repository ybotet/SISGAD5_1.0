# Matriz RBAC (Roles × Permisos × Endpoints) - SISGAD5

> **Versión:** 1.1  
> **Fecha:** 2026-11-03  
> **Nota:** Roles alineados con `docs/02_actors.es.md` (Administrador, Probador, Editor, Supervisor, Analista de Materiales, Director).

---

## 1. Roles del Sistema

| Rol                        | Código                | Descripción                                                               | Nivel            |
| -------------------------- | --------------------- | ------------------------------------------------------------------------- | ---------------- |
| **Administrador**          | `admin`               | Acceso total al sistema, gestión de usuarios y configuración              | 1 (Máximo)       |
| **Probador**               | `probador`            | Primer contacto con quejas: registro, clasificación, derivación y pruebas | 2                |
| **Editor**                 | `editor`              | Trabajo con nomencladores: crear, modificar y eliminar datos maestros     | 2                |
| **Supervisor**             | `supervisor`          | Supervisión operativa: asignación de técnicos, seguimiento de KPIs        | 2                |
| **Analista de Materiales** | `analista_materiales` | Gestión de catálogo de materiales, asignaciones, consumos, dashboard      | 2                |
| **Director**               | `director`            | Visión estratégica: dashboards ejecutivos, solo lectura                   | 3 (Solo lectura) |

---

## 2. Permisos por Recurso y Acción

### Formato: `recurso:accion`

| Recurso      | create                                          | read     | update | delete          | Acciones Especiales |
| ------------ | ----------------------------------------------- | -------- | ------ | --------------- | ------------------- |
| **users**    | ✅                                              | ✅       | ✅     | ✅ (soft)       | `assign_roles`      |
| **roles**    | ✅                                              | ✅       | ✅     | ✅              | `assign_permisos`   |
| **permisos** | ✅                                              | ✅       | ❌     | ❌              | -                   |
| **sesiones** | ❌                                              | ✅ (own) | ❌     | ✅ (revoke own) | -                   |
| **auth**     | register, login, refresh, logout, forgot, reset | -        | -      | -               | -                   |

| Recurso             | create     | read | update     | delete     | Acciones Especiales                                   |
| ------------------- | ---------- | ---- | ---------- | ---------- | ----------------------------------------------------- |
| **telefonos**       | ✅         | ✅   | ✅         | ✅ (soft)  | `cambiar_estado`, `historial`                         |
| **lineas**          | ✅         | ✅   | ✅         | ✅ (soft)  | `cambiar_estado`, `historial`                         |
| **pizarras**        | ✅         | ✅   | ✅         | ✅ (soft)  | `historial`, `ubicacion`                              |
| **quejas**          | ✅         | ✅   | ✅         | ❌         | `asignar`, `cambiar_estado`, `historial`, `auditoria` |
| **pruebas**         | ✅         | ✅   | ✅ (own)   | ❌         | -                                                     |
| **trabajos**        | ✅         | ✅   | ✅         | ❌         | `asignar`, `cerrar`                                   |
| **estadisticas_mp** | ❌         | ✅   | ❌         | ❌         | -                                                     |
| **catalogos_mp**    | ❌ (admin) | ✅   | ❌ (admin) | ❌ (admin) | -                                                     |

| Recurso           | create | read | update          | delete              | Acciones Especiales      |
| ----------------- | ------ | ---- | --------------- | ------------------- | ------------------------ |
| **materiales**    | ✅     | ✅   | ✅              | ✅ (soft)           | `buscar`, `paginar`      |
| **categorias**    | ✅     | ✅   | ✅              | ✅ (soft, RESTRICT) | -                        |
| **unidades**      | ✅     | ✅   | ✅              | ✅ (soft, RESTRICT) | -                        |
| **asignaciones**  | ✅     | ✅   | ✅ (estado/obs) | ❌                  | `items`, `validar_stock` |
| **consumos**      | ✅     | ✅   | ❌              | ❌                  | `validar_vs_asignacion`  |
| **dashboard_mat** | ❌     | ✅   | ❌              | ❌                  | `exportar`, `alertas`    |

---

## 3. Matriz Completa: Rol × Permiso

| Permiso                        | Administrador | Probador              | Editor           | Supervisor | Analista de Materiales | Director |
| ------------------------------ | ------------- | --------------------- | ---------------- | ---------- | ---------------------- | -------- |
| **— **Users Service** —**      |               |                       |                  |            |                        |          |
| users:create                   | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| users:read                     | ✅            | ✅ (own)              | ✅ (own)         | ✅         | ✅ (own)               | ✅       |
| users:update                   | ✅            | ✅ (own profile)      | ✅ (own profile) | ❌         | ✅ (own profile)       | ❌       |
| users:delete                   | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| users:assign_roles             | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| roles:create                   | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| roles:read                     | ✅            | ❌                    | ❌               | ✅         | ❌                     | ✅       |
| roles:update                   | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| roles:delete                   | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| roles:assign_permisos          | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| permisos:create                | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| permisos:read                  | ✅            | ❌                    | ❌               | ✅         | ❌                     | ✅       |
| sesiones:read_own              | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| sesiones:revoke_own            | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| sesiones:read_all              | ✅            | ❌                    | ❌               | ✅         | ❌                     | ✅       |
| auth:register                  | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| auth:login                     | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| auth:refresh                   | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| auth:logout                    | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| auth:forgot_password           | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| auth:reset_password            | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| **— **MP Service** —**         |               |                       |                  |            |                        |          |
| telefonos:create               | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| telefonos:read                 | ✅            | ✅                    | ✅               | ❌         | ✅                     | ✅       |
| telefonos:update               | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| telefonos:delete               | ✅            | ❌                    | ✅               | ❌         | ❌                     | ❌       |
| telefonos:cambiar_estado       | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| telefonos:historial            | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| lineas:create                  | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| lineas:read                    | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| lineas:update                  | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| lineas:delete                  | ✅            | ❌                    | ✅               | ✅         | ❌                     | ❌       |
| lineas:cambiar_estado          | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| lineas:historial               | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| pizarras:create                | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| pizarras:read                  | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| pizarras:update                | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| pizarras:delete                | ✅            | ❌                    | ✅               | ❌         | ❌                     | ❌       |
| pizarras:historial             | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| pizarras:ubicacion             | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| quejas:create                  | ✅            | ✅                    | ✅               | ❌         | ❌                     | ❌       |
| quejas:read                    | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| quejas:update                  | ✅            | ✅ (estado)           | ✅               | ❌         | ❌                     | ❌       |
| quejas:asignar                 | ✅            | ❌                    | ❌               | ✅         | ❌                     | ❌       |
| quejas:cambiar_estado          | ✅            | ✅ (siguiente válido) | ✅ (Probada)     | ✅         | ❌                     | ❌       |
| quejas:historial               | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| quejas:auditoria               | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| pruebas:create                 | ✅            | ✅ (asignadas)        | ✅               | ❌         | ❌                     | ❌       |
| pruebas:read                   | ✅            | ✅ (propias)          | ✅               | ✅         | ❌                     | ✅       |
| pruebas:update                 | ✅            | ❌                    | ✅               | ❌         | ❌                     | ❌       |
| trabajos:create                | ✅            | ❌                    | ✅               | ✅         | ❌                     | ❌       |
| trabajos:read                  | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| trabajos:update                | ✅            | ✅ (asignados)        | ✅               | ✅         | ❌                     | ❌       |
| estadisticas_mp:read           | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| catalogos_mp:read              | ✅            | ✅                    | ✅               | ✅         | ✅                     | ✅       |
| catalogos_mp:write             | ✅            | ❌                    | ❌               | ❌         | ❌                     | ❌       |
| **— **Materials Service** —**  |               |                       |                  |            |                        |          |
| materiales:create              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| materiales:read                | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| materiales:update              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| materiales:delete              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| materiales:buscar              | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| materiales:paginar             | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| categorias:create              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| categorias:read                | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| categorias:update              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| categorias:delete              | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| unidades:create                | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| unidades:read                  | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| unidades:update                | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| unidades:delete                | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| asignaciones:create            | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| asignaciones:read              | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| asignaciones:update_estado     | ✅            | ❌                    | ❌               | ✅         | ✅                     | ❌       |
| asignaciones:items             | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| asignaciones:validar_stock     | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| consumos:create                | ✅            | ❌                    | ❌               | ✅         | ✅                     | ❌       |
| consumos:read                  | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| consumos:validar_vs_asignacion | ✅            | ❌                    | ❌               | ❌         | ✅                     | ❌       |
| dashboard_mat:read             | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| dashboard_mat:exportar         | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |
| dashboard_mat:alertas          | ✅            | ❌                    | ❌               | ✅         | ✅                     | ✅       |

**Leyenda:** ✅ = Permitido | ✅ = Solo lectura | ❌ = Denegado | (own) = Solo propios recursos | (asignadas) = Solo recursos asignados al usuario

---

## 4. Matriz: Rol × Endpoint (Resumen)

### Users Service

| Endpoint                       | Administrador | Probador | Editor   | Supervisor | Analista de Materiales | Director |
| ------------------------------ | ------------- | -------- | -------- | ---------- | ---------------------- | -------- |
| POST /api/auth/register        | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| POST /api/auth/login           | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| POST /api/auth/refresh         | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| POST /api/auth/logout          | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| POST /api/auth/forgot-password | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| POST /api/auth/reset-password  | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| PUT /api/auth/me/password      | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |
| GET /api/users                 | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| POST /api/users                | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| GET /api/users/:id             | ✅            | ✅ (own) | ✅ (own) | ✅ (own)   | ✅ (own)               | ✅ (own) |
| PUT /api/users/:id             | ✅            | ✅ (own) | ✅ (own) | ✅ (own)   | ✅ (own)               | ✅ (own) |
| DELETE /api/users/:id          | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| GET /api/users/:id/sessions    | ✅            | ✅ (own) | ✅ (own) | ✅ (own)   | ✅ (own)               | ✅ (own) |
| PUT /api/users/:id/roles       | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| GET /api/roles                 | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| POST /api/roles                | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| PUT /api/roles/:id/permisos    | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| GET /api/permisos              | ✅            | ❌       | ❌       | ❌         | ❌                     | ❌       |
| GET /health                    | ✅            | ✅       | ✅       | ✅         | ✅                     | ✅       |

### MP Service

| Endpoint                            | Administrador | Probador       | Editor     | Supervisor | Analista de Materiales | Director |
| ----------------------------------- | ------------- | -------------- | ---------- | ---------- | ---------------------- | -------- |
| GET /api/mp/telefonos               | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| POST /api/mp/telefonos              | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| PATCH /api/mp/telefonos/:id/estado  | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| GET /api/mp/telefonos/:id/historial | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| GET /api/mp/lineas                  | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| POST /api/mp/lineas                 | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| PATCH /api/mp/lineas/:id/estado     | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| GET /api/mp/pizarras                | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| POST /api/mp/pizarras               | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| GET /api/mp/quejas                  | ✅            | ✅ (asignadas) | ✅         | ✅         | ✅                     | ✅       |
| POST /api/mp/quejas                 | ✅            | ✅             | ✅         | ❌         | ❌                     | ❌       |
| PATCH /api/mp/quejas/:id/asignar    | ✅            | ❌             | ❌         | ✅         | ❌                     | ❌       |
| PATCH /api/mp/quejas/:id/estado     | ✅            | ✅ (sig.)      | ✅ (Prob.) | ❌         | ❌                     | ❌       |
| GET /api/mp/quejas/:id/historial    | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| GET /api/mp/quejas/:id/auditoria    | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |
| POST /api/mp/pruebas                | ✅            | ✅ (asig.)     | ✅         | ❌         | ❌                     | ❌       |
| POST /api/mp/trabajos               | ✅            | ✅             | ❌         | ❌         | ❌                     | ❌       |
| GET /api/mp/estadisticas/resumen    | ✅            | ✅             | ✅         | ✅         | ✅                     | ✅       |

### Materials Service

| Endpoint                              | Administrador | Probador | Editor | Supervisor | Analista de Materiales | Director |
| ------------------------------------- | ------------- | -------- | ------ | ---------- | ---------------------- | -------- |
| GET /api/materials/materiales         | ✅            | ❌       | ❌     | ✅         | ✅                     | ✅       |
| POST /api/materials/materiales        | ✅            | ❌       | ❌     | ❌         | ✅                     | ❌       |
| PUT /api/materials/materiales/:id     | ✅            | ❌       | ❌     | ❌         | ✅                     | ❌       |
| GET /api/materials/categorias         | ✅            | ❌       | ❌     | ✅         | ✅                     | ✅       |
| POST /api/materials/categorias        | ✅            | ❌       | ❌     | ❌         | ✅                     | ❌       |
| GET /api/materials/unidades           | ✅            | ❌       | ❌     | ❌         | ✅                     | ✅       |
| POST /api/materials/unidades          | ✅            | ❌       | ❌     | ❌         | ✅                     | ❌       |
| POST /api/materials/asignaciones      | ✅            | ❌       | ❌     | ❌         | ✅                     | ❌       |
| GET /api/materials/asignaciones       | ✅            | ❌       | ❌     | ✅         | ✅                     | ✅       |
| POST /api/materials/consumos          | ✅            | ❌       | ❌     | ✅         | ✅                     | ❌       |
| GET /api/materials/consumos           | ✅            | ❌       | ❌     | ✅         | ✅                     | ✅       |
| GET /api/materials/dashboard/resumen  | ✅            | ✅       | ❌     | ✅         | ✅                     | ✅       |
| GET /api/materials/dashboard/exportar | ✅            | ❌       | ❌     | ✅         | ✅                     | ✅       |

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
  (gen_random_uuid(), 'probador', 'Probador - registra, clasifica y deriva quejas, ejecuta pruebas'),
  (gen_random_uuid(), 'editor', 'Editor - corrige errores y consolida datos/nomencladores'),
  (gen_random_uuid(), 'supervisor', 'Supervisor - asigna técnicos y supervisa operaciones'),
  (gen_random_uuid(), 'analista_materiales', 'Analista de Materiales - gestiona catálogo y asignaciones'),
  (gen_random_uuid(), 'director', 'Director - vista ejecutiva de solo lectura');
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

- [Estrategia de Seguridad](13_security.es.md)
- [Modelo de Dominio](07_domain_model.es.md)
- [Casos de Uso](03_use_cases.es.md)
- [Actores](02_actors.es.md)