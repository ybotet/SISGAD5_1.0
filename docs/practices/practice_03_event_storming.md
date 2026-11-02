# Práctica 03 - Event Storming

> **Disciplina:** Ingeniería de Dominio / Domain-Driven Design  
> **Metodología:** Event Storm (Alberto Brandolini)  
> **Basado en:** [SISGAD5_doc/docs/04 Словарь терминов.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Eventos del Dominio (Domain Events)

Los eventos son hechos inmutables del pasado que ocurren en el dominio. Se escriben en pasado.

### Contexto: Auth

| Evento | Descripción | Trigger |
|--------|-------------|---------|
| `UsuarioRegistrado` | Usuario creado en sistema | POST /api/auth/register |
| `UsuarioAutenticado` | Login exitoso | POST /api/auth/login |
| `SesionCreada` | Sesión (access+refresh) emitida | POST /api/auth/login |
| `SesionRenovada` | Nuevos tokens emitidos | POST /api/auth/refresh |
| `SesionRevocada` | Logout o revocación de seguridad | POST /api/auth/logout |
| `UsuarioBloqueado` | Bloqueo por intentos fallidos | 5 attempts login fallidos |
| `UsuarioDesbloqueado` | Account unlock tras tiempo o admin | Manual/Admin |
| `ContrasenaCambiada` | Password modificada | PUT /api/auth/me/password |
| `RolAsignado` | Rol vinculado a usuario | PUT /api/users/:id/roles |
| `PermisoAsignadoARol` | Permiso vinculado a rol | PUT /api/roles/:id/permisos |

### Contexto: MP (Quejas, Pruebas, Trabajos)

| Evento | Descripción | Trigger |
|--------|-------------|---------|
| `TelefonoCreado` | Teléfono registrado | POST /api/mp/telefonos |
| `TelefonoDesactivado` | Estado → baja | PATCH /api/mp/telefonos/:id/estado |
| `LineaCreada` | Línea registrada | POST /api/mp/lineas |
| `LineaDesactivada` | Estado → baja | PATCH /api/mp/lineas/:id/estado |
| `PizarraCreada` | Pizarra registrada | POST /api/mp/pizarras |
| `PuertoCreado` | Puerto asociado a pizarra | POST /api/mp/pizarras/:id/puertos |
| `ConexionRegistrada` | Conexión puerto↔elemento | PUT /api/mp/pizarras/:id/puertos/:puertoId |
| `QuejaReportada` | Queja creada | POST /api/mp/quejas |
| `QuejaClasificada` | Tipo/servicio/ubicación/clave seteados | POST /api/mp/quejas (on create) |
| `QuejaPriorizada` | Prioridad 1-4 calculada | On QuejaReportada |
| `QuejaProbada` | Prueba registrada como exitosa | POST /api/mp/pruebas |
| `QuejaAsignadaATecnico` | Técnico designado | PATCH /api/mp/quejas/:id/asignar |
| `QuejaCambioEstado` | Transición válida de estado | PATCH /api/mp/quejas/:id (state machine) |
| `PruebaRegistrada` | Resultado de prueba guardado | POST /api/mp/pruebas |
| `TrabajoCreado` | Orden de trabajo creada | POST /api/mp/trabajos |
| `TrabajoAsignadoATecnico` | Técnico designado | PATCH /api/mp/trabajos/:id/asignar |
| `TrabajoCerrado` | Estado → cerrado con tiempo real | PATCH /api/mp/trabajos/:id/cerrar |
| `QuejaCerrada` | Estado → Cerrada (final) | PATCH /api/mp/quejas/:id |
| `QuejaReabierta` | Estado → Abierta desde Cerrada | PATCH /api/mp/quejas/:id |
| `MovimientoRegistrado` | Cambio físico de elemento | POST /api/mp/movimientos |

### Contexto: Materials

| Evento | Descripción | Trigger |
|--------|-------------|---------|
| `MaterialCreado` | Material agregado al catálogo | POST /api/materials/materiales |
| `CategoriaCreada` | Nueva categoría creada | POST /api/materials/categorias |
| `UnidadMedidaCreada` | Nueva unidad creada | POST /api/materials/unidades |
| `AsignacionCreada` | Materiales asignados a trabajador | POST /api/materials/asignaciones |
| `AsignacionItemCreado` | Ítem añadido a asignación | Parte de AsignacionCreada |
| `PrecioMomentoCapturado` | Costo conocido al asignar | Parte de AsignacionCreada |
| `AsignacionEstadoActualizado` | Cambio Pendiente→Entregada, etc. | PATCH /api/materials/asignaciones/:id |
| `ConsumoCreado` | Materiales consumidos | POST /api/materials/consumos |
| `ConsumoItemCreado` | Ítem añadido a consumo | Parte de ConsumoCreado |
| `PrecioRealCapturado` | Costo real conocido | Parte de ConsumoCreado |
| `StockVerificado` | Validación stock (concurrente) | Parte de AsignacionCreada/ConsumoCreado |
| `StockBajoAlertado` | Stock lógico < mínimo | Cálculo dashboard |
| `SaldoLogicoCalculado` | Σ(asignado) - Σ(consumido) | Cálculo dashboard |

---

## 2. Comandos (Commands)

Los comandos son intenciones del usuario que provocan eventos. Validan Invariantes de Negocio.

### Auth Commands

| Comando | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `RegistrarUsuario` | Admin | Email válido, password política, email único | `UsuarioRegistrado` |
| `Autenticar` | Usuario | Credenciales válidas, no bloqueado | `UsuarioAutenticado`, `SesionCreada` |
| `RenovarToken` | Usuario | Refresh token válido, no revocado, no expirado | `SesionRenovada` |
| `RevocarSesion` | Usuario | Refresh token existe y pertenece al usuario | `SesionRevocada` |
| `CambiarContrasena` | Usuario | Password actual correcto, nuevo cumple política | `ContrasenaCambiada` |
| `AsignarRolesAUsuario` | Admin | Roles existen, usuario existe | `RolAsignado` (xN) |
| `AsignarPermisosARol` | Admin | Permisos existen, rol existe | `PermisoAsignadoARol` (xN) |

### MP Commands

| Comando | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `CrearTelefono` | Operador | Número único, cliente_id válido | `TelefonoCreado` |
| `DesactivarTelefono` | Operador | Teléfono existe, activo | `TelefonoDesactivado` |
| `CrearLinea` | Operador | Número único, cliente_id válido | `LineaCreada` |
| `CrearPizarra` | Operador | Nombre único, tipo_pizarra_id válido | `PizarraCreada` |
| `CrearPuerto` | Operador | Número único por pizarra | `PuertoCreado` |
| `RegistrarConexion` | Operador | Puerto existe, elemento válido | `ConexionRegistrada` |
| `ReportarQueja` | Operador | Clasificación completa, tel/linea/pizarra válidos | `QuejaReportada`, `QuejaClasificada`, `QuejaPriorizada` |
| `RegistrarPrueba` | Técnico | Queja/trabajo existen, técnico asignado | `PruebaRegistrada` |
| `AsignarTecnicoQueja` | Jefe | Queja existe, técnico válido, estado actual válido | `QuejaAsignadaATecnico` |
| `CambiarEstadoQueja` | Operador/Técnico | Transición válida (FSM), técnico asignado si aplica | `QuejaCambioEstado` |
| `CrearTrabajo` | Jefe | Descripción requerida, queja opcional válida | `TrabajoCreado` |
| `AsignarTecnicoTrabajo` | Jefe | Trabajo existe, técnico válido | `TrabajoAsignadoATecnico` |
| `CerrarTrabajo` | Técnico | Trabajo asignado al técnico, tiempo real > 0 | `TrabajoCerrado` |
| `RegistrarMovimiento` | Técnico | Elemento existe, tipo_movimiento válido | `MovimientoRegistrado` |

### Materials Commands

| Comando | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `CrearMaterial` | Analista | Código único, precio > 0, categoria/unidad existen | `MaterialCreado` |
| `CrearCategoria` | Analista | Nombre único | `CategoriaCreada` |
| `CrearUnidadMedida` | Analista | Nombre/símbolo únicos | `UnidadMedidaCreada` |
| `CrearAsignacion` | Analista/Técnico | Materiales existen, trabajador válido, cantidades > 0 | `AsignacionCreada` (+ items, +precio momento) |
| `ActualizarEstadoAsignacion` | Analista | Asignación existe, estado válido | `AsignacionEstadoActualizado` |
| `CrearConsumo` | Técnico | Materiales existen, consumo ≤ asignación pendiente, cantidades > 0 | `ConsumoCreado` (+ items, +precio real) |
| `VerificarStock` | Sistema (automático) | Concurrente, goroutines | `StockVerificado` |
| `GenerarAlertaStockBajo` | Sistema (automático) | Stock < mínimo | `StockBajoAlertado` |

---

## 3. Agregados (Aggregates)

### Auth Aggregate
```
SesionRoot: Sesion
├── User (agregado raíz)
├── Rol (agregado raíz)
├── Permiso (agregado raíz)
├── Sesiones[] (entidades)
├── UserRoles[] (value objects)
└── RolesPermisos[] (value objects)
```

### MP Aggregate
```
Root: Queja
├── FlujoEstadoQueja[] (entidades)
├── QuejaClasificacion (value object)
└── QuejaPrioridad (value object)

Root: Trabajo
├── TrabajoItems[] (entidades) - si aplica

Root: Telefono
├── TelefonoHistorial[] (entidades)
```

### Materials Aggregate
```
Root: Asignacion
├── AsignacionItem[] (entidades)
└── AsignacionEstado (value object)

Root: Consumo
├── ConsumoItem[] (entidades)

Root: Material
├── StockLogico (value object)
```

---

## 4. Reglas de Negocio Identificadas (BR)

| ID | Regla | Tipo | Agregado |
|----|-------|------|----------|
| BR-01 | 5 intentos fallidos → bloqueo 15min | Validación | User |
| BR-02 | Refresh token se invalida al renovarse | Invariancia | Sesion |
| BR-03 | Prioridad = tipo.peso + servicio.peso + ubicacion.peso + antigüedad | Cálculo | Queja |
| BR-04 | Solo transiciones validas FSM | Invariancia | Queja |
| BR-05 | Queja "Cerrada" puede reabrirse (nuevo num_reporte) | Regla de negocio | Queja |
| BR-06 | Prueba debe vincular queja o trabajo | Validación | Prueba |
| BR-07 | Trabajo: tiempo_real ≤ 2 × tiempo_estimado (alerta) | Regla | Trabajo |
| BR-08 | Consumo ≤ Asignación-Pendiente (stock lógico) | Invariancia | Materials |
| BR-09 | Asignación atómica (todos items o ninguno) | Transaccional | Asignacion |
| BR-10 | Consumo atómico (todos items o ninguno) | Transaccional | Consumo |
| BR-11 | No eliminar material con historial de consumo | Invariancia | Material |
| BR-12 | Estado "Cerrada" requiere prueba exitosa | Regla | Queja |

---

## 5. Comandos vs Eventos (Matriz de Trazabilidad)

| Comando | Evento Resultante | Validaciones de Negocio | Agregado |
|---------|-------------------|------------------------|----------|
| ReportarQueja | QuejaReportada, QuejaClasificada, QuejaPriorizada | BR-03 (cálculo prioridad), RN-MP-14 (clasificación obligatoria) | Queja |
| CambiarEstadoQueja | QuejaCambioEstado | BR-04 (FSM), RN-MP-17 (flujo estados) | Queja |
| CrearAsignacion | AsignacionCreada | BR-09 (atómico), RN-MAT-05 (validación existencia) | Asignacion |
| CrearConsumo | ConsumoCreado | BR-08, BR-10, RN-MAT-13 (validar vs asignación) | Consumo |
| Autenticar | UsuarioAutenticado, SesionCreada | BR-01 (bloqueo), password verification | User/Sesion |
| RenovarToken | SesionRenovada | BR-02 (rotación), expiración | Sesion |

---

## 6. Diagrama de Eventos (Mermaid)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e1f5fe', 'secondaryColor': '#e8f5e9', 'tertiaryColor': '#fff3e0', 'lineColor': '#666' }}}%%
eventFlow
    section Auth
        UsuarioRegistrado
        UsuarioAutenticado
        SesionCreada
        SesionRenovada
        SesionRevocada
    
    section MP
        QuejaReportada
        QuejaClasificada
        QuejaPriorizada
        QuejaAsignadaATecnico
        QuejaProbada
        QuejaCambioEstado
        TrabajoCreado
        TrabajoCerrado
        PruebaRegistrada
        
    section Materials
        AsignacionCreada
        ConsumoCreado
        StockVerificado
        StockBajoAlertado
```

---

## 7. Referencias

- [Diccionario de Términos](../04_glossary.md)
- [User Story Map](practice_02_user_story_map.md)
- [Reglas de Negocio](../06_business_rules.md)
- [Modelo de Dominio](../07_domain_model.md)
- [Máquinas de Estado](../09_state_machines.md)