# Руководство по развертыванию - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Предварительные требования

### 1.1 Минимальная инфраструктура (Разработка)
| Компонент | Версия | Примечание |
|-----------|--------|------------|
| Docker | 24+ | Docker Engine |
| Docker Compose | 2.20+ | Плагин `docker compose` |
| Node.js | 20 LTS | Для сборки frontend |
| Go | 1.21+ | Для сборки materials service |
| PostgreSQL | 15+ | В контейнере или внешне |
| Git | 2.40+ | Управление версиями |

### 1.2 Требуемые порты
| Сервис | Внутренний порт | Внешний порт (Dev) |
|--------|----------------|----------------------|
| API Gateway | 3000 | 3000 |
| Users Service | 3001 | 3001 |
| MP Service | 3002 | 3002 |
| Materials Service | 8080 | 8080 |
| Frontend (Vite) | 5173 | 5173 |
| PostgreSQL (Users) | 5432 | 5433 |
| PostgreSQL (MP) | 5432 | 5434 |
| PostgreSQL (Materials) | 5432 | 5435 |
| Prometheus | 9090 | 9090 |
| Grafana | 3000 | 3001 |
| Loki | 3100 | 3100 |

---

## 2. Переменные окружения

### 2.1 Archivos `.env.example` по сервисам

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

## 3. Развертывание локально (Разработка)

### 3.1 Клонирование и настройка
```bash
# Клонировать репозиторий
git clone https://github.com/ybotet/SISGAD5_1.0.git
cd SISGAD5_1.0

# Скопировать файлы окружения
cp .env.example .env
cp api-gateway/.env.example api-gateway/.env
cp backend-users/.env.example backend-users/.env
cp backend-mp/.env.example backend-mp/.env
cp backend-materiales-go/.env.example backend-materiales-go/.env
cp frontend/.env.example frontend/.env

# Сгенерировать ключи JWT (один раз)
mkdir -p api-gateway/keys backend-users/keys backend-mp/keys backend-materiales-go/keys
openssl genrsa -out backend-users/keys/private.pem 2048
openssl rsa -in backend-users/keys/private.pem -pubout -out backend-users/keys/public.pem
cp backend-users/keys/public.pem api-gateway/keys/
cp backend-users/keys/public.pem backend-mp/keys/
cp backend-users/keys/public.pem backend-materiales-go/keys/
```

### 3.2 Поднятие полного стека
```bash
# Разработка (с hot reload)
docker compose up -d --build

# Просмотр логов
docker compose logs -f

# Проверка состояния
docker compose ps
```

### 3.3 Проверка сервисов
```bash
# Health checks
curl http://localhost:3000/health      # API Gateway
curl http://localhost:3001/health      # Users
curl http://localhost:3002/health      # MP
curl http://localhost:8080/health      # Materials

# Frontend
open http://localhost:5173
```

### 3.4 Полезные команды
```bash
# Перезапуск сервиса
docker compose restart api-gateway

# Пересборка и перезапуск
docker compose up -d --build backend-users

# Выполнение миграций (Users)
docker compose exec backend-users npm run migrate

# Выполнение seeders (Users)
docker compose exec backend-users npm run seed

# Выполнение миграций (MP)
docker compose exec backend-mp npm run migrate

# Выполнение миграций (Materials)
docker compose exec backend-materiales-go migrate -path ./migrations -database "postgres://postgres:postgres@postgres-materials:5432/bd_materiales?sslmode=disable" up

# Доступ к БД
docker compose exec postgres-users psql -U postgres -d bd_users
docker compose exec postgres-mp psql -U postgres -d bd_mp
docker compose exec postgres-materials psql -U postgres -d bd_materiales
```

---

## 4. Развертывание в продакшен

### 4.1 Подготовка
```bash
# Использовать docker-compose.prod.yml
cp .env.example .env.production
# Редактировать .env.production с реальными значениями (passwords, keys, домены)

# Сгенерировать ключи JWT для продакшена
openssl genrsa -out backend-users/keys/private.pem 4096
openssl rsa -in backend-users/keys/private.pem -pubout -out backend-users/keys/public.pem
```

