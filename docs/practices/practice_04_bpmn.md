# Práctica 04 - BPMN (Modelado de Procesos de Negocio)

> **Disciplina:** Ingeniería de Negocio  
> **Especialidad:** Business Process Model and Notation  
> **Objetivo:** Modelar los procesos clave de SISGAD5

---

## 1. Proceso 1: Gestión de Quejas (Proceso Principal)

### Descripción
Este es el proceso principal del sistema: desde la recepción de una queja hasta su cierre.

### Diagrama BPMN

```mermaid
flowchart TD
    Start([Inicio]) --> Recepcion{¿Cómo se\nrecibe?}
    Recepcion -->|Teléfono| Llamada[Recibir llamada]
    Recepcion -->|Email/Web| Formulario[Llenar formulario]
    
    Llamada --> Clasificar[Clasificar queja]
    Formulario --> Clasificar
    
    Clasificar --> Priorizar[Calcular prioridad]
    Priorizar --> CrearQueja[Crear queja en sistema]
    CrearQueja --> EstadoA{¿Requiere\nprueba?}
    
    EstadoA -->|Sí| AsignarPrueba[Asignar prueba a técnico]
    AsignarPrueba --> EjecutarPrueba[Ejecutar prueba]
    EjecutarPrueba --> RegistrarPrueba[Registrar resultado]
    RegistrarPrueba --> EstadoB{¿Prueba exitosa?}
    EstadoB -->|Sí| AsignarTecnico[Asignar técnico]
    EstadoB -->|No| RegistrarProblema[Registrar problema]
    
    EstadoA -->|No| AsignarTecnico
    EstadoB -->|No| FinProblema([Fin - Problema])
    
    AsignarTecnico --> CrearTrabajo[Crear orden de trabajo]
    CrearTrabajo --> EjecutarTrabajo[Ejecutar trabajo en campo]
    EjecutarTrabajo --> RegistrarConsumo[Registrar consumo materiales]
    RegistrarConsumo --> CerrarTrabajo[Cerrar orden de trabajo]
    CerrarTrabajo --> EstadoC{¿Queja\nresuelta?}
    
    EstadoC -->|Sí| CerrarQueja[Cerrar queja]
    EstadoC -->|No| Reabrir[Reabrir queja]
    
    CerrarQueja --> Fin([Fin])
    Reabrir --> Priorizar
    
    classDef startend fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#2196f3,stroke-width:1px
    classDef decision fill:#fff3e0,stroke:#ff9800,stroke-width:1px,stroke-dasharray:5,5
    
    class Start,Fino,Fin,FinProblema startend
    class Llamada,Formulario,Clasificar,Priorizar,CrearQueja,AsignarPrueba,EjecutarPrueba,RegistrarPrueba,AsignarTecnico,CrearTrabajo,EjecutarTrabajo,RegistrarConsumo,CerrarTrabajo,CerrarQueja,Reabrir,RegistrarProblema process
    class EstadoA,EstadoB,EstadoC decision
```

### Tabla de Procesos (Pooled Tasks)

| Pool | Lane | Actividad | Descripción |
|------|------|-----------|-------------|
| **Clientes** | Cliente Final | Reportar incidencia | Llamar o llenar formulario web |
| **Operaciones** | Operador | Clasificar queja | Asignar tipo, servicio, ubicación, clave |
| **Operaciones** | Sistema | Priorizar | Calcular prioridad (1-4) basada en reglas |
| **Campo** | Técnico | Ejecutar prueba | Medir y documentar en sitio |
| **Campo** | Técnico | Ejecutar trabajo | Reparar o instalar en sitio |
| **Logística** | Analista | Asignar materiales | Crear asignación, validar stock |
| **Logística** | Sistema | Registrar consumo | Descontar materiales usados |
| **Supervisión** | Jefe | Asignar técnico | Designar responsable |
| **Supervisión** | Jefe | Cerrar queja | Verificar y cerrar |

### Eventos de Proceso

| Evento | Tipo | Disparador |
|--------|------|------------|
| Queja Reportada | Start (Message) | Recepción de queja |
| Prueba Completada | Intermediate (Message) | Registro de prueba |
| Trabajo Cerrado | Intermediate (Message) | Cierre de orden |
| Queja Cerrada | End (Message) | Cierre definitivo |
| Queja Reabierta | Intermediate (Message) | Requiere revisión |
| Stock Bajo | Intermediate (Timer/Message) | Verificación periódica |

---

## 2. Proceso 2: Gestión de Materiales

### Diagrama BPMN

