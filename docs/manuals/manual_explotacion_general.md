# Manual de Explotación General (SISGAD5)

> **Versión:** 1.0  
> **Público:** Administradores de Sistema, DevOps  
> **Última actualización:** Septiembre 2026

---

## 1. Introducción

Este manual describe cómo instalar, configurar, operar y monitorear el sistema SISGAD5 en un entorno de producción o staging.

## 2. Requisitos del Sistema

### 2.1. Hardware Mínimo
| Componente | Requisito |
|------------|-----------|
| CPU | 4 núcleos |
| RAM | 8 GB |
| Disco | 50 GB SSD |
| Network | 1 Gbps |

### 2.2. Software Requerido
| Software | Versión | Propósito |
|----------|---------|-----------|
| Docker | 24.0+ | Contenerización |
| Docker Compose | 2.20+ | Orquestación local |
| Git | 2.30+ | Control de versiones |
| Go | 1.22+ | Build de binarios |

### 2.3. Puertos
| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| API Gateway (Traefik) | 80, 443 | HTTP/HTTPS |
| PostgreSQL (Users) | 5432 | TCP |
| PostgreSQL (MP) | 5433 | TCP |
| PostgreSQL (Materials) | 5434 | TCP |
| Redis | 6379 | TCP |
| RabbitMQ | 5672, 15672 | AMQP, HTTP |
| Prometheus | 9090 | HTTP |
| Grafana | 3000 | HTTP |
| Loki | 3100 | HTTP |
| Auth Service | 8081 | HTTP |
| MP Service | 8082 | HTTP |
| Materials Service | 8083 | HTTP |

## 3. Instalación

### 3.1. Clonar Repositorio
```bash
git clone https://github.com/ybotet/SISGAD5_1.0.git
cd SISGAD5_1.0
```

### 3.2. Configurar Variables de Entorno
```bash
# Copiar ejemplos
cp backend-users/.env.example backend-users/.env
cp backend-mp/.env.example backend-mp/.env
cp backend-materiales-go/.env.example backend-materiales-go/.env

# Editar valores sensibles
nano backend-users/.env
nano backend-mp/.env
nano backend-materiales-go/.env
```

### 3.3. Levantar Infraestructura
```bash
# Todos los servicios
docker-compose up -d

# Solo infraestructura (DB, Redis, RabbitMQ)
docker-compose up -d postgres-users postgres-mp postgres-materiales redis rabbitmq

# Solo monitoreo
docker-compose -f monitoring/docker-compose.yml up -d
```

### 3.4. Compilar y Ejecutar Servicios (sin Docker)
```bash
# Build all services
make build-all

# O individualmente
cd backend-users && go build -o bin/server ./cmd/server
cd backend-mp && go build -o bin/server ./cmd/server
cd backend-materiales-go && go build -o bin/server ./cmd/server
```

## 4. Operación Diaria

### 4.1. Verificar Estado de Servicios
```bash
# Ver logs en tiempo real
make logs

# Ver estado de contenedores
docker-compose ps

# Health checks
make health

# Ver métricas de Prometheus
# http://localhost:9090/metrics
```

### 4.2. Backups

#### PostgreSQL
```bash
# Backup por servicio
docker exec postgres-users pg_dump -U sisgad users_db > backup-users.sql
docker exec postgres-mp pg_dump -U sisgad mp_db > backup-mp.sql
docker exec postgres-materiales pg_dump -U sisgad materials_db > backup-materiales.sql

# Restore
docker exec -i postgres-users psql -U sisgad users_db < backup-users.sql
```

#### Redis
```bash
docker exec redis redis-cli BGSAVE
```

### 4.3. Monitorización

#### Prometheus
- Acceder a http://localhost:9090
- Consultas útiles:
  ```
  # Request rate por servicio
  sum(rate(http_requests_total[5m])) by (service)
  
  # Latencia P95
  histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
  
  # Error rate
  sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
  ```

#### Grafana
- Acceder a http://localhost:3000
- Dashboard: "SISGAD5 Overview"
- Dashboard: "SISGAD5 Materials"
- Dashboard: "SISGAD5 Business Metrics"

#### Loki (Logs)
```bash
# Query de logs por servicio
{service="backend-mp"} |= "ERROR"

# Query de logs por nivel
{level="error"} |~ "timeout"
```

## 5. Mantenimiento

### 5.1. Actualización de Schema de Base de Datos
```bash
# Las migraciones usan golang-migrate
migrate -path migrations/ -database $DB_URL up

# Ver migraciones aplicadas
migrate -path migrations/ -database $DB_URL version
```

### 5.2. Reinicio de Servicios
```bash
# Reiniciar todo
make restart

# Reiniciar un servicio específico
docker-compose restart backend-users

# Rebuild sin cache
docker-compose up --build --force-recreate -d
```

### 5.3. Limpiar Logs Antiguos
```bash
# Retención de logs: 7 días (config en promtail-config.yaml)
# Limpiar backups viejos
find . -name "backup-*.sql" -mtime +7 -delete
```

## 6. Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Login devuelve 401 | Password incorrecto | Verificar hash, usar endpoint /auth/me para validar token |
| Queja no cambia estado | Transición inválida (FSM) | Consultar matriz de estados en docs/thesis/07_bibliography.md |
| Stock no se decrementa | Lock distribuido falló | Revisar logs, verificar Redis, retry con backoff |
| Email no se envía | Credenciales Mailjet | Verificar MAILJET_API_KEY/SECRET en .env |
| RabbitMQ desconectado | Redireccionamiento | docker-compose restart rabbitmq |
| Dashboard vacío | Sync entre servicios | Verificar RabbitMQ, revisar consumer lag |
| Rate limit 429 | Demasiadas requests | Aumentar límites en Redis o esperar ventana |

## 7. Seguridad

### 7.1. Rotación de Secrets
```bash
# JWT Secret
openssl rand -hex 32

# DB Password
openssl rand -base64 24

# Actualizar .env y recrear contenedores
docker-compose up --force-recreate -d backend-users
```

### 7.2. Actualizar Certificados TLS
```bash
# LetsEncrypt con Traefik
# Certificados se renuevan automáticamente

# Certificados manuales
certbot --nginx -d api.sisgad5.com
```

## 8. Referencias

- [Tesis - Implementación](../thesis/04_development.md)
- [Manual Técnico](manual_tecnico.md)
- [Manual Operativo](manual_operativo.md)
- [Manual Administrativo](manual_administracion.md)
- [API Reference](../api/mp_reference.md)
