# Guía de Despliegue - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Requisitos Previos

### 1.1 Infraestructura Mínima (Desarrollo)
| Componente     | Versión | Notas                        |
| -------------- | ------- | ---------------------------- |
| Docker         | 24+     | Docker Engine                |
| Docker Compose | 2.20+   | Plugin `docker compose`      |
| Node.js        | 20 LTS  | Para build frontend          |
| Go             | 1.21+   | Para build materials service |
| PostgreSQL     | 15+     | En contenedor o externo      |
| Git            | 2.40+   | Control de versiones         |

### 1.2 Puertos Requeridos
| Servicio               | Puerto Interno | Puerto Externo (Dev) |
| ---------------------- | -------------- | -------------------- |
| API Gateway            | 5000           | 5000                 |
| Users Service          | 5001           | 5001                 |
| MP Service             | 5002           | 5002                 |
| Materials Service      | 5003           | 5003                 |
| Frontend (Vite)        | 504            | 5004                 |
| PostgreSQL (Users)     | 5432           | 5433                 |
| PostgreSQL (MP)        | 5432           | 5434                 |
| PostgreSQL (Materials) | 5432           | 5435                 |
| Prometheus             | 9090           | 9090                 |
| Grafana                | 3000           | 3001                 |
| Loki                   | 3100           | 3100                 |

---

## 2. Variables de Entorno

### 2.1 Archivos `.env.example` por Servicio

#### API Gateway (`.env.example`)
```env
NODE_ENV=development
PORT=3000
JWT_PUBLIC_KEY_PATH=./keys/public.pem
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
USERS_SERVICE_URL=http://backend-users:3001
MP_SERVICE_URL=http://backend-mp:3002
MATERIALS_SERVICE_URL=http://backend-materiales-go:8080
LOG_LEVEL=debug
```

#### Users Service (`.env.example`)
```env
NODE_ENV=development
PORT=3001
DB_HOST=postgres-users
DB_PORT=5432
DB_NAME=bd_users
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
DB_POOL_MAX=10
DB_POOL_MIN=0
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
BCRYPT_COST=12
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW=900000
LOG_LEVEL=debug
```

#### MP Service (`.env.example`)
```env
NODE_ENV=development
PORT=3002
DB_HOST=postgres-mp
DB_PORT=5432
DB_NAME=bd_mp
DB_USER=postgres
DB_PASSWORD=postgres
DB_DIALECT=postgres
DB_POOL_MAX=10
DB_POOL_MIN=0
JWT_PUBLIC_KEY_PATH=./keys/public.pem
LOG_LEVEL=debug
```

#### Materials Service (`.env.example`)
```env
APP_ENV=development
PORT=8080
DB_HOST=postgres-materials
DB_PORT=5432
DB_NAME=bd_materiales
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL_MODE=disable
JWT_PUBLIC_KEY_PATH=./keys/public.pem
LOG_LEVEL=debug
GIN_MODE=debug
```

#### Frontend (`.env.example`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=SISGAD5
VITE_DEFAULT_LANG=es
```

---

## 3. Despliegue Local (Desarrollo)

### 3.1 Clonar y Configurar
```bash
# Clonar repositorio
git clone https://github.com/ybotet/SISGAD5_1.0.git
cd SISGAD5_1.0

# Copiar archivos de entorno
cp .env.example .env
cp api-gateway/.env.example api-gateway/.env
cp backend-users/.env.example backend-users/.env
cp backend-mp/.env.example backend-mp/.env
cp backend-materiales-go/.env.example backend-materiales-go/.env
cp frontend/.env.example frontend/.env

# Generar claves JWT (una sola vez)
mkdir -p api-gateway/keys backend-users/keys backend-mp/keys backend-materiales-go/keys
openssl genrsa -out backend-users/keys/private.pem 2048
openssl rsa -in backend-users/keys/private.pem -pubout -out backend-users/keys/public.pem
cp backend-users/keys/public.pem api-gateway/keys/
cp backend-users/keys/public.pem backend-mp/keys/
cp backend-users/keys/public.pem backend-materiales-go/keys/
```

### 3.2 Levantar Stack Completo
```bash
# Desarrollo (con hot reload)
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ver estado
docker compose ps
```

### 3.3 Verificar Servicios
```bash
# Health checks
curl http://localhost:3000/health      # API Gateway
curl http://localhost:3001/health      # Users
curl http://localhost:3002/health      # MP
curl http://localhost:8080/health      # Materials

