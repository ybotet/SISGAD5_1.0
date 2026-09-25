# 📐 ARCHITECTURE.md — Arquitectura Técnica de SISGAD5

> **Versión:** 1.0  
> **Relacionado:** [SPEC.md](./SPEC.md), [Tesis 03 - Diseño](./docs/thesis/03_methodology.md)

---

## 1. Resumen Ejecutivo

SISGAD5 utiliza una **arquitectura de microservicios** con los siguientes principios:

- **4 contextos delimitados** (Auth, MP, Materials, Shared Kernel)
- **API Gateway** como única puerta de entrada
- **Bases de datos separadas** por servicio (PostgreSQL × 3)
- **Stateless** services (JWT, Redis para sesiones)
- **Docker + Docker Compose** para orquestación

## 2. Componentes

| Componente | Tecnología | Puerto | Responsabilidad |
|------------|------------|--------|-----------------|
| **Frontend** | React 18 + Vite + TS | 5004 | SPA responsiva |
| **API Gateway** | Node.js + Express | 5000 | Enrutamiento, auth, rate limit |
| **Users Service** | Node.js + Express + Sequelize | 5001 | Auth, usuarios, RBAC |
| **MP Service** | Node.js + Express + Sequelize + Zod | 5002 | Quejas, pruebas, trabajos, infraestructura |
| **Materials Service** | Go + Gin + GORM | 5003 | Materiales, asignaciones, consumos |
| **PostgreSQL** | PostgreSQL 17 | 5432 | Persistencia (3 BDs) |
| **Redis** | Redis 7 | 6379 | Caché, sessions, locks |
| **Prometheus** | Prometheus | 9090 | Métricas |
| **Grafana** | Grafana | 3000 | Dashboards |
| **Loki** | Loki | 3100 | Logging |

## 3. Arquitectura de Código (por microservicio)

### 3.1. Node.js Services (Users, MP)
```
backend-[service]/
├── src/
│   ├── config/          # Configuración y env vars
│   ├── controllers/     # Manejadores de rutas (presentation)
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Sequelize models (domain entities)
│   ├── repositories/    # Data access (domain repositories)
│   ├── routes/          # Definición de endpoints
│   ├── services/        # Lógica de negocio (application)
│   ├── validators/      # Zod schemas
│   └── utils/           # Helpers
├── tests/
│   ├── unit/
│   └── integration/
├── migrations/
├── Dockerfile
└── docker-compose.yml
```

### 3.2. Go Service (Materials)
```
backend-materiales-go/
├── cmd/
│   └── api/
│       └── main.go      # Entry point
├── internal/
│   ├── config/          # Environment config
│   ├── handlers/        # HTTP handlers (presentation)
│   ├── logger/          # Zap logger config
│   ├── models/          # GORM models (domain entities)
│   ├── repositories/
│   │   └── postgres/    # PostgreSQL implementations
│   ├── services/        # Business logic (application)
│   └── pkg/             # Shared utilities
├── migrations/
├── docs/                # Swagger generado (migrado a docs/api/)
├── Dockerfile
├── go.mod
└── go.sum
```

## 4. Principios de Diseño

1. **Single Responsibility**: Cada servicio gestiona un bounded context
2. **Database per Service**: Ningún servicio accede directamente a la BD de otro
3. **Stateless Services**: No se almacena estado de sesión en memoria
4. **Async Communication**: Eventos vía RabbitMQ (futuro); actualmente sync REST
5. **Health Checks**: Cada servicio expone `/health`
6. **Centralized Logging**: Structured JSON logs (Zap/Pino)
7. **Observability**: Métricas Prometheus + dashboards Grafana

## 5. Patrones Implementados

| Patrón | Dónde | Propósito |
|--------|-------|-----------|
| Repository | Todos | Abstracción de acceso a datos |
| Service Layer | Todos | Encapsular lógica de negocio |
| Factory | Domain | Validar invariantes en creación |
| Specification | MP (FSM) | Validar transiciones de estado |
| Strategy | MP (prioridad) | Cálculo configurable de prioridad |
| Lock Distribuido | Materials | Validación de stock concurrente |
| Circuit Breaker | Services | Resiliencia ante fallos externos |

## 6. Comunicación Inter-Servicios

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Users DB    │    │    MP DB     │    │ Materials DB │
│ (PostgreSQL) │    │ (PostgreSQL) │    │ (PostgreSQL) │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│ Users       │    │ MP          │    │ Materials   │
│ Service     │    │ Service     │    │ Service     │
│ (Node.js)   │    │ (Node.js)   │    │ (Go)        │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    │ (Node.js)   │
                    └──────┬──────┘
                           │
                      ┌────▼────┐
                      │ Frontend│
                      │ (React) │
                      └─────────┘
```

## 7. Estrategia de Datos

### 7.1. Separación de Bases de Datos
- **bd_users**: Autenticación, usuarios, roles, sesiones
- **bd_mp**: Teléfonos, líneas, pizarras, quejas, pruebas, trabajos
- **bd_materiales**: Materiales, categorías, unidades, asignaciones, consumos

### 7.2. Compartición de Referencias
- User.id compartido como FK en MP y Materials (referencial integrity)
- No se comparten tablas completas

### 7.3. Migraciones
- **Node.js**: Sequelize migrations (`sequelize db:migrate`)
- **Go**: golang-migrate (`migrate -path migrations/ -database $DB_URL up`)

## 8. Seguridad

| Capa | Medida |
|------|--------|
| Transporte | HTTPS (TLS) en producción |
| Autenticación | JWT (HS256) con expiración corta |
| Autorización | RBAC por endpoint (middleware) |
| Validación | Zod (Node), custom validators (Go) |
| Rate Limiting | Redis-based (por IP y user) |
| Input Sanitización | express-validator, Helmet.js |
| Secrets | Variables de entorno (.env, gitignored) |

## 9. Referencias

- [SPEC.md - Arquitectura](./SPEC.md#3-arquitectura-del-sistema)
- [AGENT.md - Reglas Arquitectónicas](./AGENT.md#33-регламент-архитектурных-правил)
- [Tesis 03 - Diseño](./docs/thesis/03_methodology.md)
- [Tesis 02 - Fundamentos](./docs/thesis/02_state_of_art.md)
- [UML Estático](./docs/practices/practice_05_uml_static.md)
