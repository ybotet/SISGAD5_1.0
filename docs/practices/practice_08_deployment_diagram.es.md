# Práctica 08 — Diagrama de Despliegue

> **Дисциплина:** Архитектура ПО
> **Специализация:** Deployment Diagram (UML)
> **Цель:** Modelar la topología física de SISGAD5

---

## 1. Topología de infraestructura

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
graph TB
    subgraph "Клиентская сеть (Internet)"
        CL[Клиент: Browser/Mobile\nHTTPS + JWT]
    end

    subgraph "DMZ (Зона демилитаризации)"
        LB[Load Balancer\n(Nginx/Traefik)]
        GW[API Gateway :5000\n(Node.js + Express)]
        FE[Frontend SPA\n(React + Vite, CDN)]
        GRF[Grafana :3000]
    end

    subgraph "Application Tier"
        US[Users Service :5001\n(Node.js + Express + Sequelize)]
        MS[MP Service :5002\n(Node.js + Express + Sequelize + Zod)]
        MAT[Materials Service :5003\n(Go + Gin + GORM)]
        PRED[Prediction Service :5004\n(Python + FastAPI + sklearn)]
    end

    subgraph "Data Tier"
        PG[(PostgreSQL :5432\n4 БД: bd_users, bd_mp,\nbd_materiales, bd_predictions)]
        RD[(Redis :6379\nCache + Session Store)]
    end

    subgraph "MLOps Tier"
        ML[MLflow Server\n(Model Registry)]
        DVC[DVC Storage\n(Git LFS)]
        AIR[Airflow Scheduler\n(Cron DAGs)]
    end

    subgraph "Monitoring Tier"
        PROM[Prometheus :9090\n(Metrics)]
    end

    subgraph "CI/CD"
        GH[GitHub Actions\n(Auto Deploy)]
    end

    CL --> LB
    LB --> FE
    LB --> GW
    FE -->|Static Build| CL
    GW --> US
    GW --> MS
    GW --> MAT
    GW --> PRED
    GW --> GRF

    US --> PG
    MS --> PG
    MAT --> PG
    PRED --> PG
    US --> RD
    MS --> RD
    MAT --> RD
    PRED --> RD

    PRED --> ML
    PRED --> DVC
    AIR --> PRED
    AIR --> ML
    PRED --> PROM
    US --> PROM
    MS --> PROM
    MAT --> PROM
    GW --> PROM

    GH --> US
    GH --> MS
    GH --> MAT
    GH --> PRED
    GH --> GW
    GH --> FE

    classDef client fill:#bbdefb,stroke:#1976d2
    classDef dmz fill:#f3e5f5,stroke:#7b1fa2
    classDef service fill:#e3f2fd,stroke:#2196f3
    classDef db fill:#e8f5e9,stroke:#4caf50
    classDef cache fill:#fff3e0,stroke:#ff9800
    classDef mlops fill:#ede7f6,stroke:#673ab7
    classDef monitor fill:#ffebee,stroke:#f44336
    classDef cd fill:#e0f2f1,stroke:#009688

    class CL client
    class LB,GW,FE,GRF dmz
    class US,MS,MAT,PRED service
    class PG db
    class RD cache
    class ML,DVC,AIR mlops
    class PROM monitor
    class GH cd
```

---

## 2. Docker Compose (Production)

```yaml
version: '3.8'

