# 🎯 PROMPTS.md — Prompts para Tareas No Completadas (SISGAD5)

> **Proyecto:** SISGAD5_1.0 — https://github.com/ybotet/SISGAD5_1.0
> **Generado:** 2026-11-03 · Basado en TASKLIST.md v2.5 (**65 tareas no cerradas: 30 🔄 + 35 ⏳**)
> **Uso:** copiar el bloque de código del prompt y ejecutarlo en Kilo Code con el agente indicado.
> **Nota:** los prompts marcados 🔗 están agrupados porque comparten archivos/función (ejecutar en orden). Los marcados 👤 requieren acción humana (no hay prompt automatizable completo).
> **Alcance (2026-11-03):** TASK-420-02 (puertos) y TASK-420-03 (conexiones) quedaron fuera de alcance ❌ — la entidad Pizarra gestiona nombre, dirección y tipo; no se controlan puertos. Este documento muestra **solo tareas no completadas**; los prompts de tareas ya cerradas (TASK-710-11/1000-05, TASK-710-12, TASK-720-02, TASK-300-06/07, entre otras) fueron retirados.

---

## Bloque 1 — Frontend (Fase 7) — `frontend/`

### Prompt 1.1 — TASK-710-08 · Módulo de Trabajos 🔴🔄
Agente: frontend-dev. Contexto verificado: existen `TrabajadorPage.tsx`, `MovimientoPage.tsx`, `components/queja/QuejaDetalleModal.tsx` (que muestra trabajos vinculados), pero NO hay página CRUD de órdenes de trabajo ni ruta dedicada en `App.tsx`. El backend expone `/api/trabajo` (routes+controller MP).
```
Proyecto: SISGAD5. Tarea: TASK-710-08 — Módulo de Trabajos (frontend).
Objetivo: CRUD de órdenes de trabajo conectado a /api/trabajo del backend-mp, con asignación de técnicos.
Pasos:
1. Inspeccionar backend-mp/src/routes/trabajo.js y su controller para confirmar endpoints, campos y respuestas reales (no asumir).
2. Crear frontend/src/services/trabajoService.ts siguiendo el patrón de servicios existentes (axios instance de src/services/api.ts).
3. Crear pages/trabajo/TrabajosPage.tsx (listado con search/page/limit vía patrón parseListParams del backend) y formulario crear/editar reutilizando componentes de components/queja como referencia de estilo.
4. Panel de asignación de trabajadores (multi-select desde /api/trabajador) usando el modelo Trabajo_trabajadores.
5. Registrar ruta protegida en App.tsx con ProtectedRoute por permiso, y enlace en la navegación lateral.
6. Verificar: npm run lint && npm run build sin errores; probar flujo manualmente contra localhost:5004.
Criterio de aceptación: pantalla de Trabajos completa (lista+CRUD+asignación). Al terminar actualizar TASKLIST.md (🔄→✅) y docs/memory/.
```

### Prompt 1.2 — TASK-700-04 · Estado global 🔄
Agente: frontend-dev. Contexto: AuthContext + ErrorContext (Context API) funcionan; no hay store de datos de dominio. Decisión previa del proyecto: mantener Context API salvo dolor real.
```
Proyecto: SISGAD5. Tarea: TASK-700-04 — Manejo de estado global predecible.
Antes de codificar, decidir y documentar (ADR corto en docs/adr/): ¿Zustand o ampliar Context? Evaluar: solo se necesita cache de listas (paginación) + notificaciones.
Si la respuesta es Zustand (recomendado mínimo):
1. npm i zustand; crear src/store/useNotificationStore.ts (toasts, véase prompt 1.3) y src/store/useAuthStore.ts migrando AuthContext SIN romper consumidores (export hook-compatible wrapper).
2. Migrar gradualmente: primero notificaciones, luego auth. Prohibido big-bang.
3. Verificar tests/e2e de login siguen pasando (o auto-skip si no hay navegador).
Criterio: un único patrón de estado global documentado; cero regresiones visibles. Cerrar TASKLIST+memoria.
```

### Prompt 1.3 — TASK-720-04 + TASK-720-05 · Loading states + Toasts 🔗🔄⏳
Mismo agente, mismos archivos (components/ui/). Ejecutar juntos.
```
Proyecto: SISGAD5. Tareas: TASK-720-04 (loading uniformes) y TASK-720-05 (notificaciones toast).
Stack elegido: react-hot-toast (liviano) + skeletons propios.
1. npm i react-hot-toast; montar <Toaster/> en App.tsx.
2. Crear components/ui/Skeleton.tsx (TableSkeleton, CardSkeleton, FormSkeleton).
3. Crear helper src/utils/notify.ts: notifySuccess/notifyError(msg|ApiError) mapeando códigos de error del gateway a mensajes ES.
4. Sustituir TODOS los spinners/loads ad-hoc y alert()/ErrorDisplay por Skeleton+toast en llamadas CRUD (buscar: grep -rn "spinner\|cargando\|alert(" src/). Los errores de mutación deben disparar toast automáticamente en services/api.ts interceptor.
5. lint+build verde. Cerrar ambas tareas en TASKLIST.md.
```

---

## Bloque 2 — Backend Users (Fases 3, 6, 8) — `backend-users/`

