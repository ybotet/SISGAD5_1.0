# Практика 10 — Модель безопасности (Security Model)

> **Дисциплина:** Информационная безопасность
> **Специализация:** Security Model (Threat Modeling, RBAC, JWT, CORS)
> **Методология:** OWASP ASVS + STRIDE
> **Цель:** Определение и документирование уровней и механизмов безопасности SISGAD5

---

## 1. Угрозы (STRIDE)

| Категория | Угроза | Пример с SISGAD5 | Mitigation |
|-----------|--------|------------------|------------|
| **Spoofing** | Подмена пользователя | JWT подделка | HMAC SHA-256 подпись, секрет из .env |
| **Tampering** | Изменение данных | Изменение precio_unitario | ACID транзакции, precios congelяются |
| **Repudiation** | Отрицание действий | Техник отрицает отчёт | Auditoría (quién, qué, cuándо) |
| **Information Disclosure** | Утечка данных | User.id в responses | No sensitive data в payloads |
| **Denial of Service** | Блокировка сервиса | Brute force login | 5 попыток → блокировка 15min |
| **Elevation of Privilege** | Привилегии выше | Обычный user → admin | RBAC middleware на всех endpoints |

---

## 2. Аутентификация (Authentication)

### 2.1. JWT Token спецификация

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
graph TD
    A[User autenticado] --> B{generar AccessToken}
    B --> C[Header:\n{\"alg\":\"HS256\",\"typ\":\"JWT\"}]
    C --> D[Payload:\n{\"sub\":\"user-uuid\",\n \"email\":\"user@etecsa.cu\",\n \"nombre\":\"Имя\",\n \"roles\":[\"tecnico\"],\n \"permisos\":[\"mp:quejas:read\"],\n \"iat\":1730000000,\n \"exp\":1730003600}]
    D --> E[Signature:\nHMACSHA256(\nbase64url(header).\n+ base64url(payload),\nJWT_SECRET)]
    E --> F[Access Token (1h)]
    
    A --> G{generar RefreshToken}
    G --> H[Случайный UUID v4\n(32 bytes)]
    H --> I[Save hash в bd_users.sessions]
    I --> J[Refresh Token (7d)\nHttpOnly + Secure + SameSite]
    
    subgraph "Access Token Payload"
        D
    end
    
    subgraph "Refresh Flow"
        K[POST /auth/refresh] --> L[Validate refresh_token cookie]
        L --> M{Токен валиден?}
        M -->|Sí| N[Generate new Access+Refresh]
        N --> O[Revocar старый Refresh]
        O --> P[Set new cookies]
        M -->|No| Q[401 Unauthorized]
    end
    
    classDef crypto fill:#f3e5f5,stroke:#7b1fa2
    classDef token fill:#e3f2fd,stroke:#2196f3
    classDef flow fill:#fff3e0,stroke:#ff9800
    
    class C,D,E,F,H,I,J crypto
    class D token
    class K,L,M,N,O,P,Q flow
```

### 2.2. Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | `default-src 'self'` | Prevent XSS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy |
| `Permissions-Policy` | `geolocation=(), camera=()` | Restrict permissions |

---

## 3. Авторизация (Authorization — RBAC)

### 3.1. Матрица ролей и перmisos

| Rol | Recurso | Acción | Permiso |
|-----|---------|--------|---------|
| **admin** | users | create, read, update, delete | `user:*` |
| **admin** | roles | create, read, update, delete | `role:*` |
| **admin** | permissions | read | `permission:read` |
| **admin** | quejas | read | `mp:queja:read` |
| **admin** | materiales | create, read, update, delete | `material:*` |
| **admin** | categorias | create, read, update, delete | `categoria:*` |
| **admin** | unidades | create, read, update, delete | `unidad:*` |
| **op_admin** | quejas | create, read, update | `mp:queja:*` |
| **op_admin** | telefonos | create, read, update | `mp:telefono:*` |
| **op_admin** | pizarras | create, read, update | `mp:pizarra:*` |
| **tecnico** | trabajos | read (assigned), update estado | `mp:trabajo:read`, `mp:trabajo:estado` |
| **tecnico** | pruebas | create, read (assigned) | `mp:prueba:*` |
| **tecnico** | movimientos | create | `mp:movimiento:create` |
| **tecnico** | consumos | create | `mp:consumo:create` |
| **tecnico** | asignaciones | read (assigned) | `mp:asignacion:read` |
| **analista** | materiales | create, read, update | `material:*` |
| **analista** | categorias | create, read, update | `categoria:*` |
| **analista** | unidades | create, read, update | `unidad:*` |
| **analista** | asignaciones | create, read | `mp:asignacion:*` |
| **analista** | consumos | read | `mp:consumo:read` |
| **jefe** | trabajos | assign, update estado | `mp:trabajo:*` |
| **jefe** | quejas | assign, estado, close | `mp:queja:*` |
| **director** | dashboard | read all | `dashboard:*` |
| **director** | predictions | read | `prediction:*` |

### 3.2. Middleware: Permission check

```typescript
// Auth Middleware chain
app.use('/api/:service', [
  verifyJWT,           // 1. JWT signature + expiry
  extractClaims,       // 2. Extract user claims (id, roles, permisos)
  rbacMiddleware,      // 3. Check permission
  auditMiddleware,     // 4. Log action (quién, qué, cuándо)
  rateLimitMiddleware, // 5. Rate limiting
  routeHandler         // 6. Business logic
]);

// Example: RBAC check in MP Service
function tienePermiso(recurso: string, accion: string) {
  return (req, res, next) => {
    const permisos = req.user.permisos;
    const permiso = `${recurso}:${accion}`;
    if (permisos.includes(permiso) || permisos.includes(`${recurso}:*`)) {
      next();
    } else {
      throw new ForbiddenException('Недостаточно прав');
    }
  };
}
```

---

## 4. CORS и Security Headers

### 4.1. CORS policy

| Environment | Allowed Origins | Credentials |
|-------------|-----------------|-------------|
| **Production** | `https://sisgad5.etecsa.cu` | true |
| **Staging** | `https://sisgad5-staging.etecsa.cu` | true |
| **Development** | `http://localhost:5004` | true |

```typescript
// Gateway CORS config
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400,
};
```

### 4.2. Rate limiting

| Resource | Limit | Window | Scope |
|----------|-------|--------|-------|
| `/auth/login` | 5 запросов | 15 min | per IP |
| `/auth/register` | 3 запроса | 1 hour | per IP |
| `/api/*` | 100 запросов | 1 min | per user |
| `/api/predictions/*` | 30 запросов | 1 min | per user |

---

## 5. Управление секретами

### 5.1. .env файл (gitignored)

```bash
# JWT
JWT_SECRET=change-this-to-long-random-string
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=sisgad5
DB_PASSWORD=change-this-password
DB_NAME_USERS=bd_users
DB_NAME_MP=bd_mp
DB_NAME_MAT=bd_materiales
DB_NAME_PRED=bd_predictions

# Redis
REDIS_URL=redis://redis:6379

# Grafana
GRAFANA_ADMIN_PASSWORD=change-this-too

# MLflow
MLFLOW_TRACKING_URI=http://mlflow:5000

# CORS
CORS_ORIGIN=https://sisgad5.etecsa.cu
```

### 5.2. Security checklist (из AGENTS.md)

| Control | Status |
|---------|--------|
| JWT_SECRET не содержит fallback "secreto" | ✅ TASK-A-08 |
| Materials Service защищён JWT middleware | ✅ TASK-A-09 |
| Port 5003 закрыт в prod (только Gateway) | ✅ TASK-A-10 |
| Grafana admin/admin заменён | ✅ TASK-A-11 |
| CORS использует whitelist в prod | ✅ TASK-B-16 |
| RBAC применён в MP (quejas, trabajos) | ✅ TASK-B-17 |
| SQL queries используют replacements | ✅ TASK-B-18 |

---

## 6. Аудит и логирование

### 6.1. Аудит событий (quién, qué, cuándо)

| Action | Tabla | Campos audit |
|--------|-------|--------------|
| User created | users | user_id, created_by, created_at |
| User updated | users | user_id, updated_by, updated_at |
| Queja created | quejas | queja_id, created_by, created_at |
| Queja estado cambiado | quejas_logs | queja_id, user_id, old_state, new_state |
| Material created | materiales | material_id, created_by, created_at |
| Asignacion created | asignaciones | asig_id, created_by, created_at, trabajador |
| Consumo created | consumos | consumo_id, created_by, created_at, trabajador |
| Login exitoso | audit_logs | user_id, ip, user_agent, created_at |
| Login fallido | audit_logs | ip, attempts, created_at |

### 6.2. Security headers в ответах API

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Set-Cookie: access_token=eyJ...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refresh_token=eyJ...; HttpOnly; Secure; SameSite=Strict
Authorization: Bearer eyJ...`
```

---

## 7. Список угроз (Threat Model Summary)

| ID | Угроза | Сервис | Митигировано |
|----|--------|--------|--------------|
| THR-01 | JWT fallback "secreto" | All | ✅ |
| THR-02 | Materials accessible напрямую | Materials | ✅ |
| THR-03 | Grafana default creds | Monitoring | ✅ |
| THR-04 | Open CORS (wildcard) | Gateway | ✅ |
| THR-05 | Missing RBAC checks | MP | ✅ |
| THR-06 | SQL injection (string concat) | MP | ✅ |
| THR-07 | Race condition stock | Materials | ✅ (Redis lock) |
| THR-08 | Missing validation | All | ✅ (Zod) |
| THR-09 | Sensitive data in responses | All | ✅ |
| THR-10 | Missing audit log | All | ✅ (PostgreSQL trigger) |

---

## 8. Ссылки

- [Security Model на Español](practice_10_security_model.es.md)
- [Deployment Diagram](practice_08_deployment_diagram.ru.md)
- [DFD](practice_09_dfd.ru.md)
- [Аудитория безопасности](../../docs/audit/AUDITORIA.md)
- [Архитектура системы](practice_07_system_architecture.ru.md)