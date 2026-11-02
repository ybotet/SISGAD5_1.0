# Manual Técnico (SISGAD5)

> **Versión:** 1.0  
> **Público:** Desarrolladores, Arquitectos, DevOps  
> **Última actualización:** Septiembre 2026

---

## 1. Introducción

Este manual describe aspectos técnicos del sistema: arquitectura, APIs, reglas de negocio, concurrencia y troubleshooting de código.

## 2. Arquitectura

Ver el capítulo 3 de la tesis para detalles completos: [Tesis - Diseño](../thesis/03_methodology.md)

```mermaid
graph LR
    subgraph "Frontend"
        WEB[Web App (SPA)"]
    end
    
    subgraph "Edge"
        GW[API Gateway (Traefik)]
    end
    
    subgraph "Services"
        AUTH[backend-users]
        MP[backend-mp]
        MAT[backend-materiales-go]
    end
    
    subgraph "Infra"
        PG[(PostgreSQL)]
        REDIS[(Redis)]
        RABBIT[(RabbitMQ)]
    end
    
    WEB --> GW
    GW --> AUTH
    GW --> MP
    GW --> MAT
    AUTH --> PG
    AUTH --> REDIS
    MP --> PG
    MP --> RABBIT
    MAT --> PG
    MAT --> REDIS
    MAT --> RABBIT
```

## 3. Microservicios y APIs

### 3.1. Backend Users (Auth)
| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/auth/register` | POST | Registrar usuario |
| `/api/auth/login` | POST | Login + tokens |
| `/api/auth/refresh` | POST | Renovar access token |
| `/api/auth/logout` | POST | Revocar sesión |
| `/api/auth/me` | GET | Perfil actual |
| `/api/auth/me/password` | PUT | Cambiar password |
| `/api/users` | GET,POST | Listar/crear usuarios |
| `/api/users/{id}` | GET,PUT,DELETE | CRUD usuario |
| `/api/users/{id}/roles` | PUT | Asignar roles |
| `/api/roles` | GET,POST | Listar/crear roles |
| `/api/roles/{id}/permisos` | PUT | Asignar permisos |
| `/api/sessions` | GET | Listar sesiones activas |

### 3.2. Backend MP
| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/mp/quejas` | GET,POST | Listar/reportar quejas |
| `/api/mp/quejas/{id}` | GET | Ver detalle |
| `/api/mp/quejas/{id}/estado` | PATCH | Transición de estado (FSM) |
| `/api/mp/quejas/{id}/asignar` | PATCH | Asignar técnico |
| `/api/mp/pruebas` | POST | Registrar prueba |
| `/api/mp/trabajos` | GET,POST | Listar/crear trabajos |
| `/api/mp/trabajos/{id}/iniciar` | PATCH | Iniciar trabajo |
| `/api/mp/trabajos/{id}/cerrar` | PATCH | Cerrar trabajo |
| `/api/mp/telefonos` | GET,POST | CRUD teléfonos |
| `/api/mp/lineas` | GET,POST | CRUD líneas |
| `/api/mp/pizarras` | GET,POST | CRUD pizarras |
| `/api/mp/movimientos` | GET,POST | Historial movimientos |
| `/api/mp/catalogos/*` | GET | Catálogos (tipos, servicios, etc.) |
| `/api/mp/dashboard` | GET | KPIs MP |

### 3.3. Backend Materiales
| Endpoint | Method | Descripción |
|----------|--------|-------------|
| `/api/materials/materiales` | GET,POST | CRUD materiales |
| `/api/materials/materiales/{id}` | GET,PUT,DELETE | CRUD por ID |
| `/api/materials/asignaciones` | GET,POST | Asignaciones |
| `/api/materials/consumos` | GET,POST | Consumos |
| `/api/materials/dashboard` | GET | KPIs materiales |
| `/api/materials/saldos` | GET | Saldos lógicos |
| `/api/materials/categorias` | GET,POST | CRUD categorías |
| `/api/materials/unidades` | GET,POST | CRUD unidades |
| `/api/materials/alertas-stock` | GET | Materiales con stock bajo |

## 4. Reglas de Negocio (Implementadas)

### 4.1. Prioridad de Queja (BR-03)
```
prioridad = (tipo_peso × 1) + (servicio_peso × 1) + (ubicacion_peso × 1) + antiguedad_penalty

antiguedad_penalty = 1 si crédito > 2h, else 0
Resulta en escala 3-13 → mapeado a:
  12-13 → Prioridad 1 (Urgente)
  9-11  → Prioridad 2 (Alta)
  6-8   → Prioridad 3 (Media)
  3-5   → Prioridad 4 (Baja)
```

### 4.2. FSM de Queja (BR-04)
```
Estados válidos y transiciones permitidas:

Reportada → Priorizada → Abierta → EnProgreso → PendientePrueba → PruebaExitosa → Cerrada
                                              → EnRevision
                                              → Cerrada (directo, sin prueba)

Cerrada → (Reabrir) → Reportada (nueva num_reporte)

Regla BR-12: Cerrar queja requiere prueba exitosa previa (excepto técnicos senior)
```