# Frontend
open http://localhost:5173
```

### 3.4 Comandos Útiles
```bash
# Reiniciar un servicio
docker compose restart api-gateway

# Rebuild y reiniciar
docker compose up -d --build backend-users

# Ejecutar migraciones (Users)
docker compose exec backend-users npm run migrate

# Ejecutar seeders (Users)
docker compose exec backend-users npm run seed

# Ejecutar migraciones (MP)
docker compose exec backend-mp npm run migrate

# Ejecutar migraciones (Materials)
docker compose exec backend-materiales-go migrate -path ./migrations -database "postgres://postgres:postgres@postgres-materials:5432/bd_materiales?sslmode=disable" up

# Acceso a BD
docker compose exec postgres-users psql -U postgres -d bd_users
docker compose exec postgres-mp psql -U postgres -d bd_mp
docker compose exec postgres-materials psql -U postgres -d bd_materiales
```

---

## 4. Despliegue en Producción

### 4.1 Preparación
```bash
# Usar docker-compose.prod.yml
cp .env.example .env.production
# Editar .env.production con valores reales (passwords, keys, dominios)

# Generar claves JWT de producción
openssl genrsa -out backend-users/keys/private.pem 4096
openssl rsa -in backend-users/keys/private.pem -pubout -out backend-users/keys/public.pem
```

### 4.2 Variables Críticas de Producción
```env
# .env.production
NODE_ENV=production
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
BCRYPT_COST=12
DB_PASSWORD=<strong-random-password>
LOG_LEVEL=warn
CORS_ORIGINS=https://sisgad5.dominio.cu
```

### 4.3 Desplegar
```bash
# Con docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d --build

