# 📊 Diagramas de Secuencia — SISGAD5

> **Versión:** 2.8 (dominio real consolidado: sin rol Operador; el Probador crea la queja, prueba ANTES de asignar, inserta trabajos y cierra → `Cerrada`; el Supervisor solo asigna operarios a la queja; **el consumo de materiales es exclusivo del Analista de materiales** → `Completada` o culmina en `Cerrada`; **la asignación de materiales es independiente y ocurre en cualquier momento**; escenarios redundantes fusionados/eliminados)
> **Fecha:** 2026-11-02
> **Idioma:** Español (es) — equivalente en ruso: [`08_sequence_diagrams.ru.md`](08_sequence_diagrams.ru.md)
> **Tarea:** TASK-100-04
> **Estado:** ✅ Completada
> **Criterio:** escenarios críticos con diagramas Mermaid + tablas de mensajes
> **Ubicación:** documento reubicado en `docs/` siguiendo la numeración consecutiva 00–14 (v2.8). Las copias previas en `docs/diagrams/sequence_diagrams/` quedaron como punteros.
> **Fuentes fusionadas:** diagrama canónico de `docs/diagrams/sequence_diagrams/` (v. TASK-100-04, 4 escenarios) + `08_sequence_diagrams.es.md` v1.0 (3 escenarios ASCII-art convertidos a Mermaid). En v2.5–v2.7 los escenarios de consumo (ex-Esc.5) y cierre-saga (ex-Esc.6) se fusionaron dentro del Escenario 1 por solapamiento funcional.

---

## Índice de escenarios

| # | Escenario | Tipo | Origen en fuentes previas |
|---|-----------|------|---------------------------|
| 1 | Flujo completo de queja (Abierta → Cerrada → Completada) — incluye cierre, saga de compensación y gestión de consumos | Crítico | ex-Esc.1 + ex-Esc.5 + ex-Esc.6 (fusionados v2.5–v2.7) |
| 2 | Login y autenticación JWT con refresh rotativo | Crítico | diag §Esc.1 + 08_es §3 |
| 3 | Acceso a recurso protegido vía Gateway | Crítico | 08_es §3 |
| 4 | Asignación de materiales con validación de stock | Crítico | diag §Esc.2 + 08_es §2 |
| 5 | Predicción de demanda de materiales | Complementario | diag §Esc.4 |

> **Asignación ≠ Consumo (v2.5):** la **asignación** de materiales es la entrega física al trabajador y puede ocurrir **en cualquier momento** (Escenario 4); no cambia el estado de la queja. El **consumo** es el registro contable post-cierre que realiza el Analista de materiales y deriva `Cerrada → Completada` (Escenario 1).

## Escenario 1: Flujo completo de queja (Abierta → Cerrada → Completada)

**Roles del dominio (v2.7):** Probador (crea la queja, realiza pruebas, inserta trabajos, cierra; el estado `Probada`/`Resuelta` lo devuelve la BD tras registrarse la prueba) · Supervisor (jefe inscrito: **asigna el trabajador/operario a la queja**; no inserta trabajos ni crea quejas) · **Analista de materiales** (registra/edita el consumo de materiales post-cierre; si declara que no se necesitaron materiales en una queja `Cerrada`, el ciclo culmina). **No existe el rol "Operador"** — la queja la crea el Probador. **No existe asignación de trabajador al trabajo**: el operario se asigna únicamente a la queja. **Asignación ≠ Consumo**: la asignación de materiales es la entrega física al trabajador y puede ocurrir en cualquier momento (ver Escenario 4), sin cambiar el estado de la queja; el consumo es contable, post-cierre, exclusivo del Analista.

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

        Note over AM,MPS: El consumo de materiales lo gestiona el<br/>**Analista de materiales**, no el Probador.<br/>La asignación física pudo hacerse en cualquier momento previo (Esc. 4)
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
| 11a | Analista de materiales | Sistema | `POST /api/materiales/consumos` (hubo materiales) | {queja_id, items[], cantidades, costo_unitario_real} → valida `consumo ≤ asignación pendiente` (ex-Esc.5), descuenta stock con lock y deriva la queja a **"Completada"** — culmina el ciclo. Si Materials falla: compensación de saga, la queja sigue `Cerrada` |
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
> 9. **Mecánica interna (ex-Escenario 6, fusionado aquí en v2.7):** el cierre real con trabajos asociados se ejecuta como **saga orquestada con compensación** — los pasos `SELECT queja → validar FSM → UPDATE estado='Cerrada' + fechaok` son transaccionales; si el registro posterior de consumos falla (stock insuficiente o Materials Service caído), la saga revierte el consumo y la queja permanece en `Cerrada`, pudiendo el Analista reintentar.
> 10. **Validación de consumo vs asignación (ex-Escenario 5, fusionado aquí en v2.7):** al registrar consumos, el Materials Service verifica `Σ(consumos) ≤ Σ(asignaciones) − Σ(consumos_previos)` por queja/trabajo; un exceso devuelve `400 consumo_excede_asignacion` y la queja NO avanza a `Completada`. El `costo_unitario_real` se captura en el ítem de consumo (el `costo_unitario_momento` quedó fijado en la asignación).

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

