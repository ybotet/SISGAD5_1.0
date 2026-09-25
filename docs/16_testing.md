# Estrategia de Testing - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Pirámide de Testing

```
                    ┌─────────────┐
                    │   E2E Tests │  ← Pocos, críticos, lentos
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │Integration│  │Integration│  │Integration│  ← Por servicio, media cantidad
      └────┬────┘    └────┬────┘    └────┬────┘
           ▼               ▼               ▼
      ┌─────────────────────────────────────┐
      │         Unit Tests (70%+)           │  ← Muchos, rápidos, aislados
      └─────────────────────────────────────┘
```

---

## 2. Tests Unitarios (Cobertura ≥ 70%)

### 2.1 Users Service (Jest + Supertest)
```bash
# Estructura
backend-users/tests/
├── unit/
│   ├── controllers/
│   │   ├── authController.test.js
│   │   ├── userController.test.js
│   │   └── rolController.test.js
│   ├── services/
│   │   ├── authService.test.js
│   │   ├── userService.test.js
│   │   └── rolService.test.js
│   ├── middlewares/
│   │   ├── authMiddleware.test.js
│   │   └── permissionsMiddleware.test.js
│   ├── validators/
│   │   └── authValidator.test.js
│   └── utils/
│       └── passwordUtils.test.js
└── integration/
    ├── auth.integration.test.js
    └── users.integration.test.js
```

**Comandos:**
```bash
npm test                    # Todos los tests
npm run test:unit          # Solo unitarios
npm run test:integration   # Solo integración
npm run test:coverage      # Con reporte cobertura
```

### 2.2 MP Service (Jest + Supertest)
```bash
backend-mp/tests/
├── unit/
│   ├── controllers/
│   │   ├── telefonoController.test.js
│   │   ├── lineaController.test.js
│   │   ├── pizarraController.test.js
│   │   ├── quejaController.test.js
│   │   ├── pruebaController.test.js
│   │   └── trabajoController.test.js
│   ├── services/
│   │   ├── quejaService.test.js
│   │   ├── trabajoService.test.js
│   │   └── estadoQuejaService.test.js  # Máquina de estados
│   ├── middlewares/
│   └── validators/
└── integration/
    ├── quejas.integration.test.js
    ├── trabajos.integration.test.js
    └── materiales.integration.test.js
```

### 2.3 Materials Service (Go testify)
```bash
backend-materiales-go/
├── internal/
│   ├── handlers/
│   │   ├── material_handler_test.go
│   │   ├── asignacion_handler_test.go
│   │   ├── consumo_handler_test.go
│   │   └── dashboard_handler_test.go
│   ├── services/
│   │   ├── material_service_test.go
│   │   ├── asignacion_service_test.go      # Transacciones, stock
│   │   ├── consumo_service_test.go         # Validación vs asignación
│   │   └── stock_service_test.go           # Saldo lógico
│   ├── repositories/
│   │   └── postgres/
│   │       ├── material_repo_test.go
│   │       ├── asignacion_repo_test.go
│   │       └── consumo_repo_test.go
│   └── pkg/
│       └── validator_test.go
└── tests/
    ├── unit/
    └── integration/
        ├── asignacion_integration_test.go
        └── consumo_integration_test.go
```

**Comandos:**
```bash
go test ./...                    # Todos
go test ./internal/...           # Unitarios
go test ./tests/integration/...  # Integración
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### 2.4 Frontend (Vitest + React Testing Library)
```bash
frontend/tests/
├── unit/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   │   ├── useAuth.test.ts
│   │   └── useApiError.test.ts
│   ├── services/
│   │   ├── authService.test.ts
│   │   ├── apiMaterials.test.ts
│   │   └── apiMp.test.ts
│   ├── store/
│   └── utils/
├── integration/
│   ├── pages/
│   │   ├── LoginPage.test.tsx
│   │   └── DashboardPage.test.tsx
│   └── flows/
│       └── authFlow.test.tsx
└── e2e/                          # Ver sección 3
```

**Comandos:**
```bash
npm test                    # Unitarios (Vitest)
npm run test:coverage      # Cobertura
npm run test:e2e           # E2E (Playwright)
```

---

## 3. Tests de Integración (Por Servicio)

### 3.1 Users Service
- **Auth flow completo:** register → login → refresh → logout
- **CRUD usuarios:** create → read → update → delete (soft)
- **RBAC:** asignar roles → verificar permisos en endpoints
- **Sesiones:** crear → listar → revocar

### 3.2 MP Service
- **Queja lifecycle:** crear → probar → asignar → trabajo → consumir → cerrar
- **Infraestructura:** CRUD teléfono/línea/pizarra + historial
- **Pruebas:** registrar → vincular queja/trabajo
- **Trabajos:** crear → asignar → cerrar con tiempo real

### 3.3 Materials Service
- **Asignación atómica:** múltiples items → transacción → rollback en error
- **Consumo atómico:** validar vs asignación → transacción
- **Stock lógico:** Σ(asignado) - Σ(consumido) por trabajador/material
- **Concurrencia:** goroutines validando stock simultáneo

---

## 4. Tests End-to-End (E2E) - Globales

### 4.1 Herramienta: Playwright (TypeScript)
```bash
tests/
├── e2e/
│   ├── critical-flows.spec.ts      # Flujos críticos usuario
│   ├── auth.spec.ts                # Login, logout, refresh
│   ├── mp-quejas-flow.spec.ts      # Flujo completo queja
│   ├── materials-asignacion.spec.ts # Asignación + consumo
│   └── cross-service.spec.ts       # Flujos multi-servicio
├── fixtures/
│   ├── test-data.json
│   └── users.json
└── page-objects/
    ├── LoginPage.ts
    ├── DashboardPage.ts
    ├── QuejasPage.ts
    └── MaterialesPage.ts
