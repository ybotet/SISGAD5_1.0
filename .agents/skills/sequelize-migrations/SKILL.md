---
name: sequelize-migrations
description: Crea migraciones versionadas con Sequelize y añade índices a los modelos.
---

# Migraciones con Sequelize

## Objetivo
Reemplazar `sequelize.sync()` por migraciones versionadas y añadir índices.

## Proceso

1. **Configura Sequelize CLI:**
   ```bash
   npm install --save-dev sequelize-cli
   npx sequelize init
    ```

2. Crea una migración:
```bash
npx sequelize migration:generate --name add-index-queja-estado
```

3. Escribe la migración:

```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('quejas', ['estado']);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('quejas', ['estado']);
  }
};
```
4. Añade índices a los modelos:
```js
// models/Queja.js
Queja.init({
    // ...
}, {
    indexes: [
        { fields: ['estado'] },
        { fields: ['fecha'] },
    ]
});
```

5. Ejecuta la migración:
```bash
npx sequelize db:migrate
```

**Verificación**

- La migración se aplica sin errores.
- La migración es reversible (db:migrate:undo).
- Los índices existen en la base de datos.