# 📊 Diagramas de Secuencia — SISGAD5

> **Tarea:** TASK-100-04
> **Tipo:** Diagramas UML de Secuencia
> **Estado:** ✅ Completada
> **Criterio:** 3 escenarios críticos con tablas de mensajes

---

## Escenario 1: Login y Autenticación con JWT

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
    alt Credentials válidas
        US->>US: bcrypt.compare(password, hash)
        US->>US: Generar JWT (access + refresh)
        US->>RDB: SET refresh_token:{user_id} -> token
        US-->>GW: 200 OK {access_token, refresh_token, role}
        GW-->>C: 200 OK + almacenar tokens
        C->>GW: GET /api/users/perfil<br/>(Bearer JWT)
        GW->>GW: Verificar firma JWT
        alt Token válido
            GW->>US: GET /api/users/perfil (forward)
            US-->>GW: 200 OK {user, permissions}
            GW-->>C: 200 OK {perfil}
        else Token inválido/expirado
            GW-->>C: 401 Unauthorized
        end
    else Credentials inválidas
        US-->>GW: 401 Unauthorized
        GW-->>C: 401 Unauthorized
    end
```

### Tabla de Mensajes — Login y Autenticación

| Paso | Emisor             | Mensaje                                          | Destino        | Protocolo | Descripción                                    |
| ---- | ------------------ | ------------------------------------------------ | -------------- | --------- | ---------------------------------------------- |
| 1    | Cliente (Frontend) | `POST /api/auth/login`                           | API Gateway    | HTTPS     | Envío de credenciales (email + password)       |
| 2    | API Gateway        | `POST /api/auth/login`                           | Users Service  | REST/JSON | Reenvío de credenciales al servicio             |
| 3    | Users Service      | `SELECT * FROM usuarios WHERE email = ?`         | bd_users       | SQL       | Búsqueda de usuario por email                   |
| 4    | bd_users           | User record (con hash de password y role)        | Users Service  | SQL       | Respuesta con datos del usuario                 |
| 5    | Users Service      | `bcrypt.compare(password, hash)`                 | —              | Internal  | Validación de contraseña                        |
| 6    | Users Service      | `JWT.sign({id, role, exp})`                      | —              | Internal  | Generación del access token (15 min)            |
| 7    | Users Service      | `JWT.sign({id, exp})`                            | —              | Internal  | Generación del refresh token (7 días)           |
| 8    | Users Service      | `SET refresh:{user_id} → token (TTL 7d)`         | Redis          | Redis     | Almacenamiento del refresh token                |
| 9    | Users Service      | `200 OK {access, refresh, role}`                 | API Gateway    | REST/JSON | Respuesta con tokens                            |
| 10   | API Gateway        | `200 OK {access, refresh, role}`                 | Cliente        | HTTPS     | Respuesta al frontend                           |
| 11   | Cliente (Frontend) | `GET /api/users/perfil` con `Authorization: Bearer {JWT}` | API Gateway | HTTPS     | Request autenticado al perfil de usuario        |
| 12   | API Gateway        | Verificar firma JWT, expiración                  | —              | Internal  | Validación del token                            |
| 13   | API Gateway        | `GET /api/users/perfil`                          | Users Service  | REST/JSON | Forward del request con user_id del JWT         |
| 14   | Users Service      | `SELECT * FROM usuarios WHERE id = ?`            | bd_users       | SQL       | Búsqueda del usuario por ID                     |
| 15   | Users Service      | `200 OK {perfil, permisos}`                      | API Gateway    | REST/JSON | Respuesta con datos del perfil                  |
| 16   | API Gateway        | `200 OK {perfil, permisos}`                      | Cliente        | HTTPS     | Respuesta al frontend                           |

---

## Escenario 2: Asignación de materiales con validación de stock

```mermaid
sequenceDiagram
    actor T as Técnico (Frontend)
    participant GW as API Gateway
    participant MS as Materials Service
    participant US as Users Service
    participant MADB as bd_materiales (PostgreSQL)
    participant RDX as Redis (Locks)

    T->>GW: POST /api/materials/asignaciones<br/>{trabajo_id, items[], precio_unitario}
    GW->>GW: Validar JWT
    GW->>MS: POST /api/materials/asignaciones
    MS->>RDX: ACQUIRE lock:material:{material_id} (con retry)
    alt Stock suficiente
        MS->>MADB: SELECT stock_actual WHERE material_id = ?
        MADB-->>MS: Stock disponible
        alt Stock >= cantidad requerida
            MS->>MADB: INSERT asignacion + INSERT items
            MS->>MADB: UPDATE material SET stock = stock - cantidad
            MADB-->>MS: COMMIT (transacción ACID)
            MS->>RDX: RELEASE lock
            MS-->>GW: 201 Created {asignacion_id, folio}
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

