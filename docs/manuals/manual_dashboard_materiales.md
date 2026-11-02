# Manual de Dashboard de Materiales (SISGAD5)

> **Versión:** 1.0  
> **Público:** Analistas, Jefes, Administradores  
> **Última actualización:** Septiembre 2026

---

## 1. Acceso

1. Navegar a: `https://sisgad5.tuempresa.com/materiales/dashboard`
2. El dashboard se actualiza **automáticamente** cada 30 segundos
3. Use filtros para segmentar datos

## 2. KPIs Disponibles

### Panel 1: Métricas Agregadas
| Métrica | Descripción | Cálculo |
|---------|-------------|---------|
| Asignaciones/Mes | Total de asignaciones creadas | COUNT(asignaciones) GROUP BY mes |
| Consumos/Mes | Total de consumos registrados | COUNT(consumos) GROUP BY mes |
| Costo Total | Suma de todos los consumos | SUM(consumo_items.costo_real) |
| Saldo Lógico Promedio | Promedio de saldos | AVG(Σ_asignado - Σ_consumido) |
| Alertas Stock Bajo | Materiales con saldo < mínimo | COUNT WHERE saldo < stock_minimo |

### Panel 2: Distribución por Categoría
- Gráfico de barras mostrando cantidad y costo por categoría
- Hover para ver detalles: nombre, cantidad, costo unitario promedio

### Panel 3: Top 10 Materiales
- Materiales con mayor consumo (cantidad)
- Columnas: Nombre, Cantidad, Costo Total, Stock Actual

### Panel 4: Stock Bajo (Alertas)
| Material | Stock Mínimo | Saldo Lógico | Deficit |
|----------|-------------|--------------|---------|
| Cable CAT6 UTP | 100 | 45 | -55 |
| Conector RJ45 | 50 | 12 | -38 |

**Acción:** Click en material → Ver detalle y historial → [Ir a Material](../manual_operativo.md)

## 3. Cómo Usar los Filtros

### Rango de Fechas
- Selector de calendario: "Últimos 7 días", "Últimos 30 días", o rango personalizado
- Los KPIs se recalculan automáticamente

### Por Trabajador
- Dropdown con lista de técnicos
- Filtra todos los KPIs por técnico asignado

### Por Categoría
- Filtra por categoría de material (Cableado, Conectores, Ferretería, etc.)

## 4. Exportar Datos

### Funcionalidades de Exportación
1. **Exportar Tabla:** Botón CSV en cada tabla
2. **Exportar Dashboard:** PNG del dashboard completo
3. **Exportar Reporte:** PDF con todos los KPIs y tablas

### Formato de Exportación CSV
```csv
fecha,concepto,cantidad,costo_unitario,costo_total
2026-09-20,Asignación,Cable CAT6,10,250.00,2500.00
2026-09-21,Consumo,Cable CAT6,5,250.00,1250.00
```

## 5. Interpretación de Métricas

### Saldo Lógico
- **Fórmula:** Σ(cantidades_asignadas) - Σ(cantidades_consumidas)
- **Estado óptimo:** ≥ 0
- **Alerta:** < stock_mínimo (color rojo)
- **Stock negativo:** Indica sobre-consumo (investigar)

### Costo Momento vs Costo Real
- **Costo Momento:** Precio al momento de asignación (congelado)
- **Costo Real:** Precio al momento de consumo
- **Diferencia:** Variación de precios entre asignación y consumo

## 6. Notificaciones

El dashboard genera alertas visuales:
- 🔴 **Stock crítico:** Saldo < 50% del mínimo
- 🟡 **Stock bajo:** Saldo < mínimo
- 🟢 **Stock OK:** Saldo ≥ mínimo

## 7. Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Dashboard vacío | Sin datos en período | Ampliar rango de fechas |
| Stock negativo | Consumo > asignación | Verificar validación BR-08 |
| KPIs no actualizan | Caché Redis no expiró | Forzar refresh (Ctrl+F5) |
| Exportación falla | Datos muy grandes | Reducir rango de fechas |

## 8. Referencias

- [Manual Técnico](./manual_tecnico.md)
- [Manual Operativo](./manual_operativo.md)
- [Tesis - Resultados](../thesis/06_conclusions.md)
- [UML Estático](../practices/practice_05_uml_static.md)