### Prompt 2.1 — TASK-300-05 · Recuperación de contraseña ⏳ Alta
Depende de decidir canal de correo (pendiente humano). Diseñar para proveedor plugable. *Nota (2026-11-03): la validación de política de complejidad ya existe — TASK-300-06 (cambio de contraseña) fue cerrada; reutilizar `password.validation.js` en lugar de recrearla.*
```
Proyecto: SISGAD5. Tarea: TASK-300-05 — Recuperación de contraseña.
Diseño (seguir patrón de refresh tokens: hash en BD, expiración):
1. Nueva tabla via migración versionada (migrations/ + .sequelizerc YA configurado): tb_password_resets(id, id_usuario, token_hash unique, expires_at, used_at, created_at). Migración SIEMPRE reversible up/down.
2. POST /api/auth/recuperar { email }: genera token aleatorio 32 bytes, guarda hash SHA-256, expira 30min, responde SIEMPRE 200 (anti user-enumeration). Canal de entrega: interfaz MailerPort con implementación ConsoleMailer (dev) y SMTPMailer configurable por env (SMTP_HOST…); NO hardcodear credenciales.
3. POST /api/auth/reestablecer { token, password_nueva }: valida hash+vigencia+no-usado, aplica política TASK-300-06 (reutilizar validation), marca used_at, revoca refresh tokens.
4. Rate-limit en estas 2 rutas (expres-rate-limit, bucket por IP).
5. Tests: flujo feliz, token expirado, token reused, email inexistente (200).
6. users.yaml + TASKLIST.md actualizados. Pendiente humano: aprobar proveedor SMTP real y DSN.
```

### Prompt 2.2 — TASK-300-07 · Bloqueo por intentos fallidos ⏳ Media
```
Proyecto: SISGAD5. Tarea: TASK-300-07 — Bloqueo temporal de cuenta por intentos fallidos.
1. Columnas via migración en tb_user: failed_attempts int default 0, locked_until timestamptz null.
2. En login (auth.controller.js): si locked_until > now() → 423 { retry_after }; credenciales inválidas → increment; aciertos → reset. Umbral N=5, bloqueo 15min (configurable env LOGIN_MAX_ATTEMPTS/LOGIN_LOCK_MINUTES).
3. Evento de auditoría estructurado al bloquear (logger.warn con id_usuario, ip — nota: criterio original decía ip_usuario; confirmar nombre real de columna antes de escribir SQL).
4. El mensaje de error NO debe revelar si el email existe (401 genérico).
5. Tests Jest: 5 fallos→bloqueo, login durante bloqueo→423, éxito resetea, expiración libera.
```

### Prompt 2.3 — TASK-800-01 · Tests unitarios Users Service ⏳🔴
Contexto real: backend-users SÍ tiene algunos tests parciales (auth/sesión) creados en v2.4; la fila del TASKLIST está obsoleta. Faltan controllers de usuario, middlewares, RBAC.
```
Proyecto: SISGAD5. Tarea: TASK-800-01 — Suite Jest ≥70% cobertura en backend-users.
1. Configurar jest.config.js (collectCoverageFrom src/**, excluyendo node_modules/migrations) y script npm test real (revisar package.json; hay patrones ya usados en tests existentes — inspeccionar primero tests/ actuales y NO duplicar setups).
2. Mockear sequelize con jest-mock-sequelize o mocks manuales de modelos (patrón de los tests de sesión existentes).
3. Cubrir por prioridad: user.controller CRUD+RBAC, auth (login/refresh/logout/password — TASK-300-06 ya cerrada, el endpoint existe), middlewares auth/errores, validations Zod.
4. npm test -- --coverage ≥70% statements en src/features y src/shared. Integrar en ci.yml job test-users (ya existe workflow lint/test JS — verificar nombre del job).
5. Corregir la fila TASK-800-01 de TASKLIST.md (evidencia obsoleta) y marcar avance real.
```

---

## Bloque 3 — Backend MP (Fase 4) — `backend-mp/`

### Prompt 3.1 — TASK-410-02 · Baja de línea ⏳🔴 (esqueleto, completar en ejecución)
Contexto: el equivalente existe en teléfonos (`darbaja`). Patrón: ruta PATCH dedicada antes de `/:id` genérica.
```
Proyecto: SISGAD5. Tarea: TASK-410-02 — Cambio de estado (activo/baja) de línea.
1. Leer TelefonoController darBaja y replicar semántica en LineaController: PATCH /api/linea/:id/baja y /reactivar (o PATCH /estado según convención real del teléfono — verificar primero).
2. Validar relaciones: impedir baja de línea con pizarras asociadas activas si el modelo lo exige (confirmar FK reales en models/Linea.js). *Nota (2026-11-03): los puertos quedaron fuera de alcance; no validar relación línea↔puerto.*
3. Rutas ANTES de /:id en linea.js (lección TASK-B-19). Test supertest de ambos estados. Actualizar swagger mp si existe.
```

### Prompt 3.2 — TASK-400-03 + 410-03 + 420-06 · Endpoints de historial unificado 🔗🔴🔄
Comparten servicio de agregación; crear uno parametrizado.
```
Proyecto: SISGAD5. Tareas: TASK-400-03 (teléfono), TASK-410-03 (línea), TASK-420-06 (pizarra) — historiales completos.
1. Crear src/features/historial/HistorialService.js: firma getHistorial(tipoEntidad, id) que UNE (array merge ordenado por fecha desc): quejas (via FK telefono/linea/pizarra según exista), movimientos, recorridos/asignaciones aplicables. Usar SOLO modelos reales (inspeccionar models/ antes: Queja, Movimiento, Recorrido...).
2. Endpoints: GET /api/telefono/:id/historial, GET /api/linea/:id/historial, GET /api/pizarra/:id/historial (respuesta { entidad, eventos[] } paginable ?limit=).
3. Queries con include atajado (evitar N+1); explicar en comentario el índice necesario y crear migración de índice si la consulta es lenta en datos reales.
4. Tests: cada endpoint devuelve eventos ordenados; entidad inexistente → 404.
Ejecutar 420-06 cuando exista el agregado de quejas/movimientos por pizarra (TASK-420-02 quedó fuera de alcance — ya no se requiere como dependencia).
```

