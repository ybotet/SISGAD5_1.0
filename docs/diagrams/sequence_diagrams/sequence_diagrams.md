# 📊 Diagramas de Secuencia — SISGAD5

> **Versión:** 2.4 (dominio real: sin rol Operador; el Probador crea la queja, prueba ANTES de asignar, inserta trabajos y cierra → `Cerrada`; el Supervisor solo asigna operarios a la queja; **el consumo de materiales es exclusivo del Analista de materiales** — registra consumos → `Completada` o declara "no requeridos" y el ciclo culmina en `Cerrada`)
> **Fecha:** 2026-11-02
> **Tarea:** TASK-100-04
> **Estado:** ✅ Completada
> **Criterio:** escenarios críticos con diagramas Mermaid + tablas de mensajes
> **Fuentes fusionadas:** `docs/diagrams/sequence_diagrams/sequence_diagrams.md` (v. TASK-100-04, 4 escenarios) + `docs/08_sequence_diagrams.es.md` v1.0 (3 escenarios: flujo completo de queja, asignación/consumo de materiales, autenticación con refresh). Los ASCII-art de la v1.0 fueron convertidos a Mermaid; el contenido único de ambas versiones se conservó.

---

## Índice de escenarios

| # | Escenario | Tipo | Origen en fuentes previas |
|---|-----------|------|---------------------------|
| 1 | Flujo completo de queja (Abierta → Cerrada → Completada) | Crítico | 08_es §1 (roles corregidos v2.4) |
| 2 | Login y autenticación JWT con refresh rotativo | Crítico | diag §Esc.1 + 08_es §3 |
| 3 | Acceso a recurso protegido vía Gateway | Crítico | 08_es §3 |
| 4 | Asignación de materiales con validación de stock | Crítico | diag §Esc.2 + 08_es §2 |
| 5 | Consumo de materiales (validación vs asignación) | Crítico | 08_es §2 |
| 6 | Cierre de queja con consumo (saga orquestada) | Crítico | diag §Esc.3 |
| 7 | Predicción de demanda de materiales | Complementario | diag §Esc.4 |

---

## Escenario 1: Flujo completo de queja (Abierta → Cerrada → Completada)

**Roles del dominio (v2.4):** Probador (crea la queja, realiza pruebas, inserta trabajos, cierra; el estado `Probada`/`Resuelta` lo devuelve la BD tras registrarse la prueba) · Supervisor (jefe inscrito: **asigna el trabajador/operario a la queja**; no inserta trabajos ni crea quejas) · **Analista de materiales** (registra/edita el consumo de materiales post-cierre; si declara que no se necesitaron materiales en una queja `Cerrada`, el ciclo culmina). **No existe el rol "Operador"** — la queja la crea el Probador. **No existe asignación de trabajador al trabajo**: el operario se asigna únicamente a la queja.

**Actores:** Probador, Supervisor, Analista de materiales · **Participantes:** API Gateway, MP Service, Materials Service, bd_mp

