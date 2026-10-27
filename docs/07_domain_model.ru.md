# Модель домена - SISGAD5

> **Версия:** 1.0
> **Дата:** 2026-09-25
> **Всего:** 28 классов в 5 ограниченных контекстах
> **Источник:** [SISGAD5_doc/docs/03-07](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Ограниченные контексты (Bounded Contexts)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SISGAD5                                  │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│   Auth      │    Users    │     MP      │  Materials  │ Shared │
│  Context    │  Context    │  Context    │  Context    │ Kernel │
├─────────────┼─────────────┼─────────────┼─────────────┼────────┤
│ User        │ User        │ Telefono    │ Material    │ Value  │
│ Sesion      │ Rol         │ Linea       │ Categoria   │ Objects│
│ Rol         │ Permiso     │ Pizarra     │ UnidadMedida│        │
│ Permiso     │             │ Puerto      │ Asignacion  │        │
│             │             │ Queja       │ AsignacionIt│        │
│             │             │ Prueba      │ Consumo     │        │
│             │             │ Trabajo     │ ConsumoItem │        │
│             │             │ Clave       │             │        │
│             │             │ TipoQueja   │             │        │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
```

---

## 2. Контекст Auth (Аутентификация)

### User (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | UUID | PK |
| email | String | Уникальный, NOT NULL, действительный email |
| password_hash | String | Bcrypt, NOT NULL |
| nombre | String | NOT NULL |
| apellido | String | NOT NULL |
| activo | Boolean | По умолчанию: true |
| ultimologin | DateTime | NULL |
| intentos_fallidos | Integer | По умолчанию: 0 |
| bloqueado_hasta | DateTime | NULL |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

**Методы:**
- `verificarPassword(password: String): Boolean`
- `incrementarIntentosFallidos(): void`
- `resetearIntentosFallidos(): void`
- `bloquear(minutos: Integer): void`
- `estaBloqueado(): Boolean`

### Sesion (Сущность)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | UUID | PK |
| user_id | UUID | FK → User |
| refresh_token_hash | String | Уникальный, NOT NULL |
| user_agent | String | NULL |
| ip | String | NULL |
| expira_en | DateTime | NOT NULL |
| revocada | Boolean | По умолчанию: false |
| created_at | DateTime | Авто |

**Методы:**
- `revocar(): void`
- `estaVigente(): Boolean`

---

## 3. Контекст Users (Управление пользователями и ролями)

### Rol (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | UUID | PK |
| nombre | String | Уникальный, NOT NULL (Admin, Tecnico, Operador, Jefe, Analista, Director, Auditor) |
| descripcion | String | NULL |
| created_at | DateTime | Авто |

### Permiso (Сущность)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | UUID | PK |
| nombre | String | Уникальный, NOT NULL (ej: users:create, quejas:read, materiales:write) |
| recurso | String | NOT NULL |
| accion | String | NOT NULL (create, read, update, delete) |
| created_at | DateTime | Авто |

### User_Roles (Объект-значение - Таблица связи)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| user_id | UUID | FK → User, составной PK |
| rol_id | UUID | FK → Rol, составной PK |
| asignado_por | UUID | FK → User (admin назначивший) |
| asignado_en | DateTime | Авто |

### Roles_Permisos (Объект-значение - Таблица связи)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| rol_id | UUID | FK → Rol, составной PK |
| permiso_id | UUID | FK → Permiso, составной PK |

---

## 4. Контекст MP (Mantenimiento de Plantas)

### Telefono (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| numero | String | Уникальный, NOT NULL |
| cliente_id | Integer | FK → Cliente (внешний), NOT NULL |
| estado | Enum | activo \| baja |
| fecha_baja | DateTime | NULL |
| ubicacion | String | NULL |
| observaciones | Text | NULL |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### Linea (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| numero | String | Уникальный, NOT NULL |
| cliente_id | Integer | FK → Cliente, NOT NULL |
| estado | Enum | activo \| baja |
| fecha_baja | DateTime | NULL |
| tipo_linea_id | Integer | FK → TipoLinea |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### Pizarra (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| nombre | String | NOT NULL |
| tipo_pizarra_id | Integer | FK → TipoPizarra |
| ubicacion_fisica | String | NULL |
| latitud | Decimal(10,8) | NULL |
| longitud | Decimal(11,8) | NULL |
| estado | Enum | activo \| baja |
| fecha_baja | DateTime | NULL |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### Puerto (Сущность - принадлежит Pizarra)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| pizarra_id | Integer | FK → Pizarra, NOT NULL |
| numero_puerto | Integer | NOT NULL, уникальный для панели |
| tipo_conexion | Enum | entrada \| salida |
| elemento_conectado_id | Integer | NULL (полиморфный: telefono/linea/pizarra) |
| elemento_conectado_tipo | String | NULL |
| created_at | DateTime | Авто |

### Queja (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| num_reporte | Integer | Уникальный, автоинк по году |
| telefono_id | Integer | FK → Telefono, NULL |
| linea_id | Integer | FK → Linea, NULL |
| pizarra_id | Integer | FK → Pizarra, NULL |
| tipo_queja_id | Integer | FK → TipoQueja, NOT NULL |
| servicio_id | Integer | FK → Servicio, NOT NULL |
| ubicacion_id | Integer | FK → Ubicacion, NOT NULL |
| clave_id | Integer | FK → Clave (составная классификация), NOT NULL |
| reportado_por | String | NOT NULL |
| prioridad | Integer | 1-4, вычисляется автоматически |
| estado | Enum | Abierta \| Probada \| Asignada \| Pendiente \| Resuelta \| Cerrada |
| fecha | DateTime | NOT NULL, по умолчанию now |
| tecnico_asignado_id | UUID | FK → User, NULL |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

**Методы:**
- `calcularPrioridad(): Integer`
- `puedeTransicionar(nuevoEstado: Enum): Boolean`
- `transicionar(nuevoEstado: Enum, usuarioId: UUID): void`
- `asignarTecnico(tecnicoId: UUID): void`

### FlujoEstadoQueja (Сущность - История)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| queja_id | Integer | FK → Queja, NOT NULL |
| estado_anterior | Enum | NULL (null для начального состояния) |
| estado_nuevo | Enum | NOT NULL |
| usuario_id | UUID | FK → User, NOT NULL |
| observaciones | Text | NULL |
| ip | String | NULL |
| created_at | DateTime | Авто |

### Prueba (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| queja_id | Integer | FK → Queja, NULL |
| trabajo_id | Integer | FK → Trabajo, NULL |
| tecnico_id | UUID | FK → User, NOT NULL |
| fecha | DateTime | NOT NULL |
| exitoso | Boolean | NOT NULL |
| mediciones | JSON | NULL |
| observaciones | Text | NULL |
| created_at | DateTime | Авто |

**Правило:** queja_id XOR trabajo_id должно быть NOT NULL (хотя бы один)

### Trabajo (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| queja_id | Integer | FK → Queja, NULL |
| descripcion | Text | NOT NULL |
| tecnico_asignado_id | UUID | FK → User, NULL |
| tiempo_estimado_horas | Decimal(5,2) | NULL |
| tiempo_real_horas | Decimal(5,2) | NULL |
| estado | Enum | Abierto \| Asignado \| En_Proceso \| Cerrado |
| fecha_creacion | DateTime | Авто |
| fecha_asignacion | DateTime | NULL |
| fecha_cierre | DateTime | NULL |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### Clave / Классификаторы (Каталоги MP)
| Сущность | Описание |
|----------|----------|
| TipoQueja | Тип инцидента (Corte, Ruido, Intermitente, etc.) |
| Servicio | Затрагиваемая услуга (Telefonía Básica, Internet, TV, etc.) |
| Ubicacion | Географическая зона |
| Clave | Составная классификация (tipo + servicio + ubicacion) |
| TipoLinea | Тип линии (Analógica, Digital, Fibra, etc.) |
| TipoPizarra | Тип панели (MDF, IDF, PABX, etc.) |
| Clasificacion | Дополнительные классификации |
| ClasificadorClave | Иерархические ключи |
| Clave | Коды классификации |
| Cable | Типы кабелей |
| Senalizacion | Типы сигнализации |
| Sistema | Системы коммутации |
| Planta | Заводы/здания |
| Propietario | Собственники инфраструктуры |
| Mandos | Коммутационные устройства |
| GruposTrabajo | Рабочие группы |
| TipoMovimiento | Типы движения (Instalación, Traslado, Baja) |

---

## 5. Контекст Materials (Управление материалами)

### Material (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| codigo | String | Уникальный, NOT NULL |
| nombre | String | NOT NULL |
| descripcion | Text | NULL |
| precio_unitario | Decimal(12,2) | > 0, NOT NULL |
| categoria_id | Integer | FK → Categoria, NOT NULL |
| unidad_id | Integer | FK → UnidadMedida, NOT NULL |
| stock_minimo | Integer | По умолчанию: 0 |
| activo | Boolean | По умолчанию: true |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### Categoria (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| nombre | String | Уникальный, NOT NULL |
| descripcion | Text | NULL |
| activo | Boolean | По умолчанию: true |
| created_at | DateTime | Авто |

### UnidadMedida (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| nombre | String | Уникальный, NOT NULL (ej: m, und, kg, caja, rollo) |
| simbolo | String | Уникальный, NOT NULL |
| descripcion | Text | NULL |
| activo | Boolean | По умолчанию: true |
| created_at | DateTime | Авто |

### Asignacion (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| trabajador_id | UUID | FK → User (rol Técnico/Analista), NOT NULL |
| trabajo_id | Integer | FK → Trabajo (MP), NULL |
| fecha | DateTime | NOT NULL, по умолчанию now |
| observaciones | Text | NULL |
| estado | Enum | Pendiente \| Entregada \| Parcial \| Cancelada |
| created_at | DateTime | Авто |
| updated_at | DateTime | Авто |

### AsignacionItem (Сущность - принадлежит Asignacion)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| asignacion_id | Integer | FK → Asignacion, NOT NULL |
| material_id | Integer | FK → Material, NOT NULL |
| cantidad | Integer | > 0, NOT NULL |
| costo_unitario_momento | Decimal(12,2) | > 0, захват при создании |
| created_at | DateTime | Авто |

### Consumo (Корень агрегата)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| trabajador_id | UUID | FK → User, NOT NULL |
| trabajo_id | Integer | FK → Trabajo (MP), NOT NULL |
| asignacion_id | Integer | FK → Asignacion, NULL |
| fecha | DateTime | NOT NULL, по умолчанию now |
| observaciones | Text | NULL |
| created_at | DateTime | Авто |

### ConsumoItem (Сущность - принадлежит Consumo)
| Атрибут | Тип | Правила |
|--------|-----|--------|
| id | Integer | PK, автоинк |
| consumo_id | Integer | FK → Consumo, NOT NULL |
| material_id | Integer | FK → Material, NOT NULL |
| cantidad | Integer | > 0, NOT NULL |
| costo_unitario_real | Decimal(12,2) | > 0, захват при создании |
| created_at | DateTime | Авто |

---

## 6. Shared Kernel (Разделяемые объекты-значения)

| Объект-значение | Атрибуты | Используется в |
|-----------------|----------|----------------|
| **Email** | value: String | User |
| **PasswordHash** | value: String | User |
| **TokenJWT** | value: String, expiracion: DateTime | Sesion |
| **RefreshToken** | value: String, expiracion: DateTime | Sesion |
| **Money** | amount: Decimal, currency: String (CUP) | Material, AsignacionItem, ConsumoItem |
| **Quantity** | value: Integer (>0) | AsignacionItem, ConsumoItem |
| **Priority** | value: Integer (1-4) | Queja |
| **Coordinates** | lat: Decimal, lng: Decimal | Pizarra |
| **Pagination** | page: Integer, limit: Integer, total: Integer, pages: Integer | Listados |

---

## 7. Основные связи

```
User 1 ── * Sesion
User * ── * Rol (User_Roles)
Rol * ── * Permiso (Roles_Permisos)

Telefono * ── 1 Cliente
Linea * ── 1 Cliente
Pizarra 1 ── * Puerto
Puerto * ── 1 (Telefono | Linea | Pizarra) [Полиморфная]

Queja * ── 1 Telefono
Queja * ── 1 Linea
Queja * ── 1 Pizarra
Queja * ── 1 TipoQueja
Queja * ── 1 Servicio
Queja * ── 1 Ubicacion
Queja * ── 1 Clave
Queja 1 ── * FlujoEstadoQueja
Queja * ── 1 User (tecnico_asignado)

Prueba * ── 1 Queja (опционально)
Prueba * ── 1 Trabajo (опционально)
Prueba * ── 1 User (tecnico)

Trabajo * ── 1 Queja (опционально)
Trabajo * ── 1 User (tecnico_asignado)

Material * ── 1 Categoria
Material * ── 1 UnidadMedida

Asignacion * ── 1 User (trabajador)
Asignacion * ── 1 Trabajo (опционально)
Asignacion 1 ── * AsignacionItem
AsignacionItem * ── 1 Material

Consumo * ── 1 User (trabajador)
Consumo * ── 1 Trabajo
Consumo * ── 1 Asignacion (опционально)
Consumo 1 ── * ConsumoItem
ConsumoItem * ── 1 Material
```

---

## 8. Диаграммы классов

См. исходную диаграмму: [`docs/diagrams/class_diagrams/`](../diagrams/class_diagrams/)

---

## 9. Ссылки

- [Варианты использования](03_use_cases.ru.md)
- [Глоссарий](04_glossary.ru.md)
- [Бизнес-правила](06_business_rules.ru.md)
- [Диаграммы последовательностей](08_sequence_diagrams.ru.md)
- [Модель данных ER](11_data_model.ru.md)
