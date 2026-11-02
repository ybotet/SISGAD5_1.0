# 📊 Diagramas de Secuencia — SISGAD5

> **Versión:** 2.1 (documento fusionado y canónico — sintaxis Mermaid validada con @mermaid-js/mermaid-cli v11: los 7 escenarios renderizan sin errores)
> **Fecha:** 2026-11-02
> **Tarea:** TASK-100-04
> **Estado:** ✅ Completada
> **Criterio:** escenarios críticos con diagramas Mermaid + tablas de mensajes
> **Fuentes fusionadas:** `docs/diagrams/sequence_diagrams/sequence_diagrams.md` (v. TASK-100-04, 4 escenarios) + `docs/08_sequence_diagrams.es.md` v1.0 (3 escenarios: flujo completo de queja, asignación/consumo de materiales, autenticación con refresh). Los ASCII-art de la v1.0 fueron convertidos a Mermaid; el contenido único de ambas versiones se conservó.

---

## Índice de escenarios

| # | Escenario | Tipo | Origen en fuentes previas |
|---|-----------|------|---------------------------|
| 1 | Flujo completo de queja (Abierta → Cerrada) | Crítico | 08_es §1 |
| 2 | Login y autenticación JWT con refresh rotativo | Crítico | diag §Esc.1 + 08_es §3 |
| 3 | Acceso a recurso protegido vía Gateway | Crítico | 08_es §3 |
| 4 | Asignación de materiales con validación de stock | Crítico | diag §Esc.2 + 08_es §2 |
| 5 | Consumo de materiales (validación vs asignación) | Crítico | 08_es §2 |
| 6 | Cierre de queja con consumo (saga orquestada) | Crítico | diag §Esc.3 |
| 7 | Predicción de demanda de materiales | Complementario | diag §Esc.4 |

---

## Escenario 1: Flujo completo de queja (Abierta → Cerrada)

**Actores:** Operador, Técnico, Jefe · **Participantes:** API Gateway, MP Service, Materials Service, bd_mp

```mermaid
sequenceDiagram
    actor OP as Operador
    actor TE as Técnico
    actor JE as Jefe
    participant GW as API Gateway
    participant MPS as MP Service
    participant MS as Materials Service
    participant MPDB as bd_mp (PostgreSQL)

    OP->>GW: POST /api/mp/quejas<br/>{tipo_queja, servicio, ubicacion, reportado_por, telefono_id}
    GW->>MPS: forward (JWT válido)
    MPS->>MPS: Validar clasificación + calcular prioridad
    MPS->>MPDB: INSERT queja (estado='Abierta', num_reporte)
    MPDB-->>MPS: OK
    MPS-->>GW: 201 Created {queja}
    GW-->>OP: 201 Created {id, num_reporte, estado:'Abierta', prioridad}

    TE->>GW: GET /api/mp/quejas?estado=Abierta
    GW->>MPS: forward + claims x-user-*
    MPS-->>GW: 200 OK [quejas]
    GW-->>TE: 200 OK [quejas]

    TE->>GW: POST /api/mp/pruebas<br/>{queja_id, exitoso, mediciones, observaciones}
    GW->>MPS: forward
    MPS->>MPDB: INSERT prueba
    MPS-->>GW: 201 Created {prueba}
    GW-->>TE: 201 Created

    JE->>GW: PATCH /api/mp/quejas/:id/asignar {tecnico_id}
    GW->>MPS: forward
    MPS->>MPDB: UPDATE queja SET estado='Asignada'
    MPS-->>GW: 200 OK {estado:'Asignada'}
    GW-->>JE: 200 OK

    TE->>GW: PATCH /api/mp/quejas/:id {estado:'Probada'}
    GW->>MPS: forward
    MPS->>MPDB: UPDATE queja SET estado='Probada' (FSM valida transición)
    MPS-->>GW: 200 OK
    GW-->>TE: 200 OK

    JE->>GW: POST /api/mp/trabajos<br/>{queja_id, descripcion, tiempo_estimado}
    GW->>MPS: forward
    MPS->>MPDB: INSERT trabajo
    MPS-->>GW: 201 Created {trabajo}
    GW-->>JE: 201 Created

    JE->>GW: PATCH /api/mp/trabajos/:id/asignar {tecnico_id}
    GW->>MPS: forward
    MPS-->>GW: 200 OK
    GW-->>JE: 200 OK

    TE->>GW: PATCH /api/mp/trabajos/:id/cerrar {tiempo_real}
    GW->>MPS: forward
    MPS->>MPDB: UPDATE trabajo SET estado='Cerrado', tiempo_real
    MPS-->>GW: 200 OK
    GW-->>TE: 200 OK

    TE->>GW: POST /api/materials/consumos<br/>{trabajo_id, items:[{material_id, cantidad, costo_unitario_real}]}
    GW->>MS: forward
    MS-->>GW: 201 Created {consumo}
    GW-->>TE: 201 Created

    OP->>GW: PATCH /api/mp/quejas/:id {estado:'Cerrada'}
    GW->>MPS: forward (ver FSM, cierre masivo en Esc. 6)
    MPS->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
    MPS-->>GW: 200 OK
    GW-->>OP: 200 OK {estado:'Cerrada'}
```