| Paso | Emisor             | Mensaje                                          | Destino        | Protocolo | Descripción                                    |
| ---- | ------------------ | ------------------------------------------------ | -------------- | --------- | ---------------------------------------------- |
| 1    | Técnico (Frontend) | `POST /api/materials/asignaciones`               | API Gateway    | HTTPS     | Solicitud de asignación de materiales          |
| 2    | API Gateway        | Verificar JWT                                    | —              | Internal  | Validación de autenticación                    |
| 3    | API Gateway        | `POST /api/materials/asignaciones`               | Materials Service | REST/JSON | Reenvío de la solicitud                       |
| 4    | Materials Service  | `SETNX lock:material:{id} (expiry 30s)`         | Redis          | Redis     | Adquisición de distributed lock                |
| 5    | Redis              | `OK` o `EXISTS`                                  | Materials Service | Redis     | Respuesta de lock                              |
| 6    | Materials Service  | `SELECT stock_actual WHERE id = ?`              | bd_materiales  | SQL       | Consulta de stock disponible                   |
| 7    | bd_materiales      | Stock disponible                                | Materials Service | SQL       | Respuesta con cantidad en stock                |
| 8    | Materials Service  | `BEGIN TRANSACTION`                             | bd_materiales  | SQL       | Inicio de transacción                          |
| 9    | Materials Service  | `INSERT INTO asignaciones` + `INSERT INTO items` | bd_materiales  | SQL       | Creación de registro de asignación             |
| 10   | Materials Service  | `UPDATE material SET stock = stock - n`         | bd_materiales  | SQL       | Decremento de stock                            |
| 11   | bd_materiales      | `COMMIT`                                        | Materials Service | SQL       | Confirmación atómica de la transacción         |
| 12   | Materials Service  | `DEL lock:material:{id}`                        | Redis          | Redis     | Liberación del lock                            |
| 13   | Materials Service  | `201 Created {asignacion_id, folio}`             | API Gateway    | REST/JSON | Confirmación de asignación creada              |
| 14   | API Gateway        | `201 Created`                                   | Técnico        | HTTPS     | Respuesta al frontend                          |
| 15   | Materials Service  | `409 Conflict` (stock_insuficiente)             | API Gateway    | REST/JSON | Error: stock insuficiente                      |
| 16   | Materials Service  | Retry con backoff exponencial (max 3 intentos)  | —              | Internal  | Reintento por lock ocupado                     |

---

## Escenario 3: Cierre de queja con consumo de materiales

```mermaid
sequenceDiagram
    actor TE as Técnico (Frontend)
    participant GW as API Gateway
    participant MPS as MP Service
    participant US as Users Service
    participant MS as Materials Service
    participant MPDB as bd_mp (PostgreSQL)
    participant MADB as bd_materiales (PostgreSQL)

    TE->>GW: POST /api/mp/quejas/{id}/cerrar<br/>{trabajo_id, consumos[]}
    GW->>GW: Validar JWT
    GW->>MPS: POST /api/mp/quejas/{id}/cerrar
    MPS->>US: GET /api/users/perfil (validar técnico)
    US-->>MPS: Usuario + permisos (técnico)
    MPS->>MPDB: SELECT queja WHERE id = {id}
    MPDB-->>MPS: Queja (id, estado, trabajo_id)
    alt Estado = 'Resuelta' (transición válida)
        MPS->>MPDB: UPDATE queja SET estado='Cerrada', fecha_cierre=NOW()
        MPDB-->>MPS: OK (fila actualizada)
        MPS->>MS: POST /api/materials/consumos<br/>{trabajo_id, items[]}
        MS->>MADB: BEGIN TRANSACTION
        MS->>MADB: SELECT stock WHERE id IN (?) (validar stock)
        alt Stock suficiente para todos
            MS->>MADB: INSERT consumos + UPDATE stock
            MADB-->>MS: COMMIT
            MS-->>MPS: 201 Created {consumo_id}
            MPS-->>GW: 200 OK (queja cerrada + consumos registrados)
            GW-->>TE: 200 OK {mensaje: "Queja cerrada exitosamente"}
        else Stock insuficiente
            MS->>MADB: ROLLBACK
            MS-->>MPS: 409 Conflict (stock_insuficiente)
            MPS-->>GW: 409 Conflict
            GW-->>TE: 409 Conflict
        end
    else Estado ≠ 'Resuelta' (transición inválida)
        MPS-->>GW: 400 Bad Request (transición FSM inválida)
        GW-->>TE: 400 Bad Request
    end
```

