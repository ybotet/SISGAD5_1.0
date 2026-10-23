---
name: jest-supertest-setup
description: Configura Jest y Supertest para tests de API en Node.js/Express.
---

# Configuración de Jest + Supertest

## Objetivo
Configurar una suite de tests que ejecute `npm test` sin errores y cubra los flujos críticos.

## Proceso

1. **Instala las dependencias:**
   ```bash
   npm install --save-dev jest supertest @types/jest @types/supertest
   ```

2. Configura Jest:
```javascript
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/*.test.js"]
  }
}
```

3. Escribe el primer test de API:

```js
// src/__tests__/health.test.js
const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('devuelve 200 con status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

4. Verifica que npm test pasa.

**Verificación**

- npm test ejecuta al menos un test.
- El test falla si el código está mal (compruébalo).
- El script test en package.json no es exit 1.
