# Tesis - Diseño del Sistema (Arquitectura)

## 3.1. Visión General

SISGAD5 sigue una arquitectura de **hexágono (Ports & Adapters)** combinada con **Clean Architecture** adaptada a Go. Cada microservicio implementa:

- **Domain Layer:** Entidades, value objects, agregados, reglas de negocio puras
- **Application Layer:** Servicios de aplicación, casos de uso, DTOs
- **Infrastructure Layer:** Repositorios (implementación), event bus, email, storage, middleware
- **Presentation Layer:** HTTP handlers/controllers, middleware, validadores

### Estructura de Directorios (per microservice)

```
backend-[service]/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── domain/
│   │   ├── model/          # Entidades y Value Objects
│   │   │   ├── [entity].go
│   │   │   └── [value_object].go
│   │   ├── repository/       # Interfaces (puertos)
│   │   │   └── [entity]_repository.go
│   │   └── event/            # Eventos de dominio
│   │       └── [entity]_event.go
│   ├── application/
│   │   ├── service/          # Servicios de aplicación
│   │   │   └── [entity]_service.go
│   │   ├── dto/              # Data Transfer Objects
│   │   └── query/            # Query handlers (read model)
│   ├── infrastructure/
│   │   ├── persistence/      # Implementación repositorios (adaptadores)
│   │   │   ├── postgres/
│   │   │   └── redis/
│   │   ├── eventbus/         # RabbitMQ adapter
│   │   ├── email/            # Mailjet/Sendgrid adapter
│   │   └── middleware/       # Logger, CORS, RateLimit, JWT
│   └── presentation/
│       ├── http/
│       │   ├── handler/      # Handlers HTTP
│       │   ├── controller/   # Controllers
│       │   ├── router/       # Rutas y middleware
│       │   └── middleware/
│       └── swagger/
│   └── pkg/                   # Shared utilities
├── scripts/
├── tests/
├── Dockerfile
├── docker-compose.yml
├── .env
├── .env.example
└── go.mod
```

## 3.2. Diagrama de Componentes

```mermaid
graph TD
    subgraph "Frontend"
        WEB[Web App React\n(admin/dashboard)]
    end
    
    subgraph "API Gateway"
        GW[Traefik/Nginx\nRouting + TLS + Rate Limit]
    end
    
    subgraph "Auth Service"
        AUTH_API[HTTP Handler]
        AUTH_APP[Auth Service\nApplication Layer]
        AUTH_DOMAIN[User/Sesion\nDomain Layer]
        AUTH_DB[(PostgreSQL\nusers_db)]
        AUTH_REDIS[(Redis\nSessions Cache)]
    end
    
    subgraph "MP Service"
        MP_API[HTTP Handler]
        MP_APP[Queja/Prueba/Trabajo\nServices]
        MP_DOMAIN[Queja/Trabajo/Prueba\nDomain Layer]
        MP_DB[(PostgreSQL\nmp_db)]
        MP_RABBIT[(RabbitMQ\nEvents)]
        MP_MAIL[Mailjet API]
    end
    
    subgraph "Materials Service"
        MAT_API[HTTP Handler]
        MAT_APP[Material/Asignacion/Consumo\nServices]
        MAT_DOMAIN[Material/Asignacion/Consumo\nDomain Layer]
        MAT_DB[(PostgreSQL\nmaterials_db)]
        MAT_REDIS[(Redis\nStock Locks)]
        MAT_RABBIT[(RabbitMQ\nEvents)]
    end
    
    %% External
    PROM[Prometheus\nMetrics]
    GRAF[Grafana\nDashboards]
    LOKI[Loki\nLogs]
    
    WEB --> GW
    GW --> AUTH_API
    GW --> MP_API
    GW --> MAT_API
    
    AUTH_API --> AUTH_APP
    AUTH_APP --> AUTH_DOMAIN
    AUTH_DOMAIN --> AUTH_DB
    AUTH_DOMAIN --> AUTH_REDIS
    
    MP_API --> MP_APP
    MP_APP --> MP_DOMAIN
    MP_DOMAIN --> MP_DB
    MP_DOMAIN --> MP_RABBIT
    MP_DOMAIN --> MP_MAIL
    
    MAT_API --> MAT_APP
    MAT_APP --> MAT_DOMAIN
    MAT_DOMAIN --> MAT_DB
    MAT_DOMAIN --> MAT_REDIS
    MAT_DOMAIN --> MAT_RABBIT
    
    AUTH_DOMAIN --> PROM
    MP_DOMAIN --> PROM
    MAT_DOMAIN --> PROM
    
    PROM --> GRAF
    LOKI --> GRAF
    
    AUTH_DOMAIN -.->|UserCreated| MP_DOMAIN
    MP_DOMAIN -.->|QuejaCerrada| MAT_DOMAIN
    
    classDef service fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef db fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef gateway fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    class AUTH_API,AUTH_APP,AUTH_DOMAIN,MP_API,MP_APP,MP_DOMAIN,MAT_API,MAT_APP,MAT_DOMAIN service
    class AUTH_DB,MP_DB,MAT_DB db
    class PROM,GRAF,LOKI,MP_RABBIT,MP_MAIL,MAT_REDIS,AUTH_REDIS external
    class GW,WEB gateway
```

