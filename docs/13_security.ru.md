# Стратегия безопасности - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Обзор

Безопасность в SISGAD5 реализуется по слоям (Defense in Depth):

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│  Rate Limiting │ CORS │ JWT Verification │ Logging │ Proxy  │
└─────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Users Service │    │  MP Service   │    │Materials Svc  │
│  (AuthZ)      │    │  (AuthZ)      │    │  (AuthZ)      │
│  RBAC Middle  │    │  RBAC Middle  │    │  RBAC Middle  │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 2. Аутентификация (JWT + Refresh Tokens)

### 2.1 Access Token (JWT)
- **Алгоритм:** RS256 (публичный/приватный ключ)
- **Срок действия:** 15 минут (настраивается: `JWT_ACCESS_TTL`)
- **Обязательные claims:**
  ```json
  {
    "sub": "uuid-usuario",
    "email": "user@domain.com",
    "roles": ["tecnico", "analista"],
    "permissions": ["quejas:read", "materiales:create", ...],
    "iat": 1699999999,
    "exp": 1700000899,
    "jti": "unique-token-id"
  }
  ```

### 2.2 Refresh Token
- **Формат:** Непрозрачный токен (random 64 bytes, base64url)
- **Срок действия:** 7 дней (настраивается: `JWT_REFRESH_TTL`)
- **Хранилище:** Hash в БД (`sesiones.refresh_token_hash` = bcrypt(refresh_token))
- **Ротация:** Каждое использование отзывает предыдущий и генерирует новую пару (обнаружение кражи)

### 2.3 Поток входа (Login)

```
Пользователь → POST /api/auth/login {email, password}
           ← 200 OK { access_token, refresh_token, user }
           │
           ▼ (последующие запросы)
Клиент → GET /api/mp/quejas
        Authorization: Bearer <access_token>
        │
        ▼ (Gateway)
Gateway → Проверить подпись RS256
         Проверить exp < now
         Проверить jti не в blacklist
         Извлечь claims → headers X-User-Id, X-User-Roles, X-User-Permissions
         Прокси на downstream сервис
```

### 2.4 Поток Refresh

```
Клиент → POST /api/auth/refresh { refresh_token }
       │
       ▼ (Users Service)
Service → Поиск сессии по refresh_token_hash = bcrypt(refresh_token)
        ЕСЛИ не существует ИЛИ отозвана ИЛИ expira_en < now → 401
        ЕСЛИ существует и действительна:
          1. Пометить текущую сессию как отозванную
          2. Сгенерировать новый access_token (новый jti)
          3. Сгенерировать новый refresh_token
          4. Создать новую сессию с новым refresh_token_hash
          5. Вернуть { access_token, refresh_token }
        ← 200 OK { access_token, refresh_token }
```

### 2.5 Logout

```
Клиент → POST /api/auth/logout { refresh_token }
       │
       ▼
Service → Искать сессию, установить revocada = true
       ← 200 OK { message: "Sesión cerrada" }
```

---

## 3. Авторизация (RBAC)

### 3.1 Модель
- **Пользователь** имеет **Роли** (многие-ко-многим)
- **Роль** имеет **Разрешения** (многие-ко-многим)
- **Разрешение** = `recurso:accion` (ej: `quejas:create`, `materiales:read`)

### 3.2 Проверка в сервисах
```javascript
// Универсальный middleware
const requirePermission = (resource, action) => (req, res, next) => {
  const userPerms = req.user.permissions || [];
  const required = `${resource}:${action}`;
  const hasWildcard = userPerms.includes('*');
  const hasPermission = userPerms.includes(required);
  
  if (hasWildcard || hasPermission) return next();
  return res.status(403).json({
    success: false,
    error: { code: 'FORBIDDEN', message: `Permiso requerido: ${required}` }
  });
};
```

### 3.3 Специальные разрешения (Собственность)
- `users:read` → может читать **всех** (admin) или **только своих** (другие роли)
- `quejas:read` → admin: все, técnico: назначенные, operador: все, jefe: все
- Реализуется в **Service Layer** (не только в middleware)

---

## 4. Защита данных

### 4.1 Пароли
- **Hash:** Bcrypt с cost factor 12
- **Политика:** Минимум 8 символов, 1 заглавная, 1 строчная, 1 цифра, 1 специальный
- **Никогда** не логировать пароли или их hash

