# Glosario de Términos (Ubiquitous Language) - SISGAD5

> **Versión:** 1.0
> **Fecha:** 2026-09-25
> **Fuente:** [SISGAD5_doc/docs/04 Словарь терминов.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Términos del Dominio MP (Telecomunicaciones)

| Término | Definición | Contexto | Sinónimos |
|---------|------------|----------|-----------|
| **Teléfono** | Equipo terminal de abonado conectado a la red | MP Service | Terminal, Abonado |
| **Línea** | Circuito de comunicación entre central y abonado | MP Service | Circuito, Par |
| **Pizarra** | Equipamiento de conmutación/conexión (MDF/IDF) | MP Service | Marco de Distribución, MDF, IDF |
| **Puerto** | Punto de conexión físico en una pizarra | MP Service | Punta, Conector |
| **Queja** | Registro de incidencia reportada por cliente/operador | MP Service | Incidencia, Reporte, Ticket |
| **Prueba** | Verificación técnica de un elemento (teléfono/línea/pizarra) | MP Service | Test, Medición |
| **Trabajo** | Orden de ejecución de tareas en campo | MP Service | Orden de Trabajo, OT |
| **Clave** | Código de clasificación de queja (tipo/servicio/ubicación) | MP Service | Código, Clasificador |
| **Clasificación** | Categorización de queja por tipo, servicio, ubicación | MP Service | Tipificación |
| **Prioridad** | Nivel de urgencia (1=Crítica, 2=Alta, 3=Media, 4=Baja) | MP Service | Urgencia, Nivel |
| **Estado Queja** | Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada | MP Service | Flujo de Estados |
| **Técnico** | Personal de campo que ejecuta pruebas y trabajos | MP Service | Operario, Especialista |
| **Movimiento** | Cambio físico de elemento (instalación, traslado, baja) | MP Service | Traslado, Cambio |

---

## 2. Términos del Dominio Materiales

| Término | Definición | Contexto | Sinónimos |
|---------|------------|----------|-----------|
| **Material** | Ítem del catálogo con código, nombre, precio, unidad | Materials Service | Artículo, Insumo, Bien |
| **Categoría** | Agrupación lógica de materiales (ej. Cable, Conector, Herramienta) | Materials Service | Familia, Grupo |
| **Unidad de Medida** | Magnitud de cuantificación (m, und, kg, caja) | Materials Service | UoM, Unidad |
| **Asignación** | Entrega de materiales a técnico/trabajo (precio en momento) | Materials Service | Entrega, Dotación |
| **Consumo** | Uso real de materiales en trabajo (precio real, ≤ asignado) | Materials Service | Gasto, Utilización |
| **Stock Lógico** | Σ(Asignado) − Σ(Consumido) por trabajador/material | Materials Service | Saldo, Disponible |
| **Precio Momento** | Costo unitario capturado al crear asignación | Materials Service | Precio Congelado |
| **Precio Real** | Costo unitario capturado al registrar consumo | Materials Service | Precio Ejecución |
| **Trabajador** | Técnico receptor de asignaciones y registrador de consumos | Materials Service | Operario, Usuario Materiales |

---

## 3. Términos del Dominio Usuarios y Seguridad

| Término | Definición | Contexto | Sinónimos |
|---------|------------|----------|-----------|
| **Usuario** | Entidad que accede al sistema (email, password hash, roles) | Users Service | Cuenta, Account |
| **Rol** | Conjunto de permisos (Admin, Tecnico, Operador, Jefe, Analista, Director, Auditor) | Users Service | Perfil, Profile |
| **Permiso** | Acción autorizada sobre recurso (crear, leer, actualizar, eliminar) | Users Service | Privilegio, Privilege |
| **Access Token** | JWT de corta duración (15 min) para autorización requests | Auth | Token de Acceso |
| **Refresh Token** | Token de larga duración (7 días) para renovar access token | Auth | Token de Refresco |
| **Sesión** | Par access+refresh token activo, con metadata (IP, user-agent) | Auth | Session |
| **RBAC** | Control de acceso basado en roles (Role-Based Access Control) | Auth | Control por Roles |

---

## 4. Términos del Dominio Prediction Service (MLOps)

| Término | Definición | Contexto | Sinónimos |
|---------|------------|----------|-----------|
| **Predicción** | Estimación basada en modelo ML para un caso de uso específico | Prediction Service | Estimación, Forecast |
| **Feature** | Variable de entrada procesada para el modelo predictivo | Prediction Service | Característica, Input Feature |
| **Feature Engineering** | Proceso de transformación de datos en features | Prediction Service | Ingeniería de Características |
| **Modelo** | Algoritmo entrenado (scikit-learn, XGBoost, Prophet) | Prediction Service | Modelo ML |
| **Entrenamiento** | Proceso de ajuste de parámetros del modelo con datos históricos | Prediction Service | Training |
| **Reentrenamiento** | Actualización periódica del modelo con nuevos datos | Prediction Service | Retraining |
| **Model Registry** | Repositorio versionado de modelos entrenados (MLflow) | MLOps | Registro de Modelos |
| **Pipeline** | Secuencia de transformaciones y entrenamiento (Airflow DAG) | MLOps | Flujo de Entrenamiento |
| **Drift** | Degradación del rendimiento del modelo over time | MLOps | Desviación, Concept Drift |
| **Inference** | Aplicación del modelo a datos nuevos para generar predicciones | Prediction Service | Inferencia |
| **Metric** | Métrica de evaluación (MAE, RMSE, Accuracy, Precision, Recall) | Prediction Service | Métrica |
| **bd_predictions** | Base de datos exclusiva de predicciones, metadatos y métricas | Prediction Service | Prediction DB |

---

## 5. Términos Técnicos y Arquitecturales

| Término | Definición | Contexto |
|---------|------------|----------|
| **API Gateway** | Punto de entrada único, enrutamiento, auth, rate limiting | Arquitectura |
| **Microservicio** | Servicio independientemente desplegable (Users, MP, Materials, Prediction) | Arquitectura |
| **BD por Servicio** | Cada microservicio tiene su propia BD PostgreSQL (bd_users, bd_mp, bd_materiales, bd_predictions) | Datos |
| **Transacción ACID** | Atomicidad, Consistencia, Aislamiento, Durabilidad (Go: db.Transaction) | Datos |
| **Concurrencia Go** | Goroutines + WaitGroup + Channels para validaciones paralelas | Materials Service |
| **OpenAPI 3.0** | Especificación de contratos REST (YAML) | Contratos |
| **Swagger UI** | Documentación interactiva generada desde OpenAPI | Contratos |
| **Distributed Lock** | Bloqueo distribuido (Redis SETNX + TTL) para concurrencia | Materials Service |
| **FSM** | Máquina de Estados Finita (quejas: Abierta→Probada→Asignada→...) | MP Service |
| **Spec Validation** | Validación con Zod (Node.js) / Pydantic (Python) | Entradas API |
| **Structured Logging** | Logs en formato JSON con metadata (Pino/Zap/Winston) | Auditoría |
| **Read-only Service** | Servicio que consume APIs de otros servicios sin escribir en sus BDs | Prediction Service |

---

## 6. Abreviaturas

| Abreviatura | Significado |
|-------------|-------------|
| MP | Mantenimiento de Plantas (Mantenimiento de Telefonía) |
| MDF | Main Distribution Frame (Pizarra Principal) |
| IDF | Intermediate Distribution Frame (Pizarra Intermedia) |
| OT | Orden de Trabajo |
| KPI | Key Performance Indicator |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| ER | Entity-Relationship (Entidad-Relación) |
| UML | Unified Modeling Language |
| BPMN | Business Process Model and Notation |
| E2E | End-to-End (Pruebas) |
| RPS | Requests Per Second |
| ML | Machine Learning |
| MLOps | Machine Learning Operations |
| MAE | Mean Absolute Error |
| RMSE | Root Mean Square Error |
| TDD | Test-Driven Development |
| CI/CD | Continuous Integration / Continuous Deployment |

---

## 7. Glosario DDD (Domain-Driven Design)

### Entidades (Entities)
| Entidad | ID | Contexto | Descripción |
|---------|----|----------|-------------|
| **Usuario** | `id` (UUID) | Users | Cuenta con email, hash, roles |
| **Queja** | `id` (serial) | MP | Incidencia con estado FSM y prioridad |
| **Trabajo** | `id` (serial) | MP | Orden de campo con técnico asignado |
| **Material** | `id` (serial) | Materials | Artículo con código, nombre, stock |
| **Asignación** | `id` (serial) | Materials | Entrega de materiales a trabajador |
| **Consumo** | `id` (serial) | Materials | Uso real de materiales en trabajo |

### Objetos de Valor (Value Objects)
| Valor | Contexto | Descripción |
|-------|----------|-------------|
| **Email** | Users | Validado con regex, único |
| **Password** | Users | Hash con bcrypt, política de fuerza |
| **Prioridad** | MP | Score calculado (1-4) |
| **Estado Queja** | MP | Enum de FSM (Abierta, Probada, ...) |
| **Precio** | Materials | Decimal con 4 enteros, 2 decimales |
| **Cantidad** | Materials | Entero positivo |

### Agregados (Aggregates)
| Agregado | Entidad Raíz | Entidades/VOs | Contexto |
|----------|-------------|---------------|----------|
| **Usuario** | Usuario | Email, Rol, Permiso | Users |
| **Queja** | Queja | Clasificación, Prioridad, Estado, Técnico | MP |
| **Trabajo** | Trabajo | Queja (ref), Técnico, Tiempo | MP |
| **Material** | Material | Categoría, Unidad, Stock | Materials |
| **Asignación** | Asignación | Material (ref), Cantidad, Precio Momento | Materials |
| **Consumo** | Consumo | Material (ref), Cantidad, Precio Real | Materials |

### Eventos de Dominio (Domain Events)
| Evento | Agregado | Descripción |
|--------|----------|-------------|
| `UsuarioCreado` | Usuario | Nuevo usuario registrado |
| `QuejaReportada` | Queja | Queja creada con clasificación inicial |
| `QuejaReasignada` | Queja | Cambio de técnico asignado |
| `QuejaCerrada` | Queja | Estado → Cerrada, dispara consumo de materiales |
| `TrabajoCreado` | Trabajo | OT vinculada a queja |
| `MaterialAsignado` | Asignación | Material entregado a técnico |
| `StockDecrementado` | Material | Stock reducido por consumo |
| `PrediccionGenerada` | Prediction | Nueva predicción registrada en bd_predictions |

---

## 8. Referencias

- [Modelo de Dominio](07_domain_model.md)
- [Casos de Uso](03_use_cases.md)
- [Event Storming](../practices/practice_03_event_storming.md)
- [Diccionario original en SISGAD5_doc](https://github.com/ybotet/SISGAD5_doc/blob/main/docs/04%20%D0%A1%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C%20%D1%82%D0%B5%D1%80%D0%BC%D0%B8%D0%BD%D0%BE%D0%B2.md)