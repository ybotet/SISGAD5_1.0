# Контракты API (Индекс) - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25
> **Стандарт:** OpenAPI 3.0 (YAML)

---

## 1. Индекс контрактов

| Сервис | Файл | Базовый эндпоинт | Статус |
|--------|------|-----------------|--------|
| **Users Service** | [`api/users.yaml`](api/users.yaml) | `/api/users` | ⏳ В ожидании |
| **MP Service** | [`api/mp.yaml`](api/mp.yaml) | `/api/mp` | ⏳ В ожидании |
| **Materials Service** | [`api/materials.yaml`](api/materials.yaml) | `/api/materials` | ✅ Реализовано (Go Swagger) |
| **API Gateway** | [`api/gateway.yaml`](api/gateway.yaml) | `/` (прокси) | ⏳ В ожидании |

---

## 2. Users Service - Эндпоинты

### Аутентификация (`/api/auth`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| POST | `/register` | Регистрация пользователя | Нет |
| POST | `/login` | Login → access + refresh token | Нет |
| POST | `/refresh` | Обновление access token | Refresh Token |
| POST | `/logout` | Отзыв refresh token | Access Token |
| POST | `/forgot-password` | Запрос сброса пароля | Нет |
| POST | `/reset-password` | Сброс пароля с токеном | Нет |
| PUT | `/me/password` | Смена пароля (аутентифицированный) | Access Token |

### Пользователи (`/api/users`)

| Метод | Эндпоинт | Описание | Auth | Роли |
|-------|----------|----------|------|------|
| GET | `/` | Список пользователей (пагинация, фильтры) | Access Token | Admin |
| POST | `/` | Создание пользователя | Access Token | Admin |
| GET | `/:id` | Получить пользователя по ID | Access Token | Admin, Owner |
| PUT | `/:id` | Обновление пользователя | Access Token | Admin, Owner |
| DELETE | `/:id` | Удаление (soft) | Access Token | Admin |
| GET | `/:id/sessions` | История сессий | Access Token | Admin, Owner |
| PUT | `/:id/roles` | Назначение ролей пользователю | Access Token | Admin |

### Роли (`/api/roles`)

| Метод | Эндпоинт | Описание | Auth | Роли |
|-------|----------|----------|------|------|
| GET | `/` | Список ролей | Access Token | Admin |
| POST | `/` | Создание роли | Access Token | Admin |
| GET | `/:id` | Получить роль с разрешениями | Access Token | Admin |
| PUT | `/:id` | Обновление роли | Access Token | Admin |
| DELETE | `/:id` | Удаление роли | Access Token | Admin |
| PUT | `/:id/permisos` | Назначение разрешений роли | Access Token | Admin |

### Разрешения (`/api/permisos`)

| Метод | Эндпоинт | Описание | Auth | Роли |
|-------|----------|----------|------|------|
| GET | `/` | Список разрешений | Access Token | Admin |
| POST | `/` | Создание разрешения | Access Token | Admin |