### Prompt 3.3 — TASK-420-04 · Pizarras: ubicación física ⏳
**Alcance actualizado (2026-11-03):** TASK-420-02 (puertos) y TASK-420-03 (conexiones) quedaron **fuera de alcance**. La entidad Pizarra gestiona nombre, dirección y tipo de pizarra; no se controlan puertos. Solo queda la Fase C (ubicación).
```
Proyecto: SISGAD5. Tarea: TASK-420-04 (ubicación pizarra).
Fase C — Ubicación:
1. Migración añade a Pizarra: planta_id (FK existente Planta), zona varchar, coordenadas jsonb null; expuestos en GET/PUT pizarra.
Tests; swagger/docs api mp actualizados al final.
```

### Prompt 3.4 — TASK-430-05 + TASK-450-02 + TASK-450-04 · Endpoints dedicados asignar/cerrar 🔗🔴🔄
Los tres son rutas de estado que hoy van por PUT genérico. Mismo controller pattern.
```
Proyecto: SISGAD5. Tareas: TASK-430-05 (PATCH /api/mp/quejas/:id/asignar), TASK-450-02 (PATCH /api/trabajos/:id/asignar), TASK-450-04 (PATCH /trabajos/:id/cerrar).
1. Queja: PATCH /:id/asignar { trabajador_id } → crea Asignacion, estado → 'Asignada', transición válida según máquina de estados actual (leer constants de estados primero); 409 si estado origen inválido.
2. Trabajo: PATCH /:id/asignar { trabajador_ids[] } sobre Trabajo_trabajadores (upsert múltiple en transacción).
3. Trabajo: PATCH /:id/cerrar → estado 'Cerrado' + fecha_cierre now(); requiere todos los movimientos/condición real de cierre (verificar regla existente en update genérico y replicarla, no inventar).
4. Mantener PUT genérico funcionando (retrocompatibilidad frontend); los nuevos endpoints los consumirá TASK-710-08.
5. Tests supertest de transiciones válidas/inválidas.
```

### Prompt 3.5 — TASK-430-06 + TASK-430-07 · Bitácora de transiciones + auditoría 🔗🔴
Misma tabla sirve a ambos criterios.
```
Proyecto: SISGAD5. Tareas: TASK-430-06 (historial de cambios de queja) y TASK-430-07 (auditoría de acciones).
1. Migración tb_auditoria(id, entidad, id_entidad, accion, desde_estado, hacia_estado, usuario_id, detalle jsonb, ip, created_at) — single audit trail para MP.
2. Helper logAuditoria() llamado desde Queja/Trabajo/Línea/Pizarra controllers en create/update/delete/asignar/cerrar (no en GETs).
3. GET /api/mp/quejas/:id/historial → filtra tb_auditoria entidad='Queja' (incluye quién/cuándo/desde-hacia) — satisface 430-06.
4. GET /api/mp/auditoria (permiso admin, filtros fecha/entidad/usuario, paginado) — satisface 430-07.
5. Tests: transición registra fila; historial ordenado; acceso sin permiso → 403.
```

### Prompt 3.6 — TASK-440-04 · Historial de pruebas con filtros ⏳
```
Proyecto: SISGAD5. Tarea: TASK-440-04 — Listado de pruebas filtrable.
1. Verificar ResultadoPrueba controller: añadir a GET list filters ?desde=&hasta=&resultado=&trabajador_id= combinables sobre parseListParams existente (Op.between fechas, Op.eq).
2. Índice migrado sobre (fecha_prueba, resultado) si faltare.
3. Test: combinación fecha+resultado devuelve subconjunto correcto. Documentar params en doc OpenAPI mp.
```

### Prompt 3.7 — TASK-450-03 · Tiempo estimado vs real ⏳
```
Proyecto: SISGAD5. Tarea: TASK-450-03 — Campos de tiempo en Trabajo.
1. Inspeccionar modelo Trabajo: si no existen, migración añade tiempo_estimado_horas numeric null, tiempo_real_horas numeric null (o derivar de fecha_inicio/fecha_cierre si ya existen — verificar ANTES de duplicar columnas).
2. En PATCH /cerrar (prompt 3.4) calcular tiempo_real = cierre−inicio si aplica.
3. Endpoint GET /api/trabajos/estadisticas-tiempo: media estimado vs real por mes (agregación SQL parametrizada). Test de cálculo.
```

### Prompt 3.8 — TASK-450-05 · Historial de trabajos con filtros ⏳
```
Proyecto: SISGAD5. Tarea: TASK-450-05 — GET /api/trabajos con ?estado=&trabajador_id=&desde=&hasta= aplicados en la consulta (include Trabajo_trabajadores donde aplique), paginado estándar. Reutilizar helper de filtros del prompt 3.6. Test de combinación.
```

