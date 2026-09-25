
# 🤖 AGENT.md — Instrucciones para Agentes de IA en el Proyecto SISGAD5

> **Versión:** 1.0
> **Proyecto:** SISGAD5 — Sistema de Información para la Gestión y Soporte de la Dirección No. 5
> **Repositorio:** https://github.com/ybotet/SISGAD5_1.0
> **Autor del proyecto:** Ing. Botet S.Y. (Tesis de Maestría — RTU MIREA)
> **Objetivo de este archivo:** Guiar a agentes de IA en la auditoría, mejora y desarrollo de funcionalidades del sistema.

---

## 🎯 1. Contexto General del Proyecto

SISGAD5 es una **arquitectura de microservicios** para la gestión operativa de una empresa de telecomunicaciones cubana (ETECSA — Dirección No. 5). El sistema reemplaza un sistema heredado en Microsoft Access ("Mesa de Quejas") y está compuesto por:

| Componente            | Tecnología                                | Puerto | Responsabilidad                            |
| --------------------- | ----------------------------------------- | ------ | ------------------------------------------ |
| **Frontend**          | React 18 + Vite + TypeScript + Tailwind   | 5004   | Interfaz de usuario                        |
| **API Gateway**       | Node.js + Express + http-proxy-middleware | 5000   | Puerta de entrada única                    |
| **Users Service**     | Node.js + Express + Sequelize             | 5001   | Autenticación y usuarios                   |
| **MP Service**        | Node.js + Express + Sequelize + Zod       | 5002   | Operaciones (quejas, trabajos, pruebas)    |
| **Materials Service** | Go + gorilla/mux + GORM                   | 5003   | Gestión de materiales (ACID, concurrencia) |
| **PostgreSQL**        | PostgreSQL 17+                            | 5432   | Persistencia (3 BD separadas)              |
| **Redis**             | Redis                                     | 6379   | Caché / sesiones                           |

### Bases de Datos
- `bd_users` → Users Service
- `bd_mp` → MP Service
- `bd_materiales` → Materials Service

### Reglas Arquitectónicas Fundamentales
1. **El frontend NUNCA se comunica directamente con los microservicios.** Solo con el API Gateway.
2. **Cada microservicio es dueño exclusivo de su base de datos.** No hay acceso cruzado a BD.
3. **La comunicación entre servicios es vía REST (JSON).** No hay llamadas directas entre servicios.
4. **La autenticación se centraliza en el API Gateway** (verificación de JWT). El login lo gestiona Users Service.
5. **El MP Service NO gestiona materiales.** Solo referencia IDs de materiales; la lógica de materiales vive en Materials Service.

### Reglas de Oro
1. **Prohibido acceder directamente a la BD de otro microservicio.**
2. **Prohibido subir secretos o credenciales al código.** Usar siempre variables de entorno (`.env.local`, no versionar).
3. **Prohibido mezclar lógica de negocio entre microservicios.**
4. **Priorizar siempre transacciones ACID** en operaciones críticas (asignaciones, consumos, cierres).

---

## 📋 2. Objetivo del Agente de IA

El agente debe **auditar, mejorar y completar** las funcionalidades del sistema SISGAD5, siguiendo el **inventario funcional** definido en la sección 4 de este documento.

### Objetivos Específicos
1. **Auditar** el estado real de cada funcionalidad (✅ Implementada / ⚠️ Parcial / ❌ Pendiente / 🔄 A optimizar).
2. **Optimizar** el código existente (rendimiento, legibilidad, seguridad).
3. **Completar** funcionalidades faltantes o parciales.
4. **Documentar** cada cambio realizado.
5. **Mantener** la coherencia arquitectónica del sistema.

---

## 🚦 3. Metodología de Trabajo

### 3.1 Flujo de Trabajo por Módulo
Para cada módulo del sistema, el agente debe seguir este flujo:

```
1. LEER el código fuente del módulo
2. CONTRASTAR con el inventario funcional (sección 4)
3. IDENTIFICAR gaps (funcionalidades faltantes, parciales o mejorables)
4. PROPONER un plan de acción (antes de escribir código)
5. IMPLEMENTAR los cambios
6. PROBAR los cambios (tests unitarios + integración)
7. DOCUMENTAR los cambios (CHANGELOG + comentarios en código)
8. REPORTAR el estado final
```

### 3.2 Reglas de Implementación