```mermaid
sequenceDiagram
    actor PR as Probador
    actor SU as Supervisor
    actor AM as Analista de materiales
    participant GW as API Gateway
    participant MPS as MP Service
    participant MS as Materials Service
    participant MPDB as bd_mp (PostgreSQL)

    PR->>GW: POST /api/mp/quejas<br/>{tipo_queja, servicio, ubicacion, reportado_por, telefono_id}
    GW->>MPS: forward (JWT válido)
    MPS->>MPS: Validar clasificación + calcular prioridad
    MPS->>MPDB: INSERT queja (estado='Abierta', num_reporte)
    MPDB-->>MPS: OK
    MPS-->>GW: 201 Created {queja}
    GW-->>PR: 201 Created {id, num_reporte, estado:'Abierta', prioridad}

    PR->>GW: GET /api/mp/quejas?estado=Abierta
    GW->>MPS: forward + claims x-user-*
    MPS-->>GW: 200 OK [quejas]
    GW-->>PR: 200 OK [quejas]

    Note over PR,MPS: La prueba se realiza ANTES de cualquier asignación
    PR->>GW: POST /api/mp/pruebas<br/>{queja_id, exitoso, mediciones, observaciones}
    GW->>MPS: forward
    MPS->>MPDB: INSERT prueba
    MPS->>MPDB: UPDATE queja SET estado='Probada' o 'Resuelta'<br/>(FSM evalúa resultado de la prueba)
    MPDB-->>MPS: nuevo estado
    MPS-->>GW: 201 Created {prueba, estado_queja}
    GW-->>PR: 201 Created {estado:'Probada'|'Resuelta'}

    alt Estado = 'Resuelta' (queja resuelta en la prueba, sin trabajo)
        Note over PR,MPDB: Salto directo al cierre — no se crea trabajo,<br/>no hay asignación de operario ni consumo de materiales
        PR->>GW: PATCH /api/mp/quejas/:id {estado:'Cerrada'}
        GW->>MPS: forward (ver FSM)
        MPS->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
        MPS-->>GW: 200 OK
        GW-->>PR: 200 OK {estado:'Cerrada'}
    else Estado = 'Probada' (requiere intervención → continúa el flujo)
        Note over SU,MPDB: El Supervisor asigna el trabajador (operario) A LA QUEJA<br/>(casi siempre, no siempre) — no al trabajo
        SU->>GW: PATCH /api/mp/quejas/:id/asignar-trabajador<br/>{id_trabajador}
        GW->>MPS: forward
        MPS->>MPDB: UPDATE queja SET id_trabajador_asignado, estado='Asignada'
        MPS-->>GW: 200 OK {estado:'Asignada'}
        GW-->>SU: 200 OK

        PR->>GW: POST /api/mp/trabajos<br/>{queja_id, descripcion, tiempo_estimado}
        GW->>MPS: forward
        MPS->>MPDB: INSERT trabajo (sin asignación de trabajador:<br/>el operario está asignado a la queja)
        MPS-->>GW: 201 Created {trabajo}
        GW-->>PR: 201 Created

        PR->>GW: PATCH /api/mp/trabajos/:id/cerrar {tiempo_real}
        GW->>MPS: forward
        MPS->>MPDB: UPDATE trabajo SET estado='Cerrado', tiempo_real
        MPS-->>GW: 200 OK
        GW-->>PR: 200 OK

        Note over PR,MS: Los materiales NO se asignan hasta que la queja cierre<br/>El Probador cierra la queja → estado 'Cerrada'
        PR->>GW: PATCH /api/mp/quejas/:id {estado:'Cerrada'}
        GW->>MPS: forward (verifica FSM: cierre sin tocar materiales)
        MPS->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
        MPS-->>GW: 200 OK
        GW-->>PR: 200 OK {estado:'Cerrada'}

        Note over AM,MPS: El consumo de materiales lo gestiona el<br/>**Analista de materiales**, no el Probador
        alt Se utilizaron materiales en el trabajo
            AM->>GW: POST /api/materiales/consumos<br/>{queja_id, items[], cantidades}
            GW->>MS: forward (JWT rol: analista_materiales)
            MS->>MS: validar stock + descontar inventario
            MS->>MPDB: registrar consumos + UPDATE queja SET estado='Completada'
            MPDB-->>MS: OK
            MS-->>GW: 201 Created {consumo, estado_queja:'Completada'}
            GW-->>AM: 201 Created — ciclo culmina en **Completada**
        else No se necesitaron materiales
            AM->>GW: PATCH /api/mp/quejas/:id {materiales: 'no requeridos'}
            GW->>MPS: forward (restringido al estado de materiales)
            MPS->>MPDB: confirmar queja en estado='Cerrada' (sin consumos)
            MPS-->>GW: 200 OK
            GW-->>AM: 200 OK — ciclo culmina en **Cerrada**
        end

        Note over AM,MPS: PUT/PATCH posterior al cierre: SOLO el Analista de materiales<br/>edita el consumo (Cerrada ↔ Completada)<br/>el Probador no puede
        AM->>GW: PATCH /api/mp/quejas/:id {estado:'Completada'|'Cerrada'}
        GW->>MPS: forward (RBAC: rol analista_materiales)
        MPS-->>GW: 200 OK
        GW-->>AM: 200 OK
    end
```

### Tabla de Mensajes — Flujo Completo de Queja (roles v2.4)