### Prompt 3.9 — TASK-430-10 · Notificaciones email ⏳
Depende del MailerPort del prompt 2.1 (TASK-300-05) — reutilizarlo, no crear segundo mecanismo.
```
Proyecto: SISGAD5. Tarea: TASK-430-10 — Email al asignar/cambiar estado de queja.
1. Extraer MailerPort a shared/ (si 2.1 ya lo creó en backend-users, evaluar mover a lib común o duplicar puerto con impl propia en MP — decidir y anotar ADR corto).
2. Cola simple sin infra nueva: tabla tb_notificaciones(pendiente) + worker setInterval o setImmediate fire-and-forget con reintento x3; NUNCA bloquear la respuesta HTTP.
3. Disparadores: eventos de 3.4/3.5 (asignar, cerrar). Plantilla handlebars simple.
4. Config SMTP por env; en dev console mailer. Test: evento encola notificación; fallo SMTP no rompe request.
```

### Prompt 3.10 — TASK-800-02 · Tests unitarios MP Service ⏳🔴
Contexto corregido: backend-mp SÍ tiene tests (27/27 verdes desde fix ESLint/tests de 2026-11-01). La fila TASKLIST ("Sin archivos de test") está obsoleta. Falta cobertura ≥70%.
```
Proyecto: SISGAD5. Tarea: TASK-800-02 — Elevar cobertura MP a ≥70%.
1. Corregir evidencia en TASKLIST.md (tests existentes: suite actual 27 casos).
2. jest --coverage: identificar gaps (controllers de dominio: Queja/Trabajo/Línea/Pizarra, middlewares RBAC, servicios saga).
3. Añadir suites por módulo siguiendo patrón de setup existente (env vars de test ya resueltas — reutilizar jest setup que fija DB/SECRET dummy).
4. Meta: ≥70% statements; job test-mp en CI ya activo — confirmar que corre con coverage y publica resumen.
```

---

## Bloque 4 — Materials Go (Fase 5) — `backend-materiales-go/`

### Prompt 4.1 — TASK-520-05 + TASK-530-05 · Validación stock/consumo (stub roto) 🔗🔴
Misma función: `verificarStockAsignacion` en internal/services/consumo_service.go (~líneas 80, stub comentado, trabajadorID=0 hardcodeado). Cerrar ambas juntas.
```
Proyecto: SISGAD5. Tarea: TASK-520-05 y TASK-530-05 — Activar validación real de stock en consumo.
1. Leer consumo_service.go y asignacion_service.go: entender dónde se pierde el trabajadorID (hardcode 0) y cómo obtener el ID real del contexto/DTO.
2. Implementar verificarStockAsignacion(): suma consumo acumulado por (trabajo/asignación, material) ≤ cantidad asignada; devolver AppError descriptivo con excedente exacto ("material X: solicitado N, disponible M").
3. Descomentar/conectar la llamada en el flujo de registro de consumo dentro de la MISMA transacción GORM (rollback si excede).
4. Tests testify: caso límite (=), excedido (error + rollback verificado con mock DB/sqlmock), acumulado multi-consumo.
5. go vet ./... && go test ./... verde; actualizar ambas filas TASKLIST.
```

### Prompt 4.2 — TASK-500-05 · Filtros categoría/unidad 🔄
```
Proyecto: SISGAD5. Tarea: TASK-500-05 — Query params categoria/unidad en listado de materiales.
1. Localizar material handler/service (internal/handlers|services): confirmar nombres reales de FK (categoria_id/unidad_id) leyendo models.
2. Añadir filtros combinables entre sí y con búsqueda existente (GORM Where condicional, nunca string concat).
3. Test de handler/table-test con sqlmock o el harness que ya usa asignacion_service_test.go.
```

### Prompt 4.3 — TASK-520-07 + TASK-530-07 · Historiales con filtros 🔗⏳
```
Proyecto: SISGAD5. Tareas: TASK-520-07 (historial asignaciones) y TASK-530-07 (historial consumos).
1. GET /api/v1/asignaciones?trabajador_id=&desde=&hasta=&estado= y GET /api/v1/consumos?trabajador_id=&desde=&hasta=, paginación estándar del proyecto (ver helper de paginación existente en handlers de materiales).
2. Orden por fecha desc; incluir joins mínimos para nombre de material/trabajador (prevenir N+1 con Preload o select explícito).
3. Swagger (/docs swaggo) regenerado; table-tests de filtros.
```

### Prompt 4.4 — TASK-540-05 · Alertas stock bajo (datos hardcoded) 🔄
```
Proyecto: SISGAD5. Tarea: TASK-540-05 — Reemplazar AlertasGlobales fake (dashboard_handler.go ~126+) por ranking real.
1. Query: stocks por trabajador/material donde cantidad ≤ umbral (definir umbral por material si existe campo; si no, constant configurable). Ranking por criticidad asc.
2. Responder JSON estable { alerts: [{nivel, material, trabajador, disponible, umbral}] }.
3. Test con fixture sqlmock; verificar que el frontend materials dashboard consume el mismo shape (grep en frontend/src/pages/materiales).
```

