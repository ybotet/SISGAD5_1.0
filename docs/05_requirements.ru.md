# Требования (Функциональные и Нефункциональные) - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Функциональные требования (RF)

### 1.1 Аутентификация и Авторизация (Users Service)

| ID | Требование | Описание | Приорitet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-AUTH-01 | Регистрация пользователей | Создать пользователя с email, password, начальными ролями | 🔴 Критическое | UC-01 |
| RF-AUTH-02 | Login JWT | Аутентификация, возврат access_token (15мин) + refresh_token (7д) | 🔴 Критическое | UC-02 |
| RF-AUTH-03 | Refresh Token | Обновление access_token с использованием действительного refresh_token | 🔴 Критическое | UC-03 |
| RF-AUTH-04 | Logout | Отзыв refresh_token в БД | 🔴 Критическое | UC-04 |
| RF-AUTH-05 | Восстановление пароля | Поток: email → временный токен → новый пароль | 🟡 Высокое | UC-08 |
| RF-AUTH-06 | Смена пароля | Аутентифицированный пользователь меняет пароль | 🟡 Высокое | UC-08 |
| RF-AUTH-07 | Блокировка по попыткам | Блокировка аккаунта после 5 неудачных попыток (15 мин) | 🟢 Среднее | - |
| RF-AUTH-08 | История сессий | Запись IP, user-agent, последней активности | 🟢 Среднее | - |

### 1.2 Управление Пользователями и Ролями (Users Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-USR-01 | CRUD Пользователи (Admin) | Список (пагинация), создание, чтение, обновление, удаление | 🔴 Критическое | UC-05 |
| RF-USR-02 | CRUD Роли | Создание, чтение, обновление, удаление ролей | 🔴 Критическое | UC-06 |
| RF-USR-03 | Назначение ролей | Связывание/разъединение ролей с пользователями | 🔴 Критическое | UC-07 |
| RF-USR-04 | Middleware RBAC | Проверка разрешений по каждому эндпоинту | 🔴 Критическое | - |
| RF-USR-05 | Health Check | GET /health → {status: "UP"} | 🟡 Высокое | - |

### 1.3 Управление Инфраструктурой MP (MP Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MP-01 | CRUD Телефоны | Создание, чтение, обновление, удаление с данными клиента | 🔴 Критическое | UC-09 |
| RF-MP-02 | Статус Телефона | Смена активно/бан с датой | 🔴 Критическое | UC-09 |
| RF-MP-03 | История Телефона | Жалобы, обходы, перемещения | 🔴 Критическое | UC-13 |
| RF-MP-04 | Поиск Телефоны | Фильтры: текстовый поиск, статус, клиент | 🟡 Высокое | UC-12 |
| RF-MP-05 | CRUD Линии | Создание, чтение, обновление, удаление | 🔴 Критическое | UC-10 |
| RF-MP-06 | Статус Линии | Смена активно/бан с датой | 🔴 Критическое | UC-10 |
| RF-MP-07 | История Линии | Жалобы, обходы, перемещения | 🔴 Критическое | UC-13 |
| RF-MP-08 | Поиск Линии | Фильтры: текстовый поиск, статус | 🟡 Высокое | UC-12 |
| RF-MP-09 | CRUD Панели | Создание, чтение, обновление, удаление | 🔴 Критическое | UC-11 |
| RF-MP-10 | Карта Портов | CRUD портов для каждой панели | 🟡 Высокое | UC-11 |
| RF-MP-11 | Соединения | Входящие/исходящие для каждого порта | 🟡 Высокое | UC-11 |
| RF-MP-12 | Физическое расположение | Геолокация (lat, lng, address) | 🟡 Высокое | UC-11 |
| RF-MP-13 | Поиск Панели | Фильтры: текстовый поиск, локация | 🟡 Высокое | UC-12 |