### Здоровье

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/health` | Проверка состояния | Нет |

---

## 3. MP Service - Эндпоинты

### Телефоны (`/api/mp/telefonos`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, поиск, фильтры) | Access Token |
| POST | `/` | Создание телефона | Access Token |
| GET | `/:id` | Получить телефон | Access Token |
| PUT | `/:id` | Обновление телефона | Access Token |
| PATCH | `/:id/estado` | Смена статуса (активно/бан) | Access Token |
| DELETE | `/:id` | Удаление (soft) | Access Token |
| GET | `/:id/historial` | Полный история (жалобы, обходы, перемещения) | Access Token |

### Линии (`/api/mp/lineas`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, поиск, фильтры) | Access Token |
| POST | `/` | Создание линии | Access Token |
| GET | `/:id` | Получить линию | Access Token |
| PUT | `/:id` | Обновление линии | Access Token |
| PATCH | `/:id/estado` | Смена статуса (активно/бан) | Access Token |
| DELETE | `/:id` | Удаление (soft) | Access Token |
| GET | `/:id/historial` | Полный история | Access Token |

### Панели (`/api/mp/pizarras`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, поиск, фильтры) | Access Token |
| POST | `/` | Создание панели | Access Token |
| GET | `/:id` | Получить панель | Access Token |
| PUT | `/:id` | Обновление панели | Access Token |
| DELETE | `/:id` | Удаление (soft) | Access Token |
| GET | `/:id/historial` | Полный история | Access Token |
| GET | `/:id/puertos` | Список портов | Access Token |
| POST | `/:id/puertos` | Создание порта | Access Token |
| PUT | `/:id/puertos/:puertoId` | Обновление порта | Access Token |
| DELETE | `/:id/puertos/:puertoId` | Удаление порта | Access Token |

### Жалобы (`/api/mp/quejas`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, фильтры: статус, дата, техник, приоритет, тип) | Access Token |
| POST | `/` | Создание жалобы | Access Token |
| GET | `/:id` | Получить жалобу с деталями (тесты, работы, поток) | Access Token |
| PUT | `/:id` | Обновление жалобы (статус, приоритет, тип, ключ) | Access Token |
| PATCH | `/:id/asignar` | Назначить техника | Access Token |
| PATCH | `/:id/estado` | Смена статуса (проверка потока) | Access Token |
| GET | `/:id/historial` | История изменений статусов | Access Token |
| GET | `/:id/auditoria` | Аудит действий | Access Token |

### Тесты (`/api/mp/pruebas`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, фильтры) | Access Token |
| POST | `/` | Регистрация теста | Access Token |
| GET | `/:id` | Получить тест | Access Token |
| PUT | `/:id` | Обновление теста | Access Token |

### Работы (`/api/mp/trabajos`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, фильтры) | Access Token |
| POST | `/` | Создание заказа работы | Access Token |
| GET | `/:id` | Получить работу | Access Token |
| PUT | `/:id` | Обновление работы | Access Token |
| PATCH | `/:id/asignar` | Назначить техника | Access Token |
| PATCH | `/:id/cerrar` | Закрытие работы (требует реальное время) | Access Token |

### Статистика (`/api/mp/estadisticas`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/resumen` | Агрегированные KPIs | Access Token |
| GET | `/metricas` | Метрики по дате/сервису | Access Token |

### Каталоги MP (Только чтение для большинства)

| Ресурс | Эндпоинты |
|--------|-----------|
| Tipos Жалоб | GET `/api/mp/tipos-queja`, GET `/:id` |
| Servicios | GET `/api/mp/servicios`, GET `/:id` |
| Ubicaciones | GET `/api/mp/ubicaciones`, GET `/:id` |
| Claves | GET `/api/mp/claves`, GET `/:id` |
| Tipos Линий | GET `/api/mp/tipos-linea`, GET `/:id` |
| Tipos Панелей | GET `/api/mp/tipos-pizarra`, GET `/:id` |
| Clasificaciones | GET `/api/mp/clasificaciones`, GET `/:id` |
| Clasificador Clave | GET `/api/mp/clasificador-clave`, GET `/:id` |
| Claves | GET `/api/mp/claves`, GET `/:id` |
| Cables | GET `/api/mp/cables`, GET `/:id` |
| Сигнализации | GET `/api/mp/senalizaciones`, GET `/:id` |
| Sistemas | GET `/api/mp/sistemas`, GET `/:id` |
| Plantas | GET `/api/mp/plantas`, GET `/:id` |
| Propietarios | GET `/api/mp/propietarios`, GET `/:id` |
| Mandos | GET `/api/mp/mandos`, GET `/:id` |
| Grupos Trabajo | GET `/api/mp/grupos-trabajo`, GET `/:id` |
| Tipos Movimiento | GET `/api/mp/tipos-movimiento`, GET `/:id` |