### Tabla de Mensajes — Flujo Completo de Queja

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Operador | Sistema | `POST /api/mp/quejas` | {tipo_queja, servicio, ubicacion, reportado_por, telefono_id} |
| 2 | Sistema | Operador | 201 Created | {queja: {id, num_reporte, estado: "Abierta", prioridad}} |
| 3 | Técnico | Sistema | `GET /api/mp/quejas?estado=Abierta` | - |
| 4 | Sistema | Técnico | 200 OK | [quejas] |
| 5 | Técnico | Sistema | `POST /api/mp/pruebas` | {queja_id, exitoso, mediciones, observaciones} |
| 6 | Sistema | Técnico | 201 Created | {prueba} |
| 7 | Operador/Jefe | Sistema | `PATCH /api/mp/quejas/:id/asignar` | {tecnico_id} |
| 8 | Sistema | - | 200 OK | {queja: {estado: "Asignada"}} |
| 9 | Técnico | Sistema | `PATCH /api/mp/quejas/:id` | {estado: "Probada"} |
| 10 | Jefe | Sistema | `POST /api/mp/trabajos` | {queja_id, descripcion, tiempo_estimado} |
| 11 | Jefe | Sistema | `PATCH /api/mp/trabajos/:id/asignar` | {tecnico_id} |
| 12 | Técnico | Sistema | `PATCH /api/mp/trabajos/:id/cerrar` | {tiempo_real} |
| 13 | Técnico | Sistema | `POST /api/materials/consumos` | {trabajo_id, items: [{material_id, cantidad, costo_unitario_real}]} |
| 14 | Sistema | Técnico | 201 Created | {consumo} |
| 15 | Operador/Jefe | Sistema | `PATCH /api/mp/quejas/:id` | {estado: "Cerrada"} |
| 16 | Sistema | Operador | 200 OK | {queja: {estado: "Cerrada"}} |

> **Nota:** el cierre real de queja con trabajos asociados se ejecuta como saga orquestada con compensación — ver **Escenario 6**.

---

## Escenario 2: Login y Autenticación con JWT (+ Refresh Rotativo)

**Actores:** Cliente (Frontend) · **Participantes:** API Gateway, Users Service, Redis, bd_users

```mermaid
sequenceDiagram
    actor C as Cliente (Frontend)
    participant GW as API Gateway
    participant US as Users Service
    participant RDB as Redis (Refresh Tokens)
    participant UBD as bd_users (PostgreSQL)

    C->>GW: POST /api/auth/login<br/>{email, password}
    GW->>US: POST /api/auth/login
    US->>UBD: SELECT user WHERE email = ?
    UBD-->>US: User record (hash, role)
    alt Credenciales válidas
        US->>US: bcrypt.compare(password, hash)
        US->>US: Generar JWT (access 15min + refresh 7días)
        US->>RDB: SET refresh_token:{user_id} -> token (TTL 7d)
        US->>UBD: INSERT tb_refresh_tokens (persistencia/auditoría)
        US-->>GW: 200 OK {access_token, refresh_token, role}
        GW-->>C: 200 OK + almacenar tokens
    else Credenciales inválidas
        US-->>GW: 401 Unauthorized
        GW-->>C: 401 Unauthorized
    end

    Note over C,US: Access token expirado → rotación de refresh
    C->>GW: POST /api/auth/refresh {refresh_token}
    GW->>US: POST /api/auth/refresh
    US->>RDB: GET refresh_token:{user_id}
    RDB-->>US: token almacenado
    US->>US: Verificar token + expiración
    alt Token válido
        US->>RDB: DEL token antiguo (rotación)
        US->>UBD: UPDATE tb_refresh_tokens SET revoked=true
        US->>US: Generar nuevo access + refresh
        US->>UBD: INSERT tb_refresh_tokens (nuevo)
        US-->>GW: 200 OK {new_access, new_refresh}
        GW-->>C: 200 OK {new_access, new_refresh}
    else Token inválido/revocado
        US-->>GW: 401 Unauthorized (reautenticación requerida)
        GW-->>C: 401 Unauthorized
    end
```

