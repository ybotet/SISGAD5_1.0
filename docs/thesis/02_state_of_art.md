# Tesis - Fundamentos Teóricos

## 2.1. Domain-Driven Design (DDD)

El Domain-Driven Design es un enfoque de diseño de software centrado en el dominio del problema. SISGAD5 aplica los siguientes conceptos:

### 2.1.1. Bounded Contexts

| Contexto | Servicio | Responsabilidades |
|----------|----------|-------------------|
| Auth | backend-users | Autenticación, usuarios, roles, permisos |
| MP (Telecom) | backend-mp | Infraestructura, quejas, pruebas, trabajos |
| Materials | backend-materiales-go | Catálogo, asignaciones, consumos, stock |
| Shared Kernel | - | Value objects compartidos (Money, UUID, DateTime) |

### 2.1.2. Patrones Tácticos

- **Entidades:** User, Sesion, Queja, Trabajo, Material, Asignacion
- **Objetos de Valor:** Money, Pagination, Coordinates, Email
- **Agregados:** User (root), Queja (root), Asignacion (root), Consumo (root)
- **Repositorios:** UserRepository, QuejaRepository, MaterialRepository
- **Servicios de Dominio:** AuthService, QuejaService, MaterialService

## 2.2. Arquitectura de Microservicios

### Principios Aplicados
1. **Single Responsibility:** Cada servicio tiene un dominio acotado
2. **Base de datos por servicio:** No comparten schemas (excepto Shared Kernel)
3. **Comunicación vía API:** REST sobre HTTP con JSON
4. **Autenticación centralizada:** JWT validado por API Gateway
5. **Eventos asíncronos:** RabbitMQ para eventos de dominio

### Comunicación Inter-Servicios

```
[API Gateway]
      │
      ├── [Auth Service] ──→ PostgreSQL
      │                    ──→ Redis (caché/tokens)
      │
      ├── [MP Service] ──→ PostgreSQL
      │                 ──→ RabbitMQ (eventos)
      │                 ──→ Mailjet (emails)
      │
      └── [Materials Service] ──→ PostgreSQL
                                ──→ Redis (locks/stock)
                                ──→ RabbitMQ (eventos)
```

## 2.3. Concurrencia en Go

Go proporciona concurrencia nativa a través de goroutines y channels. SISGAD5 utiliza:

### Patrones Implementados

**Worker Pool para validación de stock**
```go
// Validación concurrente de stock al crear asignaciones
func (s *Service) validarStockConcurrente(items []AsignacionItem) error {
    var wg sync.WaitGroup
    errChan := make(chan error, len(items))
    
    for _, item := range items {
        wg.Add(1)
        go func(item AsignacionItem) {
            defer wg.Done()
            if err := s.validarItem(item); err != nil {
                errChan <- err
            }
        }(item)
    }
    
    go func() {
        wg.Wait()
        close(errChan)
    }()
    
    for err := range errChan {
        if err != nil {
            return err
        }
    }
    return nil
}
```

**Mutex para locks distribuidos con Redis**

**Channels para pipeline de eventos**

## 2.4. Event Storming

La técnica Event Storming fue utilizada para identificar:

- **Eventos de dominio:** 33 eventos identificados
- **Comandos:** 22 comandos documentados
- **Agregados:** 8 agregados con invariantes definidas
- **Reglas de negocio:** 12 reglas (BR-01 a BR-12)
- **Políticas de readmodel:** 6 proyecciones para dashboards

Ver: [Event Storming](../practices/practice_03_event_storming.md)

## 2.5. BPMN

El modelado BPMN fue aplicado a tres procesos críticos:

1. Gestión de Quejas (flujo principal 1-18)
2. Gestión de Materiales (asignación → consumo)
3. Autenticación y Autorización

Ver: [BPMN](../practices/practice_04_bpmn.md)

## 2.6. UML

Diagramas estáticos y dinámicos:

- 28 clases modeladas con relaciones completas
- 5 bounded contexts identificados
- 4 diagramas de secuencia (login, queja, asignación, cierre)
- 3 diagramas de máquinas de estado (queja, asignación, trabajo)
- 2 diagramas de actividad (asignación→consumo, ciclo de vida de queja)
- 1 mapa de interacción (escenario end-to-end 18 mensajes)

Ver: [UML Estático](../practices/practice_05_uml_static.md), [UML Dinámico](../practices/practice_06_uml_dynamic.md)