### 4.3. Stock Concurrente (BR-08, BR-09, BR-10)
```
Flujo de asignación:
1. Verificar stock disponible ≥ cantidad solicitada
2. Adquirir Redis lock por material_id (con orden determinístico si hay múltiples)
3. Decrementar stock
4. Guardar asignación en transacción DB
5. Publicar evento AsignacionCreada
6. Liberar lock

Si stock insuficiente → error InsufficientStockException
Si lock timeout → retry con backoff exponencial (max 3 intentos)
```

## 5. Concurrencia

### 5.1. Validación de Stock Concurrente

```go
// backend-materiales-go/internal/application/service/asignacion_service.go
func (s *Service) validarStockConcurrente(items []AsignacionItem) error {
    var wg sync.WaitGroup
    errChan := make(chan error, len(items))
    
    for _, item := range items {
        wg.Add(1)
        go func(item AsignacionItem) {
            defer wg.Done()
            
            // Retry con backoff
            for attempt := 0; attempt < 3; attempt++ {
                if s.locker.Acquire(item.MaterialID, time.Second*5) {
                    defer s.locker.Release(item.MaterialID)
                    
                    stock := s.materialRepo.GetStock(item.MaterialID)
                    if stock >= item.Cantidad {
                        s.materialRepo.DecrementarStock(item.MaterialID, item.Cantidad)
                        return // success
                    }
                    // Retry
                }
                time.Sleep(time.Duration(attempt+1) * 100 * time.Millisecond)
            }
            
            errChan <- fmt.Errorf("insufficient stock for material %d", item.MaterialID)
        }(item)
    }
    
    wg.Wait()
    close(errChan)
    
    for err := range errChan {
        return err
    }
    return nil
}
```

### 5.2. Lock Ordering
- Los locks se adquieren siempre ordenados por material_id (ascending) para evitar deadlock.
- Ver: BR-09 y BR-10 en Event Storming docs.

## 6. Monitoreo

### 6.1. Métricas de Aplicación
| Métrica | Tipo | Labels |
|---------|------|--------|
| `http_requests_total` | Counter | service, method, path, status |
| `http_request_duration_seconds` | Histogram | service, path |
| `db_queries_total` | Counter | service, query_type |
| `events_published_total` | Counter | service, event_type |
| `stock_validation_attempts_total` | Counter | service, material_id, result |
| `fsm_transition_invalid_total` | Counter | service, from_state, to_state |
| `rate_limit_exceeded_total` | Counter | service, route |

### 6.2. Health Endpoints
| Endpoint | Checks |
|----------|--------|
| `/health` | DB connection, Redis, RabbitMQ |
| `/metrics` | Prometheus format |
| `/ready` | Readiness probe (K8s) |
| `/alive` | Liveness probe (K8s) |

### 6.3. Logs
Estructura con Zap:
```json
{
  "timestamp": "2026-09-25T12:00:00Z",
  "level": "info",
  "service": "backend-mp",
  "request_id": "abc-123",
  "correlation_id": "xyz-789",
  "message": "Queja creada",
  "queja_id": 12345,
  "num_reporte": "1001",
  "prioridad": 2
}
```

## 7. Troubleshooting Técnico

### Error: `InsufficientStockException`
- **Causa:** Stock lógico no disponible o lock timeout
- **Solución:** 
  1. Verificar `saldo_lógico` en dashboard
  2. Revisar locks en Redis (`/health/redis`)
  3. Ver logs de concurrencia
  4. Aumentar timeout en `REDIS_LOCK_TIMEOUT`

### Error: `FSMTransitionException`
- **Causa:** Intento de transición de estado no válida
- **Solución:**
  1. Ver matriz de estados en `docs/practices/practice_06_uml_dynamic.md`
  2. Ver el estado actual de la queja
  3. Realizar transiciones intermedias

### Error: `AccountLockedException`
- **Causa:** 5 intentos fallidos de login
- **Solución:**
  1. Esperar 15 minutos (auto-desbloqueo)
  2. O desbloquear vía admin panel

### Error: `DBConnectionError`
- **Causa:** Base de datos caída o connection pool agotado
- **Solución:**
  1. Verificar contenedor Postgres (`docker-compose ps`)
  2. Aumentar `MAX_DB_CONNECTIONS` en .env
  3. Limpiar connection pool: `redis-cli FLUSHALL` (si afecta sessions)

## 8. API Reference

- [MP API Reference](../api/mp_reference.md) (Swagger)
- [Auth API (Swagger)](...)
- [Materials API (Swagger)](...)

## 9. Deploy

```bash
# Build e implantar
make deploy STAGE=production

# Rollback
make rollback VERSION=v1.0.0

# Ver status
make status
```

## 10. Referencias

- [Tesis - Implementación](../thesis/04_development.md)
- [Tesis - Fundamentos](../thesis/02_state_of_art.md)
- [Tesis - Testing](../thesis/05_results.md)
- [UML Dinámico](../practices/practice_06_uml_dynamic.md)
- [UML Estático](../practices/practice_05_uml_static.md)
- [Event Storming](../practices/practice_03_event_storming.md)
- [BPMN](../practices/practice_04_bpmn.md)
