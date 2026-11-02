# Contratos de API (Índice) - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25  
> **Estándar:** OpenAPI 3.0 (YAML)

---

## 1. Índice de Contratos

| Servicio | Archivo | Endpoint Base | Estado |
|----------|---------|---------------|--------|
| **Users Service** | [`api/users.yaml`](api/users.yaml) | `/api/users` | ⏳ Pendiente |
| **MP Service** | [`api/mp.yaml`](api/mp.yaml) | `/api/mp` | ⏳ Pendiente |
| **Materials Service** | [`api/materials.yaml`](api/materials.yaml) | `/api/materials` | ✅ Implementado (Go Swagger) |
| **API Gateway** | [`api/gateway.yaml`](api/gateway.yaml) | `/` (proxy) | ⏳ Pendiente |

---

## 2. Users Service - Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario | No |
| POST | `/login` | Login → access + refresh token | No |
| POST | `/refresh` | Renovar access token | Refresh Token |
| POST | `/logout` | Invalidar refresh token | Access Token |
| POST | `/forgot-password` | Solicitar reset password | No |
| POST | `/reset-password` | Resetear password con token | No |
| PUT | `/me/password` | Cambiar password (autenticado) | Access Token |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Listar usuarios (paginado, filtros) | Access Token | Admin |
| POST | `/` | Crear usuario | Access Token | Admin |
| GET | `/:id` | Obtener usuario por ID | Access Token | Admin, Owner |
| PUT | `/:id` | Actualizar usuario | Access Token | Admin, Owner |
| DELETE | `/:id` | Eliminar usuario (soft) | Access Token | Admin |
| GET | `/:id/sessions` | Historial de sesiones | Access Token | Admin, Owner |
| PUT | `/:id/roles` | Asignar roles a usuario | Access Token | Admin |

### Roles (`/api/roles`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Listar roles | Access Token | Admin |
| POST | `/` | Crear rol | Access Token | Admin |
| GET | `/:id` | Obtener rol con permisos | Access Token | Admin |
| PUT | `/:id` | Actualizar rol | Access Token | Admin |
| DELETE | `/:id` | Eliminar rol | Access Token | Admin |
| PUT | `/:id/permisos` | Asignar permisos a rol | Access Token | Admin |

### Permisos (`/api/permisos`)

| Método | Endpoint | Descripción | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Listar permisos | Access Token | Admin |
| POST | `/` | Crear permiso | Access Token | Admin |

### Salud

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

---

## 3. MP Service - Endpoints

### Teléfonos (`/api/mp/telefonos`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, búsqueda, filtros) | Access Token |
| POST | `/` | Crear teléfono | Access Token |
| GET | `/:id` | Obtener teléfono | Access Token |
| PUT | `/:id` | Actualizar teléfono | Access Token |
| PATCH | `/:id/estado` | Cambiar estado (activo/baja) | Access Token |
| DELETE | `/:id` | Eliminar (soft) | Access Token |
| GET | `/:id/historial` | Historial completo (quejas, recorridos, movimientos) | Access Token |

### Líneas (`/api/mp/lineas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, búsqueda, filtros) | Access Token |
| POST | `/` | Crear línea | Access Token |
| GET | `/:id` | Obtener línea | Access Token |
| PUT | `/:id` | Actualizar línea | Access Token |
| PATCH | `/:id/estado` | Cambiar estado (activo/baja) | Access Token |
| DELETE | `/:id` | Eliminar (soft) | Access Token |
| GET | `/:id/historial` | Historial completo | Access Token |

### Pizarras (`/api/mp/pizarras`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, búsqueda, filtros) | Access Token |
| POST | `/` | Crear pizarra | Access Token |
| GET | `/:id` | Obtener pizarra | Access Token |
| PUT | `/:id` | Actualizar pizarra | Access Token |
| DELETE | `/:id` | Eliminar (soft) | Access Token |
| GET | `/:id/historial` | Historial completo | Access Token |
| GET | `/:id/puertos` | Listar puertos | Access Token |
| POST | `/:id/puertos` | Crear puerto | Access Token |
| PUT | `/:id/puertos/:puertoId` | Actualizar puerto | Access Token |
| DELETE | `/:id/puertos/:puertoId` | Eliminar puerto | Access Token |