### Prompt 4.5 — TASK-540-06 + TASK-1000-02 · Exportación CSV/JSON + reportes UI 🔗⏳
```
Proyecto: SISGAD5. Tareas: TASK-540-06 (Go ?format=csv) y TASK-1000-02 (exportación desde UI con filtros).
Backend Go:
1. Helper responding.WriteCSV(headers, rows) con BOM para Excel; aplicar en listados de materiales/asignaciones/consumos cuando ?format=csv (respetando TODOS los filtros activos).
Frontend:
2. Botón "Exportar" en las vistas de datos que ya tengan filtros aplicados: descarga vía fetch con blob usando los query params actuales (no exportar sin filtros implícitos).
3. Content-Disposition filename con fecha. Tests: snapshot CSV en Go; en UI basta lint+build.
```

### Prompt 4.6 — TASK-550-05 · Exportación SAP ⏳
```
Proyecto: SISGAD5. Tarea: TASK-550-05 — CSV layout SAP on-demand.
NECESITA INPUT HUMANO: especificación del layout SAP (columnas, separador, encoding). Mientras tanto:
1. Crear internal/export/sap.go con struct Layout configurable (header template file sap_layout.csv en configs/) y endpoint GET /api/v1/asignaciones/export/sap que usa ese layout sobre datos reales.
2. Dejar TODO marcado donde falte la spec; test con layout fixture propio.
```

### Prompt 4.7 — TASK-540-07 · Tendencias básicas ⏳
```
Proyecto: SISGAD5. Tarea: TASK-540-07 — Serie histórica + estadística básica.
1. GET /api/v1/dashboard/tendencias?meses=6: consumo mensual por categoría (GROUP BY date_trunc) + proyección naive (regresión lineal simple o promedio móvil 3) — sin ML, documentar limitación.
2. Consumir desde StatsPage/dashboard materiales con Recharts (patrón existente TASK-710-10).
3. Test de cálculo de proyección con serie conocida.
```

### Prompt 4.8 — TASK-800-03 · Cobertura Go ≥70% 👤🔄
Agente puede escribir tests; la meta numérica requiere medir.
```
Proyecto: SISGAD5. Tarea: TASK-800-03 — Subir cobertura de internal/services (hoy 4 tests, 2 suites).
1. go test ./... -coverprofile=coverage.out && go tool cover -func:coverage.out → informe de brechas por archivo.
2. Priorizar: consumo_service (tras fix 4.1), asignacion_service restante, stock/inventario service, dtos validation. Table-tests + sqlmock o el harness actual.
3. Meta ≥70% statements en internal/services; añadir step de coverage al job materials de ci.yml.
```

---

## Bloque 5 — Gateway & Seguridad (Fases 6, 8) — `api-gateway/`

### Prompt 5.1 — TASK-600-04 · Verificación JWT centralizada 🔄🔴
Decisione de diseño REQUIRED antes de codificar: verificar-en-borde + propagar identidad, manteniendo validación descentralizada como defense-in-depth (no romper backends).
```
Proyecto: SISGAD5. Tarea: TASK-600-04 — Gateway valida JWT y propaga identidad.
1. Nuevo middleware src/middlewares/auth.js: verifica Bearer con JWT_SECRET compartido (misma lib jwt, mismos claims), 401 uniforme { code:'UNAUTHORIZED' } para TODAS las rutas /api/* excepto whitelist pública (login, refresh, recuperar, reestablecer, health).
2. Al validar: reescribir header X-User-Id / X-User-Rol hacia el backend (strip de cualquier valor entrante spoofeable del cliente).
3. Backends: NO quitar su validación actual (defense in depth); documentar en ARCHITECTURE.md el modelo híbrido.
4. Tests supertest: sin token→401, token vencido→401, válido→llega X-User-Id al mock upstream.
5. Coherencia de 401 con frontend interceptor (verificar shape esperado en services/api.ts).
```

### Prompt 5.2 — TASK-800-04 · Tests unitarios API Gateway ⏳
```
Proyecto: SISGAD5. Tarea: TASK-800-04 — Suites Jest para middlewares del gateway.
1. jest.config.js + script test real (verificar package.json gateway; patrón de otros servicios JS ya resuelto en nov-2026).
2. Cubrir: rate-limit (falso timer), proxy routing (mock http-proxy-middleware target resolution), health, CORS lista blanca, y auth de 5.1 si ya mergeado.
3. Sin red externa: every upstream mocked. CI job test-gateway activo.
```

### Prompt 5.3 — TASK-800-05 · Tests de componentes Frontend ⏳ Media
```
Proyecto: SISGAD5. Tarea: TASK-800-05 — Vitest + Testing Library en frontend/.
1. npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom; añadir script "test" y vitest.config.ts (environment jsdom, setup file con jest-dom). Verificar compatibilidad con la versión de Vite/React instalada antes de fijar versiones.
2. Priorizar cobertura: ProtectedRoute (permitir/bloquear según permiso RBAC), flujo de login (form + interceptor de error), formularios CRUD clave (Queja, Pizarra — validación Zod espejo del backend) y utilidades de services/api.ts (mapeo de errores).
3. Mockear axios con mocks manuales o msw (no depender de backend corriendo).
4. Meta inicial: suites verdes en `npm run test` + integración al job test-js de ci.yml (o job nuevo test-frontend); ≥50% cobertura de src/components+services como primer hito (meta final ≥70% alineada con Fase 8).
5. Cerrar TASK-800-05 en TASKLIST.md con evidencia (nº de suites/cobertura).
```

