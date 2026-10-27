# Práctica 10 — Modelo de Seguridad

> **Дисциплина:** Информационная безопасность
> **Специализация:** Security Model (Threat Modeling, RBAC, JWT, CORS)
> **Методология:** OWASP ASVS + STRIDE
> **Цель:** Definir y documentar los уровни и механизмы de seguridad de SISGAD5

---

## 1. Amenazas (STRIDE)

| Категория | Amenaza | Пример с SISGAD5 | Mitigación |
|-----------|--------|------------------|------------|
| **Spoofing** | Подмена пользователя | JWT подделка | HMAC SHA-256 подпись, секрет из .env |
| **Tampering** | Изменение данных | Изменение precio_unitario | ACID транзакции, precios congelяются |
| **Repudiation** | Отрицание действий | Техник отрицает отчёт | Auditoría (quién, qué, cuándо) |
| **Information Disclosure** | Утечка данных | User.id en responses | No sensitive data en payloads |
| **Denial of Service** | Блокировка сервиса | Brute force login | 5 попыток → блокировка 15min |
| **Elevation of Privilege** | Привилегии выше | Обычный user → admin | RBAC middleware en todos endpoints |

---

## 2. Аутентификация (Authentication)

### 2.1. Especificación JWT

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
graph TD
    A[Usuario аутентифицирован] --> B{generar AccessToken}
    B --> C[Header:\n{\"alg\":\"HS256\",\"typ\":\"JWT\"}]
    C --> D[Payload:\n{\"sub\":\"user-uuid\",\n \"email\":\"user@etecsa.cu\",\n \"nombre\":\"Имя\",\n \"roles\":[\"tecnico\"],\n \"permisos\":[\"mp:quejas:read\"],\n \"iat\":1730000000,\n \"exp\":1730003600}]
    D --> E[Signature:\nHMACSHA256(\nbase64url(header).\n+ base64url(payload),\nJWT_SECRET)]
    E --> F[Access Token (1h)]

    A --> G{generar RefreshToken}
    G --> H[Случайный UUID v4\n(32 bytes)]
    H --> I[Save hash en bd_users.sessions]
    I --> J[Refresh Token (7d)\nHttpOnly + Secure + SameSite]

    subgraph "Payload Access Token"
        D
    end

    subgraph "Refresh Flow"
        K[POST /auth/refresh] --> L[Validate refresh_token cookie]
        L --> M{¿Токен валиден?}
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

| Header | Value | Propósito |
|--------|-------|----------|
| `Content-Security-Policy` | `default-src 'self'` | Prevenir XSS |
| `X-Content-Type-Options` | `nosniff` | Prevenir MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevenir clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Forzar HTTPS |
| `X-XSS-Protection` | `1; mode=block` | Protección XSS heredada |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacidad |
| `Permissions-Policy` | `geolocation=(), camera=()` | Restringir permisos |

---

## 3. Авторизация (Authorization — RBAC)

### 3.1. Matriz de roles y permisos

| Rol | Recurso | Acción | Permiso |
|-----|---------|--------|---------|
| **admin** | usuarios | create, read, update, delete | `usuario:*` |
| **admin** | roles | create, read, update, delete | `rol:*` |
| **admin** | permisos | read | `permiso:read` |
| **admin** | quejas | read | `mp:queja:read` |
| **admin** | materiales | create, read, update, delete | `material:*` |
| **admin** | categorias | create, read, update, delete | `categoria:*` |
| **admin** | unidades | create, read, update, delete | `unidad:*` |
| **operador_admin** | quejas | create, read, update | `mp:queja:*` |
| **operador_admin** | telefonos | create, read, update | `mp:telefono:*` |
| **operador_admin** | pizarras | create, read, update | `mp:pizarra:*` |
| **tecnico** | trabajos | read (назначенные), update estado | `mp:trabajo:read`, `mp:trabajo:estado` |
| **tecnico** | pruebas | create, read (назначенные) | `mp:prueba:*` |
| **tecnico** | movimientos | create | `mp:movimiento:create` |
| **tecnico** | consumos | create | `mp:consumo:create` |
| **tecnico** | asignaciones | read (назначенные) | `mp:asignacion:read` |
| **analista** | materiales | create, read, update | `material:*` |
| **analista** | categorias | create, read, update | `categoria:*` |
| **analista** | unidades | create, read, update | `unidad:*` |
| **analista** | asignaciones | create, read | `mp:asignacion:*` |
| **analista** | consumos | read | `mp:consumo:read` |
| **jefe** | trabajos | assign, update estado | `mp:trabajo:*` |
| **jefe** | quejas | assign, estado, close | `mp:queja:*` |
| **director** | dashboards | read all | `dashboard:*` |
| **director** | predictions | read | `prediction:*` |

### 3.2. Middleware: Verificación de permisos

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

### 4.1. Policy CORS

| Entorno | Orígenes permitidos | Credenciales |
|-------------|---------------------|----------------|
| **Production** | `https://sisgad5.etecsa.cu` | true |
| **Staging** | `https://sisgad5-staging.etecsa.cu` | true |
| **Разработка** | `http://localhost:5004` | true |

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

| Recurso | Límite | Ventana | Alcance |
|----------|-------|--------|-------|
| `/auth/login` | 5 запросов | 15 min | por IP |
| `/auth/register` | 3 запроса | 1 hour | por IP |
| `/api/*` | 100 запросов | 1 min | por usuario |
| `/api/predictions/*` | 30 запросов | 1 min | por usuario |

---

## 5. Gestión de secretos

### 5.1. Archivo .env (gitignored)

```bash
# JWT
JWT_SECRET=change-this-to-long-random-string
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Base de datos
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

| Control | Estado |
|---------|--------|
| JWT_SECRET no contiene fallback "secreto" | ✅ TASK-A-08 |
| Materials Service protegido con JWT middleware | ✅ TASK-A-09 |
| Port 5003 закрыт en prod (solo Gateway) | ✅ TASK-A-10 |
| Grafana admin/admin заменён | ✅ TASK-A-11 |
| CORS usa whitelist en prod | ✅ TASK-B-16 |
| RBAC применён в MP (quejas, trabajos) | ✅ TASK-B-17 |
| SQL queries используют replacements | ✅ TASK-B-18 |

---

## 6. Аудит и логирование

### 6.1. Eventos de auditoría (quién, qué, cuándо)

| Action | Tabla | Campos de auditoría |
|--------|-------|----------------------|
| Пользователь создан | users | user_id, created_by, created_at |
| Пользователь обновлён | users | user_id, updated_by, updated_at |
| Заявка создана | quejas | queja_id, created_by, created_at |
| Estado заявки изменён | quejas_logs | queja_id, user_id, old_state, new_state |
| Материал создан | materiales | material_id, created_by, created_at |
| Назначение создано | asignaciones | asig_id, created_by, created_at, trabajador |
| Расход создан | consumos | consumo_id, created_by, created_at, trabajador |
| Вход exitoso | audit_logs | user_id, ip, user_agent, created_at |
| Вход fallido | audit_logs | ip, attempts, created_at |

### 6.2. Security headers en ответах API

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

## 7. Resumen de amenazas (Threat Model Summary)

| ID | Amenaza | Сервис | Mitigado |
|----|--------|--------|----------|
| THR-01 | JWT fallback "secreto" | All | ✅ |
| THR-02 | Materials accesible directamente | Materials | ✅ |
| THR-03 | Grafana default creds | Monitoring | ✅ |
| THR-04 | CORS abierto (wildcard) | Gateway | ✅ |
| THR-05 | Falta RBAC checks | MP | ✅ |
| THR-06 | SQL injection (string concat) | MP | ✅ |
| THR-07 | Condición de carrera en stock | Materials | ✅ (Redis lock) |
| THR-08 | Falta validation | All | ✅ (Zod) |
| THR-09 | Datos sensibles en responses | All | ✅ |
| THR-10 | Falta audit log | All | ✅ (PostgreSQL trigger) |

---

## 8. Enlaces

- [Security Model en Русском](practice_10_security_model.ru.md)
- [Deployment Diagram](practice_08_deployment_diagram.es.md)
- [DFD](practice_09_dfd.es.md)
- [Аудитория seguridad](../../docs/audit/AUDITORIA.md)
- [Архитектура sistema](practice_07_system_architecture.es.md)