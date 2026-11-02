# Техническое руководство (SISGAD5)

> **Версия:** 1.0
> **Аудитория:** Разработчики, Архитекторы, DevOps
> **Последнее обновление:** Сентябрь 2026

---

## 1. Введение

Это руководство описывает технические аспекты системы: архитектуру, API, бизнес-правила, параллелизм и устранение неполадок на уровне кода.

## 2. Архитектура

Подробнее в главе 3 диссертации: [Диссертация - Дизайн](../thesis/03_methodology.ru.md)

```mermaid
graph LR
    subgraph "Frontend"
        WEB[Web App (SPA)"]
    end
    
    subgraph "Edge"
        GW[API Gateway (Traefik)]
    end
    
    subgraph "Services"
        AUTH[backend-users]
        MP[backend-mp]
        MAT[backend-materiales-go]
    end
    
    subgraph "Infra"
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        RABBIT[(RabbitMQ)]
    end
    
    WEB --> GW
    GW --> AUTH
    GW --> MP
    GW --> MAT
    AUTH --> PG
    AUTH --> REDIS
    MP --> PG
    MP --> RABBIT
    MAT --> PG
    MAT --> REDIS
    MAT --> RABBIT
```

## 3. Микросервисы и API

### 3.1. Backend Users (Auth)

| Endpoint | Method | Описание |
|----------|--------|-------------|
| `/api/auth/register` | POST | Регистрация пользователя |
| `/api/auth/login` | POST | Вход + токены |
| `/api/auth/refresh` | POST | Обновление access token |
| `/api/auth/logout` | POST | Отзыв сессии |
| `/api/auth/me` | GET | Текущий профиль |
| `/api/auth/me/password` | PUT | Смена пароля |
| `/api/users` | GET,POST | Список/создание пользователей |
| `/api/users/{id}` | GET,PUT,DELETE | CRUD пользователя |
| `/api/users/{id}/roles` | PUT | Назначение ролей |
| `/api/roles` | GET,POST | Список/создание ролей |
| `/api/roles/{id}/permisos` | PUT | Назначение разрешений |
| `/api/sessions` | GET | Список активных сессий |

### 3.2. Backend MP

| Endpoint | Method | Описание |
|----------|--------|-------------|
| `/api/mp/quejas` | GET,POST | Список/создание заявок |
| `/api/mp/quejas/{id}` | GET | Просмотр деталей |
| `/api/mp/quejas/{id}/estado` | PATCH | Переход состояния (FSM) |
| `/api/mp/quejas/{id}/asignar` | PATCH | Назначить техника |
| `/api/mp/pruebas` | POST | Регистрация теста |
| `/api/mp/trabajos` | GET,POST | Список/создание работ |
| `/api/mp/trabajos/{id}/iniciar` | PATCH | Начать работу |
| `/api/mp/trabajos/{id}/cerrar` | PATCH | Закрыть работу |
| `/api/mp/telefonos` | GET,POST | CRUD телефонов |
| `/api/mp/lineas` | GET,POST | CRUD линий |
| `/api/mp/pizarras` | GET,POST | CRUD панелей |
| `/api/mp/movimientos` | GET,POST | История перемещений |
| `/api/mp/catalogos/*` | GET | Справочники (типы, сервисы и т.д.) |
| `/api/mp/dashboard` | GET | KPIs MP |

### 3.3. Backend Materiales

| Endpoint | Method | Описание |
|----------|--------|-------------|
| `/api/materials/materiales` | GET,POST | CRUD материалы |
| `/api/materials/materiales/{id}` | GET,PUT,DELETE | CRUD по ID |
| `/api/materials/asignaciones` | GET,POST | Назначения |
| `/api/materials/consumos` | GET,POST | Расходы |
| `/api/materials/dashboard` | GET | KPIs материалы |
| `/api/materials/saldos` | GET | Логический баланс |
| `/api/materials/categorias` | GET,POST | CRUD категории |
| `/api/materials/unidades` | GET,POST | CRUD единицы |
| `/api/materials/alertas-stock` | GET | Материалы с низким запасом |

## 4. Бизнес-правила (реализованы)

### 4.1. Приоритет заявки (BR-03)
```
prioridad = (tipo_peso × 1) + (servicio_peso × 1) + (ubicacion_peso × 1) + antiguedad_penalty

antiguedad_penalty = 1 если crédito > 2h, else 0
Resulta en escala 3-13 → mapeado a:
  12-13 → Prioridad 1 (Urgente)
  9-11  → Prioridad 2 (Alta)
  6-8   → Prioridad 3 (Media)
  3-5   → Prioridad 4 (Baja)
```

### 4.2. FSM заявки (BR-04)
```
Estados válidos y transiciones permitidas:

Reportada → Priorizada → Abierta → EnProgreso → PendientePrueba → PruebaExitosa → Cerrada
                                        → EnRevision
                                        → Cerrada (directo, sin prueba)

Cerrada → (Reabrir) → Reportada (nueva num_reporte)

Regla BR-12: Cerrar заявку requiere теста exitosa (excepto técnicos senior)
```