#### ✅ Permitido
- Refactorizar código para mejorar legibilidad y rendimiento.
- Añadir validaciones de entrada (Zod, express-validator, etc.).
- Añadir tests unitarios e integración.
- Mejorar documentación (Swagger, JSDoc, comentarios).
- Optimizar consultas SQL (índices, evitar N+1).
- Añadir manejo de errores consistente.

#### ❌ Prohibido
- Cambiar la arquitectura de microservicios.
- Introducir dependencias innecesarias o pesadas.
- Modificar contratos de API existentes sin versionado.
- Acceder a la BD de otro microservicio directamente.
- Mezclar lógica de negocio entre microservicios.
- **Subir secretos o credenciales al código** (usar variables de entorno).
- Ignorar transacciones ACID en operaciones críticas.
- Ignorar las reglas arquitectónicas (sección 1).

### 3.3 Convenciones de Código
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- **Ramas:** `feature/nombre-descriptivo`, `fix/nombre-descriptivo`, `refactor/nombre-descriptivo`.
- **Nombres:** camelCase (JS/TS), snake_case (Go, BD).
- **Estructura:** Respetar la estructura de carpetas existente en cada microservicio.

---

## 📊 4. Inventario Funcional (Checklist Maestro)

> **Leyenda de estados:**
> - ✅ **Implementada:** Existe y funciona correctamente.
> - ⚠️ **Parcial:** Existe pero requiere mejoras o está incompleta.
> - ❌ **Pendiente:** No existe o es un stub.
> - 🔄 **A optimizar:** Funciona pero puede mejorar.

---

### 🔐 MÓDULO 1 — Users Service (Autenticación y Usuarios)
**Servicio:** `backend-users` (Node.js + Express + Sequelize)

| #    | Funcionalidad                   | Estado | Observaciones                         |
| ---- | ------------------------------- | ------ | ------------------------------------- |
| 1.1  | Registro de usuarios            | ✅     | Implementado                          |
| 1.2  | Login con JWT                   | ✅     | Implementado                          |
| 1.3  | Refresh tokens                  | ⚠️   | Mencionado, verificar implementación  |
| 1.4  | Logout (invalidación de tokens) | ❌     | Verificar                             |
| 1.5  | CRUD de usuarios (admin)        | ⚠️   | Verificar                             |
| 1.6  | Gestión de roles (RBAC)         | ⚠️   | Roles definidos, verificar asignación |
| 1.7  | Recuperación de contraseña      | ❌     | No mencionado                         |
| 1.8  | Cambio de contraseña            | ⚠️   | Verificar                             |
| 1.9  | Bloqueo por intentos fallidos   | ❌     | No mencionado                         |
| 1.10 | Historial de sesiones           | ❌     | No mencionado                         |
| 1.11 | Integración LDAP/AD (futuro)    | ❌     | Planificado                           |
| 1.12 | Endpoint `/health`              | ⚠️   | Verificar                             |

**Roles definidos:** `admin`, `probador`, `editor`, `visor`, `admin_materiales`

---

### 📞 MÓDULO 2 — MP Service (Operaciones Principales)
**Servicio:** `backend-mp` (Node.js + Express + Sequelize + Zod)

#### 2.1 Gestión de Teléfonos

| #         | Funcionalidad                        | Estado | Observaciones                                                  |
| --------- | ------------------------------------ | ------ | -------------------------------------------------------------- |
| 2.1.1     | CRUD de teléfonos                    | ✅     | Al crear el teléfono ya viene con la información del cliente.  |
| ~~2.1.2~~ | ~~Asignación de teléfono a abonado~~ | ❌     | **ELIMINADO.** No se asignan; el cliente viene en el teléfono. |
| 2.1.3     | Cambio de estado                     | ⚠️   | **Estados:** `activo` / `baja`                                 |
| 2.1.4     | Historial completo del teléfono      | ⚠️   | Historial de todos los datos: quejas, recorridos, movimientos  |
| 2.1.5     | Búsqueda y filtrado                  | ⚠️   | Verificar                                                      |

#### 2.2 Gestión de Líneas

| #         | Funcionalidad                  | Estado | Observaciones                                                 |
| --------- | ------------------------------ | ------ | ------------------------------------------------------------- |
| 2.2.1     | CRUD de líneas                 | ✅     | Implementado                                                  |
| ~~2.2.2~~ | ~~Trazado de ruta (routing)~~  | ❌     | **ELIMINADO**                                                 |
| 2.2.3     | Estado operativo               | ⚠️   | **Estados:** `activo` / `baja`                                |
| 2.2.4     | Historial completo de la línea | ⚠️   | Historial de todos los datos: quejas, recorridos, movimientos |
| 2.2.5     | Búsqueda y filtrado            | ⚠️   | **AGREGADO.** Verificar implementación                        |

