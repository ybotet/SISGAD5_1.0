# Práctica 06 - UML Dinámico (Secuencia, Comunicación, State Machine)

> **Disciplina:** Ingeniería de Software  
> **Especialidad:** UML - Vista Dinámica  
> **Basado en:** [SISGAD5_doc/docs/03-08](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Diagramas de Secuencia

### 1.1. Registro de Queja

```mermaid
sequenceDiagram
    participant C as Cliente
    participant UI as WebApp
    participant API as QuejasController
    participant S as QuejaService
    participant DB as QuejaRepository
    participant E as EventBus
    participant N as NotificationService

    C->>UI: Llenar formulario de queja
    UI->>API: POST /api/mp/quejas\n(clasificación datos)
    API->>S: registrarQueja(crearQuejaRequest)
    S->>DB: query(tipoQueja, servicio, ubic, clave)
    S->>S: calcularPrioridad()
    S->>DB: save(Queja)
    S->>E: publish(QuejaReportada)
    S->>E: publish(QuejaClasificada)
    S->>E: publish(QuejaPriorizada)
    S-->>API: QuejaResponse
    API-->>UI: 201 Created
    E->>N: enqueue(NotificarOperador)
    Note over N,C: Email de confirmación
```

### 1.2. Login con JWT

```mermaid
sequenceDiagram
    participant U as User
    participant C as WebApp
    participant API as AuthController
    participant S as AuthService
    participant DB as UserRepository
    participant R as RedisBlacklist
    participant E as EventBus

    U->>C: Ingresar email/password
    C->>API: POST /auth/login
    API->>S: authenticate(email, password)
    S->>DB: findByEmail(email)
    DB-->>S: User con passwordHash
    S->>S: verifyPassword(password, hash)
    alt Credenciales inválidas
        S->>S: incrementarIntentos()
        S-->>API: UnauthorizedException
        API-->>C: 401 Unauthorized
        C-->>U: Mostrar error
    else Credenciales válidas
        S->>R: estaBloqueado(email)
        alt Bloqueado
            S-->>API: AccountLockedException
            API-->>C: 423 Locked
        else No bloqueado
            S->>S: resetearIntentos()
            S->>S: generarAccessToken(user)
            S->>S: generarRefreshToken(user)
            S->>DB: save(Sesion)
            S-->>API: AuthResponse(tokens)
            API-->>C: 200 OK + cookies
            C-->>U: Redirect a Dashboard
    end
```

### 1.3. Crear Asignación de Materiales

```mermaid
sequenceDiagram
    participant A as Analista
    participant UI as WebApp
    participant API as MaterialsController
    participant S as AsignacionService
    participant M as MaterialRepository
    participant R as RedisLock
    participant DB as AsignacionRepository
    participant E as EventBus

    A->>UI: Llenar formulario asignación + items
    UI->>API: POST /api/materials/asignaciones
    API->>S: crearAsignacion(AsignacionRequest)
    S->>M: findById para cada material
    S->>S: validarCantidades(items)
    alt Stock insuficiente
        S-->>API: InsufficientStockException
        API-->>UI: 400 Bad Request (stock error)
    else Stock OK
        S->>R: acquireLock("material:{id}")
        S->>M: decrementarStock(items)
        S->>DB: save(Asignacion + items)
        S->>E: publish(AsignacionCreada)
        S->>R: releaseLock()
        S-->>API: AsignacionResponse
        API-->>UI: 201 Created
    end
```

---

## 2. Diagramas de Comunicación

### 2.1. Cierre de Trabajo

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'fontSize': '14px' }}}%%
graph TD
    subgraph "Cierre de Trabajo - Comunicación"
        TEC[Técnico] -->|"1. PUT /api/mp/trabajos/{id}/cerrar\n(tiempo_real)"| CTRL[TrabajosController]
        CTRL -->|"2. cerrarTrabajo(id, tiempoReal)"| SVC[TrabajoService]
        SVC -->|"3. findById(id)"| REPO[TrabajoRepository]
        REPO -->|"4. Trabajo (estado: EnProgreso)"| SVC
        SVC -->|"5. validarCierre(trabajo, tiempoReal)"| SVC
        SVC -->|"6. cambiarEstado(Cerrada)"| SVC
        SVC -->|"7. save(trabajo)"| REPO
        SVC -->|"8. publish(TrabajoCerrado)"| BUS[EventBus]
        REPO -->|"9. Trabajo actualizado"| SVC
        BUS -->|"10. enqueue actualizar dashboard"| MAT[MaterialsService]
        SVC -->|"11. TrabajoResponse"| CTRL
        CTRL -->|"12. 200 OK"| TEC
    end
    
    classDef actor fill:#bbdefb,stroke:#1976d2,stroke-width:2px
    classDef controller fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    classDef service fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef repository fill:#d7ccc8,stroke:#795548,stroke-width:2px
    classDef bus fill:#e1bee7,stroke:#7b1fa2,stroke-width:2px
    
    class TEC actor
    class CTRL controller
    class SVC service
    class REPO repository
    class BUS,BUS bus
    class MAT service