### Quejas (`/api/mp/quejas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, filtros: estado, fecha, técnico, prioridad, tipo) | Access Token |
| POST | `/` | Crear queja | Access Token |
| GET | `/:id` | Obtener queja con detalles (pruebas, trabajos, flujo) | Access Token |
| PUT | `/:id` | Actualizar queja (estado, prioridad, tipo, clave) | Access Token |
| PATCH | `/:id/asignar` | Asignar técnico | Access Token |
| PATCH | `/:id/estado` | Cambiar estado (validando flujo) | Access Token |
| GET | `/:id/historial` | Historial de cambios de estado | Access Token |
| GET | `/:id/auditoria` | Auditoría de acciones | Access Token |

### Pruebas (`/api/mp/pruebas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, filtros) | Access Token |
| POST | `/` | Registrar prueba | Access Token |
| GET | `/:id` | Obtener prueba | Access Token |
| PUT | `/:id` | Actualizar prueba | Access Token |

### Trabajos (`/api/mp/trabajos`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, filtros) | Access Token |
| POST | `/` | Crear orden de trabajo | Access Token |
| GET | `/:id` | Obtener trabajo | Access Token |
| PUT | `/:id` | Actualizar trabajo | Access Token |
| PATCH | `/:id/asignar` | Asignar técnico | Access Token |
| PATCH | `/:id/cerrar` | Cerrar trabajo (requiere tiempo real) | Access Token |

### Estadísticas (`/api/mp/estadisticas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/resumen` | KPIs agregados | Access Token |
| GET | `/metricas` | Métricas por fecha/servicio | Access Token |

### Catálogos MP (Solo lectura para la mayoría)

| Recurso | Endpoints |
|---------|-----------|
| Tipos Queja | GET `/api/mp/tipos-queja`, GET `/:id` |
| Servicios | GET `/api/mp/servicios`, GET `/:id` |
| Ubicaciones | GET `/api/mp/ubicaciones`, GET `/:id` |
| Claves | GET `/api/mp/claves`, GET `/:id` |
| Tipos Línea | GET `/api/mp/tipos-linea`, GET `/:id` |
| Tipos Pizarra | GET `/api/mp/tipos-pizarra`, GET `/:id` |
| Clasificaciones | GET `/api/mp/clasificaciones`, GET `/:id` |
| Clasificador Clave | GET `/api/mp/clasificador-clave`, GET `/:id` |
| Claves | GET `/api/mp/claves`, GET `/:id` |
| Cables | GET `/api/mp/cables`, GET `/:id` |
| Señalizaciones | GET `/api/mp/senalizaciones`, GET `/:id` |
| Sistemas | GET `/api/mp/sistemas`, GET `/:id` |
| Plantas | GET `/api/mp/plantas`, GET `/:id` |
| Propietarios | GET `/api/mp/propietarios`, GET `/:id` |
| Mandos | GET `/api/mp/mandos`, GET `/:id` |
| Grupos Trabajo | GET `/api/mp/grupos-trabajo`, GET `/:id` |
| Tipos Movimiento | GET `/api/mp/tipos-movimiento`, GET `/:id` |

### Salud

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

---

## 4. Materials Service - Endpoints

### Materiales (`/api/materials/materiales`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, búsqueda, filtros categoría/unidad) | Access Token |
| POST | `/` | Crear material | Access Token |
| GET | `/:id` | Obtener material | Access Token |
| PUT | `/:id` | Actualizar material | Access Token |
| DELETE | `/:id` | Eliminar (soft) | Access Token |

### Categorías (`/api/materials/categorias`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar | Access Token |
| POST | `/` | Crear categoría | Access Token |
| GET | `/:id` | Obtener categoría | Access Token |
| PUT | `/:id` | Actualizar categoría | Access Token |
| DELETE | `/:id` | Eliminar (soft, RESTRICT si tiene materiales) | Access Token |