### 4.3. Stock Concurrente (BR-08, BR-09, BR-10)
```
Flujo asignación:
1. Verificar stock disponible ≥ cantidad solicitada
2. Adquirir Redis lock por material_id (con orden determinístico si hay múltiples)
3. Decrementar stock
4. Guardar asignación en transacción DB
5. Publicar evento AsignacionCreada
6. Liberar lock

Si stock insuficiente → error InsufficientStockException
Si lock timeout → retry con backoff exponencial (max 3 intentos)
```

## 5. Параллелизм

### 5.1. Валидация конкурентного запаса

```go
// backend-materiales-go/internal/application/service/asignacion_service.go
func (s *Service) validarStockConcurrente(items []AsignacionItem) error {
    var wg sync.WaitGroup
    errChan := make(chan error, len(items))
    
    for _, item := range items {
        wg.Add(1)
        go func(item AsignacionItem) {
            defer wg.Done()
            
            // Retry con backoff
            for attempt := 0; attempt < 3; attempt++ {
                if s.locker.Acquire(item.MaterialID, time.Second*5) {
                    defer s.locker.Release(item.MaterialID)
                    
                    stock := s.materialRepo.GetStock(item.MaterialID)
                    if stock >= item.Cantidad {
                        s.materialRepo.DecrementarStock(item.MaterialID, item.Cantidad)
                        return // success
                    }
                    // Retry
                }
                time.Sleep(time.Duration(attempt+1) * 100 * time.Millisecond)
            }
            
            errChan <- fmt.Errorf("insufficient stock for material %d", item.MaterialID)
        }(item)
    }
    
    wg.Wait()
    close(errChan)
    
    for err := range errChan {
        return err
    }
    return nil
}
```

### 5.2. Порядок блокировок
- Блокировки всегда приобретаются в порядке material_id (ascending) для предотвращения deadlock.
- Ver: BR-09 y BR-10 en [Event Storming](../practices/practice_03_event_storming.ru.md).

## 6. Мониторинг

### 6.1. Метрики приложения

| Метрика | Тип | Labels |
|---------|------|--------|
| `http_requests_total` | Counter | service, method, path, status |
| `http_request_duration_seconds` | Histogram | service, path |
| `db_queries_total` | Counter | service, query_type |
| `events_published_total` | Counter | service, event_type |
| `stock_validation_attempts_total` | Counter | service, material_id, result |
| `fsm_transition_invalid_total` | Counter | service, from_state, to_state |
| `rate_limit_exceeded_total` | Counter | service, route |

### 6.2. Endpoints проверки состояния

| Endpoint | Проверки |
|----------|--------|
| `/health` | DB connection, Redis, RabbitMQ |
| `/metrics` | Prometheus format |
| `/ready` | Readiness probe (K8s) |
| `/alive` | Liveness probe (K8s) |

### 6.3. Логи

Структура с Zap:
```json
{
  "timestamp": "2026-09-25T12:00:00Z",
  "level": "info",
  "service": "backend-mp",
  "request_id": "abc-123",
  "correlation_id": "xyz-789",
  "message": "Queja creada",
  "queja_id": 12345,
  "num_reporte": "1001",
  "prioridad": 2
}
```

## 7. Устранение неполадок (техническое)

### Ошибка: `InsufficientStockException`
- **Причина:** Недостаточный логический запас или таймаут блокировки
- **Решение:**
  1. Проверить `saldo_lógico` на дашборде
  2. Проверить блокировки в Redis (`/health/redis`)
  3. Просмотреть логи параллелизма
  4. Увеличить таймаут в `REDIS_LOCK_TIMEOUT`

### Ошибка: `FSMTransitionException`
- **Причина:** Попытка недопустимого перехода состояния
- **Решение:**
  1. Просмотреть матрицу состояний в [UML Dinámico](../practices/practice_06_uml_dynamic.ru.md)
  2. Проверить текущее состояние заявки
  3. Выполнить промежуточные переходы

### Ошибка: `AccountLockedException`
- **Причина:** 5 неудачных попыток входа
- **Решение:**
  1. Подождать 15 минут (автоматическая разблокировка)
  2. Или разблокировать через админ-панель

### Ошибка: `DBConnectionError`
- **Причина:** База данных отключена или pool соединений исчерпан
- **Решение:**
  1. Проверить контейнер Postgres (`docker-compose ps`)
  2. Увеличить `MAX_DB_CONNECTIONS` в .env
  3. Очистить pool соединений: `redis-cli FLUSHALL` (если влияет на сессии)

## 8. API Reference

- [MP API Reference](../api/mp_reference.md) (Swagger)
- [Auth API (Swagger)](...)
- [Materials API (Swagger)](...)

## 9. Деплой

```bash
# Сборка и развёртывание
make deploy STAGE=production

# Откат
make rollback VERSION=v1.0.0

# Просмотр статуса
make status
```

## 10. Ссылки

- [Диссертация - Реализация](../thesis/04_development.ru.md)
- [Диссертация - Основы](../thesis/02_state_of_art.ru.md)
- [Диссертация - Тестирование](../thesis/05_results.ru.md)
- [UML Dinámico](../practices/practice_06_uml_dynamic.ru.md)
- [UML Estáticо](../practices/practice_05_uml_static.ru.md)
- [Event Storming](../practices/practice_03_event_storming.ru.md)
- [BPMN](../practices/practice_04_bpmn.ru.md)