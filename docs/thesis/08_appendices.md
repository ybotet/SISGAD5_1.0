# Tesis - Apéndices

## 8.1. Apéndice A: Diccionario de Términos

| Término | Definición |
|---------|-----------|
| **Queja** | Registro de incidencia reportada por cliente u operador |
| **Prioridad** | Nivel 1-4 calculado basado en tipo, servicio, ubicación y antigüedad. 1 = urgente, 4 = baja |
| **Prueba** | Registro de verificación técnica antes o después de trabajo |
| **Trabajo** | Orden de trabajo (OT) asignada a un técnico |
| **Asignación** | Distribución de materiales a un trabajador/trabajo |
| **Consumo** | Registro de materiales físicamente utilizados en un trabajo |
| **Saldo Lógico** | Cantidad asignada menos cantidad consumida (Σasignado - Σconsumido) |
| **Stock Bajo** | Saldo lógico < stock mínimo configurado |
| **Pizarra** | Distribuidor de conexiones en cabina |
| **Puerto** | Punto de conexión en una pizarra |
| **Técnico** | Usuario responsable de ejecutar pruebas y trabajos |
| **Operador** | Usuario que registra quejas y gestiona MP |
| **Analista** | Usuario que gestiona materiales y dashboards |
| **Jefe** | Usuario con permisos de asignación y cierre |
| **Estado FSM** | Estados válidos: Reportada, Priorizada, Abierta, EnProgreso, PendientePrueba, Cerrada, etc. |

## 8.2. Apéndice B: Matriz de Permisos (RBAC)

| Rol | Usuarios | Quejas | Pruebas | Trabajos | Materiales | Dashboard |
|-----|----------|--------|---------|----------|------------|-----------|
| **Operador** | 🔒 | CRUD | Read/Create | Read/Create | Read | Read |
| **Técnico** | Read | Asignar/CambiarEstado | Create | Cerrar/VerDetalle | Read/Consumir | Read |
| **Analista MP** | Read | Read | Read | Read | CRUD + Asignar/Consumir | Full |
| **Jefe** | Read | Asignar/Cerrar | Read | Crear/Cerrar | Read | Full |
| **Admin** | CRUD | Read | Read | Read | Read | Full |

## 8.3. Apéndice C: Configuración de Docker

### docker-compose.yml (extract)
```yaml
version: '3.8'

services:
  postgres-mp:
    image: postgres:16
    environment:
      POSTGRES_DB: mp_db
      POSTGRES_USER: sisgad
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sisgad"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

## 8.4. Apéndice D: Variables de Entorno

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `DB_HOST` | Todos | Host de PostgreSQL |
| `DB_PORT` | Todos | Puerto de PostgreSQL |
| `DB_NAME` | Todos | Nombre de base de datos |
| `DB_USER` | Todos | Usuario DB |
| `DB_PASSWORD` | Todos | Password DB |
| `REDIS_HOST` | Auth, Materials | Host de Redis |
| `REDIS_PORT` | Auth, Materials | Puerto de Redis |
| `RABBITMQ_URL` | MP, Materials | URL de RabbitMQ |
| `JWT_SECRET` | Auth | Secret para firmar JWT |
| `JWT_EXPIRY_MIN` | Auth | Minutos de expiración access token |
| `REFRESH_TOKEN_DAYS` | Auth | Días de expiración refresh token |
| `MAILJET_API_KEY` | MP | API key Mailjet |
| `MAILJET_API_SECRET` | MP | API secret Mailjet |
| `PRIORITY_WEIGHT_URGENT` | MP | Peso prioridad urgente |
| `PRIORITY_MAX_AGE_HOURS` | MP | Horas máximas para prioridad 1 |

## 8.5. Apéndice E: Comandos Útiles

```bash
# Generar Swagger docs
swag init -g cmd/server/main.go -o docs/swagger/

# Generar mocks
go generate ./...

# Ejecutar tests con coverage
go test ./... -coverprofile=coverage.out

# Ver coverage HTML
go tool cover -html=coverage.out

# Ejecutar linter
gofmt -l . && golangci-lint run

# Build
make build-all

# Migrar base de datos
migrate -path migrations/ -database $DB_URL up
```

## 8.6. Apéndice F: Tabla de Versiones

| Versión | Fecha | Cambios Principales |
|---------|-------|-------------------|
| v0.1.0 | 2026-06-01 | Estructura base, Auth MVP |
| v0.2.0 | 2026-07-15 | MP: Quejas + FSM |
| v0.3.0 | 2026-08-10 | Materials: Asignaciones + Consumos |
| v0.4.0 | 2026-08-25 | Concurrencia stock + Dashboard |
| v1.0.0 | 2026-09-20 | Release estable completa |

## 8.7. Referencias

- [Abstract](00_abstract.md)
- [Introducción](01_introduction.md)
- [Fundamentos](02_state_of_art.md)
- [Diseño](03_methodology.md)
- [Implementación](04_development.md)
- [Testing](05_results.md)
- [Resultados](06_conclusions.md)