### 4.2 Чувствительные данные в логах
- **Автоматическая санитизация:** Middleware удаляет `password`, `token`, `authorization`, `refresh_token` из логов запросов/ответов
- **Correlation ID:** UUID для каждого запроса для трассировки без раскрытия данных

### 4.3 Обязательный HTTPS
- **Разработка:** localhost с mkcert (локальная CA)
- **Продакшен:** TLS 1.3, действительные сертификаты, HSTS
- **Заголовки безопасности:**
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  ```

---

## 5. Ограничение скорости (Rate Limiting)

### 5.1 API Gateway (Глобально)
```yaml
# Конфигурация по IP
rate_limit:
  window: "15m"
  max_requests: 100
  burst: 20
```

### 5.2 По эндпоинту (Критические)
| Эндпоинт | Лимит | Окно |
|----------|-------|------|
| POST /auth/login | 5 | 15 мин |
| POST /auth/register | 3 | 1 час |
| POST /auth/refresh | 10 | 15 мин |
| POST /auth/forgot-password | 2 | 1 час |

### 5.3 Заголовки ответа
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1699999999
Retry-After: 60 (если превышено)
```

---

## 6. CORS

### 6.1 Конфигурация
```javascript
// API Gateway
cors: {
  origin: [
    'https://sisgad5.dominio.cu',     // Продакшен
    'https://staging.sisgad5.dominio.cu', // Staging
    'http://localhost:5173',          // Разработка (Vite)
    'http://localhost:3000'           // Разработка (альтернативный)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 часа
}
```

---

## 7. Аудит и трассируемость

### 7.1 Аудиторские события (Непизменяемые)
| Событие | Регистрируемые данные |
|--------|-----------------------|
| Успешный/неудачный вход | user_id, email, ip, user_agent, success, timestamp |
| Использованный refresh token | session_id, user_id, ip, timestamp, ротация |
| Выход | session_id, user_id, timestamp |
| Смена статуса жалобы | queja_id, estado_anterior, estado_nuevo, user_id, ip, timestamp |
| Назначение техника | queja_id/trabajo_id, tecnico_id, user_id (назначивший), timestamp |
| CRUD пользователей | target_user_id, admin_user_id, action, timestamp |
| Назначение/расход материалов | asignacion_id/consumo_id, trabajador_id, items, timestamp |

### 7.2 Хранилище
- **Таблица:** `audit_logs` (только append, никогда update/delete)
- **Партиционирование:** По месяцам
- **Удержание:** 7 лет (законодательное требование)

### 7.3 Формат структурированного лога (JSON)
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
  "success": true
}
```

---

## 8. Безопасность контейнеров

### 8.1 Dockerfile (Многостадийный, Non-root)
```dockerfile
# Этап 1: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Этап 2: Выполнение
FROM node:20-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### 8.2 Управление секретами
- **Разработка:** `.env` (gitignored)
- **Продакшен:** GitHub Secrets → Инъекция в CI/CD → Переменные окружения в runtime
- **Никогда** не хардкодить секреты в коде или образах

---

## 9. Сканирование уязвимостей

### 9.1 CI/CD Pipeline
```yaml
# .github/workflows/security.yml
- name: Run npm audit
  run: npm audit --audit-level=high
  
- name: Run Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
- name: Run Trivy (Docker)
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
    severity: 'CRITICAL,HIGH'
```

### 9.2 Dependabot
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## 10. Чек-лист безопасности (Перед релизом)

- [ ] Все эндпоинты имеют middleware аутентификации
- [ ] Все мутирующие эндпоинты имеют проверку разрешений
- [ ] Rate limiting настроен в Gateway и критических эндпоинтах
- [ ] CORS ограничен известными источниками
- [ ] Заголовки безопасности present во всех ответах
- [ ] Логи не содержат чувствительных данных (passwords, tokens)
- [ ] Аудит событий внедрён для критических операций
- [ ] Зависимости просканированы (npm audit, Snyk, Trivy)
- [ ] Docker образы без уязвимостей CRITICAL/HIGH
- [ ] Секреты ротированы и не в коде
- [ ] Базовые тесты проникновения (OWASP Top 10)
- [ ] Документ план реагирования на incidentы

---

## 11. Ссылки

- [Матрица RBAC](12_rbac_matrix.ru.md)
- [Модель домена](07_domain_model.ru.md) - Сущности User, Sesion
- [Варианты использования](03_use_cases.ru.md) - UC-01 a UC-08
- [Диаграммы последовательностей](08_sequence_diagrams.ru.md) - Сценарий 3
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