#### 2.3 Gestión de Pizarras

| #     | Funcionalidad                    | Estado | Observaciones                              |
| ----- | -------------------------------- | ------ | ------------------------------------------ |
| 2.3.1 | CRUD de pizarras                 | ✅     | Implementado                               |
| 2.3.2 | Mapeo de puertos                 | ⚠️   | Verificar                                  |
| 2.3.3 | Conexiones entrantes/salientes   | ⚠️   | Verificar                                  |
| 2.3.4 | Ubicación física                 | ⚠️   | Verificar                                  |
| 2.3.5 | Búsqueda y filtrado              | ⚠️   | **AGREGADO.** Verificar implementación     |
| 2.3.6 | Historial completo de la pizarra | ⚠️   | **AGREGADO.** Historial de todos los datos |

#### 2.4 Gestión de Quejas (Complaints)

| #      | Funcionalidad                                                                                | Estado | Observaciones         |
| ------ | -------------------------------------------------------------------------------------------- | ------ | --------------------- |
| 2.4.1  | Registro de queja                                                                            | ✅     | Implementado          |
| 2.4.2  | Clasificación (tipo/servicio/ubicación)                                                      | ⚠️   | Verificar             |
| 2.4.3  | Priorización                                                                                 | ⚠️   | Verificar             |
| 2.4.4  | Flujo de estados (`Abierta` → `Probada` → `Asignada` → `Pendiente` → `Resuelta` → `Cerrada`) | ✅     | Implementado          |
| 2.4.5  | Asignación de técnico                                                                        | ✅     | Implementado          |
| 2.4.6  | Historial de cambios                                                                         | ⚠️   | Mencionado, verificar |
| 2.4.7  | Auditoría de acciones                                                                        | ⚠️   | Mencionado, verificar |
| 2.4.8  | Búsqueda y filtrado                                                                          | ⚠️   | Verificar             |
| 2.4.9  | Paginación                                                                                   | ⚠️   | Verificar             |
| 2.4.10 | Notificaciones por email                                                                     | ❌     | Planificado           |

#### 2.5 Gestión de Pruebas (Tests)

| #         | Funcionalidad                     | Estado | Observaciones |
| --------- | --------------------------------- | ------ | ------------- |
| 2.5.1     | Registro de prueba                | ✅     | Implementado  |
| 2.5.2     | Resultados de prueba              | ⚠️   | Verificar     |
| ~~2.5.3~~ | ~~Evidencias (fotos/mediciones)~~ | ❌     | **ELIMINADO** |
| 2.5.4     | Vinculación con queja y trabajo   | ⚠️   | Verificar     |
| 2.5.5     | Historial de pruebas              | ⚠️   | Verificar     |

#### 2.6 Gestión de Trabajos (Works)

| #     | Funcionalidad                | Estado | Observaciones                                                                                                     |
| ----- | ---------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| 2.6.1 | Creación de orden de trabajo | ✅     | Implementado                                                                                                      |
| 2.6.2 | Asignación de técnico        | ✅     | Implementado                                                                                                      |
| 2.6.3 | Materiales requeridos        | ❌     | **OBSERVACIÓN:** Los materiales SOLO se registran en el módulo de materiales. En MP NO se trabaja con materiales. |
| 2.6.4 | Tiempo estimado vs real      | ⚠️   | Verificar                                                                                                         |
| 2.6.5 | Cierre de trabajo            | ✅     | Implementado                                                                                                      |
| 2.6.6 | Historial de trabajos        | ⚠️   | Verificar                                                                                                         |

#### 2.7 Estadísticas (MP)

| #     | Funcionalidad              | Estado | Observaciones |
| ----- | -------------------------- | ------ | ------------- |
| 2.7.1 | Endpoint de resumen        | ⚠️   | Verificar     |
| 2.7.2 | Métricas agregadas         | ⚠️   | Verificar     |
| 2.7.3 | Filtros por fecha/servicio | ⚠️   | Verificar     |

---

### 📦 MÓDULO 3 — Materials Service (Gestión de Materiales)
**Servicio:** `backend-materiales-go` (Go + gorilla/mux + GORM)

#### 3.1 Gestión de Materiales