```

### 4.2 Flujos Críticos a Cubrir

| Flujo | Descripción | Prioridad |
|-------|-------------|-----------|
| **Auth Completo** | Login → navegar áreas protegidas → refresh token → logout | 🔴 Crítica |
| **Queja → Trabajo → Consumo** | Operador crea queja → Jefe asigna → Técnico prueba/crea trabajo → Consume materiales → Cierra | 🔴 Crítica |
| **Asignación Materiales** | Analista asigna → Técnico consume → Verificar stock lógico | 🔴 Crítica |
| **Dashboard KPIs** | Verificar datos reales en dashboards MP y Materiales | 🟡 Alta |
| **RBAC** | Verificar acceso denegado por rol en cada módulo | 🟡 Alta |

### 4.3 Configuración Playwright
```typescript
// tests/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'docker compose up -d && sleep 30',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 5. Tests de Carga y Rendimiento

### 5.1 Herramienta: k6 (JavaScript)
```bash
tests/
└── load/
    ├── endpoints.js              # Tests de carga por endpoint
    ├── scenarios/
    │   ├── normal-load.js        # 100 usuarios, 10 min
    │   ├── stress-test.js        # Rampa hasta 500 usuarios
    │   ├── spike-test.js         # Pico repentino 1000 usuarios
    │   └── soak-test.js          # 100 usuarios, 1 hora
    └── thresholds.js             # Umbrales de aceptación
```

### 5.2 Umbrales de Aceptación (RNF-01 a RNF-03)

| Métrica | Objetivo | Umbral Fallo |
|---------|----------|--------------|
| **Latencia p95** | < 200ms | > 500ms |
| **Throughput** | 1000+ RPS | < 500 RPS |
| **Tasa error** | < 1% | > 5% |
| **Concurrencia** | 500+ usuarios | < 200 usuarios |
| **Disponibilidad** | 99.9% | < 99.5% |

### 5.3 Ejemplo k6 Script
```javascript
// tests/load/endpoints.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latency = new Trend('latency');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Rampa
    { duration: '5m', target: 100 },   // Estable
    { duration: '2m', target: 200 },   // Estrés
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },     // Bajada
  ],
  thresholds: {
    'http_req_duration{type:api}': ['p(95)<500'],
    'errors': ['rate<0.05'],
    'http_req_failed': ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.ACCESS_TOKEN;

export default function () {
  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };

  // GET /api/mp/quejas
  let res = http.get(`${BASE_URL}/api/mp/quejas?page=1&limit=10`, { headers });
  check(res, { 'status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  latency.add(res.timings.duration);

  sleep(1);

  // GET /api/materiales/materiales
  res = http.get(`${BASE_URL}/api/materials/materiales?page=1&limit=10`, { headers });
  check(res, { 'status 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(1);
}
```

---

## 6. Tests de Contrato (Contract Testing)

### 6.1 Herramienta: Pact (Opcional)
- Verificar compatibilidad entre Gateway y servicios
- Ejecutar en CI antes de deploy

### 6.2 Validación OpenAPI
```bash
# Validar especificación
npx @redocly/openapi-cli lint docs/api/users.yaml
npx @redocly/openapi-cli lint docs/api/mp.yaml
npx @redocly/openapi-cli lint docs/api/materials.yaml
npx @redocly/openapi-cli lint docs/api/gateway.yaml

# Generar clientes TypeScript/Go
npx openapi-typescript docs/api/users.yaml -o frontend/src/types/api-users.ts
oapi-codegen -generate types,chi-server -package api docs/api/materials.yaml > backend-materiales-go/internal/api/types.go
```