### Prompt 5.4 — TASK-820-01 · Auditoría de seguridad y remediación 🔄
Hallazgo conocido: security.yml roto (falta .gitleaks.toml) + dependencias vulnerables.
```
Proyecto: SISGAD5. Tarea: TASK-820-01 — Dejar el pipeline de seguridad ACTIVO y con críticos resueltos.
1. Crear .gitleaks.toml raíz (rules por defecto + allowlist para fixtures de test con strings pseudo-secret).
2. Ejecutar localmente: npm audit en los 3 servicios JS y govulncheck en Go; actualizar dependencias con fixes mayores compatibles (changelog check); registrar breaking changes.
3. Trivy: confirmar imágenes scanneadas en security.yml; severity gate critical=fail.
4. Producir docs/security-report-2026-11.md (hallazgo→acción→estado). Workflow en verde en un push de prueba.
```

### Prompt 5.5 — TASK-820-02 + TASK-820-03 · Rendimiento y carga 🔗⏳
```
Proyecto: SISGAD5. Tarea: TASK-820-02 (benchmark ≥1000 RPS gateway documentado) y TASK-820-03 (k6 500 usuarios estables).
1. performance-tests/: vegeta o autocannon contra gateway docker-compose (modo standalone mock upstreams para medir overhead del gateway puro).
2. load-tests/scenario.js k6: escenario login→listar quejas→crear consumo; stages 0→500 VUs ramp 2m, plateau 5m; thresholds p95<800ms, error rate<1%.
3. Ejecutar contra compose local con datos seed; documentar métricas + captura en performance-tests/RESULTS-2026-11.md con hardware y versión de imagen.
4. Si no se alcanza 1000 RPS: perfilar (keep-alive, conexión pool http-proxy) y reportar cuello de botella real — el criterio admite hallazgo negativo documentado.
```

### Prompt 5.6 — TASK-810-01 · E2E ciclo completo 🔄
CI ya auto-skippea si no hay suites. Objetivo: primera suite real.
```
Proyecto: SISGAD5. Tarea: TASK-810-01 — Playwright E2E login→queja→trabajo→materiales.
1. playwright.config.ts: baseURL env, workers=1, webServer levantando compose de test (o mock server de gateway con MSW si Docker no disponible en runner — revisar runner de ci.yml y elegir viable).
2. Spec tests/e2e/ciclo-completo.spec.ts: login usuario seed → crear queja → asignar técnico → cerrar trabajo → consumir material → verificar dashboard. Data-testid en componentes tocados (añadir mínimamente).
3. Seed script e2e con usuario/estados conocidos. Quitar el auto-skip del job cuando exista ≥1 spec.
```

---

## Bloque 6 — Observabilidad & DevOps (Fases 2, 9)

### Prompt 6.1 — TASK-220-01 · Prometheus /metrics en todos los servicios 🔗🔄
Bloquea a 910-02 y 1200-03 (alertas). Es el punto crítico de esta área.
```
Proyecto: SISGAD5. Tarea: TASK-220-01 — Exponer /metrics en los 4 servicios.
1. Node (gateway, users, mp): prom-client — métrica http_requests_total{service,route,method,status} + histograma duración; endpoint GET /metrics SIN auth interna (bloquear en gateway/compose por red, no exponer público).
2. Go (materials): github.com/prometheus/client_golang con gin middleware + histogramas propios de negocio (consumos_registrados_total, asignaciones_total).
3. prometheus.yml: scrape jobs de los 4 (targets de red compose); verificar con docker compose up + curl targets UP.
4. Dashboard Grafana JSON commiteado en monitoring/grafana/dashboards/servicios.json (RPS, latencia p95, errores por servicio).
Cerrar aquí habilita el prompt 6.2.
```

### Prompt 6.2 — TASK-910-02 + TASK-1200-03 · Alertas operativas 🔗🔄
```
Proyecto: SISGAD5. Tareas: TASK-910-02 (monitoreo productivo con alertas) y TASK-1200-03 (alertas de caídas/recursos). Requiere 6.1 merged.
1. monitoring/prometheus/rules.yml: caída (up==0 2m), latencia p95>1s 5m, 5xx>5% 5m, CPU/mem container >85% 10m (via cAdvisor/node-exporter si presentes en compose monitoring).
2. Alertmanager config: route por severidad; webhook placeholder a canal elegido por humano (documentar TODO).
3. Cargar rules en prometheus.yml; test sintáctico promtool check rules; simular caída de contenedor y verificar alerta pending→firing (captura como evidencia).
```

### Prompt 6.3 — TASK-220-04 · Sentry ⏳
```
Proyecto: SISGAD5. Tarea: TASK-220-04 — SDK Sentry por servicio.
1. Humano: crear proyectos Sentry y volcar DSNs a GH Secrets (SENTRY_DSN_USERS/_MP/_MATERIALS/_GATEWAY/_FRONTEND) — bloqueante.
2. Node: @sentry/node init condicional (env presente), integrations express handler en cadena de errores AFTER logger; Go: getsentry/sentry-go con capture en middleware de error; Frontend: @sentry/react con environment release=git sha.
3. sampleRate 0.1 prod, tracesSampleRate conservador; NO enviar PII (beforeSend scrub de headers Authorization/email).
4. smoke test: endpoint /test-error detrás de flag dev, verificar evento en Sentry.
```

### Prompt 6.4 — TASK-210-04 · Branch protection 👤
```
Acción humana en GitHub Settings → Branches: rule para main: require PR, 1 review, checks obligatorios (lint-* , test-*), no force-push, no deletions. Opcional automatizar con gh CLI si restaurás acceso admin:
gh api repos/ybotet/SISGAD5_1.0/branches/main/protection -X PUT ... (requiere token con scope admin:repo).
Al aplicar, cerrar TASK-210-04 en TASKLIST.md con link al settings.
```