### Здоровье

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/health` | Проверка состояния | Нет |

---

## 4. Materials Service - Эндпоинты

### Материалы (`/api/materials/materiales`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, поиск, фильтры категория/единица) | Access Token |
| POST | `/` | Создание материала | Access Token |
| GET | `/:id` | Получить материал | Access Token |
| PUT | `/:id` | Обновление материала | Access Token |
| DELETE | `/:id` | Удаление (soft) | Access Token |

### Категории (`/api/materials/categorias`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список | Access Token |
| POST | `/` | Создание категории | Access Token |
| GET | `/:id` | Получить категорию | Access Token |
| PUT | `/:id` | Обновление категории | Access Token |
| DELETE | `/:id` | Удаление (soft, RESTRICT если есть материалы) | Access Token |

### Единицы измерения (`/api/materials/unidades`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список | Access Token |
| POST | `/` | Создание единицы | Access Token |
| GET | `/:id` | Получить единицу | Access Token |
| PUT | `/:id` | Обновление единицы | Access Token |
| DELETE | `/:id` | Удаление (soft, RESTRICT если есть материалы) | Access Token |

### Назначения (`/api/materials/asignaciones`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, фильтры) | Access Token |
| POST | `/` | Создание назначения (множественные позиции, транзакция ACID) | Access Token |
| GET | `/:id` | Получить назначение с позициями | Access Token |
| PUT | `/:id` | Обновление назначения (только статус/наблюдения) | Access Token |

### Расходы (`/api/materials/consumos`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/` | Список (пагинация, фильтры) | Access Token |
| POST | `/` | Регистрация расхода (множественные позиции, транзакция ACID, проверка vs назначение) | Access Token |
| GET | `/:id` | Получить расход с позициями | Access Token |

### Дашборд (`/api/materials/dashboard`)

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/resumen` | Общая сводка (KPIs) | Access Token |
| GET | `/distribucion/categorias` | Распределение по категориям | Access Token |
| GET | `/distribucion/unidades` | Распределение по единицам | Access Token |
| GET | `/saldo/trabajadores` | Логический склад по пользователю | Access Token |
| GET | `/alertas/stock-bajo` | Оповещения низкого склада | Access Token |
| GET | `/exportar` | Экспорт CSV/JSON (`?format=csv\|json`) | Access Token |

### Здоровье

| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/health` | Проверка состояния | Нет |

---

## 5. API Gateway - Эндпоинты

### Прокси (Маршрутизация)

| Сервис | Префикс | Целевой адрес |
|--------|---------|---------------|
| Users | `/api/users/**` | `http://backend-users:3000` |
| Users Auth | `/api/auth/**` | `http://backend-users:3000` |
| MP | `/api/mp/**` | `http://backend-mp:3000` |
| Materials | `/api/materials/**` | `http://backend-materiales-go:8080` |

### Middleware Gateway

| Функция | Описание |
|---------|----------|
| JWT Verification | Проверка подписи, истечения, извлечение claims |
| Rate Limiting | Лимит по IP (настраивается) |
| CORS | Разрешённые источники настраиваются |
| Logging | Структурированный JSON с correlation-id |
| Error Handling | Единый формат: `{success: false, error: {code, message, statusCode}}` |

### Агрегированное здоровье

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| GET | `/health` | Агрегирует состояние всех сервисов |

---

## 6. Стандартный формат ответа

### Успех
```json
{
  "success": true,
  "data": T,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Ошибка
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Описание на понятном языке",
    "statusCode": 400,
    "details": {}
  }
}
```

### Часто используемые коды ошибок

| Код | HTTP | Описание |
|-----|------|---------|
| `VALIDATION_ERROR` | 400 | Неверные входные данные |
| `UNAUTHORIZED` | 401 | Токен недействителен/отсутствует |
| `FORBIDDEN` | 403 | Недостаточно разрешений для ресурса |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `CONFLICT` | 409 | Дублирующий ресурс / недопустимый переход |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |
| `SERVICE_UNAVAILABLE` | 503 | Сервис назначения недоступен |

---

## 7. Конвенции контрактов

- **Наименование:** snake_case для параметров, camelCase для JSON-свойств
- **Пагинация:** `?page=1&limit=10` (max 100)
- **Сортировка:** `?sortBy=campo&sortOrder=ASC|DESC`
- **Поиск:** `?search=texto` (соответствующие поля по сущности)
- **Фильтры:** `?campo=valor` (точное совпадение) или `?campo[in]=val1,val2`
- **Даты:** ISO 8601 (`2026-09-25T10:30:00Z`)
- **IDs:** UUID для пользователей/сессий, автоинкремент integer для каталогов/MP/Materials

---

## 8. Ссылки

- [Users Service OpenAPI](api/users.yaml)
- [MP Service OpenAPI](api/mp.yaml)
- [Materials Service OpenAPI](api/materials.yaml)
- [API Gateway OpenAPI](api/gateway.yaml)
- [Стратегия безопасности](13_security.ru.md)
- [Матрица RBAC](12_rbac_matrix.ru.md)