| #     | Funcionalidad                                         | Estado | Observaciones          |
| ----- | ----------------------------------------------------- | ------ | ---------------------- |
| 3.1.1 | CRUD de materiales                                    | ✅     | RF-MAT-01 implementado |
| 3.1.2 | Validación de campos (nombre, código, precio, unidad) | ✅     | Implementado           |
| 3.1.3 | Paginación                                            | ✅     | RF-MAT-08 implementado |
| 3.1.4 | Búsqueda textual                                      | ✅     | RF-MAT-07 implementado |
| 3.1.5 | Filtros por categoría/unidad                          | ⚠️   | Verificar              |

#### 3.2 Gestión de Categorías y Unidades

| #     | Funcionalidad              | Estado | Observaciones          |
| ----- | -------------------------- | ------ | ---------------------- |
| 3.2.1 | CRUD de categorías         | ✅     | RF-MAT-02 implementado |
| 3.2.2 | CRUD de unidades de medida | ✅     | RF-MAT-02 implementado |
| 3.2.3 | Integridad referencial     | ✅     | Implementado           |

#### 3.3 Asignación de Materiales

| #     | Funcionalidad                              | Estado | Observaciones                      |
| ----- | ------------------------------------------ | ------ | ---------------------------------- |
| 3.3.1 | Crear asignación con múltiples ítems       | ✅     | RF-MAT-03 implementado             |
| 3.3.2 | Captura de precio en momento de asignación | ✅     | RF-MAT-06 implementado             |
| 3.3.3 | Transacción ACID                           | ✅     | RC-04 implementado                 |
| 3.3.4 | Validación de existencia de material       | ✅     | Implementado                       |
| 3.3.5 | Validación de stock (stub)                 | ⚠️   | `verificarStockAsignacion` es stub |
| 3.3.6 | Concurrencia (goroutines)                  | ⚠️   | Mencionado, verificar activación   |
| 3.3.7 | Historial de asignaciones                  | ⚠️   | Verificar                          |

#### 3.4 Registro de Consumos

| #     | Funcionalidad                                | Estado | Observaciones          |
| ----- | -------------------------------------------- | ------ | ---------------------- |
| 3.4.1 | Crear consumo con múltiples ítems            | ✅     | RF-MAT-04 implementado |
| 3.4.2 | Captura de precio real en momento de consumo | ✅     | RF-MAT-06 implementado |
| 3.4.3 | Transacción ACID                             | ✅     | RC-04 implementado     |
| 3.4.4 | Validación de cantidades                     | ✅     | Implementado           |
| 3.4.5 | Validación contra asignación                 | ⚠️   | Parcial, verificar     |
| 3.4.6 | Concurrencia (goroutines)                    | ⚠️   | Mencionado, verificar  |
| 3.4.7 | Historial de consumos                        | ⚠️   | Verificar              |

#### 3.5 Analítica y Dashboards (Materials)

| #     | Funcionalidad                          | Estado | Observaciones                       |
| ----- | -------------------------------------- | ------ | ----------------------------------- |
| 3.5.1 | Endpoint de resumen general            | ✅     | RF-MAT-11 implementado              |
| 3.5.2 | Distribución por categorías            | ✅     | Implementado                        |
| 3.5.3 | Distribución por unidades              | ✅     | Implementado                        |
| 3.5.4 | Cálculo de saldo lógico por trabajador | ⚠️   | Fórmula: Σ(asignado) - Σ(consumido) |
| 3.5.5 | Alertas de stock bajo                  | ❌     | Planificado                         |
| 3.5.6 | Exportación CSV/JSON                   | ❌     | Planificado                         |
| 3.5.7 | Tendencias y predicciones              | ❌     | Planificado (tesis)                 |

#### 3.6 Integración (Materials)

| #     | Funcionalidad                          | Estado | Observaciones          |
| ----- | -------------------------------------- | ------ | ---------------------- |
| 3.6.1 | Endpoints REST bajo `/api/materials/*` | ✅     | RF-MAT-09 implementado |
| 3.6.2 | Compatibilidad con API Gateway         | ✅     | Implementado           |
| 3.6.3 | Health check `/health`                 | ✅     | Implementado           |
| 3.6.4 | Documentación Swagger                  | ✅     | RF-MAT-10 implementado |
| 3.6.5 | Exportación a SAP                      | ❌     | Planificado            |

---

### 🖥️ MÓDULO 4 — Frontend (Interfaz de Usuario)
**Servicio:** `frontend` (React 18 + Vite + TypeScript + Tailwind)

