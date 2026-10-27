# Руководство по эксплуатации - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Мониторинг и оповещения

### 1.1 Дашборды Grafana (Доступ: `http://grafana:3001`)

| Дашборд | Описание | Ключевые метрики |
|---------|----------|------------------|
| **SISGAD5 - Overview** | Общий обзор системы | Uptime, RPS, p95 Latency, Error rate |
| **SISGAD5 - API Gateway** | Входящий трафик | Requests/s, Latency, 4xx/5xx, Rate limit hits |
| **SISGAD5 - Users Service** | Аутентификация и пользователи | Logins/s, Регистрации, Refresh tokens, Активные сессии |
| **SISGAD5 - MP Service** | Операции MP | Созданные жалобы, Закрытые работы, Зарегистрированные тесты |
| **SISGAD5 - Materials Service** | Управление материалами | Назначения, Расходы, Низкий склад, Логический склад |
| **SISGAD5 - Infrastructure** | Системные ресурсы | CPU, Память, Диск, Сеть, Контейнеры |
| **SISGAD5 - Database** | Базы данных | Подключения, Queries/s, Locks, Размер БД |
| **SISGAD5 - Business KPIs** | Бизнес-метрики | Открытые жалобы, Время решения, Расходуемые материалы |

### 1.2 Критические оповещения (PrometheusRules)

```yaml
# monitoring/prometheus/rules/sisgad5-critical.yml
groups:
- name: sisgad5-critical
  interval: 30s
  rules:
  # Сервис не отвечает
  - alert: ServiceDown
    expr: up{job=~"sisgad5-.*"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Сервис {{ $labels.job }} недоступен"
      description: "{{ $labels.job }} не отвечает 1 минуту"

  # Высокая задержка
  - alert: HighLatency
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=~"sisgad5-.*"}[5m])) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Высокая задержка p95 в {{ $labels.job }}"
      description: "p95 = {{ $value }}s в течение 5 минут"

  # Высокая частота ошибок
  - alert: HighErrorRate
    expr: rate(http_requests_total{job=~"sisgad5-.*",status=~"5.."}[5m]) / rate(http_requests_total{job=~"sisgad5-.*"}[5m]) > 0.05
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Частота ошибок 5xx > 5% в {{ $labels.job }}"

  # База данных: соединения исчерпаны
  - alert: DBConnectionsHigh
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Подключения БД > 80% на {{ $labels.instance }}"

  # Диск заполнен
  - alert: DiskSpaceLow
    expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Диск < 10% свободно на {{ $labels.instance }}"

  # Высокое потребление памяти
  - alert: HighMemoryUsage
    expr: (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Память > 85% на {{ $labels.container }}"

  # Низкий склад материалов
  - alert: MaterialStockLow
    expr: sisgad5_materials_stock_logico < 10
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "Низкий склад: {{ $labels.material_codigo }}"
      description: "Логический баланс = {{ $value }} для {{ $labels.material_nombre }}"

  # Жалобы без назначения > 24h
  - alert: UnassignedComplaintsOld
    expr: sisgad5_quejas_sin_asignar_24h > 0
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "{{ $value }} жалоб без назначения > 24h"
```

### 1.3 Уведомления
- **Канал Slack/Telegram:** `#sisgad5-alerts`
- **Критическая почта:** `ops@dominio.cu`
- **Эскалация:** Если не подтверждено в течение 15 мин → Начальник дежурной службы

---

## 2. Логирование

### 2.1 Доступ к логам (Grafana Loki: `http://loki:3100`)

```logql
# Все логи сервиса
{service="api-gateway"}

# Логи ошибок
{service="backend-users"} |= "ERROR"

# Логи по trace_id (распределённая трассировка)
{service=~"sisgad5-.*"} | trace_id="abc-123-def-456"

# Логи аудита
{service=~"sisgad5-.*"} | json | level="INFO" | action=~"quejas:.*"

# Логи неудачной аутентификации
{service="backend-users"} | json | action="auth:login" | success=false
```

### 2.2 Формат лога (JSON)
```json
{
  "timestamp": "2026-09-25T10:30:00.123Z",
  "level": "INFO",
  "service": "mp-service",
  "trace_id": "abc-123-def-456",
  "span_id": "span-789",
  "user_id": "uuid-usuario",
  "action": "quejas:cambiar_estado",
  "resource": "quejas",
  "resource_id": 12345,
  "details": {
    "estado_anterior": "Asignada",
    "estado_nuevo": "Pendiente"
  },
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "duration_ms": 45
}
```