### Tabla de Mensajes — Login y Autenticación

| Paso | Emisor | Mensaje | Destino | Protocolo | Descripción |
| ---- | ------ | ------- | ------- | --------- | ----------- |
| 1 | Cliente (Frontend) | `POST /api/auth/login` | API Gateway | HTTPS | Envío de credenciales (email + password) |
| 2 | API Gateway | `POST /api/auth/login` | Users Service | REST/JSON | Reenvío de credenciales al servicio |
| 3 | Users Service | `SELECT * FROM usuarios WHERE email = ?` | bd_users | SQL | Búsqueda de usuario por email |
| 4 | bd_users | User record (con hash de password y role) | Users Service | SQL | Respuesta con datos del usuario |
| 5 | Users Service | `bcrypt.compare(password, hash)` | — | Internal | Validación de contraseña |
| 6 | Users Service | `JWT.sign({id, role, exp})` | — | Internal | Generación del access token (15 min) |
| 7 | Users Service | `JWT.sign({id, exp})` | — | Internal | Generación del refresh token (7 días) |
| 8 | Users Service | `SET refresh:{user_id} → token (TTL 7d)` | Redis | Redis | Almacenamiento del refresh token |
| 9 | Users Service | `INSERT tb_refresh_tokens` | bd_users | SQL | Persistencia para auditoría/revocación |
| 10 | Users Service | `200 OK {access, refresh, role}` | API Gateway | REST/JSON | Respuesta con tokens |
| 11 | API Gateway | `200 OK {access, refresh, role}` | Cliente | HTTPS | Respuesta al frontend |
| 12 | Cliente (Frontend) | `POST /api/auth/refresh` {refresh_token} | API Gateway | HTTPS | Renovación tras expiración del access |
| 13 | Users Service | Verificar refresh en Redis/BD, rotar | — | Internal | DELETE old + INSERT new (revoked=true anterior) |
| 14 | Users Service | `200 OK {new_access, new_refresh}` | API Gateway | REST/JSON | Nuevos tokens |
| 15 | API Gateway | `200 OK {new_access, new_refresh}` | Cliente | HTTPS | Respuesta al frontend |

---

## Escenario 3: Acceso a Recurso Protegido (Claims vía Gateway)

**Actores:** Usuario · **Participantes:** API Gateway, MP Service

```mermaid
sequenceDiagram
    actor U as Usuario (Frontend)
    participant GW as API Gateway
    participant MPS as MP Service

    U->>GW: GET /api/mp/quejas<br/>Authorization: Bearer [access]
    GW->>GW: Verificar JWT (firma, expiración)
    GW->>GW: Extraer claims (user_id, roles, permisos)
    alt Token válido
        GW->>MPS: GET /api/mp/quejas<br/>Headers: x-user-id, x-user-roles
        MPS->>MPS: Filtrar resultados por permisos del rol
        MPS-->>GW: 200 OK [quejas filtradas]
        GW-->>U: 200 OK [quejas]
    else Token inválido/expirado
        GW-->>U: 401 Unauthorized
    end
```

### Tabla de Mensajes — Acceso a Recurso Protegido

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Usuario | Gateway | `GET /api/mp/quejas` | Header: Authorization: Bearer \<access\> |
| 2 | Gateway | - | Verificar JWT (firma, expiración) | - |
| 3 | Gateway | - | Extraer claims (user_id, roles) | - |
| 4 | Gateway | MP | `GET /api/mp/quejas` | Headers: X-User-Id, X-User-Roles |
| 5 | MP | Gateway | 200 OK | [quejas filtradas por permisos] |
| 6 | Gateway | Usuario | 200 OK | [quejas] |

---

## Escenario 4: Asignación de Materiales con Validación de Stock

**Actores:** Analista/Técnico (Frontend) · **Participantes:** API Gateway, Materials Service, Redis (Locks), bd_materiales