```

---

## 3. Máquinas de Estado

### 3.1. Estado de Queja

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e3f2fd', 'secondaryColor': '#e8f5e9', 'tertiaryColor': '#fff3e0', 'lineColor': '#37474f' }}}%%
stateDiagram-v2
    [*] --> Reportada
    Reportada --> Priorizada: Sistema\n(calcular prioridad)
    Priorizada --> Abierto: Sistema\n(validar clasificación)
    Abierto --> EnProgreso: Asignar técnico
    EnProgreso --> PendientePrueba: Completar trabajo\nsin prueba previa
    EnProgreso --> EnRevision: Cerrar trabajo\ncon observaciones
    PendientePrueba --> PruebaExitosa: Prueba OK
    PruebaExitosa --> Cerrada: Cerrar queja
    EnProgreso --> Cerrada: Cerrar directamente\n(Sin prueba)
    PendientePrueba --> EnProgreso: Prueba fallida\n(Reabrir)
    Cerrada --> Reportada: Reabrir\n(Crear nueva)
    
    state Reportada {
        [*] --> Clasificada
        Clasificada --> Priorizada2: Interno
    }
    
    note right of Reportada
        Estado inicial al crear la queja
    end note
    
    note right of Cerrada
        Estado final (hasta reapertura)
    end note
```

### 3.2. Estado de Asignación

```mermaid
stateDiagram-v2
    [*] --> Pendiente
    Pendiente --> Aprobada: Aprobar
    Aprobada --> Entregada: Confirmar entrega
    Entregada --> ParcialmenteRetornada: Devolver items parciales
    ParcialmenteRetornada --> Entregada: Re-entregar items
    Aprobada --> Cancelada: Cancelar
    Entregada --> Cancelada: Cancelar
    Cancelada --> [*]
    
    note right of Pendiente
        Creada pero no aprobada\npor jefe de área
    end note
    
    note right of Entregada
        Técnico confirma recepción\nfísica de materiales
    end note
```

### 3.3. Estado de Trabajo

```mermaid
stateDiagram-v2
    [*] --> Creada
    Creada --> Asignada: Asignar técnico
    Asignada --> EnProgreso: Iniciar\n(Mobile app check-in)
    EnProgreso --> Cerrada: Completar\n(tiempo real registrar)
    EnProgreso --> Cancelada: Cancelar\n(requiere justificación)
    Cerrada --> [*]
    Cancelada --> [*]
```

---

## 4. Diagramas de Actividad

### 4.1. Flujo de Asignación → Consumo (Materiales)

```mermaid
activityDiagram-v2
    start
    :Solicitar asignación;
    if (¿Stock disponible?) then (Sí)
        :Crear asignación\n(con items y precios);
        :Bloquear stock lógico;
        :Emitir evento AsignacionCreada;
        if (¿Trabajador confirma entrega?) then (Sí)
            :Cambiar estado a "Entregada";
            :Registrar consumo parcial\n(con precios reales);
            :Validar consumo ≤ asignación;
            :Emitir evento ConsumoCreado;
            :Calcular saldo lógico;
            if (¿Saldo < stock mínimo?) then (Sí)
                :Emitir alerta StockBajoAlertado;
            else (No)
                :Continuar;
            endif
        else (No)
            :Mantener estado "Aprobada";
        endif
    else (No)
        :Error: InsufficientStockException;
        :Devolver detalle faltante;
    endif
    stop
```

### 4.2. Flujo de Queja (FSM - State Machine)

