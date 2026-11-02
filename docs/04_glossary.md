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

## 4. Términos Técnicos y Arquitecturales

| Término | Definición | Contexto |
|---------|------------|----------|
| **API Gateway** | Punto de entrada único, enrutamiento, auth, rate limiting | Arquitectura |
| **Microservicio** | Servicio independientemente desplegable (Users, MP, Materials) | Arquitectura |
| **BD por Servicio** | Cada microservicio tiene su propia BD PostgreSQL (bd_users, bd_mp, bd_materiales) | Datos |
| **Transacción ACID** | Atomicidad, Consistencia, Aislamiento, Durabilidad (Go: db.Transaction) | Datos |
| **Concurrencia Go** | Goroutines + WaitGroup + Channels para validaciones paralelas | Materials Service |
| **OpenAPI 3.0** | Especificación de contratos REST (YAML) | Contratos |
| **Swagger UI** | Documentación interactiva generada desde OpenAPI | Contratos |

---

## 5. Abreviaturas

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

---

## 6. Referencias

- [Modelo de Dominio](07_domain_model.md)
- [Casos de Uso](03_use_cases.md)
- [Event Storming](../practices/practice_03_event_storming.md)
- [Diccionario original en SISGAD5_doc](https://github.com/ybotet/SISGAD5_doc/blob/main/docs/04%20%D0%A1%D0%BB%D0%BE%D0%B2%D0%B0%D1%80%D1%8C%20%D1%82%D0%B5%D1%80%D0%BC%D0%B8%D0%BD%D0%BE%D0%B2.md)