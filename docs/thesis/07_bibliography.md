# Tesis - Lecciones Aprendidas

## 7.1. Decisiones Clave Exitosas

### 7.1.1. Go como lenguaje principal
**Decisión:** Usar Go para todos los microservicios.
**Resultado:** Código simple, concurrencia potente, deployment fácil con bins estáticos.
**Lección:** El ecosistema Go es excelente para microservicios, pero la curva de aprendizaje con testing es empinada si no se usan interfaces desde el inicio.

### 7.1.2. Event Storming como técnica de diseño
**Decisión:** Aplicar Event Storming para identificar eventos y agregados.
**Resultado:** 33 eventos, 22 comandos, 12 reglas de negocio identificadas sin ambigüedades.
**Lección:** Invertir tiempo en Event Storming al inicio ahorra semanas de bugs lógicos después.

### 7.1.3. Repository Pattern con interfaces
**Decisión:** Definir interfaces en domain/repository, implementar en infrastructure.
**Resultado:** Tests fáciles de mockear, adaptación a cambios de DB sencilla.
**Lección:** Las interfaces deben vivir donde se consume, no donde se implementa.

### 7.1.4. Testcontainers para integration tests
**Decisión:** Usar Testcontainers en lugar de mocks para DB/Redis.
**Resultado:** Tests fiables, zero configuration local.
**Lección:** Los mocks enganchan menos — Testcontainers detecta issues que mocks no.

### 7.1.5. Mutex distribuido con Redis para stock
**Decisión:** Usar Redis como lock distribuido para validación de stock.
**Resultado:** Cero race conditions en pruebas de carga.
**Lección:** Siempre implementar retry con backoff exponencial cuando se usan locks distribuidos.

## 7.2. Errores y Retos Enfrentados

### Reto 1: Goroutine leaks
**Problema:** Algunas goroutines no se cerraban correctamente, causando memory leaks.
**Solución:** Usar `context.Context` con cancelación y `defer cancel()` en todos los handlers.
**Lección:** Every goroutine must have a context for cancellation.

### Reto 2: Deadlock en locks anidados
**Problema:** Asignación con múltiples materiales requería locks múltiples en orden inconsistente.
**Solución:** Ordenar locks por ID antes de adquirirlos (lock ordering).
**Lección:** Documentar el orden de lock acquisition y seguir siempre.

### Reto 3: Transacciones distribuidas
**Problema:** Crear queja + enviar email + notificar Slack requería atomicity.
**Solución:** Usar eventos de dominio + eventual consistency (Saga pattern simplificado).
**Lección:** En microservicios, favorecer eventual consistency sobre distributed transactions.

### Reto 4: Rate limiting por IP + User
**Problema:** Nginx no podía hacer rate limiting por usuario JWT.
**Solución:** Implementar en middleware de Go con Redis.
**Lección:** Para límites por usuario, el rate limiting debe ser application-level.

### Reto 5: Migración de schema de DB
**Problema:** Añadir columna con default valor grande era slow en producción.
**Solución:** Usar migrações sin default, apply data migration, luego add default.
**Lección:** Nunca hacer schema migrations con datos grandes en el mismo paso.

## 7.3. Mejoras Identificadas para FUTURE

| Área | Mejora | Prioridad |
|------|--------|------------|
| Testing | Property-based testing con GoQuickCheck | Media |
| Performance | Connection pooling tuning (pgxpool) | Alta |
| Observability | OpenTelemetry para tracing distribuido | Alta |
| Security | CSP headers + security.txt | Media |
| CI/CD | Canary deployment en Kubernetes | Baja |
| Documentation | Auto-generar docs con swaggo | Media |

## 7.4. Costos de Infraestructura (Estimados)

| Servicio | Est. Mensual |
|----------|-------------|
| PostgreSQL (RDS) | $180 |
| Redis (Elasticache) | $50 |
| RabbitMQ (Amazon MQ) | $75 |
| Prometheus + Grafana (EC2) | $40 |
| Loki + Promtail | $30 |
| **Total** | **$375** |

*Nota: Estimados para staging. Producción requiere 2x replica.*

## 7.5. Referencias

- [Roadmap](../17_roadmap.md)
- [Testing](../16_testing.md)
- [Fundamentos](../thesis/02_state_of_art.md)
