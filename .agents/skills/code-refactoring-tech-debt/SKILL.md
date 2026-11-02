
---
name: code-refactoring-tech-debt
description: Elimina duplicación, reduce complejidad y extrae código común de forma segura.
---

# Refactorización de Deuda Técnica

## Objetivo
Eliminar duplicación y reducir complejidad sin cambiar el comportamiento.

## Proceso

1. **Identifica la duplicación:**
   - Código idéntico en dos o más sitios.
   - Código similar con pequeñas variaciones.
   - Funciones que hacen lo mismo con nombres distintos.

2. **Extrae a un módulo común:**
   - Si es lógica de negocio, va a un paquete compartido.
   - Si es utilidad, va a un módulo de utils.
   - Si es configuración, va a un archivo de config.

3. **Verifica que los tests pasan** después de cada extracción.

## Ejemplo (Node.js)

```typescript
// Antes: duplicado en backend-mp y backend-users
// backend-mp/src/middleware/auth.js
function validateAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    // ...
}

// backend-users/src/middleware/auth.js
function validateAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    // ...
}

// Después: paquete compartido
// shared/auth-middleware.js
export function validateAuth(req, res, next) { /* ... */ }

// Ambos servicios importan del paquete compartido
```

**Verificación**
- No queda código duplicado.
- Los tests pasan.
- El comportamiento es idéntico.