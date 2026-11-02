# Практика 03 — Event Storming

> **Дисциплина:** Инженерия домена / Domain-Driven Design
> **Методология:** Event Storm (Alberto Brandolini)
> **Основано на:** [SISGAD5_doc/docs/04 Словарь терминов.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. События домена (Domain Events)

События — это неизменяемые прошлые события в домене. Записываются в прошедшем времени.

### Контекст: Auth

| Событие | Описание | Инициатор |
|--------|-------------|---------|
| `UsuarioRegistrado` | Пользователь создан в системе | POST /api/auth/register |
| `UsuarioAutenticado` | Успешный вход | POST /api/auth/login |
| `SesionCreada` | Сессия (access+refresh) выдана | POST /api/auth/login |
| `SesionRenovada` | Выданы новые токены | POST /api/auth/refresh |
| `SesionRevocada` | Logout или отзыв по соображениям безопасности | POST /api/auth/logout |
| `UsuarioBloqueado` | Блокировка из-за неудачных попыток входа | 5 attempts login fallidos |
| `UsuarioDesbloqueado` | Разблокировка через время или администратора | Manual/Admin |
| `ContrasenaCambiada` | Пароль изменён | PUT /api/auth/me/password |
| `RolAsignado` | Роль связана с пользователем | PUT /api/users/:id/roles |
| `PermisoAsignadoARol` | Разрешение связано с ролью | PUT /api/roles/:id/permisos |

### Контекст: MP (Quejas, Pruebas, Trabajos)

| Событие | Описание | Инициатор |
|--------|-------------|---------|
| `TelefonoCreado` | Телефон зарегистрирован | POST /api/mp/telefonos |
| `TelefonoDesactivado` | Estado → в архиве | PATCH /api/mp/telefonos/:id/estado |
| `LineaCreada` | Линия зарегистрирована | POST /api/mp/lineas |
| `LineaDesactivada` | Estado → в архиве | PATCH /api/mp/lineas/:id/estado |
| `PizarraCreada` | Панель зарегистрирована | POST /api/mp/pizarras |
| `PuertoCreado` | Порт связан с панелью | POST /api/mp/pizarras/:id/puertos |
| `ConexionRegistrada` | Связь порт↔элемент | PUT /api/mp/pizarras/:id/puertos/:puertoId |
| `QuejaReportada` | Заявка создана | POST /api/mp/quejas |
| `QuejaClasificada` | Тип/сервис/локация/ключ установлены | POST /api/mp/quejas (on create) |
| `QuejaPriorizada` | Приоритет 1-4 рассчитан | On QuejaReportada |
| `QuejaProbada` | Тест зарегистрирован как успешный | POST /api/mp/pruebas |
| `QuejaAsignadaATecnico` | Техник назначен | PATCH /api/mp/quejas/:id/asignar |
| `QuejaCambioEstado` | Допустимый переход состояния | PATCH /api/mp/quejas/:id (state machine) |
| `PruebaRegistrada` | Результат теста сохранён | POST /api/mp/pruebas |
| `TrabajoCreado` | Ордер работы создан | POST /api/mp/trabajos |
| `TrabajoAsignadoATecnico` | Техник назначен | PATCH /api/mp/trabajos/:id/asignar |
| `TrabajoCerrado` | Estado → закрыта с реальным временем | PATCH /api/mp/trabajos/:id/cerrar |
| `QuejaCerrada` | Estado → Закрыта (финальное) | PATCH /api/mp/quejas/:id |
| `QuejaReabierta` | Estado → Открыта из Закрытой | PATCH /api/mp/quejas/:id |
| `MovimientoRegistrado` | Физическое перемещение элемента | POST /api/mp/movimientos |

### Контекст: Materials

| Событие | Описание | Инициатор |
|--------|-------------|---------|
| `MaterialCreado` | Материал добавлен в каталог | POST /api/materials/materiales |
| `CategoriaCreada` | Создана новая категория | POST /api/materials/categorias |
| `UnidadMedidaCreada` | Создана новая единица | POST /api/materials/unidades |
| `AsignacionCreada` | Материалы назначены технику | POST /api/materials/asignaciones |
| `AsignacionItemCreado` | Элемент добавлен в назначение | Parte de AsignacionCreada |
| `PrecioMomentoCapturado` | Стоимость известна при назначении | Parte de AsignacionCreada |
| `AsignacionEstadoActualizado` | Cambio Pendiente→Entregada, etc. | PATCH /api/materials/asignaciones/:id |
| `ConsumoCreado` | Материалы расходованы | POST /api/materials/consumos |
| `ConsumoItemCreado` | Элемент добавлен в расход | Parte de ConsumoCreado |
| `PrecioRealCapturado` | Реальная стоимость известна | Parte de ConsumoCreado |
| `StockVerificado` | Проверка запаса (конкурентная) | Parte de AsignacionCreada/ConsumoCreado |
| `StockBajoAlertado` | Логический баланс < минимум | Cálculo dashboard |
| `SaldoLogicoCalculado` | Σ(назначено) - Σ(расходовано) | Cálculo dashboard |

### Контекст: Prediction (MLOps)

| Событие | Описание | Инициатор |
|--------|-------------|---------|
| `PrediccionGenerada` | Прогноз сгенерирован и зарегистрирован | POST /api/predictions/* |
| `ModeloEntrenado` | Модель обучена и зарегистрирована в MLflow | Airflow DAG / POST /api/predictions/retrain |
| `ModeloDesplegado` | Версия модели повышена в продакшн | MLflow promote to production |
| `ModeloRetrainado` | Модель переобучена с новыми данными | Airflow scheduled DAG |
| `DriftDetectado` | Метрики деградированы выше порога | Monitoreo de modelos |
| `AlertaDriftEmitida` | Оповещение отправлено по drift | DriftDetectionJob |
| `FeatureEngineerizada` | Фичи обработаны и сохранены | Feature Engineering pipeline |
| `PredictionExportada` | Прогноз экспортирован в CSV/PDF | Frontend export action |

---

## 2. Команды (Commands)

Команды — это намерения пользователя, которые вызывают события. Проверяют бизнес-инварианты.

### Auth Commands

| Comанда | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `RegistrarUsuario` | Admin | Email válido, password política, email único | `UsuarioRegistrado` |
| `Autenticar` | Usuario | Credenciales válidas, no bloqueado | `UsuarioAutenticado`, `SesionCreada` |
| `RenovarToken` | Usuario | Refresh token válido, no revocado, no expirado | `SesionRenovada` |
| `RevocarSesion` | Usuario | Refresh token existe y pertenece al usuario | `SesionRevocada` |
| `CambiarContrasena` | Usuario | Password actual correcto, nuevo cumple política | `ContrasenaCambiada` |
| `AsignarRolesAUsuario` | Admin | Roles existen, usuario existe | `RolAsignado` (xN) |
| `AsignarPermisosARol` | Admin | Permisos existen, rol existe | `PermisoAsignadoARol` (xN) |

### MP Commands

| Comанда | Actor | Validaciones | Evento Resultante |
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
| `CerrarTrabajo` | Técnico | Trabajo asignado al técnico, время real > 0 | `TrabajoCerrado` |
| `RegistrarMovimiento` | Técnico | Elemento existe, tipo_movimiento válido | `MovimientoRegistrado` |

### Materials Commands

| Comанда | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `CrearMaterial` | Analista | Código único, precio > 0, categoria/unidad existen | `MaterialCreado` |
| `CrearCategoria` | Analista | Nombre único | `CategoriaCreada` |
| `CrearUnidadMedida` | Analista | Nombre/símbolo únicos | `UnidadMedidaCreada` |
| `CrearAsignacion` | Analista/Técnico | Materiales existen, trabajador válido, cantidades > 0 | `AsignacionCreada` (+ items, +precio momento) |
| `ActualizarEstadoAsignacion` | Analista | Asignación existe, estado válido | `AsignacionEstadoActualizado` |
| `CrearConsumo` | Técnico | Materiales existen, consumo ≤ asignación pendiente, cantidades > 0 | `ConsumoCreado` (+ items, +precio real) |
| `VerificarStock` | Sistema (automático) | Concurrente, goroutines | `StockVerificado` |
| `GenerarAlertaStockBajo` | Sistema (automático) | Stock < mínimo | `StockBajoAlertado` |

### Prediction Commands

| Comанда | Actor | Validaciones | Evento Resultante |
|---------|-------|--------------|-------------------|
| `GenerarPrediccion` | Analista/Director | Modelo desplegado, features válidas | `PrediccionGenerada` |
| `EntrenarModelo` | Admin/Data Scientist | Datos históricos disponibles, hiperparámetros válidos | `ModeloEntrenado` |
| `DesplegarModelo` | Admin | Modelo entrenado, tests pasados | `ModeloDesplegado` |
| `RetrainModelo` | System (Airflow) | Schedule activo, nuevos datos | `ModeloRetrainado` |
| `DetectDrift` | System | Métricas < umbral | `DriftDetectado`, `AlertaDriftEmitida` |
| `ExportarPrediccion` | Director | Predicción exists | `PredictionExportada` |

---

## 3. Агрегаты (Aggregates)

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

### Prediction Aggregate

```
Root: Modelo
├── Versiones[] (entidades - MLflow)
├── UmbralesDrift (value object)
└── EstadoDespliegue (value object)

Root: Prediccion
├── Features (value object)
├── Resultado (value object)
└── Confianza (value object)

Root: AlertaDrift
├── Metricas (value object)
└── Resolucion (value object)
```

---

## 4. Рegras de negocio identificadas (BR)

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
| BR-13 | Predicción solo sobre modelos en producción | Validación | Modelo |
| BR-14 | Drift > umbral → alerta + recomendación retraining | Regla | Modelo |
| BR-15 | Feature engineering debe validar schema de entrada | Validación | Prediccion |
| BR-16 | Confianza < 80% → flag de baja confianza | Regla | Prediccion |
| BR-17 | Retraining automático solo con datos ≥ 7 días | Regla | Modelo |

---

## 5. Comandas vs Eventos (Matriz de Trazabilidad)

| Comanda | Evento Resultante | Validaciones de Negocio | Agregado |
|---------|-------------------|------------------------|----------|
| ReportarQueja | QuejaReportada, QuejaClasificada, QuejaPriorizada | BR-03 (cálculo prioridad), RN-MP-14 (clasificación obligatoria) | Queja |
| CambiarEstadoQueja | QuejaCambioEstado | BR-04 (FSM), RN-MP-17 (flujo estados) | Queja |
| CrearAsignacion | AsignacionCreada | BR-09 (atómico), RN-MAT-05 (validación existencia) | Asignacion |
| CrearConsumo | ConsumoCreado | BR-08, BR-10, RN-MAT-13 (validar vs asignación) | Consumo |
| Autenticar | UsuarioAutenticado, SesionCreada | BR-01 (bloqueo), password verification | User/Sesion |
| RenovarToken | SesionRenovada | BR-02 (rotación), expiración | Sesion |
| GenerarPrediccion | PrediccionGenerada | BR-13 (modelo prod), BR-15 (schema) | Prediccion/Modelo |
| EntrenarModelo | ModeloEntrenado | Datos históricos, hiperparámetros | Modelo |
| DesplegarModelo | ModeloDesplegado | Tests pasados, staging | Modelo |
| RetrainModelo | ModeloRetrainado | BR-17 (7 días datos) | Modelo |
| DetectDrift | DriftDetectado, AlertaDriftEmitida | BR-14 (umbral) | Modelo |
| ExportarPrediccion | PredictionExportada | Predicción exists | Prediccion |

---

## 6. Диаграмма событий (Mermaid)

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

    section Prediction
        PrediccionGenerada
        ModeloEntrenado
        ModeloDesplegado
        ModeloRetrainado
        DriftDetectado
        AlertaDriftEmitida
```

---

## 7. Ссылки

- [Diccionario de Términos](../04_glossary.ru.md)
- [User Story Map](practice_02_user_story_map.ru.md)
- [Reglas de Negocio](../06_business_rules.ru.md)
- [Modelo de Dominio](../07_domain_model.ru.md)
- [Máquinas de Estado](../09_state_machines.ru.md)