| # | De | Hacia | Mensaje | Datos |
|---|----|-------|---------|-------|
| 1 | Probador | Sistema | `POST /api/mp/quejas` | {tipo_queja, servicio, ubicacion, reportado_por, telefono_id} — el Probador crea la queja (no existe el Operador) |
| 2 | Sistema | Probador | 201 Created | {queja: {id, num_reporte, estado: "Abierta", prioridad}} |
| 3 | Probador | Sistema | `GET /api/mp/quejas?estado=Abierta` | - |
| 4 | Probador | Sistema | `POST /api/mp/pruebas` | {queja_id, exitoso, mediciones, observaciones} — **la prueba va ANTES de la asignación** |
| 5 | Sistema (BD vía FSM) | Probador | 201 Created | {prueba, estado_queja: "Probada" \| "Resuelta"} — la BD devuelve el estado tras la prueba |
| 6a | Probador | Sistema | `PATCH /api/mp/quejas/:id` (rama Resuelta) | {estado: "Cerrada"} — cierre directo, sin trabajo ni materiales |
| 6b | Supervisor | Sistema | `PATCH /api/mp/quejas/:id/asignar-trabajador` (rama Probada) | {id_trabajador} — el operario se asigna **a la queja**, casi siempre pero no siempre |
| 7 | Probador | Sistema | `POST /api/mp/trabajos` (rama Probada) | {queja_id, descripcion, tiempo_estimado} — el probador inserta el trabajo; **sin campo de trabajador** |
| 8 | Probador | Sistema | `PATCH /api/mp/trabajos/:id/cerrar` | {tiempo_real} |
| 9 | Probador | Sistema | `PATCH /api/mp/quejas/:id` (cierre) | {estado: "Cerrada"} — el Probador cierra; NO toca materiales |
| 10 | Sistema | Probador | 200 OK | {queja: {estado: "Cerrada", fechaok}} |
| 11a | Analista de materiales | Sistema | `POST /api/materiales/consumos` (hubo materiales) | {queja_id, items[], cantidades} → registra consumos y deriva la queja a **"Completada"** — culmina el ciclo |
| 11b | Analista de materiales | Sistema | `PATCH /api/mp/quejas/:id` (no hubo materiales) | {materiales: "no requeridos"} → confirma **"Cerrada"** sin consumos — culmina el ciclo |
| 12 | Analista de materiales | Sistema | `PATCH /api/mp/quejas/:id` (post-cierre) | Solo edición del consumo (Cerrada ↔ Completada); RBAC exclusivo del Analista |

> **Reglas de dominio (v2.4):**
> 1. **No existe el rol "Operador"** — la queja la crea el **Probador**.
> 2. El **Supervisor** (jefe inscrito) **solo realiza asignaciones de trabajador a la queja**, nunca inserta trabajos ni crea quejas.
> 3. **La prueba se realiza antes de la asignación**; el estado `Probada`/`Resuelta` lo devuelve la BD (FSM) tras registrarse la prueba.
> 4. **El trabajador (operario) se asigna a la queja, no al trabajo** — no existe endpoint de asignación de trabajador al trabajo; el `POST /trabajos` no recibe técnico/trabajador.
> 5. El **Probador inserta el trabajo** (`POST /trabajos`) y se ejecuta casi siempre, salvo cuando la prueba resuelve la queja directamente (estado `Resuelta` → cierre sin trabajo).
> 6. **Los materiales no se asignan hasta que la queja cierre**: el Probador cierra → **`Cerrada`**. Posteriormente el **Analista de materiales** registra el consumo → **`Completada`**; si declara que no se necesitaron materiales, la queja permanece en `Cerrada` y el ciclo culmina ahí.
> 7. **El consumo de materiales es responsabilidad exclusiva del Analista de materiales** (rol `analista_materiales`): el Probador no puede registrar consumos ni cambiar Cerrada↔Completada.
> 8. `PUT`/`PATCH` posteriores al cierre sirven **únicamente** para editar el estado de la queja entre `Cerrada` y `Completada` (consumo de materiales), y solo los ejecuta el Analista de materiales.
> 9. **Nota:** el cierre real con trabajos asociados se ejecuta como saga orquestada con compensación — ver **Escenario 6**.

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

**Actores:** Analista de materiales (Frontend) — v2.4: la asignación/consumo de materiales es exclusiva del Analista, ocurre después del cierre de la queja · **Participantes:** API Gateway, Materials Service, Redis (Locks), bd_materiales