### 4.2 Критические переменные продакшена
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

### 4.3 Развёртывание
```bash
# С docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d --build

# Проверка
docker compose -f docker-compose.prod.yml ps
curl https://sisgad5.dominio.cu/health
```

### 4.4 SSL/TLS (Reverse Proxy)
```nginx
# nginx.conf (пример)
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

## 5. Kubernetes (Продвинутый продакшен)

### 5.1 Структура `k8s/prod/`
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

### 5.2 Пример развертывания (API Gateway)
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
          limits:
            memory: "512Mi"
            cpu: "500m"
          requests:
            memory: "256Mi"
            cpu: "250m"
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

### 5.3 HPA (Горизонтальный автоскейлер подов)
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

## 6. База данных в продакшен

### 6.1 PostgreSQL (Рекомендуемый управляемый сервис)
- **Cloud SQL (GCP) / RDS (AWS) / Azure Database**
- **Высокая доступность:** Синхронная реплика в другой зоне
- **Бэкапы:** Ежедневные автоматические + восстановление во время (7 дней)
- **Подключения:** Пул соединений с PgBouncer (max 100 на сервис)

### 6.2 Миграции в продакшен
```bash
# Users/MP (Sequelize)
# Выполнять в CI/CD перед deploy
npm run migrate

# Materials (Golang Migrate)
migrate -path ./migrations \
  -database "postgres://user:pass@host:5432/db?sslmode=require" \
  up
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions (`.github/workflows/cd.yml`)
```yaml
name: CD - Deploy to Production
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push API Gateway
        uses: docker/build-push-action@v5
        with:
          context: ./api-gateway
          push: true
          tags: ghcr.io/ybotet/sisgad5-api-gateway:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      # ... (повторить для каждого сервиса)
      
      - name: Deploy to Kubernetes
        uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}
      - run: kubectl apply -k k8s/prod/
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

---

## 8. Откат (Rollback)

### 8.1 Docker Compose
```bash
# Пометить предыдущую версию перед deploy
docker tag ghcr.io/ybotet/sisgad5-api-gateway:latest ghcr.io/ybotet/sisgad5-api-gateway:prev

# Быстрый откат
docker compose -f docker-compose.prod.yml down
# Отредактировать docker-compose.prod.yml для использования тега :prev
docker compose -f docker-compose.prod.yml up -d
```

### 8.2 Kubernetes
```bash
# Откат развертывания
kubectl rollout undo deployment/api-gateway -n sisgad5-prod

# Просмотр истории
kubectl rollout history deployment/api-gateway -n sisgad5-prod

# Откат к конкретной версии
kubectl rollout undo deployment/api-gateway -n sisgad5-prod --to-revision=5
```

---

## 9. Чек-лист перед развертыванием

- [ ] Переменные окружения настроены (`.env.production`)
- [ ] Ключи JWT сгенерированы и распределены
- [ ] Пароли БД сильные и уникальны для каждого сервиса
- [ ] SSL-сертификаты действительны
- [ ] DNS настроен (A/AAAA записи)
- [ ] Health checks возвращают 200
- [ ] Миграции БД выполнены
- [ ] Seedеры начальных данных (роли, разрешения, каталоги MP)
- [ ] Мониторинг оповещает (Prometheus rules)
- [ ] Централизованные логи (Loki получает)
- [ ] Бэкапы БД проверены
- [ ] Документация отката доступна

---

## 10. Ссылки

- [Архитектура](../ARCHITECTURE.md)
- [Операции](15_operations.ru.md)
- [Мониторинг](../monitoring/)
- [Скрипты автоматизации](../scripts/)
- [docker-compose.yml](../docker-compose.yml)
- [docker-compose.prod.yml](../docker-compose.prod.yml)