```mermaid
sequenceDiagram
    actor T as Técnico/Analista (Frontend)
    participant GW as API Gateway
    participant MS as Materials Service
    participant MADB as bd_materiales (PostgreSQL)
    participant RDX as Redis (Locks)

    T->>GW: POST /api/materials/asignaciones<br/>{trabajo_id, trabajador_id, items[], precio_unitario}
    GW->>GW: Validar JWT
    GW->>MS: POST /api/materials/asignaciones
    MS->>RDX: ACQUIRE lock:material:{material_id} (SETNX, expiry 30s)
    alt Lock adquirido y stock suficiente
        MS->>MADB: SELECT stock_actual WHERE material_id = ?
        MADB-->>MS: Stock disponible
        alt Stock >= cantidad requerida
            MS->>MADB: BEGIN TRANSACTION
            MS->>MADB: INSERT asignacion + INSERT items (captura costo_unitario_momento)
            MS->>MADB: UPDATE material SET stock = stock - cantidad
            MADB-->>MS: COMMIT (transacción ACID)
            MS->>RDX: RELEASE lock
            MS-->>GW: 201 Created {asignacion_id, folio, items:[{costo_unitario_momento}]}
            GW-->>T: 201 Created
        else Stock insuficiente
            MS->>RDX: RELEASE lock
            MS-->>GW: 409 Conflict (stock_insuficiente)
            GW-->>T: 409 Conflict
        end
    else Timeout en lock (otro técnico)
        MS->>MS: Retry (exponential backoff, max 3)
        alt Max reintentos alcanzados
            MS-->>GW: 503 Service Unavailable (timeout_lock)
            GW-->>T: 503 Service Unavailable
        end
    end
```

### Tabla de Mensajes — Asignación de Materiales

| Paso | Emisor | Mensaje | Destino | Protocolo | Descripción |
| ---- | ------ | ------- | ------- | --------- | ----------- |
| 1 | Técnico/Analista (Frontend) | `POST /api/materials/asignaciones` | API Gateway | HTTPS | Solicitud de asignación (múltiples ítems) |
| 2 | API Gateway | Verificar JWT | — | Internal | Validación de autenticación |
| 3 | API Gateway | `POST /api/materials/asignaciones` | Materials Service | REST/JSON | Reenvío de la solicitud |
| 4 | Materials Service | `SETNX lock:material:{id} (expiry 30s)` | Redis | Redis | Adquisición de distributed lock |
| 5 | Redis | `OK` o `EXISTS` | Materials Service | Redis | Respuesta de lock |
| 6 | Materials Service | `SELECT stock_actual WHERE id = ?` | bd_materiales | SQL | Consulta de stock disponible |
| 7 | bd_materiales | Stock disponible | Materials Service | SQL | Respuesta con cantidad en stock |
| 8 | Materials Service | `BEGIN TRANSACTION` | bd_materiales | SQL | Inicio de transacción |
| 9 | Materials Service | `INSERT INTO asignaciones` + `INSERT INTO items` | bd_materiales | SQL | Creación de registro (captura `costo_unitario_momento`) |
| 10 | Materials Service | `UPDATE material SET stock = stock - n` | bd_materiales | SQL | Decremento de stock |
| 11 | bd_materiales | `COMMIT` | Materials Service | SQL | Confirmación atómica de la transacción |
| 12 | Materials Service | `DEL lock:material:{id}` | Redis | Redis | Liberación del lock |
| 13 | Materials Service | `201 Created {asignacion_id, folio}` | API Gateway | REST/JSON | Confirmación de asignación creada |
| 14 | API Gateway | `201 Created` | Técnico | HTTPS | Respuesta al frontend |
| 15 | Materials Service | `409 Conflict` (stock_insuficiente) | API Gateway | REST/JSON | Error: stock insuficiente |
| 16 | Materials Service | Retry con backoff exponencial (max 3 intentos) | — | Internal | Reintento por lock ocupado |

---

## Escenario 5: Consumo de Materiales (Validación vs Asignación)

**Actores:** Técnico · **Participantes:** API Gateway, Materials Service, MP Service, bd_materiales