### 2.3 Удержание
- **Логи приложений:** 30 дней
- **Логи аудита:** 7 лет (требование законодательства)
- **Логи доступа (nginx):** 90 дней

---

## 3. Ежедневные операции

### 3.1 Чек-лист утро (08:00)
- [ ] Проверить дашборд Overview (все зелёные)
- [ ] Просмотр активных оповещений в Grafana/Alertmanager
- [ ] Проверить завершённые ночные бэкапы
- [ ] Проверить свободное место на диске (> 20% свободно)
- [ ] Проверить синхронизацию реплик БД
- [ ] Проверить жалобы без назначения > 24h

### 3.2 Чек-лист вечер (16:00)
- [ ] Проверить бизнес-метрики (KPI)
- [ ] Просмотр ошибок дня в логах
- [ ] Проверить SSL-сертификаты (истечение > 30 дней)
- [ ] Подтвердить запланированный бэкап

### 3.3 Чек-лист неделя (Понедельник)
- [ ] Выполнить `docker system prune -f` (очистка неиспользуемых образов)
- [ ] Проверить обновляемые зависимости (Dependabot PRs)
- [ ] Проверить ёмкость хранилищ Loki/Prometheus
- [ ] Проверить восстановление из бэкапа (ежемесячно)

---

## 4. Процедуры устранения неполадок

### 4.1 Сервис не отвечает (ServiceDown)
```bash
# 1. Проверить контейнер
docker compose ps | grep <servicio>

# 2. Просмотр последних логов
docker compose logs --tail=100 <servicio>

# 3. Перезапуск сервиса
docker compose restart <servicio>

# 4. Если проблема сохраняется, проверить БД
docker compose exec postgres-<servicio> pg_isready

# 5. Масштабирование в Kubernetes при необходимости
kubectl rollout restart deployment/<servicio> -n sisgad5-prod
```

### 4.2 Медленная база данных
```bash
# 1. Просмотр активных запросов
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, 
         query, state 
  FROM pg_stat_activity 
  WHERE state = 'active' 
  AND now() - pg_stat_activity.query_start > interval '5 seconds';"

# 2. Просмотр блокировок
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocked_activity.query AS blocked_query,
         blocking_locks.pid AS blocking_pid,
         blocking_activity.query AS blocking_query
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_pids.pid
  WHERE NOT blocked_locks.granted;"

# 3. Удаление проблемного запроса (крайний случай)
docker compose exec postgres-<servicio> psql -U postgres -d <bd> -c "SELECT pg_terminate_backend(<pid);;"
```

### 4.3 Утечка памяти
```bash
# 1. Просмотр использования памяти контейнером
docker stats <contenedor> --no-stream

# 2. Перезапуск контейнера
docker compose restart <servicio>

# 3. Анализ дампа кучи (Node.js)
# В коде: process.on('exit', () => { require('heapdump').writeSnapshot(); })
```

### 4.4 Истекший SSL-сертификат
```bash
# Обновление (Let's Encrypt + certbot)
certbot renew --nginx

# Проверка
openssl x509 -in /etc/letsencrypt/live/sisgad5.dominio.cu/fullchain.pem -text -noout | grep "Not After"
```

---

## 5. Бэкап и восстановление

### 5.1 Скрипты бэкапа (`scripts/`)

#### backup.sh (Ежедневно, 02:00)
```bash
#!/bin/bash
# scripts/backup.sh
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/${DATE}"
mkdir -p ${BACKUP_DIR}

# Бэкап БД Users
docker compose exec -T postgres-users pg_dump -U postgres bd_users | gzip > ${BACKUP_DIR}/bd_users_${DATE}.sql.gz

# Бэкап БД MP
docker compose exec -T postgres-mp pg_dump -U postgres bd_mp | gzip > ${BACKUP_DIR}/bd_mp_${DATE}.sql.gz

# Бэкап БД Materials
docker compose exec -T postgres-materials pg_dump -U postgres bd_materiales | gzip > ${BACKUP_DIR}/bd_materiales_${DATE}.sql.gz

# Бэкап Docker volumes (uploads, etc.)
tar -czf ${BACKUP_DIR}/volumes_${DATE}.tar.gz /var/lib/docker/volumes/sisgad5_*

# Загрузка в удалённое хранилище (S3/MinIO/GCS)
aws s3 cp ${BACKUP_DIR} s3://sisgad5-backups/${DATE}/ --recursive

# Очистка локальных бэкапов > 7 дней
find /backups -type d -mtime +7 -exec rm -rf {} \;

echo "Бэкап завершён: ${BACKUP_DIR}"
```

