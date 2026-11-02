# Manual de Dashboard de Quejas (SISGAD5)

> **Versión:** 1.0  
> **Público:** Operadores, Jefes, Coordinadores  
> **Última actualización:** Septiembre 2026

---

## 1. Acceso

1. Navegar a: `https://sisgad5.tuempresa.com/mp/dashboard`
2. El dashboard se actualiza **automáticamente** cada 60 segundos
3. Use filtros para segmentar datos

## 2. KPIs Disponibles

### Panel 1: Métricas de Quejas
| Métrica | Descripción | Cálculo |
|---------|-------------|---------|
| Quejas Creadas | Total en período | COUNT(quejas) GROUP BY fecha |
| Quejas Cerradas | Quejas con estado Cerrada | COUNT WHERE estado = Cerrada |
| Quejas Pendientes | Quejas abiertas (no cerradas) | COUNT WHERE estado != Cerrada |
| Tasa de Cierre | % de quejas resueltas | Quejas Cerradas / Quejas Creadas × 100 |
| Tiempo Promedio Cierre | Avg tiempo Abierta → Cerrada | AVG(fecha_cierre - fecha_creacion) en horas |

### Panel 2: Prioridad Distribution
- Distribución de quejas por prioridad (1-4)
- Color: 1=🔴, 2=🟠, 3=🟡, 4=🟢

### Panel 3: Tiempo de Resolución (SLA)
| Prioridad | SLA Máximo | Cumple | Tiempo Promedio |
|-----------|-----------|--------|-----------------|
| 1 (Urgente) | 2 horas | 95% | 1.5h |
| 2 (Alta) | 8 horas | 88% | 5.2h |
| 3 (Media) | 24 horas | 92% | 12.3h |
| 4 (Baja) | 72 horas | 98% | 25.1h |

### Panel 4: Productividad por Técnico
| Técnico | Quejas Asignadas | Quejas Cerradas | Tiempo Prom. Cierre | Productividad |
|---------|-----------------|-----------------|---------------------|--------------|
| Pérez, A. | 25 | 22 | 4.2h | 88% |
| López, M. | 18 | 15 | 6.8h | 83% |

## 3. Filtros Disponibles

### Rango de Fechas
- Últimas 24 horas
- Últimos 7 días
- Últimos 30 días
- Rango personalizado

### Por Servicio
- Telefonía
- Internet
- Fibra Óptica
- Otros

### Por Prioridad
- Seleccionar una o múltiples prioridades (checkbox)

### Por Técnico
- Dropdown con todos los técnicos activos

### Por Estado
- Abierta, EnProgreso, EnRevision, PendientePrueba, Cerrada

## 4. Indicadores Visuales

| Color | Prioridad |
|-------|-----------|
| 🔴 Rojo | 1 - Urgente |
| 🟠 Naranja | 2 - Alta |
| 🟡 Amarillo | 3 - Media |
| 🟢 Verde | 4 - Baja |

## 5. Exportar Datos

### Opciones de Exportación
1. **Exportar Tabla:** CSV o JSON
2. **Exportar Gráfico:** PNG
3. **Exportar Reporte Completo:** PDF (todos los KPIs + tablas)

### Reporte Ejecutivo
El reporte PDF incluye:
- Resumen ejecutivo
- KPIs principales
- Distribución por prioridad
- Cumplimiento de SLA
- Productividad por técnico
- Quejas críticas del período

## 6. Alertas y Notificaciones

### Quejas Urgentes (Prioridad 1)
- 🔴 Destacadas en rojo
- Notificación push al operador
- Email al coordinador si no se asigna en 30 min

### SLA en Riesgo
- 🟡 Amarillo: Queja próxima al SLA límite
- 🟠 Naranja: Queja vencida el SLA
- Se muestra tiempo restante en tiempo real

## 7. Solución de Problemas

| Problema | Causa | Solución |
|----------|-------|----------|
| Dashboard vacío | Sin datos en período | Ampliar rango de fechas |
| SLA incorrecto | Prioridad mal calculada | Verificar BR-03 en docs |
| Técnico no aparece | Sin quejas asignadas | Verificar filtros y estado |
| Exportación falla | Datos muy grandes | Reducir rango de fechas |
| Métricas no actualizan | Worker de cálculo parado | Verificar RabbitMQ/RabbitMQ |

## 8. Referencias

- [Manual Técnico](./manual_tecnico.md)
- [Manual Operativo](./manual_operativo.md)
- [BPMN](../practices/practice_04_bpmn.md)
- [FSM](../practices/practice_06_uml_dynamic.md)
- [Tesis - Resultados](../thesis/06_conclusions.md)