```mermaid
sequenceDiagram
    actor T as Técnico (Frontend)
    participant GW as API Gateway
    participant MS as Materials Service
    participant MPS as MP Service
    participant MADB as bd_materiales (PostgreSQL)

    T->>GW: POST /api/materials/consumos<br/>{trabajador_id, trabajo_id, asignacion_id, items:[{material_id, cantidad, costo_unitario_real}]}
    GW->>MS: forward (JWT validado)
    MS->>MPS: GET /api/mp/trabajos/{trabajo_id} (verificar existencia/estado)
    MPS-->>MS: trabajo (abierto ✓)
    MS->>MADB: Σ(consumos_previos) por asignacion_id
    MADB-->>MS: consumido_actual
    MS->>MS: Validar: consumo ≤ Σ(asignaciones) − Σ(consumos_previos)
    alt Validación exitosa
        MS->>MADB: BEGIN TRANSACTION
        MS->>MADB: INSERT consumo + items (captura costo_unitario_real)
        MS->>MADB: UPDATE stock = stock − cantidad
        MADB-->>MS: COMMIT (ACID)
        MS-->>GW: 201 Created {consumo, items:[{costo_unitario_real}]}
        GW-->>T: 201 Created
    else Excede asignación pendiente
        MS-->>GW: 400 Bad Request (consumo_excede_asignacion)
        GW-->>T: 400 Bad Request
    end
```

### Tabla de Mensajes — Consumo de Materiales

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Técnico | Sistema | `POST /api/materials/consumos` | {trabajador_id, trabajo_id, asignacion_id, items: [...]} |
| 2 | Sistema | - | Verificar trabajo existente/abierto | `GET /api/mp/trabajos/{id}` |
| 3 | Sistema | - | Validar consumo ≤ asignación pendiente | Σ(consumos) ≤ Σ(asignaciones) − Σ(consumos_previos) |
| 4 | Sistema | - | Transacción: INSERT consumo + items | db.Transaction() |
| 5 | Sistema | - | Capturar costo_unitario_real | Input del técnico |
| 6 | Sistema | Técnico | 201 Created | {consumo, items: [{costo_unitario_real}]} |

---

## Escenario 6: Cierre de Queja con Consumo de Materiales (Saga Orquestada)

**Actores:** Técnico (Frontend) · **Participantes:** API Gateway, MP Service, CierreQuejaSaga, bd_mp, Materials Service, bd_materiales

```mermaid
sequenceDiagram
    actor TE as Técnico (Frontend)
    participant GW as API Gateway
    participant MPS as MP Service
    participant SAGA as CierreQuejaSaga (Orquestador)
    participant MPDB as bd_mp (PostgreSQL)
    participant MS as Materials Service
    participant MADB as bd_materiales (PostgreSQL)

    TE->>GW: POST /api/mp/quejas/{id}/cerrar<br/>{id_clavecierre, fechaok, token}
    GW->>GW: Verificar JWT + claims (rol: tecnico)
    GW->>MPS: POST /api/mp/quejas/{id}/cerrar (forward con claims)
    MPS->>SAGA: execute(quejaId, ctx)

    SAGA->>MPDB: BEGIN (transacción Sequelize)
    SAGA->>MPDB: SELECT queja WHERE id = {id}
    MPDB-->>SAGA: Queja (estado, id_telefono, etc.)

    alt Queja no existe
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: 404 Not Found (QUEJA_NO_ENCONTRADA)
        MPS-->>GW: 404 Not Found
        GW-->>TE: 404 Not Found
    else Estado inválido (no Resuelta/Probada)
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: 400 Bad Request (ESTADO_INVALIDO)
        MPS-->>GW: 400 Bad Request
        GW-->>TE: 400 Bad Request
    else Ya está cerrada
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: compensación: YA_CERRADA
        MPS-->>GW: 400 Bad Request (already closed)
        GW-->>TE: 400 Bad Request
    else Estado válido
        SAGA->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
        SAGA->>MPDB: SELECT trabajos WHERE id_queja = {id}
        MPDB-->>SAGA: trabajos[]
        alt No hay trabajos (sin consumo)
            SAGA->>MPDB: COMMIT
            SAGA-->>MPS: 200 OK (queja cerrada, sin consumo)
            MPS-->>GW: 200 OK
            GW-->>TE: 200 OK {mensaje: "Queja cerrada"}
        else Hay trabajos
            SAGA->>MS: POST /api/materiales/consumos<br/>{trabajo_id, trabajador_id, ...}
            Note over SAGA,MS: Retry con backoff exponencial (max 3)
            MS->>MADB: BEGIN TRANSACTION
            MS->>MADB: INSERT consumo + UPDATE stock (con lock)
            alt Stock suficiente
                MS->>MADB: COMMIT
                MS-->>SAGA: 201 Created {consumo_id}
                SAGA->>MPDB: COMMIT
                SAGA-->>MPS: 200 OK (queja cerrada + consumo registrado)
                MPS-->>GW: 200 OK
                GW-->>TE: 200 OK {mensaje: "Queja cerrada exitosamente"}
            else Stock insuficiente o Materials falla
                MS->>MADB: ROLLBACK
                MS-->>SAGA: 409/500 (stock_insuficiente/error)
                SAGA->>MPDB: UPDATE queja SET estado='Resuelta' (compensación)
                SAGA->>MPDB: ROLLBACK
                SAGA-->>MPS: compensación: MATERIALES_FALLA
                MPS-->>GW: 500/409 (error con compensación)
                GW-->>TE: Error: cierre revertido, intente nuevamente
            end
        end
    end
```