```mermaid
activityDiagram-v2
    start
    :Cliente/operador reporta queja;
    :Sistema clasifica (tipo, servicio, ubicación, clave);
    :Sistema calcula prioridad (1-4);
    if (¿Prioridad = 1?) then (Urgente)
        :Notificar inmediatamente;
        :Asignar a primer técnico disponible;
    else (Normal)
        :Agregar al backlog;
        :Asignar en orden de prioridad;
    endif
    :Técnico ejecuta prueba (si aplica);
    if (¿Prueba exitosa?) then (Sí)
        :Crear orden de trabajo;
        :Asignar técnico;
        :Ejecutar trabajo;
        :Registrar consumo;
        :Cerrar trabajo;
        :Cerrar queja;
        :Enviar notificación al cliente;
    else (No)
        :Reabrir queja;
        :Asignar nuevo técnico;
    endif
    stop
```

---

## 4.3. Saga: Cierre de Queja con Registro de Consumo (Distribuido)

Cuando se cierra una queja, el MP Service debe:
1. Actualizar el estado de la queja a `"Cerrada"` (local, en `bd_mp`).
2. Registrar un consumo de materiales asociado al trabajo (remoto, en `bd_materiales` vía Materials Service).

Estas dos operaciones abarcan **dos bases de datos distintas** (`bd_mp` y `bd_materiales`), por lo que no se puede usar una transacción ACID distribuida. Se aplica el patrón **Saga orquestada** con compensación:

- **Orquestador:** `CierreQuejaSaga` (en MP Service, archivo `backend-mp/src/shared/services/cierreQuejaSaga.js`).
- Coordina una transacción local (Sequelize) y, al finalizar con éxito, llama al Materials Service vía REST (`POST /api/materiales/consumos`).
- Si el Materials Service falla, **compensa** revirtiendo el cierre de la queja (pasándola de vuelta a `"Resuelta"`).
- **Idempotencia:** la queja ya cerrada retorna `compensación: { motivo: "YA_CERRADA" }` sin acciones.
- **Quejas sin trabajos:** no generan consumo de materiales (optimización).

### Diagrama de Secuencia — Saga Cierre de Queja

```mermaid
sequenceDiagram
    participant GW as API Gateway
    participant MPS as MP Service
    participant SAGA as CierreQuejaSaga (Orquestador)
    participant MPDB as BD_MP (local)
    participant MS as Materials Service
    participant MADB as BD_Materiales (remota)

    GW->>MPS: POST /api/mp/queja/{id}/cerrar (JWT válido)
    MPS->>SAGA: execute(quejaId, ctx)
    SAGA->>MPDB: BEGIN (transacción Sequelize)
    SAGA->>MPDB: SELECT queja WHERE id = {id}
    alt Queja no existe
        SAGA-->>MPS: compensación: QUEJA_NO_ENCONTRADA
        SAGA->>MPDB: ROLLBACK
    else Ya está cerrada
        SAGA-->>MPS: compensación: YA_CERRADA
        SAGA->>MPDB: ROLLBACK
    else Estado inválido (no Resuelta/Probada)
        SAGA-->>MPS: compensación: ESTADO_INVALIDO
        SAGA->>MPDB: ROLLBACK
    else Estado válido
        SAGA->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
        SAGA->>MPDB: SELECT trabajos WHERE id_queja = {id}
        alt No hay trabajos
            SAGA->>MPDB: COMMIT
            SAGA-->>MPS: success (sin consumo)
        else Hay trabajos
            SAGA->>MS: POST /api/materiales/consumos\n(Authorization: Bearer <token>)
            MS->>MADB: BEGIN (transacción GORM)
            MS->>MADB: INSERT consumo + UPDATE stock
            alt Materiales éxito
                MS->>MADB: COMMIT
                MS-->>SAGA: 201 Created (consumo)
                SAGA->>MPDB: COMMIT
                SAGA-->>MPS: success (con consumo)
            else Materiales falla
                MS->>MADB: ROLLBACK
                MS-->>SAGA: Error (HTTP 5xx / timeout)
                SAGA->>MPDB: UPDATE queja SET estado='Resuelta' (compensación)
                SAGA->>MPDB: ROLLBACK
                SAGA-->>MPS: compensación: MATERIALES_FALLA + REVERTIR_CIERRE
            end
        end
    end
    MPS-->>GW: Resultado (success o compensación)
```

### Código: Orquestador `CierreQuejaSaga.execute()`