| #    | Funcionalidad                | Estado | Observaciones        |
| ---- | ---------------------------- | ------ | -------------------- |
| 4.1  | Login                        | ⚠️   | Verificar            |
| 4.2  | Dashboard principal          | ⚠️   | Verificar            |
| 4.3  | Módulo de teléfonos          | ⚠️   | Verificar            |
| 4.4  | Módulo de líneas             | ⚠️   | Verificar            |
| 4.5  | Módulo de pizarras           | ⚠️   | Verificar            |
| 4.6  | Módulo de quejas             | ✅     | Implementado         |
| 4.7  | Módulo de pruebas            | ⚠️   | Verificar            |
| 4.8  | Módulo de trabajos           | ⚠️   | Verificar            |
| 4.9  | Módulo de materiales         | ⚠️   | Verificar            |
| 4.10 | Módulo de estadísticas       | ⚠️   | Verificar            |
| 4.11 | Gestión de usuarios          | ⚠️   | Verificar            |
| 4.12 | Perfil de usuario            | ❌     | Verificar            |
| 4.13 | Internacionalización (ES/RU) | ⚠️   | Mencionado           |
| 4.14 | Responsive design            | ⚠️   | Tailwind configurado |
| 4.15 | Manejo de errores            | ⚠️   | Verificar            |
| 4.16 | Loading states               | ⚠️   | Verificar            |
| 4.17 | Notificaciones toast         | ⚠️   | Verificar            |

---

### 🌐 MÓDULO 5 — API Gateway
**Servicio:** `api-gateway` (Node.js + Express + http-proxy-middleware)

| #    | Funcionalidad                    | Estado | Observaciones |
| ---- | -------------------------------- | ------ | ------------- |
| 5.1  | Enrutamiento a Users Service     | ✅     | Implementado  |
| 5.2  | Enrutamiento a MP Service        | ✅     | Implementado  |
| 5.3  | Enrutamiento a Materials Service | ✅     | Implementado  |
| 5.4  | Verificación de JWT              | ⚠️   | Verificar     |
| 5.5  | Rate limiting                    | ⚠️   | Mencionado    |
| 5.6  | CORS                             | ⚠️   | Mencionado    |
| 5.7  | Logging centralizado             | ⚠️   | Mencionado    |
| 5.8  | Health checks agregados          | ⚠️   | Verificar     |
| 5.9  | Manejo de errores unificado      | ⚠️   | Verificar     |
| 5.10 | Documentación de rutas           | ❌     | No mencionado |

---

### 📊 MÓDULO 6 — Analítica y Reportes (Transversal)

| #   | Funcionalidad                          | Estado | Observaciones             |
| --- | -------------------------------------- | ------ | ------------------------- |
| 6.1 | Dashboard de KPIs                      | ⚠️   | Parcial en MP y Materials |
| 6.2 | Tiempo promedio de resolución          | ⚠️   | Verificar                 |
| 6.3 | Porcentaje de quejas cerradas          | ⚠️   | Verificar                 |
| 6.4 | Consumo de materiales por técnico      | ⚠️   | Verificar                 |
| 6.5 | Consumo de materiales por trabajo      | ⚠️   | Verificar                 |
| 6.6 | Exportación de reportes (CSV/JSON/PDF) | ❌     | Planificado               |
| 6.7 | Analítica predictiva                   | ❌     | Planificado (tesis)       |
| 6.8 | Alertas y notificaciones               | ❌     | Planificado               |

---

### 🧪 MÓDULO 7 — Testing y QA

| #   | Funcionalidad               | Estado | Observaciones                    |
| --- | --------------------------- | ------ | -------------------------------- |
| 7.1 | Tests unitarios (Users)     | ⚠️   | Verificar                        |
| 7.2 | Tests unitarios (MP)        | ⚠️   | Verificar                        |
| 7.3 | Tests unitarios (Materials) | ✅     | `testify` mencionado             |
| 7.4 | Tests de integración (API)  | ⚠️   | Insomnia/Postman                 |
| 7.5 | Tests E2E                   | ❌     | Planificado (Playwright/Cypress) |
| 7.6 | Cobertura de código         | ⚠️   | Verificar (objetivo 70%)         |
| 7.7 | Tests de carga (k6)         | ❌     | Planificado                      |
| 7.8 | Auditoría de seguridad      | ⚠️   | `npm audit`, Helmet              |
| 7.9 | CI con GitHub Actions       | ✅     | Implementado                     |

---

### 🚀 MÓDULO 8 — Despliegue y Mantenimiento

