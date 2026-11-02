# Tesis - Implementación

## 4.1. Microservicio de Usuarios (backend-users)

### Tecnologías
- Go 1.22
- PostgreSQL (users_db)
- Redis (sessions cache, rate limiting)
- Echo Framework
- JWT + bcrypt

### Funcionalidades Implementadas
- Registro de usuarios con validación de email único
- Login con rate limiting (5 intentos → bloqueo 15 min)
- Refresh token con revocación
- Roles y permisos RBAC
- Cambio de contraseña
- Listado y paginación de usuarios

### Endpoints Principales
```
POST   /api/auth/register       # Registrar usuario
POST   /api/auth/login          # Login + tokens
POST   /api/auth/refresh        # Renovar access token
POST   /api/auth/logout         # Revocar sesión
GET    /api/auth/me             # Perfil actual
PUT    /api/auth/me/password    # Cambiar contraseña
GET    /api/users               # Listar usuarios
POST   /api/users               # Crear usuario
GET    /api/users/{id}          # Ver detalle
PUT    /api/users/{id}/roles    # Asignar roles
GET    /api/roles               # Listar roles
POST   /api/roles               # Crear rol
```

## 4.2. Microservicio de Infraestructura MP (backend-mp)

### Tecnologías
- Go 1.22
- PostgreSQL (mp_db)
- RabbitMQ (eventos de dominio)
- Mailjet API (notificaciones)
- Echo Framework

### Funcionalidades Implementadas
- CRUD de Teléfonos, Líneas, Pizarras, Puertos
- Gestión de conectores entre puertos
- Registro y seguimiento de Quejas
- Calculadora de prioridades (BR-03)
- FSM para estados de queja (BR-04)
- Registro de Pruebas de red
- Gestión de Órdenes de Trabajo
- Movimientos de infraestructura

### Endpoints Principales
```
POST   /api/mp/quejas                   # Reportar queja
GET    /api/mp/quejas                   # Listar quejas (con filtros)
GET    /api/mp/quejas/{id}              # Ver detalle
PATCH  /api/mp/quejas/{id}/estado       # Cambiar estado (FSM)
PATCH  /api/mp/quejas/{id}/asignar      # Asignar técnico
POST   /api/mp/pruebas                  # Registrar prueba
POST   /api/mp/trabajos                 # Crear orden de trabajo
PATCH  /api/mp/trabajos/{id}/cerrar     # Cerrar trabajo
GET    /api/mp/telefonos                # Listar teléfonos
POST   /api/mp/telefonos                # Crear teléfono
GET    /api/mp/pizarras                 # Listar pizarras
POST   /api/mp/pizarras                 # Crear pizarra
```

## 4.3. Microservicio de Materiales (backend-materiales-go)

### Tecnologías
- Go 1.22
- PostgreSQL (materials_db)
- Redis (locks distribuidos, stock)
- RabbitMQ (eventos de dominio)
- Echo Framework

### Funcionalidades Implementadas
- CRUD de Materiales, Categorías, Unidades
- Creación y gestión de Asignaciones (con concurrencia)
- Creación y gestión de Consumos (con validación)
- Cálculo de saldo lógico en tiempo real
- Alertas de stock bajo
- Dashboard con KPIs

### Concurrencia Implementada
```go
// Uso de goroutines y Mutex para validación atómica de stock
func (s *AsignacionService) CrearAsignacionConcurrente(req AsignacionRequest) (*Asignacion, error) {
    // Validar todo o nada (transaccional)
    stockValido, err := s.verificarStockConcurrente(req.Items)
    if err != nil || !stockValido {
        return nil, ErrInsufficientStock
    }
    
    // Bloquear y decrementar stock
    for _, item := range req.Items {
        if err := s.locker.Acquire(item.MaterialID, time.Second*5); err != nil {
            return nil, ErrConcurrentAccess
        }
        defer s.locker.Release(item.MaterialID)
    }
    
    // Guardar atomicamente
    return s.asignacionRepo.Save(req)
}
```

### Endpoints Principales
```
POST   /api/materials/materiales          # Crear material
GET    /api/materials/materiales          # Listar
POST   /api/materials/asignaciones        # Crear asignación
GET    /api/materials/asignaciones        # Listar asignaciones
POST   /api/materials/consumos            # Crear consumo
GET    /api/materials/dashboard           # KPIs materiales
GET    /api/materials/saldos              # Saldo lógico
GET    /api/materials/categorias          # Listar categorías
GET    /api/materials/unidades            # Listar unidades
```

## 4.4. API Gateway

### Configuración
- Traefik o Nginx como reverse proxy
- Rutas agrupadas por servicio:
  - `/api/auth/*` → backend-users
  - `/api/mp/*` → backend-mp
  - `/api/materials/*` → backend-materiales-go

### Middleware Global
- JWT validation
- Rate limiting
- CORS
- Logging (Zap)
- Compression (gzip)
- Request ID

## 4.5. Monitoreo e Infraestructura

### Prometheus Metrics
- Métricas de aplicación: request count, latency, error rate
- Métricas de sistema: CPU, memory, goroutines
- Métricas de negocio: quejas creadas, trabajos cerrados, stock bajo

### Grafana Dashboards
- Service Health (latencia, errores)
- Business Metrics (quejas/trabajo/pruebas por día)
- System Metrics (CPU, memory, GC)
- Materials Dashboard (asignaciones/consumos/stock)

### Logging con Loki
- Structured logging con Zap
- Labels: service, level, method, path
- Correlación con Request IDs

## 4.6. Referencias

- [UML Estático](../practices/practice_05_uml_static.md)
- [UML Dinámico](../practices/practice_06_uml_dynamic.md)
- [API Reference](../api/mp_reference.md)