---

## 7. Tests de Seguridad

### 7.1 SAST (Análisis Estático)
```yaml
# .github/workflows/security.yml
- name: Run ESLint Security
  run: npx eslint --ext .js,.ts --rule 'security/detect-object-injection: error' .

- name: Run Gosec (Go)
  run: gosec ./...

- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/secrets
      p/owasp-top-ten
```

### 7.2 DAST (Análisis Dinámico - Opcional)
- OWASP ZAP en staging
- Escaneo semanal programado

### 7.3 Dependency Scanning
```bash
# npm
npm audit --audit-level=high
npm audit fix

# Go
govulncheck ./...

# Docker
trivy image ghcr.io/ybotet/sisgad5-api-gateway:latest
```

---

## 8. CI/CD Integration

### 8.1 Pipeline de Tests
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres-users:
        image: postgres:15
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: bd_users }
        ports: [5432:5432]
      postgres-mp:
        image: postgres:15
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: bd_mp }
        ports: [5433:5432]
      postgres-materials:
        image: postgres:15
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: bd_materiales }
        ports: [5434:5432]

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      
      - name: Setup Go
        uses: actions/setup-go@v5
        with: { go-version: '1.21', cache: true }
      
      - name: Install dependencies
        run: |
          cd api-gateway && npm ci
          cd ../backend-users && npm ci
          cd ../backend-mp && npm ci
          cd ../frontend && npm ci
      
      - name: Run unit tests (Node)
        run: |
          cd api-gateway && npm test
          cd ../backend-users && npm run test:unit
          cd ../backend-mp && npm run test:unit
      
      - name: Run unit tests (Go)
        run: |
          cd backend-materiales-go && go test ./internal/...
      
      - name: Run unit tests (Frontend)
        run: cd frontend && npm test
      
      - name: Run integration tests
        run: |
          cd backend-users && npm run test:integration
          cd ../backend-mp && npm run test:integration
          cd ../../backend-materiales-go && go test ./tests/integration/...
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
```

---

## 9. Test Data Management

### 9.1 Seeders por Ambiente
```javascript
// backend-users/seeders/20260925-roles-permisos.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Roles
    const roles = await queryInterface.bulkInsert('roles', [
      { nombre: 'admin', descripcion: 'Administrador' },
      { nombre: 'tecnico', descripcion: 'Técnico de campo' },
      { nombre: 'operador', descripcion: 'Operador mesa ayuda' },
      { nombre: 'jefe', descripcion: 'Jefe departamento' },
      { nombre: 'analista', descripcion: 'Analista materiales' },
      { nombre: 'director', descripcion: 'Director ejecutivo' },
      { nombre: 'auditor', descripcion: 'Auditor cumplimiento' },
    ], { returning: true });

    // Permisos (ver 12_rbac_matrix.md)
    // ...
  }
};
```

### 9.2 Factories para Tests (Factory Pattern)
```typescript
// tests/factories/userFactory.ts
export const createTestUser = (overrides = {}) => ({
  email: `test${Date.now()}@example.com`,
  password: 'TestPass123!',
  nombre: 'Test',
  apellido: 'User',
  activo: true,
  ...overrides,
});

export const createTestQueja = (overrides = {}) => ({
  telefono_id: 1,
  tipo_queja_id: 1,
  servicio_id: 1,
  ubicacion_id: 1,
  clave_id: 1,
  reportado_por: 'Test User',
  prioridad: 3,
  ...overrides,
});
```

---

## 10. Cobertura Mínima Requerida

| Servicio | Unitarios | Integración | Total Objetivo |
|----------|-----------|-------------|----------------|
| Users | ≥ 70% | ≥ 50% | ≥ 70% |
| MP | ≥ 70% | ≥ 50% | ≥ 70% |
| Materials | ≥ 70% | ≥ 50% | ≥ 70% |
| Frontend | ≥ 70% | ≥ 40% | ≥ 70% |
| Gateway | ≥ 60% | ≥ 40% | ≥ 60% |

---

## 11. Referencias

- [Guía de Despliegue](14_deployment.md) - Tests en pipeline
- [Guía de Operación](15_operations.md) - Monitoreo de tests
- [Requisitos](05_requirements.md) - RNF-10
- [Arquitectura](../ARCHITECTURE.md) - Testing strategy