### Tabla de Mensajes — Cierre de Queja con Consumo

| Paso | Emisor             | Mensaje                                          | Destino        | Protocolo | Descripción                                    |
| ---- | ------------------ | ------------------------------------------------ | -------------- | --------- | ---------------------------------------------- |
| 1    | Técnico (Frontend) | `POST /api/mp/quejas/{id}/cerrar`                | API Gateway    | HTTPS     | Cierre de queja con consumos de materiales     |
| 2    | API Gateway        | Verificar JWT                                    | —              | Internal  | Validación de autenticación                    |
| 3    | API Gateway        | `POST /api/mp/quejas/{id}/cerrar`                | MP Service     | REST/JSON | Forward de la solicitud                        |
| 4    | MP Service         | `GET /api/users/perfil`                          | Users Service  | REST/JSON | Validar usuario técnico y permisos             |
| 5    | Users Service      | `200 OK {user, permissions}`                    | MP Service     | REST/JSON | Confirmación de rol técnico                    |
| 6    | MP Service         | `SELECT * FROM quejas WHERE id = ?`             | bd_mp          | SQL       | Obtención del estado actual de la queja        |
| 7    | bd_mp              | Queja (id, estado, trabajo_id)                 | MP Service     | SQL       | Respuesta con datos de la queja                |
| 8    | MP Service         | Validar FSM: estado actual → 'Cerrada'          | —              | Internal  | Verificación de máquina de estados             |
| 9    | MP Service         | `UPDATE quejas SET estado='Cerrada'`            | bd_mp          | SQL       | Actualización del estado de la queja           |
| 10   | bd_mp              | `COMMIT`                                        | MP Service     | SQL       | Confirmación del cambio de estado              |
| 11   | MP Service         | `POST /api/materials/consumos`                  | Materials Service | REST/JSON | Registro de consumos de materiales        |
| 12   | Materials Service  | `BEGIN TRANSACTION`                             | bd_materiales  | SQL       | Inicio de transacción                          |
| 13   | Materials Service  | `SELECT stock WHERE id IN (?)`                  | bd_materiales  | SQL       | Validación de stock para todos los ítems       |
| 14   | bd_materiales      | Stock disponible                                | Materials Service | SQL       | Confirmación de stock suficiente               |
| 15   | Materials Service  | `INSERT consumos + UPDATE stock`                | bd_materiales  | SQL       | Registro de consumos y decremento de stock     |
| 16   | bd_materiales      | `COMMIT`                                        | Materials Service | SQL       | Confirmación atómica                           |
| 17   | Materials Service  | `201 Created`                                   | MP Service     | REST/JSON | Confirmación de consumos registrados           |
| 18   | MP Service         | `200 OK`                                        | API Gateway    | REST/JSON | Confirmación de cierre de queja                |
| 19   | API Gateway        | `200 OK`                                        | Técnico        | HTTPS     | Respuesta exitosa al frontend                  |
| 20   | Materials Service  | `409 Conflict` (stock_insuficiente)             | MP Service     | REST/JSON | Error: stock insuficiente                      |
| 21   | MP Service         | `ROLLBACK` + `409 Conflict`                      | API Gateway    | REST/JSON | Reversión y notificación de error              |
| 22   | MP Service         | `400 Bad Request` (FSM inválida)                | API Gateway    | REST/JSON | Error: transición de estado no permitida       |

---

## Escenario 4: Predicción de demanda de materiales (bonus)

```mermaid
sequenceDiagram
    actor A as Analista (Frontend)
    participant GW as API Gateway
    participant PRED as Prediction Service
    participant MS as Materials Service
    participant MPS as MP Service
    participant MADB as bd_materiales
    participant MPDB as bd_mp
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

> **Nota:** El escenario 1, 2 y 3 son los 3 escenarios críticos solicitados. El escenario 4 es complementario y ya existe parcialmente en `ARCHITECTURE.md`.
