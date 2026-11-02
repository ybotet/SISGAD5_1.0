# Glosario de Términos (Ubiquitous Language) - SISGAD5

> **Versión:** 1.1
> **Fecha:** 2026-10-28
> **Fuente:** [SISGAD5_doc/docs/04 Словарь терминов.md](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Términos del Dominio MP (Telecomunicaciones)

| Término            | Término (RU) | Definición | Contexto | Sinónimos |
| ------------------ | ------------ | ---------- | -------- | --------- |
| **Teléfono**       | Телефон | Equipo terminal de abonado conectado a la red. | MP Service | Terminal, Abonado |
| **Línea**          | Телефонная линия | Medio físico o canal virtual que conecta un terminal de usuario (teléfono) con la central telefónica, permitiendo la transmisión de señales de voz y datos. | MP Service | Circuito, Par |
| **Pizarra**        | Учрежденческая АТС (УАТС) / Мини-АТС | Equipamiento de conmutación/conexión (MDF/IDF). | MP Service | Marco de Distribución, MDF, IDF |
| **Puerto**         | Порт | Punto de conexión físico en una pizarra. | MP Service | Punta, Conector |
| **Queja**          | Заявка / Заявка абонента | Notificación formal realizada por el cliente (usualmente vía telefónica) sobre una avería en el servicio contratado. Punto de entrada del proceso de gestión de averías. | MP Service | Incidencia, Reporte, Ticket |
| **Prueba**         | Станционная проверка | Verificación técnica de un elemento (teléfono/línea/pizarra). | MP Service | Test, Medición |
| **Trabajo**        | Выездные работы | Orden de ejecución de tareas en campo (instalación, reparación, mantenimiento). | MP Service | Orden de Trabajo, OT |
| **Clave**          | Ключ | Código de clasificación de queja (tipo/servicio/ubicación). | MP Service | Código, Clasificador |
| **Clasificación**  | Классификация | Categorización de queja por tipo, servicio, ubicación. | MP Service | Tipificación |
| **Prioridad**      | Приоритет | Nivel de urgencia (1=Crítica, 2=Alta, 3=Media, 4=Baja). | MP Service | Urgencia, Nivel |
| **Estado Queja**   | Статус заявки | Abierta → Probada → Asignada → Pendiente → Resuelta → Cerrada. | MP Service | Flujo de Estados |
| **Trabajador**     | Техник | Personal de campo que ejecuta pruebas y trabajos. | MP Service | Operario, Especialista |
| **Movimiento**     | Перемещение | Cambio físico de elemento (instalación, traslado, baja). | MP Service | Traslado, Cambio |
| **Avería**         | Повреждение / Авария | Interrupción total o parcial de un servicio de telecomunicaciones, reportada por el cliente o detectada por el sistema. | MP Service | Rotura, Afectación |
| **Mesa de Quejas** | Журнал учета заявок | Aplicación heredada en Microsoft Access utilizada por la DAG5 para la gestión operativa. | MP Service | Sistema de gestión |
| **Orden de Servicio** | Наряд-заказ / Заказ-наряд | Documento formal emitido por el departamento comercial que autoriza la realización de un trabajo (instalación, reparación, mantenimiento). | MP Service | Orden de Trabajo |
| **Recorrido**      | Трасса / Маршрут прокладки | Trayectoria física de la infraestructura de telecomunicaciones (cables, ductos) desde la planta hasta el punto final del cliente. | MP Service | Трасса |

---

## 2. Términos del Dominio Materiales

| Término            | Término (RU) | Definición | Contexto | Sinónimos |
| ------------------ | ------------ | ---------- | -------- | --------- |
| **Material**       | Материалы / Расходные материалы | Ítem del catálogo con código, nombre, precio, unidad. Herramientas, insumos y equipos (cables, terminales, conectores) utilizados para trabajos de reparación o instalación. | Materials Service | Artículo, Insumo, Bien |
| **Categoría**      | Категория | Agrupación lógica de materiales (ej. Cable, Conector, Herramienta). | Materials Service | Familia, Grupo |
| **Unidad de Medida** | Единица измерения | Magnitud de cuantificación (m, und, kg, caja). | Materials Service | UoM, Unidad |
| **Asignación**     | Назначение исполнителя | Entrega de materiales a técnico/trabajo (precio en momento). | Materials Service | Entrega, Dotación |
| **Consumo**        | Расход | Uso real de materiales en trabajo (precio real, ≤ asignado). | Materials Service | Gasto, Utilización |
| **Stock Lógico**   | Логический склад | Σ(Asignado) − Σ(Consumido) por trabajador/material. | Materials Service | Saldo, Disponible |
| **Precio Momento** | Цена в момент | Costo unitario capturado al crear asignación. | Materials Service | Precio Congelado |
| **Precio Real**    | Цена реальная | Costo unitario capturado al registrar consumo. | Materials Service | Precio Ejecución |

---

## 3. Términos del Dominio Usuarios y Seguridad

| Término        | Término (RU) | Definición | Contexto | Sinónimos |
| -------------- | ------------ | ---------- | -------- | --------- |
| **Usuario**    | Пользователь | Entidad que accede al sistema (email, password hash, roles). | Users Service | Cuenta, Account |
| **Rol**        | Роль | Conjunto de permisos. Roles canónicos: `admin`, `tecnico`, `operador`, `jefe`, `analista`, `director`, `auditor`. | Users Service | Perfil, Profile |
| **Permiso**    | Разрешение | Acción autorizada sobre recurso (crear, leer, actualizar, eliminar). | Users Service | Privilegio, Privilege |
| **Access Token** | Токен доступа | JWT de corta duración (15 min) para autorización de requests. | Auth | Access Token |
| **Refresh Token** | Токен обновления | Token de larga duración (7 días) para renovar access token. | Auth | Refresh Token |
| **Sesión**     | Сессия | Par access+refresh token activo, con metadata (IP, user-agent). | Auth | Session |
| **RBAC**       | Управление ролями | Control de acceso basado en roles (Role-Based Access Control). | Auth | Control por Roles |

---

## 4. Términos del Dominio Prediction Service (MLOps)

| Término                | Término (RU) | Definición | Contexto | Sinónimos |
| ---------------------- | ------------ | ---------- | -------- | --------- |
| **Predicción**         | Прогноз | Estimación basada en modelo ML para un caso de uso específico. | Prediction Service | Estimación, Forecast |
| **Feature**            | Признак | Variable de entrada procesada para el modelo predictivo. | Prediction Service | Característica, Input Feature |
| **Feature Engineering** | Инжиниринг признаков | Proceso de transformación de datos en features. | Prediction Service | Ingeniería de Características |
| **Modelo**             | Модель | Algoritmo entrenado (scikit-learn, XGBoost, Prophet). | Prediction Service | Modelo ML |
| **Entrenamiento**      | Обучение | Proceso de ajuste de parámetros del modelo con datos históricos. | Prediction Service | Training |
| **Reentrenamiento**    | Переобучение | Actualización periódica del modelo con nuevos datos. | Prediction Service | Retraining |
| **Model Registry**     | Реестр моделей | Repositorio versionado de modelos entrenados (MLflow). | MLOps | Registro de Modelos |
| **Pipeline**           | Конвейер | Secuencia de transformaciones y entrenamiento (Airflow DAG). | MLOps | Flujo de Entrenamiento |
| **Drift**              | Дрифт | Degradación del rendimiento del modelo over time. | MLOps | Desviación, Concept Drift |
| **Inference**          | Инференс | Aplicación del modelo a datos nuevos para generar predicciones. | Prediction Service | Inferencia |
| **Metric**             | Метрика | Métrica de evaluación (MAE, RMSE, Accuracy, Precision, Recall). | Prediction Service | Метрика |
| **bd_predictions**     | bd_predictions | Base de datos exclusiva de predicciones, metadatos y métricas. | Prediction Service | Prediction DB |

---

## 5. Términos Técnicos y Arquitecturales

| Término                | Término (RU) | Definición | Contexto |
| ---------------------- | ------------ | ---------- | -------- |
| **API Gateway**        | API шлюз | Punto de entrada único, enrutamiento, auth, rate limiting. | Arquitectura |
| **Microservicio**      | Микросервис | Servicio independientemente desplegable (Users, MP, Materials, Prediction). | Arquitectura |
| **BD por Servicio**    | БД на сервис | Cada microservicio tiene su propia PostgreSQL (bd_users, bd_mp, bd_materiales, bd_predictions). | Datos |
| **Transacción ACID**   | Транзакция ACID | Atomicidad, Consistencia, Aislamiento, Durabilidad (Go: db.Transaction). | Datos |
| **Concurrencia Go**    | Конкуренция Go | Goroutines + WaitGroup + Channels para validaciones paralelas. | Materials Service |
| **OpenAPI 3.0**        | OpenAPI 3.0 | Especificación de contratos REST (YAML). | Contratos |
| **Swagger UI**         | Swagger UI | Documentación interactiva generada desde OpenAPI. | Contratos |
| **Distributed Lock**   | Распределённая блокировка | Bloqueo distribuido (Redis SETNX + TTL) para concurrencia. | Materials Service |
| **FSM**                | Конечный автомат | Máquina de estados finitos (quejas: Abierta→Probada→Asignada→...). | MP Service |
| **Spec Validation**    | Валидация spec | Validación con Zod (Node.js) / Pydantic (Python). | Entradas API |
| **Structured Logging** | Структурированное логирование | Registros detallados de todas las acciones del sistema, incluyendo quién, cuándo y qué (Pino/Zap/Winston). | Auditoría |
| **Read-only Service**  | Только чтение | Servicio que consume APIs de otros servicios sin escribir en sus BDs. | Prediction Service |
| **DSS**                | СППР | Sistema de apoyo a la toma de decisiones: análisis de datos históricos, visualización (gráficos, tableros) y generación de informes. | Arquitectura |
| **Dashboard**          | Дашборд | Interfaz visual con gráficos e indicadores en tiempo real para monitorear KPIs. | Frontend |
| **Notificación**       | Уведомление | Mensaje automático (email, SMS, notificación en sistema) enviado cuando ocurre un evento crítico. | Sistema |

---

## 6. Términos de KPIs y Métricas

| Término                          | Término (RU) | Definición | Contexto |
| -------------------------------- | ------------ | ---------- | -------- |
| **Servicio reparado en 24/72h**  | Услуга восстановлена за 24/72 часа | KPI que mide el porcentaje de averías resueltas dentro de las 24 o 72 horas siguientes al reporte. | KPI |
| **Interrupción pendiente**       | Неустраненное повреждение | Avería reportada pero no solucionada. Se mide como promedio de pendientes al final del día. | KPI |
| **Interrupción resuelta**        | Устраненное повреждение | Avería solucionada mediante prueba en central o trabajo de reparación en terreno. | KPI |
| **Avería repetida**              | Повторное повреждение | Avería que reocurre en el mismo servicio en un período corto (ej. mismo mes). Puede indicar reparación incompleta. | KPI |
| **MTTR** (Tiempo medio de reparación) | Среднее время восстановления (MTTR) | Tiempo promedio desde el reporte de una avería hasta su solución. | KPI |
| **MTBF** (Tiempo medio entre fallos) | Средняя наработка на отказ (MTBF) | Tiempo promedio que un servicio opera sin interrupciones entre dos averías consecutivas. | KPI |
| **Ciclo de vida de la avería**   | Жизненный цикл повреждения | Etapas: reportado → en diagnóstico → en reparación → resuelto → cerrado. | Proceso |

---

## 7. Términos de Infraestructura Telecomunicaciones

| Término                        | Término (RU) | Definición | Contexto |
| ------------------------------ | ------------ | ---------- | -------- |
| **Telefonía fija**             | Стационарная телефонная связь | Servicio de telecomunicaciones que proporciona comunicación de voz a través de una línea física (cable de cobre, fibra óptica) conectada a una central de conmutación. | Infraestructura |
| **Planta telefónica / Planta** | АТС / Станция | Central telefónica (nodo de conmutación) desde donde parten los servicios hacia los clientes. Punto de origen de la infraestructura. En Cuba, se usa coloquialmente para referirse a la estación de conmutación. | Infraestructura |
| **Transmisión de Datos (Tx)**  | Передача данных (ПД) | Servicio que permite el intercambio de información digital entre dos o más puntos a través de un medio de transmisión (cable, fibra, radio). | Infraestructura |
| **FAR**                        | РВС | Fuerzas Armadas Revolucionarias. En el contexto del documento, es el principal cliente de la DAG5. Información sensible. | Cliente |
| **SIPREC**                     | Система предоставления услуг | Sistema empresarial interno de ETECSA para gestión operativa y comercial. No usado por DAG5 por sensibilidad de datos. | Sistema interno |
| **Escalamiento**               | Эскалация | Proceso de elevar una avería a un nivel superior de soporte cuando no puede resolverse en el primer nivel. | Proceso |

---

## 8. Abreviaturas

| Abreviatura | Significado                                          | Término (RU) |
| ----------- | ---------------------------------------------------- | ------------ |
| MP          | Mantenimiento de Plantas (Telecom Maintenance)     | МП |
| MDF         | Main Distribution Frame (Pizarra Principal)          | Главный распределительный кадр |
| IDF         | Intermediate Distribution Frame (Pizarra Intermedia) | Промежуточный распределительный кадр |
| OT          | Orden de Trabajo                                     | Рабочий заказ |
| KPI         | Key Performance Indicator                            | Показатель эффективности |
| RBAC        | Role-Based Access Control                            | Управление ролями |
| JWT         | JSON Web Token                                       | JSON Web Token |
| ER          | Entity-Relationship (Entidad-Relación)               | Entity-Relationship |
| UML         | Unified Modeling Language                            | UML |
| BPMN        | Business Process Model and Notation                  | BPMN |
| E2E         | End-to-End (Pruebas)                                 | End-to-End |
| RPS         | Requests Per Second                                  | RPS |
| ML          | Machine Learning                                     | Машинное обучение |
| MLOps       | Machine Learning Operations                          | MLOps |
| MAE         | Mean Absolute Error                                  | MAE |
| RMSE        | Root Mean Square Error                               | RMSE |
| TDD         | Test-Driven Development                              | TDD |
| CI/CD       | Continuous Integration / Continuous Deployment       | CI/CD |
| DSS         | Sistema de apoyo a la toma de decisiones             | СППР |

---

## 9. Glosario DDD (Domain-Driven Design)

### Entidades (Entities)

| Entidad        | ID            | Contexto  | Descripción                            |
| -------------- | ------------- | --------- | -------------------------------------- |
| **Usuario**    | `id` (UUID)   | Users     | Cuenta con email, hash, roles          |
| **Queja**      | `id` (serial) | MP        | Incidencia con estado FSM y prioridad. |
| **Trabajo**    | `id` (serial) | MP        | Orden de campo con técnico asignado.   |
| **Material**   | `id` (serial) | Materials | Artículo con código, nombre, stock.    |
| **Asignación** | `id` (serial) | Materials | Entrega de materiales a trabajador.    |
| **Consumo**    | `id` (serial) | Materials | Uso real de materiales en trabajo.     |

### Objetos de Valor (Value Objects)

| Valor            | Contexto  | Descripción                         |
| ---------------- | --------- | ----------------------------------- |
| **Email**        | Users     | Validado con regex, único           |
| **Password**     | Users     | Hash con bcrypt, política de fuerza |
| **Prioridad**    | MP        | Score calculado (1-4)               |
| **Estado Queja** | MP        | Enum de FSM (Abierta, Probada, ...) |
| **Precio**       | Materials | Decimal con 4 enteros, 2 decimales  |
| **Cantidad**     | Materials | Entero positivo                     |

### Agregados (Aggregates)

| Agregado       | Entidad Raíz | Entidades/VOs                              | Contexto  |
| -------------- | ------------ | ------------------------------------------ | --------- |
| **Usuario**    | Usuario      | Email, Rol, Permiso                        | Users     |
| **Queja**      | Queja        | Clasificación, Prioridad, Estado, Técnico  | MP        |
| **Trabajo**    | Trabajo      | Queja (ref), Técnico, Tiempo               | MP        |
| **Material**   | Material     | Categoría, Unidad, Stock                   | Materials |
| **Asignación** | Asignación   | Material (ref), Cantidad, Precio Momento   | Materials |
| **Consumo**    | Consumo      | Material (ref), Cantidad, Precio Real      | Materials |

### Eventos de Dominio (Domain Events)

| Evento               | Agregado   | Descripción                                     |
| -------------------- | ---------- | ----------------------------------------------- |
| `UsuarioCreado`      | Usuario    | Nuevo usuario registrado                        |
| `QuejaReportada`     | Queja      | Queja creada con clasificación inicial          |
| `QuejaReasignada`    | Queja      | Cambio de técnico asignado                      |
| `QuejaCerrada`       | Queja      | Estado → Cerrada, dispara consumo de materiales |
| `TrabajoCreado`      | Trabajo    | OT vinculada a queja                            |
| `MaterialAsignado`   | Asignación | Material entregado a técnico                    |
| `StockDecrementado`  | Material   | Stock reducido por consumo                      |
| `PrediccionGenerada` | Prediction | Nueva predicción registrada en bd_predictions   |

---

## 10. Notas de traducción (Diccionario cruzado)

Términos del Diccionario original con equivalencias de traducción establecidas:

| Concepto del negocio | Término canónico (RU) |
| -------------------- | --------------------- |
| Creación de reportes | Создание заявки |
| Asignación de técnicos | Назначение исполнителя |
| Cierre de avería | Закрытие заявки |
| Historial de averías por servicio | История повреждений по услуге |

---

## 11. Referencias

- [Modelo de Dominio](07_domain_model.es.md)
- [Casos de Uso](03_use_cases.es.md)
- [Actores](02_actors.es.md)
- [Event Storming](practices/practice_03_event_storming.es.md)
- [Diccionario original en SISGAD5_doc](https://github.com/ybotet/SISGAD5_doc/blob/main/docs/04%20%D0%A1%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C%20%D1%82%D0%B5%D1%80%D0%BC%D0%B8%D0%BD%D0%BE%D0%B2.md)

---

## 12. Bibliografía

- [SISGAD5_doc] SISGAD5_doc. *Документация проекта SISGAD5*. Репозиторий: https://github.com/ybotet/SISGAD5_doc. — 2026.
- [ETECSA] ETECSA. *SIPREC — Sistema de Provisión y Reclamos de Clientes*. — 2025.
- [GOST705] ГОСТ 7.0.5-2008. *Библиографская ссылка*. Библиографическое описание. Общие требования и правила составления. — 2008.
