# Práctica 02 - User Story Map (Mapa de Historias de Usuario)

> **Disciplina:** Ingeniería de Requisitos  
> **Basado en:** [SISGAD5_doc/docs/02 Акторы.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Historias de Usuario por Actor

### Epic 1: Autenticación y Gestión de Usuarios

```
Actividad principal: "Gestionar cuenta de usuario"

[Login] ──→ [Dashboard] ──→ [VerPerfil] ──→ [EditarPerfil] ──→ [ChangePassword]
   │            │              │                │
   │            │              └─→ [ViewSessions] ──→ [RevokeSession]
   │            │
   │            └─→ [RecuperarPassword]
   │
   └─→ [Logout]

[Admin] ──→ [CrearUsuario] ──→ [AsignarRoles] ──→ [VerDetalleUsuario] ──→ [EditarUsuario] ──→ [EliminarUsuario]
             │                      │
             │                      └─→ [VerHistorial]
             │
             └─→ [CrearRol] ──→ [AsignarPermisos] ──→ [EditarRol] ──→ [EliminarRol]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-01 | Login | Usuario | Iniciar sesión con email/password | Acceder al sistema | 🔴 |
| US-02 | Refresh Token | Usuario | Renovar access token automáticamente | No interrumpir flujo de trabajo | 🔴 |
| US-03 | Logout | Usuario | Cerrar sesión e invalidar tokens | Seguridad en equipos compartidos | 🔴 |
| US-04 | Registrar Usuario | Admin | Crear usuarios con roles iniciales | Onboarding de nuevos empleados | 🔴 |
| US-05 | Listar Usuarios | Admin | Ver lista paginada de usuarios | Auditar cuentas activas | 🟡 |
| US-06 | Editar Usuario | Admin | Modificar datos de usuario | Actualizar información | 🟡 |
| US-07 | Bloquear Usuario | Admin | Bloquear/reactivar cuenta | Seguridad ante riesgos | 🟡 |
| US-08 | Asignar Roles | Admin | Asignar/desasignar roles | Control de acceso | 🔴 |
| US-09 | Crear Rol | Admin | Crear nuevos roles | Adaptar a nuevas funciones | 🟡 |
| US-10 | Asignar Permisos | Admin | Dar permisos específicos a rol | Granularidad de acceso | 🟡 |
| US-11 | Recuperar Password | Usuario | Recuperar contraseña vía email | Recuperar acceso | 🟡 |
| US-12 | Cambiar Password | Usuario | Cambiar mi contraseña | Seguridad personal | 🟡 |
| US-13 | Ver Sesiones Activas | Usuario/Admin | Ver sesiones activas | Detectar accesos no autorizados | 🟢 |
| US-14 | Revocar Sesión | Usuario/Admin | Cerrar sesión en otro dispositivo | Seguridad | 🟢 |

### Epic 2: Gestión de Infraestructura (Teléfonos, Líneas, Pizarras)

```
Actividad: "Gestionar infraestructura"

[CrearElemento] ──→ [VerDetalle] ──→ [EditarElemento] ──→ [CambiarEstado] ──→ [VerHistorial]
       │                 │               │                  │
       │                 │               └─→ [Eliminar]    │
       │                 │                                 │
       │                 └─→ [BuscarElementos]             │
       │                                                   │
       └─→ [ListarElementos] ──→ [FiltrarElementos] ──→ [ExportarLista]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-15 | CRUD Teléfonos | Operador | Registrar/editar/eliminar teléfonos | Digitalizar inventario | 🔴 |
| US-16 | Cambiar Estado Teléfono | Operador | Marca activo/baja con fecha | Gestión ciclo vida | 🔴 |
| US-17 | Historial Teléfono | Técnico/Jefe | Ver quejas y movimientos | Diagnóstico | 🟡 |
| US-18 | Buscar Teléfonos | Operador | Filtrar por cliente, estado, búsqueda | Localizar rápido | 🟡 |
| US-19 | CRUD Líneas | Operador | Gestionar líneas de telecomunicación | Digitalizar inventario | 🔴 |
| US-20 | Cambiar Estado Línea | Operador | Activar/desactivar líneas | Gestión ciclo vida | 🔴 |
| US-21 | CRUD Pizarras | Operador | Gestionar pizarras y puertos | Digitalizar infraestructura | 🔴 |
| US-22 | Mapear Puertos | Operador | CRUD puertos por pizarra | Gestión conexiones | 🟡 |
| US-23 | Conexiones Pizarra | Operador | Registrar conexiones entrantes/salientes | Trazabilidad | 🟡 |
| US-24 | Ubicación Física | Operador | Geolocalizar pizarras | Mapas y planos | 🟡 |
| US-25 | Ver Historial Pizarra | Técnico | Ver historial completo | Diagnóstico | 🟡 |
| US-26 | Exportar Infraestructura | Jefe | Exportar listado a CSV/PDF | Reportes | 🟢 |

### Epic 3: Gestión de Quejas

```
Actividad: "Ciclo de vida de queja"

[CrearQueja] ──→ [VerDetalle] ──→ [EditarQueja] ──→ [CambiarEstado/Asignar]
      │              │                │                    │
      │              │                │                    └─→ [VerHistorial]
      │              │                │                    └─→ [VerAuditoría]
      │              │                │                    └─→ [AsignarTécnico]
      │              │                │
      │              │                └─→ [Eliminar] (solo draft)
      │              │
      │              └─→ [BuscarQuejas/Filtrar]
      │
      └─→ [ListarQuejas] ──→ [FiltrarQuejas]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-27 | Crear Queja | Operador | Registrar queja con clasificación | Iniciar proceso | 🔴 |
| US-28 | Clasificar Queja | Operador | Seleccionar tipo/servicio/ubicación/clave | Priorizar y dirigir | 🔴 |
| US-29 | Priorizar Queja | Sistema | Asignar prioridad 1-4 automáticamente | Ordenar atención | 🔴 |
| US-30 | Cambiar Estado | Operador/Técnico | Transitar entre estados válidos | Avanzar proceso | 🔴 |
| US-31 | Asignar Técnico | Jefe | Asignar a técnico disponible | Ejecución | 🔴 |
| US-32 | Ver Detalle Queja | Todos (según rol) | Ver pruebas, trabajos, historial | Diagnóstico | 🟡 |
| US-33 | Ver Historial Estado | Auditor | Ver todos los cambios de estado | Trazabilidad | 🟡 |
| US-34 | Ver Auditoría | Auditor | Ver quién hizo qué y cuándo | Cumplimiento | 🟡 |
| US-35 | Buscar Quejas | Operador | Filtrar por estado, fecha, técnico, prioridad | Localizar rápido | 🟡 |
| US-36 | Notificación Email | Sistema | Enviar email al asignar/cambiar estado | Comunicación | 🟢 |
| US-37 | Reabrir Queja | Operador | Cambiar estado Cerrada → Abierta | Corrección | 🟢 |

### Epic 4: Gestión de Pruebas

```
Actividad: "Registrar pruebas técnicas"

[CrearPrueba] ──→ [VerDetalle] ──→ [EditarPrueba]
       │               │               │
       │               └─→ [VerHistorial]
       │
       └─→ [ListarPruebas] ──→ [FiltrarPruebas]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-38 | Registrar Prueba | Técnico | Registrar resultado con mediciones | Evidenciar verificación | 🔴 |
| US-39 | Resultado Prueba | Técnico | Marcar exitoso/fail + observaciones | Calidad | 🔴 |
| US-40 | Vincular Prueba | Técnico | Relacionar a queja y/o trabajo | Trazabilidad | 🔴 |
| US-41 | Listar Pruebas | Jefe | Ver historial con filtros | Supervisión | 🟡 |

### Epic 5: Gestión de Trabajos

```
Actividad: "Orden de trabajo"

[CrearTrabajo] ──→ [VerDetalle] ──→ [EditarTrabajo] ──→ [AsignarTécnico]
       │              │                │                  │
       │              │                │                  └─→ [CerrarTrabajo]
       │              │                │                    (requiere tiempo real)
       │              │                │
       │              │                └─→ [Eliminar]
       │              │
       │              └─→ [VerHistorial]
       │
       └─→ [ListarTrabajos] ──→ [FiltrarTrabajos]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-42 | Crear Trabajo | Jefe | Orden de trabajo con descripción y tiempo estimado | Planificar | 🔴 |
| US-43 | Asignar Técnico | Jefe | Asignar trabajo a técnico | Ejecución | 🔴 |
| US-44 | Cerrar Trabajo | Técnico | Registrar tiempo real y cerrar | Finalizar | 🔴 |
| US-45 | Historial Trabajos | Jefe | Listar con filtros | Supervisión | 🟡 |

### Epic 6: Gestión de Materiales

```
Actividad: "Catálogo y movimientos de materiales"

[GestionarMateriales] ──→ [VerDetalle] ──→ [EditarMaterial]
         │                    │               │
         │                    │               └─→ [Eliminar]
         │                    │
         │                    └─→ [Buscar/Filtrar]
         │
         └─→ [ListarMateriales] ──→ [Paginar]

         [CrearAsignación] ──→ [VerDetalle] ──→ [EditarEstado]
                │                │               │
                │                │               └─→ [VerHistorial]
                │                │
                │                └─→ [VerItems]
                │
                └─→ [ListarAsignaciones]

         [CrearConsumo] ──→ [VerDetalle] ──→ [VerItems]
                │               │
                │               └─→ [VerHistorial]
                │
                └─→ [ListarConsumos]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-46 | CRUD Materiales | Analista | Gestionar catálogo completo | Digitalizar inventario | 🔴 |
| US-47 | CRUD Categorías | Analista | Organizar materiales | Gestión eficiente | 🔴 |
| US-48 | CRUD Unidades | Analista | Definir unidades de medida | Especificidad | 🔴 |
| US-49 | Crear Asignación | Analista/Técnico | Asignar múltiples ítems con precio momento | Control de costos | 🔴 |
| US-50 | Validar Stock | Sistema | Verificar stock disponible (concurrente) | Evitar sobreasignación | 🔴 |
| US-51 | Historial Asignaciones | Analista | Listar con filtros | Auditoría | 🟡 |
| US-52 | Crear Consumo | Técnico | Registrar consumo con precio real | Control de gastos | 🔴 |
| US-53 | Validar Consumo ≤ Asignación | Sistema | Bloquear sobre-consumo | Control de inventario | 🔴 |
| US-54 | Historial Consumos | Analista | Listar con filtros | Auditoría | 🟡 |
| US-55 | Ver Dashboard | Todos | KPIs materiales en tiempo real | Toma de decisiones | 🟡 |
| US-56 | Saldo Lógico | Analista | Ver saldo por trabajador/material | Control de stock | 🟡 |
| US-57 | Alertas Stock Bajo | Sistema | Notificar stock mínimo | Reabastecer | 🟢 |
| US-58 | Exportar Materiales | Analista | CSV/JSON export | Reportes | 🟢 |

### Epic 7: Estadísticas y Dashboards

```
Actividad: "Análisis de datos"

[VerDashboardMP] ──→ [FiltrarDatos] ──→ [VerGráficos] ──→ [ExportarDatos]
         │                │                │                │
         └─→ [KPIsPrincipales]             │                │
                                           │                │
                                        [VerDetalle]         │
                                                             │
[VerDashboardMateriales] ──→ [FiltrarDatos] ──→ [VerGráficos] ──→ [ExportarDatos]
```

**Historias:**

| ID | Historia | Como... | Quiero... | Para... | Prioridad |
|----|----------|---------|-----------|---------|-----------|
| US-59 | Dashboard MP | Jefe/Director | Ver KPIs: quejas, trabajos, pruebas | Supervisión | 🟡 |
| US-60 | Dashboard Materiales | Analista/Director | Ver KPIs: asignaciones, consumos, stock | Supervisión | 🟡 |
| US-61 | Filtrar por Fecha | Todos | Filtrar KPIs por rango de fechas | Análisis temporal | 🟡 |
| US-62 | Filtrar por Servicio | Todos | Filtrar por tipo de servicio | Análisis segmentado | 🟡 |
| US-63 | Exportar KPIs | Director | Exportar reportes a PDF/Excel | Reportes ejecutivos | 🟢 |

---

## 3. Prioridad del Backlog (MVP → Completo)

### MVP (Mínimo Producto Viable) - 🔴 Release 1.0
- Autenticación completa (US-01 a US-04)
- CRUD teléfonos/líneas/pizarras (US-15 a US-24)
- Quejas: crear, clasificar, flujo completo (US-27 a US-30)
- Trabajos: crear, asignar, cerrar (US-42 a US-44)
- Materiales: CRUD + asignación básica (US-46 a US-49)
- Dashboard básico

### Release 1.5 - 🟡 Mejora Operativa
- Priorización automática quejas
- Historiales completos
- Búsqueda y filtrado avanzado
- Exportaciones
- Dashboard avanzado

### Release 2.0 - 🟡 Funcionalidades Avanzadas
- Concurrencia Go para stock
- Notificaciones email
- Auditoría completa
- Reabrir quejas
- Stock bajo / alertas
- Exportación SAP

### Futuro - ⚪ Innovación
- Predicción de fallos
- Asignación automática técnicos
- Chatbot soporte N1
- API pública
- Multi-tenancy

---

## 4. Métricas de Historias

| Epic | Historias | Priority 1 | Priority 2 | Priority 3 | Priority 4 | Total Story Points |
|------|-----------|------------|------------|------------|------------|-------------------|
| Auth + Users | US-01 a US-14 | 8 | 4 | 2 | 0 | 45 |
| Infraestructura MP | US-15 a US-26 | 7 | 4 | 1 | 0 | 35 |
| Quejas | US-27 a US-37 | 5 | 7 | 2 | 0 | 30 |
| Pruebas | US-38 a US-41 | 2 | 1 | 0 | 0 | 10 |
| Trabajos | US-42 a US-45 | 2 | 1 | 0 | 0 | 10 |
| Materiales | US-46 a US-58 | 5 | 4 | 3 | 0 | 35 |
| Analítica | US-59 a US-63 | 1 | 3 | 2 | 0 | 12 |
| **TOTAL** | **63 historias** | **30** | **22** | **10** | **0** | **177** |

---

## 5. Enlaces Relacionados

- [Casos de Uso](../03_use_cases.md)
- [Actores](../02_actors.md)
- [Event Storming](practice_03_event_storming.md)
- [Project Card](practice_01_project_card.md)
- [Roadmap](../17_roadmap.md)