### Tabla de Mensajes — Cierre de Queja (Saga Orquestada)

| Paso | Emisor | Mensaje | Destino | Protocolo | Descripción |
| ---- | ------ | ------- | ------- | --------- | ----------- |
| 1 | Técnico (Frontend) | `POST /api/mp/quejas/{id}/cerrar` | API Gateway | HTTPS | Cierre de queja con datos de cierre |
| 2 | API Gateway | Verificar JWT + claims (`rol: tecnico`) | — | Internal | Validación con claims (no llama a Users Service) |
| 3 | API Gateway | Forward request con headers `x-user-*` | MP Service | REST/JSON | Propagación de claims |
| 4 | MP Service | `CierreQuejaSaga.execute(quejaId, ctx)` | — | Internal | Inicio de orquestación |
| 5 | CierreQuejaSaga | `BEGIN` | bd_mp | SQL | Transacción local |
| 6 | CierreQuejaSaga | `SELECT queja WHERE id = ?` | bd_mp | SQL | Validar existencia y estado |
| 7 | CierreQuejaSaga | Validar FSM: estado ∈ {Resuelta, Probada} | — | Internal | Verificación de máquina de estados |
| 8 | CierreQuejaSaga | `UPDATE quejas SET estado='Cerrada'` | bd_mp | SQL | Cierre local |
| 9 | CierreQuejaSaga | `SELECT trabajos WHERE id_queja = ?` | bd_mp | SQL | Buscar trabajos asociados |
| 10 | CierreQuejaSaga | `POST /api/materiales/consumos` | Materials Service | REST/JSON | Registro de consumo (si hay trabajos) |
| 11 | Materials Service | `BEGIN TRANSACTION` + `INSERT consumo` + `UPDATE stock` | bd_materiales | SQL | Transacción ACID remota |
| 12 | CierreQuejaSaga | `COMMIT` | bd_mp | SQL | Confirmación local (si Materials OK) |
| 13 | CierreQuejaSaga | `UPDATE quejas SET estado='Resuelta'` (rollback) | bd_mp | SQL | Compensación (si Materials falla) |
| 14 | CierreQuejaSaga | `ROLLBACK` | bd_mp | SQL | Reversión de transacción local |

---

## Escenario 7: Predicción de Demanda de Materiales (Complementario)

**Actores:** Analista · **Participantes:** API Gateway, Prediction Service, Materials Service, MP Service, bd_predictions

```mermaid
sequenceDiagram
    actor A as Analista (Frontend)
    participant GW as API Gateway
    participant PRED as Prediction Service
    participant MS as Materials Service
    participant MPS as MP Service
    participant PDB as bd_predictions

    A->>GW: GET /api/predictions/demanda-materiales?periodo=30d
    GW->>PRED: GET /api/predictions/demanda-materiales (JWT validado)
    PRED->>MS: GET /api/materials/asignaciones?historial=true (read-only)
    MS-->>PRED: Datos históricos de asignaciones
    PRED->>MPS: GET /api/mp/trabajos?historial=true (read-only)
    MPS-->>PRED: Datos históricos de trabajos
    PRED->>PRED: Procesar features + inferencia modelo
    PRED->>PDB: INSERT prediccion + metrics
    PDB-->>PRED: OK
    PRED-->>GW: 200 OK {prediccion, intervalo_confianza, features_importance}
    GW-->>A: 200 OK (visualización en dashboard)
```

---

## Referencias

- [Casos de Uso](../../03_use_cases.es.md)
- [Modelo de Dominio](../../07_domain_model.es.md)
- [Máquinas de Estado](../../09_state_machines.es.md)
- [Estrategia de Seguridad](../../13_security.es.md)
