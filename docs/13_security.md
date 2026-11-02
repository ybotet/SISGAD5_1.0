# Estrategia de Seguridad - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Visión General

La seguridad en SISGAD5 se implementa en capas (Defense in Depth):

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

## 2. Autenticación (JWT + Refresh Tokens)

### 2.1 Access Token (JWT)
- **Algoritmo:** RS256 (clave pública/privada)
- **Expiración:** 15 minutos (configurable: `JWT_ACCESS_TTL`)
- **Claims obligatorios:**
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
- **Formato:** Token opaco (random 64 bytes, base64url)
- **Expiración:** 7 días (configurable: `JWT_REFRESH_TTL`)
- **Almacenamiento:** Hash en BD (`sesiones.refresh_token_hash` = bcrypt(refresh_token))
- **Rotación:** Cada uso invalida el anterior y genera nuevo par (detección de robo)

### 2.3 Flujo de Login

```
Usuario → POST /api/auth/login {email, password}
        ← 200 OK { access_token, refresh_token, user }
        │
        ▼ (requests posteriores)
Cliente → GET /api/mp/quejas
         Authorization: Bearer <access_token>
         │
         ▼ (Gateway)
Gateway → Verificar firma RS256
         Verificar exp < now
         Verificar jti no en blacklist
         Extraer claims → headers X-User-Id, X-User-Roles, X-User-Permissions
         Proxy a servicio downstream
```

### 2.4 Flujo de Refresh

```
Cliente → POST /api/auth/refresh { refresh_token }
        │
        ▼ (Users Service)
Service → Buscar sesion por refresh_token_hash = bcrypt(refresh_token)
         SI no existe O revocada O expira_en < now → 401
         SI existe y vigente:
           1. Marcar sesión actual como revocada
           2. Generar nuevo access_token (nuevo jti)
           3. Generar nuevo refresh_token
           4. Crear nueva sesión con nuevo refresh_token_hash
           5. Retornar { access_token, refresh_token }
        ← 200 OK { access_token, refresh_token }
```

### 2.5 Logout

```
Cliente → POST /api/auth/logout { refresh_token }
        │
        ▼
Service → Buscar sesión, marcar revocada = true
        ← 200 OK { message: "Sesión cerrada" }
```

---

## 3. Autorización (RBAC)

### 3.1 Modelo
- **Usuario** tiene **Roles** (muchos a muchos)
- **Rol** tiene **Permisos** (muchos a muchos)
- **Permiso** = `recurso:accion` (ej: `quejas:create`, `materiales:read`)

### 3.2 Verificación en Servicios
```javascript
// Middleware genérico
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

### 3.3 Permisos Especiales (Ownership)
- `users:read` → puede leer **todos** (admin) o **solo propio** (otros roles)
- `quejas:read` → admin: todos, técnico: asignadas, operador: todas, jefe: todas
- Implementado en **Service Layer** (no solo middleware)

---

## 4. Protección de Datos

### 4.1 Contraseñas
- **Hash:** Bcrypt con cost factor 12
- **Política:** Mín 8 chars, 1 mayús, 1 minús, 1 num, 1 especial
- **Nunca** loguear passwords ni hashes

### 4.2 Datos Sensibles en Logs
- **Sanitización automática:** Middleware remueve `password`, `token`, `authorization`, `refresh_token` de request/response logs
- **Correlation ID:** UUID por request para trazabilidad sin exponer datos

### 4.3 HTTPS Obligatorio
- **Desarrollo:** localhost con mkcert (CA local)
- **Producción:** TLS 1.3, certificados válidos, HSTS
- **Headers de seguridad:**
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  ```

---

## 5. Rate Limiting

### 5.1 API Gateway (Global)
```yaml
# Configuración por IP
rate_limit:
  window: "15m"
  max_requests: 100
  burst: 20
```

### 5.2 Por Endpoint (Críticos)
| Endpoint | Límite | Ventana |
|----------|--------|---------|
| POST /auth/login | 5 | 15 min |
| POST /auth/register | 3 | 1 hora |
| POST /auth/refresh | 10 | 15 min |
| POST /auth/forgot-password | 2 | 1 hora |

### 5.3 Headers de Respuesta
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1699999999
Retry-After: 60 (si excedido)
```

---

## 6. CORS

### 6.1 Configuración
```javascript
// API Gateway
cors: {
  origin: [
    'https://sisgad5.dominio.cu',     // Producción
    'https://staging.sisgad5.dominio.cu', // Staging
    'http://localhost:5173',          // Desarrollo (Vite)
    'http://localhost:3000'           // Desarrollo (alternativo)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400 // 24 horas
}
```

---

## 7. Auditoría y Trazabilidad

### 7.1 Eventos Auditados (Inmutables)
| Evento | Datos Registrados |
|--------|-------------------|
| Login exitoso/fallido | user_id, email, ip, user_agent, success, timestamp |
| Refresh token usado | session_id, user_id, ip, timestamp, rotación |
| Logout | session_id, user_id, timestamp |
| Cambio estado queja | queja_id, estado_anterior, estado_nuevo, user_id, ip, timestamp |
| Asignación técnico | queja_id/trabajo_id, tecnico_id, user_id (quien asigna), timestamp |
| CRUD usuarios | target_user_id, admin_user_id, action, timestamp |
| Asignación/consumo materiales | asignacion_id/consumo_id, trabajador_id, items, timestamp |

### 7.2 Almacenamiento
- **Tabla:** `audit_logs` (solo append, nunca update/delete)
- **Particionado:** Por mes
- **Retención:** 7 años (requisito legal)

### 7.3 Formato Log Estructurado (JSON)
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

## 8. Seguridad en Contenedores

### 8.1 Dockerfile (Multi-stage, Non-root)
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine AS runtime
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### 8.2 Secrets Management
- **Desarrollo:** `.env` (gitignored)
- **Producción:** GitHub Secrets → Inyectados en CI/CD → Variables de entorno en runtime
- **Nunca** hardcodear secrets en código ni imágenes

---

## 9. Escaneo de Vulnerabilidades

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

## 10. Checklist de Seguridad (Pre-Release)

- [ ] Todos los endpoints tienen middleware de autenticación
- [ ] Todos los endpoints mutantes tienen verificación de permisos
- [ ] Rate limiting configurado en Gateway y endpoints críticos
- [ ] CORS restringido a orígenes conocidos
- [ ] Headers de seguridad presentes en todas las respuestas
- [ ] Logs no contienen datos sensibles (passwords, tokens)
- [ ] Auditoría de eventos críticos implementada
- [ ] Dependencias escaneadas (npm audit, Snyk, Trivy)
- [ ] Imágenes Docker sin vulnerabilidades CRITICAL/HIGH
- [ ] Secrets rotados y no en código
- [ ] Pruebas de penetración básicas (OWASP Top 10)
- [ ] Plan de respuesta a incidentes documentado

---

## 11. Referencias

- [Matriz RBAC](12_rbac_matrix.md)
- [Modelo de Dominio](07_domain_model.md) - Entidades User, Sesion
- [Casos de Uso](03_use_cases.md) - UC-01 a UC-08
- [Diagramas de Secuencia](08_sequence_diagrams.md) - Escenario 3
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)