```mermaid
sequenceDiagram
    actor T as Analista de materiales (Frontend)
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
| 1 | Analista de materiales (Frontend) | `POST /api/materials/asignaciones` | API Gateway | HTTPS | Solicitud de asignación (múltiples ítems) |
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
| 14 | API Gateway | `201 Created` | Analista de materiales | HTTPS | Respuesta al frontend |
| 15 | Materials Service | `409 Conflict` (stock_insuficiente) | API Gateway | REST/JSON | Error: stock insuficiente |
| 16 | Materials Service | Retry con backoff exponencial (max 3 intentos) | — | Internal | Reintento por lock ocupado |

---

## Escenario 5: Consumo de Materiales (Validación vs Asignación)

**Actores:** Analista de materiales · **Participantes:** API Gateway, Materials Service, MP Service, bd_materiales

```mermaid
sequenceDiagram
    actor T as Analista de materiales (Frontend)
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
| 1 | Analista de materiales | Sistema | `POST /api/materials/consumos` | {trabajador_id, trabajo_id, asignacion_id, items: [...]} |
| 2 | Sistema | - | Verificar trabajo existente/abierto | `GET /api/mp/trabajos/{id}` |
| 3 | Sistema | - | Validar consumo ≤ asignación pendiente | Σ(consumos) ≤ Σ(asignaciones) − Σ(consumos_previos) |
| 4 | Sistema | - | Transacción: INSERT consumo + items | db.Transaction() |
| 5 | Sistema | - | Capturar costo_unitario_real | Input del Analista de materiales |
| 6 | Sistema | Analista de materiales | 201 Created | {consumo, items: [{costo_unitario_real}]} |

---

## Escenario 6: Cierre de Queja con Consumo de Materiales (Saga Orquestada)

**Actores:** Probador (cierra la queja → `Cerrada`) · Analista de materiales (registra el consumo → `Completada`) — v2.4: **el cierre NO invoca Materials Service**; la saga queda como mecanismo interno para cuando el Analista registra consumos sobre una queja cerrada. **Participantes:** API Gateway, MP Service, CierreQuejaSaga, bd_mp, Materials Service, bd_materiales

```mermaid
sequenceDiagram
    actor PRb as Probador (Frontend)
    actor AMa as Analista de materiales (Frontend)
    participant GW as API Gateway
    participant MPS as MP Service
    participant SAGA as CierreQuejaSaga (Orquestador)
    participant MPDB as bd_mp (PostgreSQL)
    participant MS as Materials Service
    participant MADB as bd_materiales (PostgreSQL)

    PRb->>GW: POST /api/mp/quejas/{id}/cerrar<br/>{id_clavecierre, fechaok, token}
    GW->>GW: Verificar JWT + claims (rol: probador)
    GW->>MPS: POST /api/mp/quejas/{id}/cerrar (forward con claims)
    MPS->>SAGA: execute(quejaId, ctx)

    SAGA->>MPDB: BEGIN (transacción Sequelize)
    SAGA->>MPDB: SELECT queja WHERE id = {id}
    MPDB-->>SAGA: Queja (estado, id_telefono, etc.)

    alt Queja no existe
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: 404 Not Found (QUEJA_NO_ENCONTRADA)
        MPS-->>GW: 404 Not Found
        GW-->>PRb: 404 Not Found
    else Estado inválido (no Resuelta/Probada)
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: 400 Bad Request (ESTADO_INVALIDO)
        MPS-->>GW: 400 Bad Request
        GW-->>PRb: 400 Bad Request
    else Ya está cerrada
        SAGA->>MPDB: ROLLBACK
        SAGA-->>MPS: compensación: YA_CERRADA
        MPS-->>GW: 400 Bad Request (already closed)
        GW-->>PRb: 400 Bad Request
    else Estado válido
        SAGA->>MPDB: SELECT trabajos WHERE id_queja = {id}
        MPDB-->>SAGA: trabajos[]
        Note over PRb,SAGA: v2.4: el cierre del Probador NO toca materiales<br/>la queja queda en 'Cerrada' con fechaok
        SAGA->>MPDB: UPDATE queja SET estado='Cerrada', fechaok=NOW()
        SAGA->>MPDB: COMMIT
        SAGA-->>MPS: 200 OK (queja cerrada, pendiente de clasificación de materiales)
        MPS-->>GW: 200 OK
        GW-->>PRb: 200 OK {estado: "Cerrada"}

        Note over AMa,MADB: Fase posterior: el Analista de materiales gestiona el consumo
        alt Se utilizaron materiales en los trabajos
            AMa->>GW: POST /api/materiales/consumos<br/>{queja_id, items[], cantidades}
            GW->>MS: forward (JWT rol: analista_materiales)
            SAGA->>MS: POST /api/materiales/consumos (verificación cruzada)
            Note over SAGA,MS: Retry con backoff exponencial (max 3)
            MS->>MADB: BEGIN TRANSACTION
            MS->>MADB: INSERT consumo + UPDATE stock (con lock)
            alt Stock suficiente
                MS->>MADB: COMMIT
                MS-->>SAGA: 201 Created {consumo_id}
                SAGA->>MPDB: UPDATE queja SET estado='Completada'
                SAGA->>MPDB: COMMIT
                SAGA-->>MPS: 200 OK (queja completada + consumo registrado)
                MPS-->>GW: 200 OK
                GW-->>AMa: 200 OK {estado: "Completada"} — ciclo culmina
            else Stock insuficiente o Materials falla
                MS->>MADB: ROLLBACK
                MS-->>SAGA: 409/500 (stock_insuficiente/error)
                SAGA->>MPDB: UPDATE queja SET estado='Cerrada' (compensación)
                SAGA->>MPDB: ROLLBACK
                SAGA-->>MPS: compensación: MATERIALES_FALLA
                MPS-->>GW: 500/409 (error con compensación)
                GW-->>AMa: Error: consumo revertido, la queja sigue Cerrada
            end
        else No se necesitaron materiales
            AMa->>GW: PATCH /api/mp/quejas/:id {materiales: 'no requeridos'}
            GW->>MPS: forward (RBAC: rol analista_materiales)
            MPS->>MPDB: confirmar queja en estado='Cerrada' (sin consumos)
            MPS-->>GW: 200 OK
            GW-->>AMa: 200 OK {estado: "Cerrada"} — ciclo culmina sin materiales
        end
    end
```