# Verificar
docker compose -f docker-compose.prod.yml ps
curl https://sisgad5.dominio.cu/health
```

### 4.4 SSL/TLS (Reverse Proxy)
```nginx
# nginx.conf (ejemplo)
server {
    listen 443 ssl http2;
    server_name sisgad5.dominio.cu;
    
    ssl_certificate /etc/letsencrypt/live/sisgad5.dominio.cu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sisgad5.dominio.cu/privkey.pem;
    
    location / {
        proxy_pass http://api-gateway:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /ws {
        proxy_pass http://api-gateway:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 5. Kubernetes (Producción Avanzada)

### 5.1 Estructura `k8s/prod/`
```
k8s/prod/
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── ingress.yaml
├── services/
│   ├── api-gateway.yaml
│   ├── backend-users.yaml
│   ├── backend-mp.yaml
│   ├── backend-materiales-go.yaml
│   └── frontend.yaml
├── deployments/
│   ├── api-gateway.yaml
│   ├── backend-users.yaml
│   ├── backend-mp.yaml
│   ├── backend-materiales-go.yaml
│   └── frontend.yaml
├── statefulsets/
│   ├── postgres-users.yaml
│   ├── postgres-mp.yaml
│   └── postgres-materials.yaml
├── monitoring/
│   ├── prometheus.yaml
│   ├── grafana.yaml
│   └── loki.yaml
└── hpa/
    ├── api-gateway.yaml
    ├── backend-users.yaml
    ├── backend-mp.yaml
    └── backend-materiales-go.yaml
```

### 5.2 Deployment Ejemplo (API Gateway)
```yaml
# k8s/prod/deployments/api-gateway.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: sisgad5-prod
  labels:
    app: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: ghcr.io/ybotet/sisgad5-api-gateway:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: sisgad5-config
        - secretRef:
            name: sisgad5-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 5.3 HPA (Horizontal Pod Autoscaler)
```yaml
# k8s/prod/hpa/api-gateway.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: sisgad5-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 6. Base de Datos en Producción

### 6.1 PostgreSQL (Managed Service Recomendado)
- **Cloud SQL (GCP) / RDS (AWS) / Azure Database**
- **Alta disponibilidad:** Réplica sincrónica en zona distinta
- **Backups:** Automáticos diarios + point-in-time recovery (7 días)
- **Conexiones:** Pooling con PgBouncer (max 100 conexiones por servicio)

### 6.2 Migraciones en Producción
```bash
# Users/MP (Sequelize)
# Ejecutar en pipeline CI/CD antes de deploy
npm run migrate

# Materials (Golang Migrate)
migrate -path ./migrations \
  -database "postgres://user:pass@host:5432/db?sslmode=require" \
  up
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions (`.github/workflows/cd.yml`)

El pipeline `CD` se dispara en `push` a `main` (cuando cambian los servicios, el
compose de producción o `deploy.sh`) y también por `workflow_dispatch` (dry-run /
redeploy con un tag existente).

**Jobs:**

1. **`build-and-push`** — matriz de 5 servicios (`backend-users`, `backend-mp`,
   `api-gateway`, `backend-materiales`, `frontend`). Cada imagen se publica en GHCR
   con dos tags:
   - `sha-<commit>` (inmutable, usado por el deploy y el rollback).
   - `latest` (solo en `main`).
2. **`deploy`** — corre tras `build-and-push`, protegido por el entorno
   `production` (aprobación manual). Por SSH ejecuta `deploy.sh` en el servidor:
   `docker login` GHCR → `compose pull` → `compose up -d` → healthcheck 60 s →
   rollback automático al tag anterior si el healthcheck falla.
3. **`security-scan`** — Trivy sobre la imagen `api-gateway:sha-<commit>`.

**Configuración humana (una sola vez, ~2 min):**

- GitHub → Settings → Environments → **production** → *Required reviewers*
  (aprobación manual antes de desplegar).
- Secrets de repositorio:
  - `SSH_DEPLOY_HOST`, `SSH_DEPLOY_USER`, `SSH_DEPLOY_KEY` (clave privada estricta).
  - `GHCR_PULL_USER`, `GHCR_PULL_TOKEN` (opcional; PAT con `read:packages`).
- En el servidor: `docker login ghcr.io` persistente (si no se usan los secrets
  `GHCR_PULL_*`) y `/opt/sisgad5/CURRENT_TAG` (lo crea el propio script).

**Dry-run:**

```bash
# GitHub → Actions → CD → Run workflow → input `tag` = sha-abc123 (tag ya publicado)
# o dejar vacío para usar el SHA del commit.
```

### 7.2 Variables de imagen

`docker-compose.prod.yml` referencia las imágenes como:

```yaml
image: ${IMAGE_PREFIX:-ghcr.io/ybotet/sisgad5_1.0}/<service>:${IMAGE_TAG:-latest}
```

`IMAGE_PREFIX` e `IMAGE_TAG` se inyectan en el servidor (los exporta el job
`deploy` antes de invocar `deploy.sh`). `build:` se mantiene como fallback para
despliegue local con `--build`.

---

## 8. Rollback

### 8.1 Docker Compose (automatizado)

El rollback es **automático** dentro de `deploy.sh`: si el healthcheck de
`http://localhost:5000/health` no responde en 60 s, el script vuelve al tag
guardado en `/opt/sisgad5/CURRENT_TAG` (`compose pull` + `up -d`) y reintenta el
healthcheck. El tag solo se persiste en `CURRENT_TAG` tras un despliegue OK.

Rollback manual (mismo mecanismo):

```bash
# En el servidor, con el tag anterior conocido:
cd /opt/sisgad5
IMAGE_TAG=sha-<tag-anterior> ./deploy.sh
```

### 8.2 Kubernetes
```bash
# Rollback deployment
kubectl rollout undo deployment/api-gateway -n sisgad5-prod

# Ver historial
kubectl rollout history deployment/api-gateway -n sisgad5-prod

# Rollback a revisión específica
kubectl rollout undo deployment/api-gateway -n sisgad5-prod --to-revision=5
```

---

## 9. Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas (`.env.production`)
- [ ] Claves JWT generadas y distribuidas
- [ ] Contraseñas BD fuertes y únicas por servicio
- [ ] Certificados SSL válidos
- [ ] DNS configurado (A/AAAA records)
- [ ] Health checks responden 200
- [ ] Migraciones BD ejecutadas
- [ ] Seeders de datos iniciales (roles, permisos, catálogos MP)
- [ ] Monitoreo alertando (Prometheus rules)
- [ ] Logs centralizados (Loki recibiendo)
- [ ] Backups BD verificados
- [ ] Documentación de rollback accesible

---

## 10. Referencias

- [Arquitectura](../ARCHITECTURE.md)
- [Operaciones](15_operations.es.md)
- [Monitoreo](../monitoring/)
- [Scripts de automatización](../scripts/)
- [docker-compose.yml](../docker-compose.yml)
- [docker-compose.prod.yml](../docker-compose.prod.yml)