services:
  ### API Gateway
  gateway:
    image: sisgad5/gateway:latest
    ports:
      - "${PORT_GATEWAY:-5000}:5000"
    env_file:
      - .env.production
    depends_on:
      - users_service
      - mp_service
      - materials_service
      - prediction_service
    restart: unless-stopped
    networks:
      - app_net

  ### Users Service (Node.js)
  users_service:
    image: sisgad5/users-service:latest
    ports:
      - "${PORT_USERS:-5001}:5001"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ### MP Service (Node.js)
  mp_service:
    image: sisgad5/mp-service:latest
    ports:
      - "${PORT_MP:-5002}:5002"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5002/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ### Materials Service (Go)
  materials_service:
    image: sisgad5/materials-service:latest
    ports:
      - "${PORT_MATERIALS:-5003}:5003"
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5003/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ### Prediction Service (Python)
  prediction_service:
    image: sisgad5/prediction-service:latest
    ports:
      - "${PORT_PREDICTION:-5004}:5004"
    env_file:
      - .env.production
    volumes:
      - ./ml_models:/app/models
    depends_on:
      - postgres
      - redis
      - mlflow
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5004/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  ### PostgreSQL
  postgres:
    image: postgres:17
    ports:
      - "${PORT_PG:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init_db:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - app_net
    command: >
      postgres -c "shared_buffers=256MB"
      -c "effective_cache_size=512MB"
      -c "maintenance_work_mem=64MB"
      -c "checkpoint_completion_minutes=30"
      -c "wal_buffers=16MB"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  ### Redis
  redis:
    image: redis:7-alpine
    ports:
      - "${PORT_REDIS:-6379}:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  ### MLflow
  mlflow:
    image: mlflow/mlflow:2.12.0
    ports:
      - "${PORT_MLFLOW:-5005}:5000"
    environment:
      - BACKEND_STORE_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/mlflow
      - ARTIFACT_ROOT=/mlflow/artifacts
    depends_on:
      - postgres
    volumes:
      - mlflow_data:/mlflow
    restart: unless-stopped
    networks:
      - app_net

  ### Grafana
  grafana:
    image: grafana/grafana-enterprise:latest
    ports:
      - "${PORT_GRAFANA:-3000}:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ANONYMOUS_ENABLED=false
      - GF_AUTH_ANONYMOUS_ENABLED=false
    depends_on:
      - prometheus
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    restart: unless-stopped
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "grafana-cli", "admin", "check"]
      interval: 30s
      timeout: 10s
      retries: 3

  ### Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "${PORT_PROMETHEUS:-9090}:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    restart: unless-stopped
    networks:
      - app_net

networks:
  app_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
  redis_data:
  mlflow_data:
  grafana_data:
  prometheus_data:
  ml_models:
```

---

## 3. Kubernetes Manifests (Helm Chart)

### 3.1. Deployment: Users Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sisgad5-users-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: users-service
  template:
    metadata:
      labels:
        app: users-service
    spec:
      containers:
        - name: users-service
          image: sisgad5/users-service:latest
          ports:
            - containerPort: 5001
          envFrom:
            - configMapRef:
                name: sisgad5-config
            - secretRef:
                name: sisgad5-secrets
          livenessProbe:
            httpGet:
              path: /health
              port: 5001
            initialDelaySeconds: 30
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 5001
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

### 3.2. Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: sisgad5-users-service
spec:
  selector:
    app: users-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5001
  type: ClusterIP
```

### 3.3. HorizontalPodAutoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sisgad5-users-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sisgad5-users-service
  minReplicas: 3
  maxReplicas: 10
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

## 4. CI/CD Pipeline (GitHub Actions)

```yaml
name: SISGAD5 CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: bd_users
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage

  build-and-push:
    needs: [lint, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - name: Build and Push Gateway
        uses: docker/build-push-action@v5
        with:
          context: .
          file: services/gateway/Dockerfile
          push: true
          tags: sisgad5/gateway:${{ github.sha }}
      # ... similarly for other services

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: |
          echo "Running deployment scripts..."
          kubectl apply -f k8s/
```

---

## 5. Ports y сеть

| Сервис | Порт | Протокол | Ограничение |
|--------|------|----------|-------------|
| API Gateway | 5000 | HTTPS | Entrada desde DMZ |
| Users Service | 5001 | HTTP | Solo Gateway |
| MP Service | 5002 | HTTP | Solo Gateway |
| Materials Service | 5003 | HTTP | Solo Gateway |
| Prediction Service | 5004 | HTTP | Solo Gateway |
| PostgreSQL | 5432 | SQL | Solo внутри сети |
| Redis | 6379 | TCP | Solo внутри сети |
| Grafana | 3000 | HTTPS | Entrada desde DMZ + auth |
| Prometheus | 9090 | HTTP | Entrada desde DMZ |

> **В production Materials Service (5003) DEVE estar закрыт** — доступен только через Gateway (согласно SEC-02).

---

## 6. Enlaces

- [Security Model](practice_10_security_model.es.md)
- [DFD](practice_09_dfd.es.md)
- [Архитектура системы](practice_07_system_architecture.es.md)
- [Развёртывание](practice_08_deployment_diagram.es.md)