### Tabla de Mensajes — Cierre de Queja (Saga Orquestada)

| Paso | Emisor | Mensaje | Destino | Protocolo | Descripción |
| ---- | ------ | ------- | ------- | --------- | ----------- |
| 1 | Probador (Frontend) | `POST /api/mp/quejas/{id}/cerrar` | API Gateway | HTTPS | Cierre de queja con datos de cierre |
| 2 | API Gateway | Verificar JWT + claims (`rol: probador`) | — | Internal | Validación con claims (no llama a Users Service) |
| 3 | API Gateway | Forward request con headers `x-user-*` | MP Service | REST/JSON | Propagación de claims |
| 4 | MP Service | `CierreQuejaSaga.execute(quejaId, ctx)` | — | Internal | Inicio de orquestación |
| 5 | CierreQuejaSaga | `BEGIN` | bd_mp | SQL | Transacción local |
| 6 | CierreQuejaSaga | `SELECT queja WHERE id = ?` | bd_mp | SQL | Validar existencia y estado |
| 7 | CierreQuejaSaga | Validar FSM: estado ∈ {Resuelta, Probada} | — | Internal | Verificación de máquina de estados |
| 8 | CierreQuejaSaga | `UPDATE queja SET estado='Cerrada', fechaok=NOW()` + `COMMIT` (v2.4: el cierre NO toca materiales) | bd_mp | SQL | Estado final del cierre = `Cerrada` para todos los casos |
| 9 | Analista de materiales | `POST /api/materiales/consumos` {queja_id, items[]} | API Gateway → Materials Service | REST/JSON | Fase posterior: registro de consumo (RBAC rol analista_materiales) |
| 10 | Materials Service | `BEGIN TRANSACTION` + `INSERT consumo` + `UPDATE stock` | bd_materiales | SQL | Transacción ACID remota |
| 11 | MP Service (saga) | `UPDATE quejas SET estado='Completada'` al confirmarse el consumo | bd_mp | SQL | Culminación del ciclo con materiales |
| 12 | Analista de materiales | `PATCH /api/mp/quejas/:id {materiales:'no requeridos'}` (si no hubo consumo) | MP Service | REST/JSON | Confirma `Cerrada` sin consumos — culmina el ciclo |
| 13 | CierreQuejaSaga | Reversión a `'Cerrada'` si Materials falla (compensación) | bd_mp | SQL | El consumo se reintenta; la queja sigue cerrada |

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

---

## Registro de Cambios