### 1.4 Управление Жалобами (MP Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MP-14 | Регистрация Жалобы | POST /quejas с обязательной классификацией | 🔴 Критическое | UC-14 |
| RF-MP-15 | Классификация | tipo_queja, servicio, ubicacion (FK-ключи) | 🔴 Критическое | UC-14 |
| RF-MP-16 | Приоритетирование | Уровни 1-4 с автоматическим расчетом | 🔴 Критическое | UC-14 |
| RF-MP-17 | Поток Состояний | Abierta→Probada→Asignada→Pendiente→Resuelta→Cerrada | 🔴 Критическое | UC-15 |
| RF-MP-18 | Назначение Техника | PATCH /quejas/:id/asignar с проверкой роли | 🔴 Критическое | UC-16 |
| RF-MP-19 | История Изменений | Автоматическая регистрация переходов состояний | 🔴 Критическое | UC-15 |
| RF-MP-20 | Аудит Действий | Журнал: кто, что, когда, IP | 🔴 Критическое | - |
| RF-MP-21 | Поиск Жалобы | Фильтры: статус, дата, техник, приоритет, тип | 🟡 Высокое | UC-12 |
| RF-MP-22 | Пагинация | ?page=1&limit=10 в списках | 🟡 Высокое | UC-12 |
| RF-MP-23 | Уведомления Email | При назначении/смене статуса (настраивается) | 🟢 Среднее | - |

### 1.5 Управление Тестами (MP Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MP-24 | Регистрация Теста | POST /pruebas с результатом и наблюдениями | 🔴 Критическое | UC-17 |
| RF-MP-25 | Результаты Теста | Поля: exitoso, mediciones, observaciones | 🔴 Критическое | UC-17 |
| RF-MP-26 | Связывание | FK с queja_id И/ИЛИ trabajo_id (хотя бы один) | 🔴 Критическое | UC-17 |
| RF-MP-27 | История Тестов | Список с фильтрами по дате, технику, результату | 🟡 Высокое | UC-17 |

### 1.6 Управление Работами (MP Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MP-28 | Создание Заказа Работы | POST /trabajos с описанием, временем оценки | 🔴 Критическое | UC-18 |
| RF-MP-29 | Назначение Техника | PATCH /trabajos/:id/asignar | 🔴 Критическое | UC-16 |
| RF-MP-30 | Время Оценка vs Фактическое | Поля: estimado_horas, real_horas | 🟡 Высокое | UC-19 |
| RF-MP-31 | Закрытие Работы | PATCH /trabajos/:id/cerrar с фактическим временем | 🔴 Критическое | UC-19 |
| RF-MP-32 | История Работ | Список с фильтрами | 🟡 Высокое | UC-19 |

### 1.7 Статистика MP (MP Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MP-33 | Общий Сводка | GET /estadisticas/resumen с KPIs | 🟡 Высокое | UC-20 |
| RF-MP-34 | Агрегированные Метрики | По статусу, приоритету, технику, сервису | 🟡 Высокое | UC-20 |
| RF-MP-35 | Фильтры Дата/Сервис | Query-параметры функциональны | 🟢 Среднее | UC-20 |

### 1.8 Каталог Материалов (Materials Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MAT-01 | CRUD Материалы | Название, код, цена, единица, категория обязательны | 🔴 Критическое | UC-21 |
| RF-MAT-02 | CRUD Категории/Единицы | Управление независимо с ссылочной целостностью | 🔴 Критическое | UC-21 |
| RF-MAT-03 | Назначение Множественных Позиций | POST /asignaciones с массивом позиций | 🔴 Критическое | UC-22 |
| RF-MAT-04 | Расход Множественных Позиций | POST /consumos с массивом позиций | 🔴 Критическое | UC-23 |
| RF-MAT-05 | Фильтры Категория/Единица | Query-параметры в списках | 🟡 Высокое | UC-21 |
| RF-MAT-06 | Захват Цены Момент/Реальная | costo_unitario_momento (назначение) / costo_unitario_real (расход) | 🔴 Критическое | UC-22, UC-23 |
| RF-MAT-07 | Текстовый поиск | ?search=... в названии, коде, описании | 🔴 Критическое | UC-21 |
| RF-MAT-08 | Пагинация | ?page=1&limit=10 | 🔴 Критическое | UC-21 |

### 1.9 Транзакции и Проверки (Materials Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MAT-09 | Транзакция ACID Назначение | db.Transaction() с откатом при ошибке | 🔴 Критическое | UC-22 |
| RF-MAT-10 | Транзакция ACID Расход | db.Transaction() с откатом при ошибке | 🔴 Критическое | UC-23 |
| RF-MAT-11 | Проверка Существования Материала | HTTP 400 если материал не существует | 🔴 Критическое | UC-22, UC-23 |
| RF-MAT-12 | Проверка Количеств | HTTP 400 если количество ≤ 0 | 🔴 Критическое | UC-22, UC-23 |
| RF-MAT-13 | Проверка Фактического Склада | Расход ≤ Назначено (дополнить stub) | 🔴 Критическое | UC-23 |
| RF-MAT-14 | Проверка против Назначения | Расход не может превышать незавершенное назначение | 🔴 Критическое | UC-23 |
| RF-MAT-15 | Конкуренция Go | Goroutines + WaitGroup + Channels для проверок | 🟡 Высокое | UC-22, UC-23 |

