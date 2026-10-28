---
name: nodejs-audit
description: Áreas críticas a auditar en proyectos Node.js con Express y Sequelize.
---

# Auditoría de Node.js

## 1. Seguridad
- **Secretos:** Busca `JWT_SECRET`, contraseñas de BD o API keys hardcodeadas.
- **Validación:** ¿Se usa Zod (o similar) en todos los endpoints de escritura?
- **Autenticación:** ¿Se valida el JWT en cada ruta protegida?
- **Rate limiting:** ¿Está configurado en el Gateway y en los servicios?

## 2. Base de Datos (Sequelize)
- **Consultas N+1:** Busca bucles que hacen consultas individuales en lugar de usar `include`.
- **Índices:** Verifica que los campos de búsqueda frecuente tengan índices definidos.
- **Migraciones:** ¿Se usan migraciones o solo `db:sync`?

## 3. Manejo de Errores
- ¿Hay un middleware global de manejo de errores?
- ¿Se devuelven errores consistentes al cliente?
- ¿Se registran los errores con suficiente contexto?

## 4. Calidad de Código
- **Duplicación:** Busca código repetido entre `backend-mp` y `backend-users` (middleware, utilidades).
- **Dependencias:** ¿Hay dependencias desactualizadas o vulnerables?
- **Estructura:** ¿Sigue una organización clara (controllers, routes, models, services)?