### Prompt 6.5 — TASK-210-02 + TASK-900-01 + TASK-900-02 · CD deploy automático 🔗🔴
```
Proyecto: SISGAD5. Tareas: TASK-210-02 (CD build+push+deploy operativo), TASK-900-01 (descomentar/terminar deploy) y TASK-900-02 (SSH automation).
Contexto TASK-210-02: cd.yml ya construye y publica imágenes a GHCR, pero el paso de despliegue remoto está comentado/placeholder — este prompt lo completa; cerrar las tres tareas en el mismo PR con evidencia run-link.
Precondición humana: secrets SSH_DEPLOY_HOST/USER/KEY (strict key) + GHCR pull creds en servidor.
1. cd.yml job deploy: despues de build&push, runner SSH (appleboy/ssh-action o ssh manual con known_hosts): docker login GHCR, compose -f docker-compose.prod.yml pull con tags SHA, docker compose up -d, healthcheck loop curl /health 60s, rollback automático a tag anterior si health falla (guardar CURRENT_TAG file en servidor).
2. Parametrizar deploy.sh para aceptar IMAGE_TAG=<sha> (reutilizar lógica, no duplicar).
3. Environment "production" con approval manual en GH env settings (humano 2 min).
4. Dry-run: workflow_dispatch con tag existente. Evidencia run-link en TASKLIST.
```

### Prompt 6.6 — TASK-900-03 · Rollback versionado ⏳
```
Proyecto: SISGAD5. Tarea: TASK-900-03 — Estrategia de rollback.
1. Basado en CURRENT_TAG del prompt 6.5: documentar en docs/14_deployment.md comando rollback.sh IMAGE_TAG=<sha-anterior> y procedimiento de verificación post-rollback (health + smoke login).
2. Política de retención GHCR (settings → paquetes: conservar últimos 20) — capturar screenshot/config en docs.
3. Test real en entorno staging/local compose: desplegar vN, rollback a vN-1, verificar.
```

### Prompt 6.7 — TASK-900-04 · Secrets management 👤⏳
```
Acción humana: auditar docker-compose.prod.yml — mover TODO valor real a .env en servidor (chmod 600, fuera del repo), rotar JWT_SECRET (≥256 bits) y contraseñas BD; verificar que ningún secreto histórico quedó legible en git log (si sí: rotación obligatoria + notas en docs/13_security.md). Marcar TASK-900-04 con checklist firmado.
```

### Prompt 6.8 — TASK-910-01 · Orquestación (ADR) ⏳
```
Proyecto: SISGAD5. Tarea: TASK-910-01 — Decisión K8s vs Compose.
Redactar docs/adr/ADR-00X-orquestacion.md evaluando: escala actual (tesis, mononodo), costo operativo, monitoreo existente. Recomendación esperada: permanecer en Compose + documento de umbral de migración (cuándo reconsiderar K8s). No crear carpeta k8s/ salvo decisión contraria. Cierre = ADR aprobado por tutor.
```

---

## Bloque 7 — Documentación & Proceso (Fases 1, 10, 11, 12)

### Prompt 7.1 — TASK-100-06 · Matriz de trazabilidad ⏳🔴
```
Proyecto: SISGAD5. Tarea: TASK-100-06 — Matriz Requisito→Caso de uso→Endpoint/Clase→Test.
1. Fuentes: requisitos de docs/01/02 (o donde estén numerados), endpoints de docs/api/*.yaml, tests existentes (jest/go test/playwright).
2. Generar docs/traceability_matrix.md tabla markdown con columna "huérfanos detectados" (requisitos sin test, tests sin requisito). Semi-automatizar con script scripts/gen-traceability.py (regex sobre yaml+tests) y revisar salida manualmente.
3. Criterio de "sin huérfanos" aplicado a requisitos v1; los futuros se marcan GAP.
Depende de que la revisión documental del humano (en curso, hasta 07_domain_model) haya fijado nombres definitivos.
```

### Prompt 7.2 — TASK-110-04 · ER consolidado 🔄 — ⚠️ EN PAUSA POR DECISIÓN HUMANA
```
Estado: el humano está revisando docs archivo por archivo (actualmente 07_domain_model.es.md). NO ejecutar hasta indicación. Cuando llegue a 11_data_model: reconciliar divergencia de nomenclatura acordada (opción B: tablas tb_* en código son fuente de verdad → actualizar diagramas erDiagram existentes en docs/11_data_model.md l.24/151/310 a nombres tb_* y claves reales verificadas contra migrations/models de los 3 servicios), luego cerrar 🔄→✅.
```

### Prompt 7.3 — TASK-1100-01 · Documento de diseño reconciliado 🔄
```
Proyecto: SISGAD5. Tarea: TASK-1100-01 — Reconciliar docs/00–17 + thesis con código real.
Solo DESPUÉS de completar la revisión humana archivo-por-archivo. Método: diff aserciones técnicas de docs vs código (endpoints, tablas, flujos) con checklist por documento; corregir docs (nunca código para "cuadrar" docs); registrar cada corrección en docs/memory/. Esta tarea es mayormente humana; el agente puede asistir generando el checklist de discrepancias por documento.
```

