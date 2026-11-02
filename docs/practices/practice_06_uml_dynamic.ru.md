# Практика 06 — UML Dinámico (Secuencia, Comunicación, State Machine)

> **Дисциплина:** Инженерия программного обеспечения
> **Специализация:** UML — Динамическая вью
> **Основано на:** [SISGAD5_doc/docs/03-08](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Диаграммы последовательностей

### 1.1. Регистрация заявки

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
    Note over N,C: Email de confirmation
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

    U->>C: Ввести email/password
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

## 2. Диаграммы коммуникаций

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

## 3. Машины состояний

### 3.1. Состояние заявки

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
    PruebaExitosa --> Cerrada: Cerrar заявку
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

### 3.2. Состояние назначения

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
        Creada pero não aprobada\npor jefe de área
    end note
    
    note right of Entregada
        Técnico confirma recepción\nfísica de materiales
    end note
```

### 3.3. Состояние работы

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

## 4. Диаграммы активности

### 4.1. Flujo Asignación → Consumo (Materiales)

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
            :Maintener estado "Aprobada";
        endif
    else (No)
        :Error: InsufficientStockException;
        :Devolver detalle faltante;
    endif
    stop
```

### 4.2. Flujo Заявки (FSM - State Machine)

```mermaid
activityDiagram-v2
    start
    :Cliente/operador reporta заявку;
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
        :Cerrar заявку;
        :Enviar notificación al cliente;
    else (No)
        :Reabrir заявку;
        :Asignar nuevo técnico;
    endif
    stop
```

---

## 5. Карта последовательностей (Диаграмма взаимодействия)

### Escenario: Заявка → Тест → Работа → Cierre (4 фазы)

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
    CLI->>OPE: Reportar заявку (tipo, servicio и т.д.)
    autonumber 2
    OPE->>WEB: Ввести данные заявки
    OPE->>API: POST /quejas
    autonumber 3
    API->>Q: Registrar заявку
    Q->>Q: Clasificar + Priorizar
    Q-->>API: Заявка создана (#123, приоритет 2)
    autonumber 4
    API-->>WEB: 201 Created
    WEB->>OPE: Confirmación + номер заявки (1001)
    autonumber 5
    OPE->>TEC: "Заявка #123 приоритет 2"
    autonumber 6
    TEC->>WEB: Перейти к заявке #123
    TEC->>WEB: "Создать тест"
    TEC->>API: POST /pruebas
    autonumber 7
    API->>P: Registrar тест
    P->>Q: Verificar заявка существует
    P-->>API: Тест зарегистрирован (успешный)
    autonumber 8
    API-->>WEB: 201 Created
    WEB->>TEC: Confirmación
    autonumber 9
    TEC->>WEB: "Создать работу"
    TEC->>API: POST /trabajos
    autonumber 10
    API->>W: Crear работу
    W->>Q: Vincular заявку #123
    W-->>API: Работа создана (OT-045)
    autonumber 11
    API-->>WEB: 201 Created
    autonumber 12
    TEC->>WEB: Перейти к работе OT-045
    TEC->>WEB: "Начать работу"
    API->>W: PUT /trabajos/045/iniciar
    autonumber 13
    TEC->>WEB: "Registrar расход: 3x Cable CAT6"
    API->>W: POST /consumos
    autonumber 14
    W->>Q: Verificar stock (concurrente)
    W->>W: Registrar расход
    W-->>API: 201 Created
    autonumber 15
    TEC->>WEB: "Закрыть работу (tiempo: 3.5h)"
    API->>W: PUT /trabajos/045/cerrar
    autonumber 16
    W->>Q: Cambiar estado a "Cerrada"
    W-->>API: 200 OK
    autonumber 17
    API->>NOT: send(NotificarCliente)
    NOT->>CLI: Email заявка закрыта
    autonumber 18
    CLI->>OPE: "Заявка 1001 закрыта"
```

---

## 6. Ссылки

- [UML Estáticо](../08_sequence_diagrams.ru.md)
- [Event Storming](practice_03_event_storming.ru.md)
- [Máquinas de Estado](../09_state_machines.ru.md)