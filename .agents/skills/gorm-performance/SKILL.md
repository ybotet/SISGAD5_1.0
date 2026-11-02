---
name: gorm-performance
description: Optimiza consultas GORM, elimina N+1 y usa transacciones correctamente.
---

# Rendimiento con GORM

## Objetivo
Eliminar consultas N+1 y asegurar el uso correcto de transacciones.

## Proceso

1. **Identifica N+1:**
   ```go
   // MAL: N+1
   for _, consumo := range consumos {
       var detalles []Detalle
       db.Where("consumo_id = ?", consumo.ID).Find(&detalles)  // N consultas
   }

   // BIEN: Preload
   var consumos []Consumo
   db.Preload("Detalles").Find(&consumos)  // 1 consulta
   ```

2. Usa transacciones para operaciones críticas:

```go
err := db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Model(&Material{}).Where("id = ?", id).
        Update("stock", gorm.Expr("stock - ?", cantidad)).Error; err != nil {
        return err
    }
    // ...
    return nil
})
```

3.     Verifica que no hay fugas de transacciones.

**Verificación**
- No hay consultas N+1.
- Las operaciones críticas usan transacciones.
- El stock nunca queda negativo.