### Prompt 7.4 — TASK-1100-02 · Vigencia de manuales 🔄
```
Verificar docs/manuals/ (6 roles) contra UI actual: comandos/rutas/pantallas obsoletos → corregir; añadir sección troubleshooting del error visto en producción (migraciones no aplicadas → db:migrate, referencia a fix .sequelizerc nov-2026). Cierre con matriz doc→última-validación.
```

### Prompt 7.5 — TASK-1100-03 · Presentación de defensa 👤
```
Acción humana (Tutor): slides finales. Soporte IA posible bajo pedido explícito: generar outline desde docs/thesis + dashboards screenshots. No crear task de agente hasta definición de formato (Beamer/Slides/PowerPoint?).
```

### Prompt 7.6 — TASK-1200-01 · Proceso SLA 👤⏳
```
Acción humana: definir niveles SLA por severidad y flujo de triage; plantillas de issue ya existen (.github/ISSUE_TEMPLATE/). Entregable: docs/support_sla.md + labels GitHub. Agente puede borrador si el humano dicta niveles.
```

### Prompt 7.7 — TASK-1200-02 · Roadmap re-priorizado 👤🔄
```
Actualización de docs/17_roadmap.md con estado post-auditoría v2.4 (mover completadas, re-priorizar Fase 8 testing y 9 CD como críticas previas a defensa). Humano aprueba; agente propone diff.
```

### Prompt 7.8 — TASK-1200-05 · Cadencia de dependencias 🔄
```
Verificar Dependabot: frecuencia PRs, edad de PRs abiertos, regresiones. Proponer plan: mergear minors semanalmente tras CI verde; majors en rama dedicada. Reportar en docs/17_roadmap.md sección mantenimiento.
```

### Prompt 7.9 — TASK-1200-04 · Optimización rendimiento 👤⏳
```
Depende de baseline de 5.5 (820-02/03). Sin benchmark no hay "≥20%" medible. Bloqueada hasta tener RESULTS de rendimiento. No generar trabajo prematuro.
```

---

## Bloque 8 — Analytics transversal (Fase 10)

### Prompt 8.1 — TASK-1000-04 · Segmentación unificada 🔗🔄
```
Unificar criterios de filtro (desde/hasta/area/servicio) en endpoints dashboard de MP y Materials (nombres de param idénticos, formatos fecha ISO). Refactor de helpers de query por servicio + tabla de mapeo en docs/api/analytics_params.md. Tests de regresión por dashboard.
```

### Prompt 8.2 — TASK-1000-07 · Tendencias históricas 🔄
```
Extender dashboard/historic de quejas (existe parcial) a series mensuales por categoría/servicio; alinear con TASK-540-07 (Go) bajo mismo contrato de respuesta {series:[{label,values[]}]}. Consumir en StatsPage.
```

### Prompt 8.3 — TASK-1000-06 · API análisis transversal ⏳
```
Decisión previa (ADR corto): agregación en gateway (BFF) vs servicio nuevo. Recomendado: capa ligera en api-gateway /api/analytics/* que compone responses de MP+Materials con JWT validado (usa 5.1). Sin BD nueva. Cache TTL 60s en memoria. Tests de composición.
```

### Prompt 8.4 — TASK-1000-03 · Alertas métricas configurables ⏳
```
Depende de 6.2 (reglas Prometheus) para infra + umbral real de 4.4. Implementar: reglas declaradas en monitoring/prometheus/rules.yml (fuente única versionada) + UI de solo-lectura que las lista desde Alertmanager API. Configuración editable = out of scope tesis (documentar).
```

### Prompt 8.5 — TASK-1000-08 · Comparación de períodos ⏳
```
Endpoint de comparación (por servicio donde exista dashboard): ?periodo=actual&vs=anterior devuelve varianza % por KPI. Implementar primero en MP quejas (menor esfuerzo), reutilizar para materiales. Test con datos fixture de dos meses.
```

### Prompt 8.6 — TASK-1000-01 · Cierre dashboards 🔄
```
Quedan detalles tras 8.1/8.2: pasar checklist KPI comprometidos vs visibles; evidenciar con screenshots en docs/memory; cerrar ✅.
```

---

## 📌 Orden de ejecución recomendado (crítico → periférico)

| # | Prompt | Razón |
|---|--------|-------|
| 1 | 6.1 (Prometheus /metrics) | Desbloquea 6.2, 8.4, 1200-03 |
| 2 | 4.1 (stub stock Go) | Bug funcional real, riesgo de datos |
| 3 | 2.1 (recuperación contraseña) → 2.2 | Feature prometida en API docs |
| 4 | 5.4 (security pipeline) | Verde en CI previo a defensa |
| 5 | 3.4 + 3.5 (asignar/cerrar + auditoría) | Núcleo de negocio MP |
| 6 | 1.1 (UI Trabajos) | Consume endpoints de 3.4 |
| 7 | 2.3 + 3.10 + 5.2 + 5.3 + 4.8 (tests cobertura) | Fase 8 completa, requisito de tesis |
| 8 | 5.6 (E2E) | Depende de 3.4/1.1 |
| 9 | 6.5/6.6 (CD deploy+rollback) | Requiere secretos humanos |
| 10 | Resto | Mejoras continuas |

**Reglas transversales para TODOS los prompts:** (1) inspeccionar el código real antes de asumir nombres de tablas/columnas/endpoints — hubo varias filas de TASKLIST con evidencia obsoleta; (2) toda migración reversible; (3) cerrar cada tarea actualizando TASKLIST.md + docs/memory/ en el mismo commit; (4) lint+test+build en verde antes de push.