### Unidades de Medida (`/api/materials/unidades`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar | Access Token |
| POST | `/` | Crear unidad | Access Token |
| GET | `/:id` | Obtener unidad | Access Token |
| PUT | `/:id` | Actualizar unidad | Access Token |
| DELETE | `/:id` | Eliminar (soft, RESTRICT si tiene materiales) | Access Token |

### Asignaciones (`/api/materials/asignaciones`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, filtros) | Access Token |
| POST | `/` | Crear asignación (múltiples items, transacción ACID) | Access Token |
| GET | `/:id` | Obtener asignación con items | Access Token |
| PUT | `/:id` | Actualizar asignación (solo estado/obs) | Access Token |

### Consumos (`/api/materials/consumos`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar (paginado, filtros) | Access Token |
| POST | `/` | Registrar consumo (múltiples items, transacción ACID, validar vs asignación) | Access Token |
| GET | `/:id` | Obtener consumo con items | Access Token |

### Dashboard (`/api/materials/dashboard`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/resumen` | Resumen general (KPIs) | Access Token |
| GET | `/distribucion/categorias` | Distribución por categorías | Access Token |
| GET | `/distribucion/unidades` | Distribución por unidades | Access Token |
| GET | `/saldo/trabajadores` | Saldo lógico por trabajador | Access Token |
| GET | `/alertas/stock-bajo` | Alertas de stock bajo | Access Token |
| GET | `/exportar` | Exportar CSV/JSON (`?format=csv\|json`) | Access Token |

### Salud

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

---

## 5. API Gateway - Endpoints

### Proxy (Enrutamiento)

| Servicio | Prefijo | Target |
|----------|---------|--------|
| Users | `/api/users/**` | `http://backend-users:3000` |
| Users Auth | `/api/auth/**` | `http://backend-users:3000` |
| MP | `/api/mp/**` | `http://backend-mp:3000` |
| Materials | `/api/materials/**` | `http://backend-materiales-go:8080` |

### Middleware Gateway

| Función | Descripción |
|---------|-------------|
| JWT Verification | Validar firma, expiración, extraer claims |
| Rate Limiting | Límite por IP (configurable) |
| CORS | Orígenes permitidos configurables |
| Logging | JSON estructurado con correlation-id |
| Error Handling | Formato unificado: `{success: false, error: {code, message, statusCode}}` |

### Salud Agregada

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Agrega health de todos los servicios |

---

## 6. Formato de Respuesta Estándar

### Éxito
```json
{
  "success": true,
  "data": T,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible",
    "statusCode": 400,
    "details": {}
  }
}
```

### Códigos de Error Comunes

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Datos de entrada inválidos |
| `UNAUTHORIZED` | 401 | Token inválido/ausente |
| `FORBIDDEN` | 403 | Sin permisos para el recurso |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Recurso duplicado / transición inválida |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
| `SERVICE_UNAVAILABLE` | 503 | Servicio downstream no disponible |

---

## 7. Convenciones de Contratos

- **Naming:** snake_case para parámetros, camelCase para propiedades JSON
- **Paginación:** `?page=1&limit=10` (max 100)
- **Ordenación:** `?sortBy=campo&sortOrder=ASC|DESC`
- **Búsqueda:** `?search=texto` (campos relevantes por entidad)
- **Filtros:** `?campo=valor` (igualdad exacta) o `?campo[in]=val1,val2`
- **Fechas:** ISO 8601 (`2026-09-25T10:30:00Z`)
- **IDs:** UUID para usuarios/sesiones, Integer autoinc para catálogos/entidades MP/Materials

---

## 8. Referencias

- [Users Service OpenAPI](api/users.yaml)
- [MP Service OpenAPI](api/mp.yaml)
- [Materials Service OpenAPI](api/materials.yaml)
- [API Gateway OpenAPI](api/gateway.yaml)
- [Estrategia de Seguridad](13_security.md)
- [Matriz RBAC](12_rbac_matrix.md)