#### restore.sh
```bash
#!/bin/bash
# scripts/restore.sh
# Использование: ./restore.sh <backup_date> [bd_users|bd_mp|bd_materiales]

BACKUP_DATE=$1
TARGET_DB=$2
BACKUP_DIR="/backups/${BACKUP_DATE}"

if [ ! -d "${BACKUP_DIR}" ]; then
  # Загрузить из удалённого
  aws s3 cp s3://sisgad5-backups/${BACKUP_DATE}/ ${BACKUP_DIR} --recursive
fi

case $TARGET_DB in
  bd_users)
    gunzip -c ${BACKUP_DIR}/bd_users_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-users psql -U postgres bd_users
    ;;
  bd_mp)
    gunzip -c ${BACKUP_DIR}/bd_mp_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-mp psql -U postgres bd_mp
    ;;
  bd_materiales)
    gunzip -c ${BACKUP_DIR}/bd_materiales_${BACKUP_DATE}.sql.gz | docker compose exec -T postgres-materials psql -U postgres bd_materiales
    ;;
  *)
    echo "Использование: $0 <fecha> <bd_users|bd_mp|bd_materiales>"
    exit 1
    ;;
esac

echo "Восстановление завершено для ${TARGET_DB} из ${BACKUP_DATE}"
```

### 5.2 Планировка (cron)
```bash
# На хосте или Kubernetes CronJob
0 2 * * * /opt/sisgad5/scripts/backup.sh >> /var/log/sisgad5-backup.log 2>&1
```

---

## 6. Плановое техническое обслуживание

### 6.1 Техническое окно
- **Расписание:** Воскресенья 02:00 - 06:00 (местное время)
- **Уведомление:** 48 часов вперед по email/Slack
- **План отката:** Документирован для каждого изменения

### 6.2 Ежемесячные задачи
- [ ] Обновление зависимостей (слияние Dependabot PRs после CI)
- [ ] Ротация старых логов
- [ ] Проверка целостности бэкапов (тестовое восстановление)
- [ ] Очистка просроченных сессий в БД
- [ ] Обновление базовых Docker-образов (security patches)

### 6.3 Ежеквартальные задачи
- [ ] Ротация ключей JWT (создание новых, развёртывание с нулевым простоем)
- [ ] Проверка SSL-сертификатов
- [ ] Полное тестирование disaster recovery
- [ ] Аудит доступа (пользователи, роли, разрешения)

---

## 7. Масштабирование ёмкости

### 7.1 Горизонтальное масштабирование (Kubernetes)
```bash
# Вручную
kubectl scale deployment/api-gateway --replicas=5 -n sisgad5-prod

# Автоматически (уже настроен HPA)
# См.: k8s/prod/hpa/
```

### 7.2 Вертикальное масштабирование (Docker Compose)
```yaml
# docker-compose.prod.yml
services:
  backend-users:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 7.3 База данных
- **Read Replicas:** Для запросов только чтения (дашборды, отчёты)
- **Connection Pooling:** PgBouncer (transaction mode)
- **Партиционирование:** Большие таблицы по датам (audit_logs, flujo_estado_queja)

---

## 8. Контакты и эскалация

| Роль | Имя | Контакт | Доступность |
|------|-----|---------|-------------|
| **Главный DevOps** | Яйсел Ботет | yaiselbotet@gmail.com | 24/7 (дежурство) |
| **DBA** | - | - | Рабочие часы |
| **Безопасность** | - | security@dominio.cu | 24/7 |
| **Облачная инфраструктура** | - | cloud@dominio.cu | Рабочие часы |

### Матрица эскалации
| Серьёзность | Время реакции | Эскалация |
|-------------|----------------|-----------|
| **Критическая (P1)** | 15 минут | DevOps → DBA → Облако |
| **Высокая (P2)** | 1 час | DevOps → DBA |
| **Средняя (P3)** | 4 часа | DevOps |
| **Низкая (P4)** | 24 часа | Бэклог |

---

## 9. Ссылки

- [Развертывание](14_deployment.ru.md)
- [Мониторинг](../monitoring/)
- [Скрипты](../scripts/)
- [Тестирование](16_testing.ru.md)
- [Архитектура](../ARCHITECTURE.md)