### v2.4 — 2026-11-02 (rol Analista de materiales añadido al dominio)
1. **Nuevo actor "Analista de materiales"** en Escenarios 1, 4, 5 y 6: es quien **modifica/registra el consumo de materiales**, no el Probador.
2. **Escenario 1 rediseñado:** el Probador cierra la queja → `Cerrada` (sin tocar materiales). Después, el Analista de materiales: si hubo consumo → `POST /materiales/consumos` deriva la queja a **`Completada`** (culmina el ciclo); si declara que **no se necesitaron materiales** en una queja cerrada → permanece **`Cerrada`** y culmina el ciclo.
3. **RBAC post-cierre:** el `PUT/PATCH` entre `Cerrada` ↔ `Completada` es **exclusivo del Analista de materiales** (rol JWT `analista_materiales`); el Probador pierde esa capacidad.
4. **Escenario 6 (saga):** el cierre ya NO invoca Materials Service; la verificación cruzada de stock/consumo se ejecuta en la fase posterior del Analista, con compensación que devuelve la queja a `Cerrada` (antes revertía a `Resuelta`).
5. **Escenarios 4 y 5:** actor renombrado Probador → Analista de materiales (la asignación y el consumo de materiales le pertenecen).

### v2.3 — 2026-11-02 (segunda corrección del dominio real según revisión del propietario)
1. **Eliminado el rol "Operador" por completo** — no existe; la queja la crea el **Probador** (`POST /quejas`).
2. **Orden corregido:** la **prueba se realiza ANTES de la asignación** (antes, en v2.2 figuraba la asignación previa del Supervisor). El estado `Probada`/`Resuelta` lo devuelve la BD (FSM) tras registrarse la prueba.
3. **El trabajador (operario) se asigna a la QUEJA, no al trabajo**: nuevo paso `PATCH /quejas/:id/asignar-trabajador` ejecutado por el Supervisor (casi siempre, no siempre). **Eliminada toda asignación de técnico al trabajo** (`PATCH /trabajos/:id/asignar` fuera del flujo; `POST /trabajos` ya no recibe `tecnico_id`).
4. **Estados finales renombrados:** al cerrar, la queja queda en **`Cerrada`**; cuando se le asignan/consumen materiales pasa a **`Completada`**. Se elimina `Cerrada con materiales` / `Cerrada sin materiales`. El PATCH post-cierre solo edita el estado entre `Cerrada` ↔ `Completada`.
5. Escenario 6 (saga) alineado: estado final `Completada` (hubo consumo) o `Cerrada` (no hubo); claim JWT del cierre corregido a `rol: probador`.
6. Sintaxis Mermaid revalidada con @mermaid-js/mermaid-cli v11: los 7 bloques renderizan sin errores.

### v2.2 — 2026-11-02 (corrección de roles y estados según dominio real)
Correcciones aplicadas tras revisión del propietario (pendiente propagar a `docs/07_domain_model.es.md` y demás documentos cuando la revisión archivo-por-archivo llegue a cada uno):

1. **Roles:** se eliminó el rol inexistente "Operador como ejecutor de pruebas" → es el **Probador** quien realiza pruebas, cierra trabajos e **inserta los trabajos**. El rol "Jefe" fue renombrado a **Supervisor** (jefe inscrito; solo realiza asignaciones, nunca inserta trabajos). El Operador únicamente crea la queja.
2. **Orden del flujo:** la asignación de la queja al probador ocurre ANTES de la prueba; el estado `Probada`/`Resuelta` lo devuelve la BD (FSM) tras registrarse la prueba. Si `Resuelta` → cierre directo sin trabajo; si `Probada` → continúa con trabajo.
3. **Eliminada** la asignación de técnico *después* del trabajo: el técnico se asigna solo antes (en la creación del trabajo por el probador o adicionalmente por el supervisor).
4. **Nuevos estados de cierre:** `Cerrada con materiales` / `Cerrada sin materiales`. Los materiales no se asignan hasta que la queja cierre; la saga (Escenario 6) fija el estado final según existan consumos.
5. **Restricción post-cierre:** `PUT/PATCH` sobre queja cerrada solo permite editar el estado de consumo de materiales.
6. Escenarios 4, 5 y 6 actualizados con los roles correctos (Probador en lugar de Técnico/Analista; claim `rol: probador`).
7. Sintaxis Mermaid revalidada con @mermaid-js/mermaid-cli v11: los 7 bloques renderizan sin errores.
