---
name: security-jwt-hardening
description: Elimina fallbacks de JWT_SECRET, fuerza la validación al arranque y aplica buenas prácticas de JWT.
---

# Endurecimiento de JWT

## Objetivo
Eliminar cualquier fallback de `JWT_SECRET` y garantizar que la aplicación no arranque
sin un secreto válido (≥32 caracteres).

## Proceso

1. **Busca patrones de fallback:**
   - `process.env.JWT_SECRET || "secreto"`
   - `process.env.JWT_SECRET || 'fallback'`
   - `process.env.JWT_SECRET ?? 'default'`
   - Cualquier expresión que dé un valor por defecto al secreto.

2. **Reemplaza por validación al arranque:**
   - Si el proyecto usa Zod (como MP), añade la validación al esquema de config.
   - Si no, añade un `if (!process.env.JWT_SECRET) throw new Error(...)` al inicio.

3. **Verifica que la longitud sea ≥32 caracteres.** Un secreto corto es vulnerable a
   ataques de fuerza bruta.

4. **Asegúrate de que `.env.example` documente `JWT_SECRET`** sin valor real.

5. **Verifica que el arranque falla** si falta la variable.

## Ejemplo (Node.js + Zod)

```typescript
// Antes
const secret = process.env.JWT_SECRET || "secreto";

// Después (en el schema de config)
JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),