```mermaid
flowchart TD
    Start([Inventario]) --> VerificarStock{¿Stock\nmínimo?}
    VerificarStock -->|Sí| AlertaStock[Generar alerta]
    AlertaStock --> Notificar[Notificar a Analista]
    Notificar --> Planificar[Planificar reposición]
    Planificar --> CrearOrden[Crear orden de compra interna]
    CrearOrden --> AsignarMaterial[Asignar materiales a trabajo]
    AsignarMaterial --> ValidarStock[Validar stock disponible]
    ValidarStock --> Transaccion[Transacción: crear asignación]
    Transaccion --> RegistrarConsumo[Registrar consumo tras uso]
    RegistrarConsumo --> ValidarConsumo[Validar consumo ≤ asignado]
    ValidarConsumo --> TransaccionC[Transacción: crear consumo]
    TransaccionC --> CalcularSaldo[Calcular saldo lógico]
    CalcularSaldo --> StockBajo{¿Stock < mínimo?}
    StockBajo -->|Sí| AlertaStock
    StockBajo -->|No| Fin([Fin])
    VerificarStock -->|No| FinOpe([Fin - Stock OK])
    
    classDef startend fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#2196f3,stroke-width:1px
    classDef decision fill:#fff3e0,stroke:#ff9800,stroke-width:1px,stroke-dasharray:5,5
    
    class Start,Fino,Fino,Fin,FinOpe startend
    class AlertaStock,Notificar,Planificar,CrearOrden,AsignarMaterial,ValidarStock,Transaccion,RegistrarConsumo,ValidarConsumo,TransaccionC,CalcularSaldo process
    class VerificarStock,StockBajo decision
```

---

## 3. Proceso 3: Autenticación y Autorización

### Diagrama BPMN

```mermaid
flowchart TD
    Start([Login]) --> Credenciales[Ingresar email + password]
    Credenciales --> Validar{¿Credenciales válidas?}
    Validar -->|No| Incrementar[Incrementar intentos]
    Incrementar --> Bloqueado{¿5 intentos?}
    Bloqueado -->|Sí| Bloquear[Bloquear cuenta 15min]
    Bloqueado -->|No| ErrorLogin[Error: credenciales inválidas]
    Bloquear --> NotificarAdmin[Notificar admin]
    
    Validar -->|Sí| Resetear[Resetear intentos]
    Resetear --> VerificarSesion{¿Sesión activa?}
    VerificarSesion -->|Sí| RevocarSesion[Revocar sesión anterior]
    VerificarSesion -->|No| CrearSesion[Crear nueva sesión]
    RevocarSesion --> CrearSesion
    CrearSesion --> GenerarJWT[Generar Access + Refresh Token]
    GenerarJWT --> RetornarToken[Retornar tokens al cliente]
    RetornarToken --> Dashboard([Dashboard])
    
    ErrorLogin --> Fin([Fin])
    
    classDef startend fill:#e8f5e9,stroke:#4caf50,stroke-width:2px
    classDef process fill:#e3f2fd,stroke:#2196f3,stroke-width:1px
    classDef decision fill:#fff3e0,stroke:#ff9800,stroke-width:1px,stroke-dasharray:5,5
    
    class Start,Fino,Fin,Dashboard startend
    class Credenciales,Incrementar,NotificarAdmin,Bloquear,Resetear,VerificarSesion,RevocarSesion,CrearSesion,GenerarJWT,RetornarToken process
    class Validar,Bloqueado,ErrorLogin decision
```

---

## 4. Términos BPMN Utilizados

| Elemento | Uso en SISGAD5 |
|----------|----------------|
| **Pool** | Separación por rol/área (Clientes, Operaciones, Campo, Logística, Supervisión, Sistema) |
| **Lane** | Sub-división dentro de pool (Operador vs Sistema) |
| **Task (Actividad)** | Acciones discretas (Clasificar, Priorizar, Crear, Asignar) |
| **Subprocess** | Agrupación de tareas complejas (Transacción Materiales) |
| **Gateway (Exclusive)** | Decisiones (¿Requiere prueba?, ¿Stock bajo?, ¿Credenciales válidas?) |
| **Event Start (Message)** | Eventos externos (Queja Reportada, Login) |
| **Event Intermediate (Timer)** | Verificaciones periódicas (alertas de stock) |
| **Event End** | Resultados del proceso (Queja Cerrada, Login Exitoso) |
| **Sequence Flow** | Flujo de trabajo y datos |
| **Data Object** | Información compartida (queja, material, tokens) |
| **Annotation** | Reglas de negocio asociadas |

---

## 5. Métricas de Procesos (KPIs)

| Proceso | KPI | Objetivo |
|---------|-----|----------|
| Quejas | Tiempo de cierre (Abierta→Cerrada) | < 48 horas |
| Quejas | Tiempo desde reporte → primera prueba | < 4 horas |
| Materiales | Tiempo desde alerta stock → reposición | < 24 horas |
| Autenticación | Tasa de logins fallidos | < 5% |
| Trabajos | Tiempo estimado vs real (desviación) | < ±20% |

---

## 6. Referencias

- [User Story Map](practice_02_user_story_map.md)
- [Reglas de Negocio](../06_business_rules.md)
- [Casos de Uso](../03_use_cases.md)
- [Máquinas de Estado](../09_state_machines.md)
- [Event Storming](practice_03_event_storming.md)