# Матрица RBAC (Роли × Разрешения × Эндпоинты) - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Роли системы

| Роль | Код | Описание | Уровень |
|------|-----|----------|---------|
| **Администратор** | `admin` | Полный доступ к системе, управление пользователями и настройка | 1 (Максимальный) |
| **Техник** | `tecnico` | Выполнение полевых работ, тестов, расход материалов | 2 |
| **Оператор** | `operador` | Регистрация и классификация жалоб, управление инфраструктурой | 2 |
| **Начальник** | `jefe` | Надзор, назначение техников, утверждение закрытий | 2 |
| **Аналитик** | `analista` | Управление каталогом материалов, назначения, дашборд | 2 |
| **Директор** | `director` | Только чтение: дашборды руководства, стратегические KPI | 3 (Только чтение) |
| **Аудитор** | `auditor` | Только чтение: трассируемость, логи аудита, истории | 3 (Только чтение) |

---

## 2. Разрешения по ресурсу и действию

### Формат: `ресурс:действие`

| Ресурс | create | read | update | delete | Специальные действия |
|--------|--------|------|--------|--------|---------------------|
| **users** | ✅ | ✅ | ✅ | ✅ (soft) | `assign_roles` |
| **roles** | ✅ | ✅ | ✅ | ✅ | `assign_permisos` |
| **permisos** | ✅ | ✅ | ❌ | ❌ | - |
| **sesiones** | ❌ | ✅ (own) | ❌ | ✅ (revoke own) | - |
| **auth** | register, login, refresh, logout, forgot, reset | - | - | - | - |

| Ресурс | create | read | update | delete | Специальные действия |
|--------|--------|------|--------|--------|---------------------|
| **telefonos** | ✅ | ✅ | ✅ | ✅ (soft) | `cambiar_estado`, `historial` |
| **lineas** | ✅ | ✅ | ✅ | ✅ (soft) | `cambiar_estado`, `historial` |
| **pizarras** | ✅ | ✅ | ✅ | ✅ (soft) | `puertos`, `historial`, `ubicacion` |
| **puertos** | ✅ | ✅ | ✅ | ✅ | - |
| **quejas** | ✅ | ✅ | ✅ | ❌ | `asignar`, `cambiar_estado`, `historial`, `auditoria` |
| **pruebas** | ✅ | ✅ | ✅ (own) | ❌ | - |
| **trabajos** | ✅ | ✅ | ✅ | ❌ | `asignar`, `cerrar` |
| **estadisticas_mp** | ❌ | ✅ | ❌ | ❌ | - |
| **catalogos_mp** | ❌ (admin) | ✅ | ❌ (admin) | ❌ (admin) | - |

| Ресурс | create | read | update | delete | Специальные действия |
|--------|--------|------|--------|--------|---------------------|
| **materiales** | ✅ | ✅ | ✅ | ✅ (soft) | `buscar`, `paginar` |
| **categorias** | ✅ | ✅ | ✅ | ✅ (soft, RESTRICT) | - |
| **unidades** | ✅ | ✅ | ✅ | ✅ (soft, RESTRICT) | - |
| **asignaciones** | ✅ | ✅ | ✅ (estado/obs) | ❌ | `items`, `validar_stock` |
| **consumos** | ✅ | ✅ | ❌ | ❌ | `validar_vs_asignacion` |
| **dashboard_mat** | ❌ | ✅ | ❌ | ❌ | `exportar`, `alertas` |

---

## 3. Полная матрица: Роль × Разрешение

| Разрешение | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|-----------|-------|---------|----------|------|----------|----------|---------|
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
| quejas:read | ✅ | ✅ (назначенные) | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| quejas:update | ✅ | ✅ (назначенные, статус) | ✅ (классификация) | ✅ | ❌ | ❌ | ❌ |
| quejas:asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| quejas:cambiar_estado | ✅ | ✅ (след. допустимый) | ✅ (Probada) | ✅ | ❌ | ❌ | ❌ |
| quejas:historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ✅ |
| quejas:auditoria | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ |
| pruebas:create | ✅ | ✅ (назначенные) | ❌ | ✅ | ❌ | ❌ | ❌ |
| pruebas:read | ✅ | ✅ (собственные) | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| pruebas:update | ✅ | ✅ (собственные) | ❌ | ❌ | ❌ | ❌ | ❌ |
| trabajos:create | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:read | ✅ | ✅ (назначенные) | 👁️ | ✅ | ❌ | 👁️ | 👁️ |
| trabajos:update | ✅ | ✅ (назначенные) | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| trabajos:cerrar | ✅ | ✅ (назначенные) | ❌ | ✅ | ❌ | ❌ | ❌ |
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
| asignaciones:read | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| asignaciones:update_estado | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | ❌ | ❌ |
| asignaciones:items | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| asignaciones:validar_stock | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| consumos:create | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| consumos:read | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| consumos:validar_vs_asignacion | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| dashboard_mat:read | ✅ | 👁️ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| dashboard_mat:exportar | ✅ | ❌ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| dashboard_mat:alertas | ✅ | ❌ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |

**Легенда:** ✅ = Разрешено | 👁️ = Только чтение | ❌ = Запрещено | (own) = Только собственные ресурсы | (назначенные) = Только ресурсы назначенные пользователю

---

## 4. Матрица: Роль × Эндпоинт (Сводка)

### Users Service

| Эндпоинт | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
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

| Эндпоинт | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
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
| GET /api/mp/quejas | ✅ | ✅ (назначенные) | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| POST /api/mp/quejas | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/quejas/:id/asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/quejas/:id/estado | ✅ | ✅ (след.) | ✅ (Prob.) | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/quejas/:id/historial | ✅ | ✅ | ✅ | ✅ | 👁️ | 👁️ | ✅ |
| GET /api/mp/quejas/:id/auditoria | ✅ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | ✅ |
| POST /api/mp/pruebas | ✅ | ✅ (назначенные) | ❌ | ✅ | ❌ | ❌ | ❌ |
| POST /api/mp/trabajos | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/trabajos/:id/asignar | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| PATCH /api/mp/trabajos/:id/cerrar | ✅ | ✅ (назначенные) | ❌ | ✅ | ❌ | ❌ | ❌ |
| GET /api/mp/estadisticas/resumen | ✅ | 👁️ | 👁️ | ✅ | 👁️ | ✅ | 👁️ |

### Materials Service

| Эндпоинт | Admin | Técnico | Operador | Jefe | Analista | Director | Auditor |
|----------|-------|---------|----------|------|----------|----------|---------|
| GET /api/materials/materiales | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/materiales | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| PUT /api/materials/materiales/:id | ✅ | ❌ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/categorias | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/categorias | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| GET /api/materials/unidades | ✅ | 👁️ | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/unidades | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| POST /api/materials/asignaciones | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/asignaciones | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| POST /api/materials/consumos | ✅ | ✅ | ❌ | 👁️ | ✅ | ❌ | ❌ |
| GET /api/materials/consumos | ✅ | ✅ (собственные) | ❌ | 👁️ | ✅ | 👁️ | 👁️ |
| GET /api/materials/dashboard/resumen | ✅ | 👁️ | ❌ | 👁️ | ✅ | ✅ | 👁️ |
| GET /api/materials/dashboard/exportar | ✅ | ❌ | ❌ | 👁️ | ✅ | ✅ | 👁️ |

---

## 5. Реализация в middleware

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

// Использование в маршрутах
router.post('/quejas', authMiddleware, requirePermission('quejas', 'create'), quejaController.create);
router.patch('/quejas/:id/asignar', authMiddleware, requirePermission('quejas', 'asignar'), quejaController.asignar);
```

### API Gateway (middleware/auth.js)
```javascript
// Проверка JWT и извлечение claims
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

// Ограничение скорости по IP
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 запросов в окно
  keyGenerator: (req) => req.ip
});
```

---

## 6. Предопределённые разрешения (Seed Data)

### Роли по умолчанию
```sql
INSERT INTO roles (id, nombre, descripcion) VALUES
  (gen_random_uuid(), 'admin', 'Administrador del sistema - acceso total'),
  (gen_random_uuid(), 'tecnico', 'Técnico de campo - ejecuta trabajos y pruebas'),
  (gen_random_uuid(), 'operador', 'Operador de mesa de ayuda - registra y clasifica quejas'),
  (gen_random_uuid(), 'jefe', 'Jefe departamento - supervisa y asigna'),
  (gen_random_uuid(), 'analista', 'Analista de materiales - gestiona catálogo y asignaciones'),
  (gen_random_uuid(), 'director', 'Director - vista ejecutiva de solo lectura'),
  (gen_random_uuid(), 'auditor', 'Auditor - trazabilidad y cumplimiento de solo lectura');
```

### Разрешения по умолчанию
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
  -- MP: Телефоны
  (gen_random_uuid(), 'telefonos:create', 'telefonos', 'create'),
  (gen_random_uuid(), 'telefonos:read', 'telefonos', 'read'),
  (gen_random_uuid(), 'telefonos:update', 'telefonos', 'update'),
  (gen_random_uuid(), 'telefonos:delete', 'telefonos', 'delete'),
  (gen_random_uuid(), 'telefonos:cambiar_estado', 'telefonos', 'cambiar_estado'),
  (gen_random_uuid(), 'telefonos:historial', 'telefonos', 'historial'),
  -- ... (остальные разрешения MP)
  -- Materials
  (gen_random_uuid(), 'materiales:create', 'materiales', 'create'),
  (gen_random_uuid(), 'materiales:read', 'materiales', 'read'),
  (gen_random_uuid(), 'materiales:update', 'materiales', 'update'),
  (gen_random_uuid(), 'materiales:delete', 'materiales', 'delete'),
  (gen_random_uuid(), 'materiales:buscar', 'materiales', 'buscar'),
  (gen_random_uuid(), 'materiales:paginar', 'materiales', 'paginar'),
  -- ... (остальные разрешения Materials)
```

---

## 7. Ссылки

- [Стратегия безопасности](13_security.ru.md)
- [Модель домена](07_domain_model.ru.md)
- [Варианты использования](03_use_cases.ru.md)
- [Актеры](02_actors.ru.md)