### 1.10 Аналитика и Дашборды (Materials Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MAT-16 | Общий Сводка | GET /dashboard/resumen | 🔴 Критическое | UC-24 |
| RF-MAT-17 | Распределение Категорий | Агрегация по категории | 🔴 Критическое | UC-24 |
| RF-MAT-18 | Распределение Единиц | Агрегация по единице | 🔴 Критическое | UC-24 |
| RF-MAT-19 | Логический Склад Пользователя | Σ(назначено) − Σ(расходовано) | 🟡 Высокое | UC-24 |
| RF-MAT-20 | Оповещения Низкого Склада | Настраиваемый эндпоинт оповещений | 🟢 Среднее | UC-24 |
| RF-MAT-21 | Экспорт CSV/JSON | ?format=csv|json | 🟢 Среднее | UC-24 |
| RF-MAT-22 | Тенденции/Прогнозы | Базовая статистическая модель | ⚪ Низкое | UC-24 |

### 1.11 Интеграция (Materials Service)

| ID | Требование | Описание | Приoritet | Вариант использования |
|----|-----------|----------|----------|----------------------|
| RF-MAT-23 | REST Endpoints | Под /api/materials/* | 🔴 Критическое | - |
| RF-MAT-24 | Совместимость с API Gateway | Функционирующий прокси | 🔴 Критическое | - |
| RF-MAT-25 | Health Check | GET /health → {status: "UP"} | 🔴 Критическое | - |
| RF-MAT-26 | Swagger UI | Интерактивная документация | 🔴 Критическое | - |
| RF-MAT-27 | Экспорт SAP | CSV, совместимый с SAP | 🟢 Среднее | - |

---

## 2. Нефункциональные требования (RNF)

| ID | Категория | Требование | Метрика/Цель |
|----|-----------|------------|--------------|
| RNF-01 | Производительность | Задержка API | < 200ms p95 |
| RNF-02 | Производительность | Пропускная способность | 1000+ RPS |
| RNF-03 | Производительность | Конкуренция | 500+ одновременных пользователей |
| RNF-04 | Доступность | Uptime | 99.9% |
| RNF-05 | Безопасность | Аутентификация | JWT RS256 + Refresh rotation |
| RNF-06 | Безопасность | Авторизация | RBAC по эндпоинту |
| RNF-07 | Безопасность | Чувствительные данные | Bcrypt (password), HTTPS обязательный |
| RNF-08 | Безопасность | Аудит | Непизменяемый журнал критических действий |
| RNF-09 | Масштабируемость | Горизонтальная | Бесформатные сервисы, shared-nothing |
| RNF-10 | Поддерживаемость | Покрытие тестами | ≥ 70% модульных |
| RNF-11 | Поддерживаемость | Документация | OpenAPI 3.0 + Swagger UI |
| RNF-12 | Операционность | Логи | JSON структурированные, централизованные (Loki) |
| RNF-13 | Операционность | Метрики | Prometheus + Grafana дашборды |
| RNF-14 | Операционность | Трассируемость | Correlation IDs cross-service |
| RNF-15 | Переносимость | Контейнеры | Docker multi-stage < 200MB |
| RNF-16 | Совместимость | Браузеры | Chrome, Firefox, Edge (последние 2 версии) |
| RNF-17 | Доступность | Frontend | WCAG 2.1 AA |
| RNF-18 | Интернационализация | ES/RU | Полный i18n frontend |

---

## 3. Бизнес-правила (RN)

См. [Бизнес-правила](06_business_rules.ru.md)

---

## 4. Матрица трассируемости (Требования → Варианты использования → Классы домена → Эндпоинты → Тесты)

> **Цель:** Полная трассируемость между функциональными требованиями, вариантами использования, классами домена, эндпоинтами API и связанными тестами.

### 4.1 Аутентификация и Пользователи (Users Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-AUTH-01 | UC-01 | User, Rol | POST /api/auth/register | auth.test.js |
| RF-AUTH-02 | UC-02 | User, Sesion, Email, PasswordHash | POST /api/auth/login | auth.test.js |
| RF-AUTH-03 | UC-03 | Sesion, RefreshToken | POST /api/auth/refresh | auth.test.js |
| RF-AUTH-04 | UC-04 | Sesion | POST /api/auth/logout | auth.test.js |
| RF-AUTH-07 | — | User | — | auth.test.js |
| RF-AUTH-08 | — | Sesion | — | auth.test.js |
| RF-USR-01 | UC-05 | User | GET /api/users (пагинация) | users.test.js |
| RF-USR-02 | UC-06 | Rol | CRUD /api/roles/* | roles.test.js |
| RF-USR-03 | UC-07 | User, Rol, User_Roles | POST /api/users/:id/roles | users.test.js |
| RF-USR-04 | — | — | Все | auth.middleware.test.js |

### 4.2 Управление Инфраструктурой MP (MP Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MP-01 | UC-09 | Telefono | CRUD /api/mp/telefonos/* | telefonos.test.js |
| RF-MP-02 | UC-09 | Telefono | PATCH /api/mp/telefonos/:id/estado | telefonos.test.js |
| RF-MP-03 | UC-13 | Telefono | GET /api/mp/telefonos/:id/historial | telefonos.test.js |
| RF-MP-04 | UC-12 | Telefono | GET /api/mp/telefonos?search= | telefonos.test.js |
| RF-MP-05 | UC-10 | Linea | CRUD /api/mp/lineas/* | lineas.test.js |
| RF-MP-10 | UC-11 | Pizarra, Puerto | CRUD /api/mp/pizarras/* | pizarras.test.js |
| RF-MP-11 | UC-11 | Puerto, Conexion | CRUD /api/mp/puertos/* | puertos.test.js |
| RF-MP-12 | UC-11 | Pizarra, Coordinates | PATCH /api/mp/pizarras/:id/ubicacion | pizarras.test.js |

### 4.3 Управление Жалобами (MP Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MP-14 | UC-14 | Queja | POST /api/mp/quejas | quejas.test.js |
| RF-MP-15 | UC-14 | Clave, TipoQueja, Servicio, Ubicacion | — (включено в Queja) | quejas.test.js |
| RF-MP-16 | UC-14 | Queja, Priority | — (автоматически) | quejas.test.js |
| RF-MP-17 | UC-15 | Queja (FSM) | PATCH /api/mp/quejas/:id/estado | quejas.test.js |
| RF-MP-18 | UC-16 | Queja | PATCH /api/mp/quejas/:id/asignar | quejas.test.js |
| RF-MP-19 | UC-15 | Queja (история) | GET /api/mp/quejas/:id/historial | quejas.test.js |
| RF-MP-20 | — | Queja (аудит) | — (логирование) | audit.test.js |
| RF-MP-21 | UC-12 | Queja | GET /api/mp/quejas?filter= | quejas.test.js |

### 4.4 Управление Тестами и Работами (MP Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MP-24 | UC-17 | Prueba | POST /api/mp/pruebas | pruebas.test.js |
| RF-MP-25 | UC-17 | Prueba | — (поля результата) | pruebas.test.js |
| RF-MP-26 | UC-17 | Prueba (FK) | POST /api/mp/pruebas | pruebas.test.js |
| RF-MP-27 | UC-17 | Prueba | GET /api/mp/pruebas?filter= | pruebas.test.js |
| RF-MP-28 | UC-18 | Trabajo | POST /api/mp/trabajos | trabajos.test.js |
| RF-MP-29 | UC-16 | Trabajo | PATCH /api/mp/trabajos/:id/asignar | trabajos.test.js |
| RF-MP-30 | UC-19 | Trabajo | PUT /api/mp/trabajos/:id/tiempo | trabajos.test.js |
| RF-MP-31 | UC-19 | Trabajo (cierre) | PATCH /api/mp/trabajos/:id/cerrar | trabajos.test.js |

### 4.5 Управление Материалами (Materials Service - Go)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MAT-01 | UC-21 | Material | CRUD /api/materials/materiales/* | materiales_test.go |
| RF-MAT-02 | UC-21 | Categoria, UnidadMedida | CRUD /api/materials/categorias/* | categorias_test.go |
| RF-MAT-03 | UC-22 | Asignacion, AsignacionItem | POST /api/materials/asignaciones | asignacion_test.go |
| RF-MAT-04 | UC-23 | Consumo, ConsumoItem | POST /api/materials/consumos | consumo_test.go |
| RF-MAT-05 | UC-21 | Material, Categoria, UnidadMedida | GET /api/materials/*?filter= | materiales_test.go |
| RF-MAT-06 | UC-22, UC-23 | AsignacionItem, ConsumoItem | — (захват цены) | asignacion_test.go |
| RF-MAT-07 | UC-21 | Material | GET /api/materials/*?search= | materiales_test.go |
| RF-MAT-08 | UC-21 | Pagination | GET /api/materials/*?page= | materiales_test.go |

### 4.6 Транзакции и Проверки (Materials Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MAT-09 | UC-22 | Asignacion (транзакция) | POST /api/materials/asignaciones | asignacion_test.go |
| RF-MAT-10 | UC-23 | Consumo (транзакция) | POST /api/materials/consumos | consumo_test.go |
| RF-MAT-11 | UC-22, UC-23 | Material | POST /api/materials/* | materiales_test.go |
| RF-MAT-12 | UC-22, UC-23 | AsignacionItem, ConsumoItem | POST /api/materials/* | asignacion_test.go |
| RF-MAT-13 | UC-23 | Consumo, Asignacion | POST /api/materials/consumos | consumo_test.go |
| RF-MAT-14 | UC-23 | Consumo, Asignacion | POST /api/materials/consumos | consumo_test.go |
| RF-MAT-15 | UC-22, UC-23 | Asignacion, Consumo (конкуренция) | POST /api/materials/* | concurrency_test.go |

### 4.7 Аналитика и Дашборды (Materials Service + MP Service)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-MAT-16 | UC-24 | — | GET /api/materials/dashboard/resumen | dashboard_test.go |
| RF-MAT-17 | UC-24 | — | GET /api/materials/dashboard/categorias | dashboard_test.go |
| RF-MAT-18 | UC-24 | — | GET /api/materials/dashboard/unidades | dashboard_test.go |
| RF-MAT-19 | UC-24 | Material (Логический склад) | GET /api/materials/dashboard/saldo | dashboard_test.go |
| RF-MAT-20 | UC-24 | Material | GET /api/materials/dashboard/alertas | dashboard_test.go |
| RF-MAT-21 | UC-24 | — | GET /api/materials/dashboard?format=csv | dashboard_test.go |
| RF-MP-33 | UC-20 | — | GET /api/mp/estadisticas/resumen | estadisticas.test.js |
| RF-MP-34 | UC-20 | — | GET /api/mp/estadisticas?group_by= | estadisticas.test.js |

### 4.8 Prediction Service (MLOps)

| Требование | Вариант использования | Класс домена | Эндпоинт | Тест |
|-----------|---------------------|--------------|----------|------|
| RF-PRED-01 | Predictive Use Case 1 | DemandaModel | POST /api/predictions/demanda | test_demanda.py |
| RF-PRED-02 | Predictive Use Case 2 | TiempoModel | POST /api/predictions/tiempo | test_tiempo.py |
| RF-PRED-03 | Predictive Use Case 3 | AnomaliaModel | POST /api/predictions/anomalias | test_anomalias.py |
| RF-PRED-04 | Predictive Use Case 4 | PrioridadModel | POST /api/predictions/prioridad | test_prioridad.py |
| RF-PRED-05 | Predictive Use Case 5 | FallosModel | POST /api/predictions/fallos | test_fallos.py |
| RF-PRED-06 | Predictive Use Case 6 | AsignacionModel | POST /api/predictions/asignacion | test_asignacion.py |
| RF-PRED-07 | — | Prediction | GET /api/predictions/models | test_models.py |
| RF-PRED-08 | — | Prediction (Retraining) | POST /api/predictions/retrain | test_retrain.py |

---

## 5. Ссылки

- [Варианты использования](03_use_cases.ru.md)
- [Бизнес-правила](06_business_rules.ru.md)
- [Модель домена](07_domain_model.ru.md)
- [Матрица RBAC](12_rbac_matrix.ru.md)
- [Стратегия безопасности](13_security.ru.md)