## 3.3. Patrones de Diseño Implementados

### 3.3.1. Repositorio (Repository Pattern)
```go
// Puerta (interface) en domain/repository
type UserRepository interface {
    FindByID(id string) (*User, error)
    FindByEmail(email string) (*User, error)
    Save(user *User) error
    Delete(id string) error
}

// Adaptador en infrastructure/persistence/postgres
type PostgresUserRepository struct {
    db *sqlx.DB
}
```

### 3.3.2. Servicio de Dominio
- Encapsula lógica de negocio compleja que no pertenece a una sola entidad

### 3.3.3. Factory
- `NewUser()`, `NewQueja()`, `NewAsignacion()` - validan invariantes en creación

### 3.3.4. Specification
- `Queja.puedeTransicionar(estado)` - FSM implementation

### 3.3.5. Observer (Eventos)
- `EventBus.publish()` - eventos de dominio publicados a RabbitMQ

### 3.3.6. Decorator
- Middleware JWT, Logger, RateLimitador decoran handlers HTTP

### 3.3.7. Strategy
- Cálculo de prioridad configurable vía pesos

### 3.3.8. Circuit Breaker
- Implementado con Hystrix-like pattern para llamadas a APIs externas

## 3.4. Seguridad

- **Autenticación:** JWT con access token (15 min) + refresh token (7 días)
- **Autorización:** RBAC con roles y permisos granulares
- **Validación:** Input validation en todos los endpoints (echo/validator)
- **Rate Limiting:** Por IP y por usuario (Redis-based)
- **CORS:** Configurado por origen permitido
- **Headers de Seguridad:** X-Content-Type-Options, X-Frame-Options, CSP
- **Secrets Management:** Variables de entorno (.env no versionadas)

## 3.5. Decisiones Tecnológicas

| Categoría | Tecnología | Justificación |
|-----------|------------|---------------|
| Lenguaje | Go 1.22+ | Concurrencia, rendimiento, simplicidad |
| Framework HTTP | Echo | Ligero, middleware flexible, validación |
| DB Principal | PostgreSQL 16 | ACID, JSONB, madurez |
| Cache/DB Secundaria | Redis 7 | Locks distribuidos, caché, rate limit |
| Eventos | RabbitMQ | Mensajería confiable, AMQP |
| Autenticación | JWT + bcrypt | Estándar, seguro, stateless |
| Envío Email | Mailjet API | API REST, buena deliverabilidad |
| Contenerización | Docker | Portabilidad |
| Orchestración | Docker Compose | Simple para dev/prod |
| Monitoreo | Prometheus + Grafana | Métricas estándar, dashboards |
| Logging | Loki + Promtail | Agregación centralizada, eficiente |
| Testing | Go testing + Testcontainers | Integration tests con contenedores reales |
| CI/CD | GitHub Actions | Integrado con GitHub, fácil de usar |
| Documentación API | Swagger/OpenAPI | Auto-generada, interactiva |

## 3.6. Referencias

- [User Story Map](../practices/practice_02_user_story_map.md)
- [Event Storming](../practices/practice_03_event_storming.md)
- [UML Estático](../practices/practice_05_uml_static.md)
- [Casos de Uso](../03_use_cases.md)
- [Modelo Entidad-Relación](../10_uml_diagrams.md)