# Стратегия тестирования - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25

---

## 1. Тестовая пирамида

```
                     ┌─────────────┐
                     │   E2E Tests │  ← Few, critical, slow
                     └──────┬──────┘
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
       ┌─────────┐    ┌─────────┐    ┌─────────┐
       │Integration│  │Integration│  │Integration│  ← Per service, medium quantity
       └────┬────┘    └────┬────┘    └────┬────┘
            ▼               ▼               ▼
       ┌─────────────────────────────────────┐
       │         Unit Tests (70%+)           │  ← Many, fast, isolated
       └─────────────────────────────────────┘
```

---

## 2. Модульные тесты (Cobertura ≥ 70%)

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
│   │   └── estadoQuejaService.test.js  # Машина состояний
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
│   │   ├── asignacion_service_test.go      # Транзакции, stock
│   │   ├── consumo_service_test.go         # Проверка vs назначение
│   │   └── stock_service_test.go           # Логический склад
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
└── e2e/                          # См. раздел 3
```

**Comandos:**
```bash
npm test                    # Unitarios (Vitest)
npm run test:coverage      # Cobertura
npm run test:e2e           # E2E (Playwright)
```

---

## 3. Интеграционные тесты (По сервису)

### 3.1 Users Service
- **Полный auth flow:** register → login → refresh → logout
- **CRUD пользователей:** create → read → update → delete (soft)
- **RBAC:** назначить роли → проверить разрешения на эндпоинтах
- **Сессии:** создать → список → отозвать

### 3.2 MP Service
- **Жизненный цикл жалобы:** создать → протестировать → назначить → работа → расход → закрыть
- **Инфраструктура:** CRUD телефон/линия/панель + история
- **Тесты:** зарегистрировать → связать с жалобой/работой
- **Работы:** создать → назначить → закрыть с реальным временем

### 3.3 Materials Service
- **Атомарное назначение:** множественные позиции → транзакция → откат при ошибке
- **Атомарный расход:** проверить vs назначение → транзакция
- **Логический склад:** Σ(назначено) - Σ(расходовано) по пользователю/материалу
- **Конкуренция:** goroutines проверяющие stock одновременно

---

## 4. Сквозные тесты (E2E) - Глобальные

### 4.1 Инструмент: Playwright (TypeScript)
```bash
tests/
├── e2e/
│   ├── critical-flows.spec.ts      # Критические сценарии пользователя
│   ├── auth.spec.ts                # Login, logout, refresh
│   ├── mp-quejas-flow.spec.ts      # Полный поток жалобы
│   ├── materials-asignacion.spec.ts # Назначение + расход
│   └── cross-service.spec.ts       # Многосервисные сценарии
├── fixtures/
│   ├── test-data.json
│   └── users.json
└── page-objects/
    ├── LoginPage.ts
    ├── DashboardPage.ts
    ├── QuejasPage.ts
    └── MaterialesPage.ts
```

### 4.2 Критические сценарии для покрытия

| Сценарий | Описание | Приоритет |
|----------|----------|-----------|
| **Полный Auth** | Login → навигация по защищённым зонам → refresh token → logout | 🔴 Критическое |
| **Жалоба → Работа → Расход** | Оператор создаёт жалобу → Jefe назначает → Техник тестирует/создаёт работу → Расходует материалы → Закрывает | 🔴 Критическое |
| **Назначение материалов** | Аналитик назначает → Техник расходует → Проверить логический склад | 🔴 Критическое |
| **KPI Дашборды** | Проверить реальные данные в дашбордах MP и материалов | 🟡 Высокое |
| **RBAC** | Проверить запрет доступа по ролям в каждом модуле | 🟡 Высокое |

### 4.3 Конфигурация Playwright
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

## 5. Тесты нагрузки и производительности

### 5.1 Инструмент: k6 (JavaScript)
```bash
tests/
└── load/
    ├── endpoints.js              # Тесты нагрузки по эндпоинтам
    ├── scenarios/
    │   ├── normal-load.js        # 100 пользователей, 10 мин
    │   ├── stress-test.js        # Нарастание до 500 пользователей
    │   ├── spike-test.js         # Резкий пик 1000 пользователей
    │   └── soak-test.js          # 100 пользователей, 1 час
    └── thresholds.js             # Пороги принятия
```

### 5.2 Пороги принятия (RNF-01 a RNF-03)

| Метрика | Цель | Порог сбоя |
|--------|------|------------|
| **Задержка p95** | < 200ms | > 500ms |
| **Пропускная способность** | 1000+ RPS | < 500 RPS |
| **Частота ошибок** | < 1% | > 5% |
| **Конкуренция** | 500+ пользователей | < 200 пользователей |
| **Доступность** | 99.9% | < 99.5% |

### 5.3 Пример k6 скрипта
```javascript
// tests/load/endpoints.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const latency = new Trend('latency');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Разгон
    { duration: '5m', target: 100 },   // Стабильно
    { duration: '2m', target: 200 },   // Нагрузка
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },     // Снижение
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

## 6. Тесты контрактов (Contract Testing)

### 6.1 Инструмент: Pact (Опционально)
- Проверка совместимости между Gateway и сервисами
- Выполняется в CI перед деплоем

### 6.2 Валидация OpenAPI
```bash
# Валидация спецификации
npx @redocly/openapi-cli lint docs/api/users.yaml
npx @redocly/openapi-cli lint docs/api/mp.yaml
npx @redocly/openapi-cli lint docs/api/materials.yaml
npx @redocly/openapi-cli lint docs/api/gateway.yaml

# Генерация клиентов TypeScript/Go
npx openapi-typescript docs/api/users.yaml -o frontend/src/types/api-users.ts
oapi-codegen -generate types,chi-server -package api docs/api/materials.yaml > backend-materiales-go/internal/api/types.go
```

---

## 7. Тесты безопасности

### 7.1 SAST (Статический анализ)
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

### 7.2 DAST (Динамический анализ - Опционально)
- OWASP ZAP на staging
- Еженедельные запланированные сканирования

### 7.3 Сканирование зависимостей
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

## 8. Интеграция CI/CD

### 8.1 Pipeline тестов
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

## 9. Управление тестовыми данными

### 9.1 Seeders по окружению
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

    // Permisos (см. 12_rbac_matrix.ru.md)
    // ...
  }
};
```

### 9.2 Фабрики для тестов (Factory Pattern)
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

## 10. Минимальное требование к покрытию

| Сервис | Модульные | Интеграционные | Общая цель |
|--------|-----------|----------------|------------|
| Users | ≥ 70% | ≥ 50% | ≥ 70% |
| MP | ≥ 70% | ≥ 50% | ≥ 70% |
| Materials | ≥ 70% | ≥ 50% | ≥ 70% |
| Frontend | ≥ 70% | ≥ 40% | ≥ 70% |
| Gateway | ≥ 60% | ≥ 40% | ≥ 60% |

---

## 11. Ссылки

- [Руководство по развертыванию](14_deployment.ru.md) - Тесты в пайплайне
- [Руководство по эксплуатации](15_operations.ru.md) - Мониторинг тестов
- [Требования](05_requirements.ru.md) - RNF-10
- [Архитектура](../ARCHITECTURE.md) - Стратегия тестирования