```javascript
// backend-mp/src/shared/services/cierreQuejaSaga.js
async execute(quejaId, { id_clavecierre, fechaok, userId, token }) {
  const t = await sequelize.transaction();          // T1: transacción local
  // ... validaciones de estado ...

  result.queja = await this._cerrarQuejaEnDB(...); // UPDATE local

  const trabajos = await Trabajo.findAll({ where: { id_queja: quejaId }, transaction: t });
  if (trabajos.length > 0) {
    const payload = this._buildConsumoPayload(queja, trabajos, userId, fechaok);
    try {
      result.consumo = await this.materialesService.registrarConsumo(payload, token); // HTTP remoto
    } catch (materialesError) {
      // Compensación: revertir cierre
      await this._revertirCierre(quejaId, { transaction: t });
      await t.rollback();
      result.compensacion = { motivo: "MATERIALES_FALLA", accion: "REVERTIR_CIERRE" };
      return result;
    }
  }
  await t.commit();   // Confirmar localmente
  result.success = true;
  return result;
}
```

### Tests (`cierreSaga.test.js`)

| Escenario | Resultado esperado |
|-----------|-------------------|
| Queja no encontrada | `success: false`, `compensacion.motivo: "QUEJA_NO_ENCONTRADA"` |
| Queja ya cerrada | `success: false`, `compensacion.motivo: "YA_CERRADA"` |
| Estado inválido (`Abierta`) | `success: false`, `compensacion.motivo: "ESTADO_INVALIDO"` |
| Cierre sin trabajos | `success: true`, `consumo: null` (no llama a Materials) |
| Cierre con trabajos (éxito) | `success: true`, `consumo` registrado |
| Cierre con trabajos (Materials falla) | `success: false`, `compensacion.motivo: "MATERIALES_FALLA"`, queja revertida |

---

## 5. Mapa de Secuencia (Diagrama de Interacción)

### Escenario: Queja → Prueba → Trabajo → Cierre (4 fases)

```mermaid
sequenceDiagram
    autonumber
    participant CLI as Cliente
    participant OPE as Operador
    participant TEC as Técnico
    participant WEB as WebApp
    participant API as Gateway
    participant Q as QuejaService
    participant P as PruebaService
    participant W as TrabajoService
    participant NOT as NotificationService

    autonumber 1
    CLI->>OPE: Reportar queja (tipo, servicio, etc.)
    autonumber 2
    OPE->>WEB: Ingresar datos queja
    OPE->>API: POST /quejas
    autonumber 3
    API->>Q: Registrar queja
    Q->>Q: Clasificar + Priorizar
    Q-->>API: Queja creada (#123, prioridad 2)
    autonumber 4
    API-->>WEB: 201 Created
    WEB->>OPE: Confirmación + número de reporte (1001)
    autonumber 5
    OPE->>TEC: "Queja #123 prioridad 2"
    autonumber 6
    TEC->>WEB: Navegar a queja #123
    TEC->>WEB: "Crear prueba"
    TEC->>API: POST /pruebas
    autonumber 7
    API->>P: Registrar prueba
    P->>Q: Verificar queja existe
    P-->>API: Prueba registrada (exitosa)
    autonumber 8
    API-->>WEB: 201 Created
    WEB->>TEC: Confirmación
    autonumber 9
    TEC->>WEB: "Crear trabajo"
    TEC->>API: POST /trabajos
    autonumber 10
    API->>W: Crear trabajo
    W->>Q: Vincular queja #123
    W-->>API: Trabajo creado (OT-045)
    autonumber 11
    API-->>WEB: 201 Created
    autonumber 12
    TEC->>WEB: Navegar a trabajo OT-045
    TEC->>WEB: "Iniciar trabajo"
    API->>W: PUT /trabajos/045/iniciar
    autonumber 13
    TEC->>WEB: "Registrar consumo: 3x Cable CAT6"
    API->>W: POST /consumos
    autonumber 14
    W->>Q: Verificar stock (concurrente)
    W->>W: Registrar consumo
    W-->>API: 201 Created
    autonumber 15
    TEC->>WEB: "Cerrar trabajo (tiempo: 3.5h)"
    API->>W: PUT /trabajos/045/cerrar
    autonumber 16
    W->>Q: Cambiar estado a "Cerrada"
    W-->>API: 200 OK
    autonumber 17
    API->>NOT: send(NotificarCliente)
    NOT->>CLI: Email queja cerrada
    autonumber 18
    CLI->>OPE: "Queja 1001 cerrada"
```

---

## 6. Referencias

- [Diagramas UML](../08_sequence_diagrams.es.md)
- [Event Storming](practice_03_event_storming.es.md)
- [Máquinas de Estado](../09_state_machines.es.md)
- [Diagramas de Secuencia](practice_08_deployment_diagram.es.md)
- [Flujo de Trabajo](practice_04_bpmn.es.md)