| #   | Funcionalidad                              | Estado | Observaciones         |
| --- | ------------------------------------------ | ------ | --------------------- |
| 8.1 | Docker Compose (dev)                       | ✅     | Implementado          |
| 8.2 | Docker Compose (prod)                      | ✅     | Implementado          |
| 8.3 | Script de deploy                           | ✅     | `deploy.sh`           |
| 8.4 | Backups automáticos de BD                  | ⚠️   | Mencionado            |
| 8.5 | Monitoreo (Prometheus/Grafana)             | ⚠️   | Carpeta `monitoring/` |
| 8.6 | Alertas (UptimeRobot, Sentry)              | ❌     | Planificado           |
| 8.7 | Rotación de secretos                       | ❌     | No mencionado         |
| 8.8 | Actualización de dependencias (Dependabot) | ⚠️   | Mencionado            |
| 8.9 | Documentación de operaciones               | ⚠️   | Parcial en informe    |

---

## 🎯 5. Prioridades de Trabajo

### 🔴 Alta Prioridad (Bloqueantes para "Puerto Seguro")
1. Completar tests en Users y MP Service (unitarios + integración).
2. Implementar validación de stock real en Materials Service (actualmente stub).
3. Activar concurrencia en Materials Service (goroutines) si no está activa.
4. Completar frontend de todos los módulos (verificar integración).
5. Consolidar documentación (CHANGELOG, CONTRIBUTING, API docs).
6. Mapear permisos RBAC por endpoint.

### 🟡 Media Prioridad (Mejoras)
1. Implementar notificaciones por email.
2. Añadir exportación CSV/JSON en todos los módulos.
3. Configurar CD en GitHub Actions.
4. Centralizar logs (ELK o similar).
5. Implementar tests E2E.
6. Añadir alertas de stock bajo.

### 🟢 Baja Prioridad (Futuro)
1. Analítica predictiva (tesis).
2. Integración LDAP/AD.
3. Integración SAP.
4. Migración a Kubernetes.
5. Colas de mensajes (RabbitMQ/Kafka).

---

## 📝 6. Formato de Reporte del Agente

Cada vez que el agente complete una tarea, debe reportar usando este formato:

## 📌 Reporte de Tarea

**Módulo:** [Nombre del módulo]
**Funcionalidad:** [ID y nombre]
**Estado anterior:** [✅ / ⚠️ / ❌ / 🔄]
**Estado nuevo:** [✅ / ⚠️ / ❌ / 🔄]

### Cambios Realizados
- [Descripción breve del cambio 1]
- [Descripción breve del cambio 2]

### Archivos Modificados
- `ruta/al/archivo1.js`
- `ruta/al/archivo2.go`

### Tests Ejecutados
- [ ] Test unitario: `nombre-del-test`
- [ ] Test de integración: `nombre-del-test`

### Evidencia
[Capturas, logs, o fragmentos de código relevantes]

### Próximos Pasos
- [Siguiente tarea recomendada]
```

---

## 🚫 7. Restricciones y Advertencias

1. **NUNCA** modificar la arquitectura sin consultar al autor.
2. **NUNCA** introducir dependencias que rompan la compatibilidad.
3. **NUNCA** acceder a BD de otro microservicio.
4. **NUNCA** subir secretos o credenciales al código (usar variables de entorno).
5. **SIEMPRE** respetar los contratos de API existentes.
6. **SIEMPRE** priorizar transacciones ACID en operaciones críticas.
7. **SIEMPRE** documentar los cambios en el CHANGELOG.
8. **SIEMPRE** ejecutar los tests antes de commitear.
9. **SIEMPRE** usar Conventional Commits.
10. **SIEMPRE** preguntar al autor si hay ambigüedad.

---

## 📞 8. Contacto y Escalación

Si el agente encuentra un bloqueo o ambigüedad:
1. Documentar el problema en el reporte.
2. Proponer 2-3 alternativas de solución.
3. Esperar confirmación del autor antes de proceder.

---

## 📚 9. Referencias

- **Repositorio:** https://github.com/ybotet/SISGAD5_1.0
- **Informe de curso (Materials Service):** `ТИП_2_КР_ЭФМО-01-25_Ботет С.Я._Отчет.pdf`
- **Checklist del Ciclo de Vida del Software:** (documento base proporcionado por el autor)
- **Documentación Go:** https://go.dev/doc/
- **Documentación GORM:** https://gorm.io/docs/
- **Documentación PostgreSQL:** https://www.postgresql.org/docs/17/
- **Documentación React:** https://react.dev/
- **Documentación Express:** https://expressjs.com/

