# Руководство по эксплуатции (SISGAD5)

> **Версия:** 1.0
> **Аудитория:** Системные администраторы, DevOps
> **Последнее обновление:** Сентябрь 2026

---

## 1. Введение

Это руководство описывает, как установить, настроить, запустить и мониторить систему SISGAD5 в производственной или тестовой среде.

## 2. Системные требования

### 2.1. Минимальное оборудование

| Компонент | Требование |
|-----------|-----------|
| CPU | 4 ядра |
| ОЗУ | 8 ГБ |
| Диск | 50 ГБ SSD |
| Сеть | 1 Gbps |

### 2.2. Необходимое ПО

| Программа | Версия | Назначение |
|----------|--------|-----------|
| Docker | 24.0+ | Контейнеризация |
| Docker Compose | 2.20+ | Локальная оркестровка |
| Git | 2.30+ | Управление версиями |
| Go | 1.22+ | Сборка бинарников |

### 2.3. Порты

| Сервис | Порт | Протокол |
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

## 3. Установка

### 3.1. Клонирование репозитория
```bash
git clone https://github.com/ybotet/SISGAD5_1.0.git
cd SISGAD5_1.0
```

### 3.2. Настройка переменных окружения
```bash
# Скопировать шаблоны
cp backend-users/.env.example backend-users/.env
cp backend-mp/.env.example backend-mp/.env
cp backend-materiales-go/.env.example backend-materiales-go/.env

# Отредактировать конфиденциальные значения
nano backend-users/.env
nano backend-mp/.env
nano backend-materiales-go/.env
```

### 3.3. Запуск инфраструктуры
```bash
# Все сервисы
docker-compose up -d

# Только инфраструктура (БД, Redis, RabbitMQ)
docker-compose up -d postgres-users postgres-mp postgres-materiales redis rabbitmq

# Только мониторинг
docker-compose -f monitoring/docker-compose.yml up -d
```

### 3.4. Сборка и запуск сервисов (без Docker)
```bash
# Сборка всех сервисов
make build-all

# Или по отдельности
cd backend-users && go build -o bin/server ./cmd/server
cd backend-mp && go build -o bin/server ./cmd/server
cd backend-materiales-go && go build -o bin/server ./cmd/server
```

## 4. Ежедневная эксплуатация

### 4.1. Проверка состояния сервисов
```bash
# Просмотр логов в реальном времени
make logs

# Просмотр состояния контейнеров
docker-compose ps

# Проверка состояния
make health

# Просмотр метрик Prometheus
# http://localhost:9090/metrics
```

### 4.2. Резервные копии

#### PostgreSQL
```bash
# Резервная копия по сервису
docker exec postgres-users pg_dump -U sisgad users_db > backup-users.sql
docker exec postgres-mp pg_dump -U sisgad mp_db > backup-mp.sql
docker exec postgres-materiales pg_dump -U sisgad materials_db > backup-materiales.sql

# Восстановление
docker exec -i postgres-users psql -U sisgad users_db < backup-users.sql
```

#### Redis
```bash
docker exec redis redis-cli BGSAVE
```

### 4.3. Мониторинг

#### Prometheus
- Доступ: http://localhost:9090
- Полезные запросы:
  ```
  # Request rate по сервису
  sum(rate(http_requests_total[5m])) by (service)
  
  # P95 latency
  histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
  
  # Error rate
  sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
  ```

#### Grafana
- Доступ: http://localhost:3000
- Дашборд: "SISGAD5 Overview"
- Дашборд: "SISGAD5 Materials"
- Дашборд: "SISGAD5 Business Metrics"

#### Loki (Логи)
```bash
# Запрос логов по сервису
{service="backend-mp"} |= "ERROR"

# Запрос логов по уровню
{level="error"} |~ "timeout"
```

## 5. Техническое обслуживание

### 5.1. Обновление схемы базы данных
```bash
# Миграции используют golang-migrate
migrate -path migrations/ -database $DB_URL up

# Просмотр применённых миграций
migrate -path migrations/ -database $DB_URL version
```

### 5.2. Перезапуск сервисов
```bash
# Перезапустить всё
make restart

# Перезапустить конкретный сервис
docker-compose restart backend-users

# Пересборка без кэша
docker-compose up --build --force-recreate -d
```

### 5.3. Очистка старых логов
```bash
# Удержание логов: 7 дней (конфигурация в promtail-config.yaml)
# Очистка старых резервных копий
find . -name "backup-*.sql" -mtime +7 -delete
```

## 6. Устранение неполадок

| Проблема | Причина | Решение |
|----------|-------|----------|
| Login возвращает 401 | Неверный пароль | Проверить хеш, использовать /auth/me для проверки токена |
| Queja не меняет состояние | Недопустимый переход (FSM) | См. матрицу состояний в [документе](../thesis/07_bibliography.ru.md) |
| Stock не уменьшается | 分布ный lock failed | Проверить логи, проверить Redis, retry с backoff |
| Email не отправляется | Credentials Mailjet | Проверить MAILJET_API_KEY/SECRET в .env |
| RabbitMQ отключён | Перенаправление | docker-compose restart rabbitmq |
| Dashboard пустой | Синхронизация между сервисами | Проверить RabbitMQ, проверить consumer lag |
| Rate limit 429 | Слишком много запросов | Увеличить лимиты в Redis или подождать окно |

## 7. Безопасность

### 7.1. Ротация секретов
```bash
# JWT Secret
openssl rand -hex 32

# DB Password
openssl rand -base64 24

# Обновить .env и пересоздать контейнеры
docker-compose up --force-recreate -d backend-users
```

### 7.2. Обновление TLS сертификатов
```bash
# LetsEncrypt с Traefik
# Сертификаты автоматически обновляются

# Ручные сертификаты
certbot --nginx -d api.sisgad5.com
```

## 8. Ссылки

- [Tesis - Implementación](../thesis/04_development.ru.md)
- [Руководство техническое](manual_tecnico.ru.md)
- [Руководство оперативное](manual_operativo.ru.md)
- [Руководство административное](manual_administracion.ru.md)
- [API Reference](../api/mp_reference.md)