**Actores:** Analista de materiales (Frontend) — v2.7: **la asignación de materiales es la entrega física al trabajador y puede realizarse en cualquier momento** (antes, durante o después de los trabajos); NO cambia el estado de la queja. Es distinta del **consumo** (registro contable post-cierre que deriva `Cerrada → Completada`, ver Escenario 1). La gestión de ambas es exclusiva del Analista de materiales. · **Participantes:** API Gateway, Materials Service, Redis (Locks), bd_materiales

```mermaid
sequenceDiagram
    actor T as Analista de materiales (Frontend)
    participant GW as API Gateway
    participant MS as Materials Service
    participant MADB as bd_materiales (PostgreSQL)
    participant RDX as Redis (Locks)

    Note over T,MADB: Entrega física de materiales al trabajador —<br/>válida en cualquier momento, no altera el estado de la queja
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
    else Timeout en lock (otra transacción concurrente)
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

## Escenario 5: Predicción de Demanda de Materiales (Complementario)

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

- [Casos de Uso](03_use_cases.es.md)
- [Modelo de Dominio](07_domain_model.es.md)
- [Máquinas de Estado](09_state_machines.es.md)
- [Estrategia de Seguridad](13_security.es.md)
- [Diagrama de Paquetes](diagrams/component_diagrams/package_diagram.md)

---

## Registro de Cambios

### v2.8 — 2026-11-02 (reubicación al consecutivo docs/)
1. **Movido de `docs/diagrams/sequence_diagrams/sequence_diagrams.md` → `docs/08_sequence_diagrams.es.md`**, siguiendo la numeración consecutiva de documentación (00–14) solicitada por el propietario. El contenido (5 escenarios, v2.7) se conserva íntegro.
2. **Referencias internas corregidas** a rutas relativas desde `docs/`.
3. **Traducción rusa actualizada** (`08_sequence_diagrams.ru.md`): de stub puntero a documento completo traducido, espejo de esta versión.
4. `docs/diagrams/sequence_diagrams/README.md` pasa a ser puntero hacia este documento canónico.

### v2.7 — 2026-11-02 (eliminación definitiva de escenarios redundantes — consolidación en 5)
1. **Eliminados los Escenarios 5 (Consumo de materiales) y 6 (Cierre con saga):** su contenido ya estaba cubierto por el Escenario 1 desde v2.5; se conservó únicamente la información única como reglas de dominio dentro del Escenario 1: validación `consumo ≤ asignación pendiente` + captura de `costo_unitario_real` (regla 10) y la mecánica transaccional de la saga con compensación a `Cerrada` (regla 9).
2. **Renumeración:** Predicción pasa de Esc. 7 → **Esc. 5**. Índice actualizado a **5 escenarios** (4 críticos + 1 complementario).
3. Referencias internas cruzadas (`ver Escenario 6`) corregidas para no apuntar a secciones inexistentes.

### v2.6 — 2026-11-02 (intento de eliminación de ex-Esc.5/6 — no persistido)
Se intentó eliminar los escenarios fusionados y renumerar a 5; el cambio no llegó a publicarse correctamente (el documento seguía mostrando 7 escenarios en HEAD). Corregido y consolidado definitivamente en v2.7.

### v2.5 — 2026-11-02 (asignación ≠ consumo)
1. **Asignación de materiales desligada del cierre:** la asignación es la **entrega física al trabajador** y puede realizarse **en cualquier momento**; NO cambia el estado de la queja (corregido el encabezado del Esc. 4, que afirmaba incorrectamente "después del cierre").
2. El **consumo** (registro contable post-cierre) sigue siendo el único disparador `Cerrada → Completada` (Esc. 1).
3. Esc. 1 absorbió la verificación de stock/consumos y el cálculo final de inventario que estaban en el ex-Esc. 6.
4. Se añadió contexto de negocio al escenario de predicción (aún sin implementación — fase TASK-700).

### v2.4 — 2026-11-02 (rol Analista de materiales añadido al dominio)
1. **Nuevo actor "Analista de materiales"** en Escenarios 1, 4 y 5: es quien **modifica/registra el consumo de materiales**, no el Probador.
2. **Escenario 1 rediseñado:** el Probador cierra la queja → `Cerrada` (sin tocar materiales). Después, el Analista de materiales: si hubo consumo → `POST /materiales/consumos` deriva la queja a **`Completada`** (culmina el ciclo); si declara que **no se necesitaron materiales** en una queja cerrada → permanece **`Cerrada`** y culmina el ciclo.
3. **RBAC post-cierre:** el `PUT/PATCH` entre `Cerrada` ↔ `Completada` es **exclusivo del Analista de materiales** (rol JWT `analista_materiales`); el Probador pierde esa capacidad.
4. La saga de cierre ya NO invoca Materials Service durante el cierre del Probador; la verificación cruzada de stock/consumo se ejecuta en la fase posterior del Analista, con compensación que devuelve la queja a `Cerrada`.
5. Escenarios de materiales: actor renombrado Probador → Analista de materiales.

### v2.3 — 2026-11-02 (segunda corrección del dominio real según revisión del propietario)
1. **Eliminado el rol "Operador" por completo** — no existe; la queja la crea el **Probador** (`POST /quejas`).
2. **Orden corregido:** la **prueba se realiza ANTES de la asignación**. El estado `Probada`/`Resuelta` lo devuelve la BD (FSM) tras registrarse la prueba.
3. **El trabajador (operario) se asigna a la QUEJA, no al trabajo**: paso `PATCH /quejas/:id/asignar-trabajador` ejecutado por el Supervisor (casi siempre, no siempre). **Eliminada toda asignación de técnico al trabajo.**
4. **Estados finales renombrados:** al cerrar, la queja queda en **`Cerrada`**; cuando se le registran consumos pasa a **`Completada`**. Se elimina `Cerrada con materiales` / `Cerrada sin materiales`.
5. Sintaxis Mermaid revalidada con @mermaid-js/mermaid-cli v11.

### v2.2 — 2026-11-02 (corrección de roles y estados según dominio real)
Correcciones aplicadas tras revisión del propietario (pendiente propagar a `docs/07_domain_model.es.md` y demás documentos cuando la revisión archivo-por-archivo llegue a cada uno): roles Probador/Supervisor, orden prueba→asignación, eliminación de asignación de técnico post-trabajo, nuevos estados de cierre y restricción RBAC post-cierre.

### v2.1 — 2026-11-02 (fix parse error Mermaid)
Reemplazados caracteres `;` en mensajes de secuencia del Escenario 1 que rompían el render en GitHub.

### v2.0 — 2026-11-02 (fusión de fuentes duplicadas)
Fusión del documento canónico (4 escenarios Mermaid) con `docs/08_sequence_diagrams.es.md` v1.0 (3 escenarios ASCII-art convertidos a Mermaid), resultando en 7 escenarios tras la migración inicial. Los archivos `docs/08_sequence_diagrams.es.md` y `.ru.md` quedaron como stubs puntero hacia este documento.
