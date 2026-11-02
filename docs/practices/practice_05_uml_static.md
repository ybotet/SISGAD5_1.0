# Práctica 05 - UML Estático (Diagramas de Clases y Objeto)

> **Disciplina:** Ingeniería de Software  
> **Especialidad:** UML (Unified Modeling Language) - Vista Estática  
> **Basado en:** [SISGAD5_doc/docs/03-07](https://github.com/ybotet/SISGAD5_doc)

---

## 1. Diagrama de Clases (28 clases)

### 28 Clases Principales

```mermaid
classDiagram
    %% Auth Context
    class User {
        <<entity>>
        +UUID id
        +String email
        +String passwordHash
        +String nombre
        +String apellido
        +boolean activo
        +DateTime ultimoLogin
        +DateTime bloqueadoHasta
        +login()
        +verificarPassword()
        +estaBloqueado()
    }
    
    class Sesion {
        <<entity>>
        +UUID id
        +UUID userId
        +String refreshTokenHash
        +String userAgent
        +String ip
        +DateTime expiraEn
        +boolean revocado
        +estaVigente()
        +revocar()
    }
    
    class Rol {
        <<entity>>
        +UUID id
        +String nombre
        +String descripcion
    }
    
    class Permiso {
        <<entity>>
        +UUID id
        +String nombre
        +String recurso
        +String accion
    }
    
    class UserRoles {
        <<entity>>
        +UUID userId
        +UUID rolId
        +UUID asignadoPor
        +DateTime asignadoEn
    }
    
    class RolesPermisos {
        <<entity>>
        +UUID rolId
        +UUID permisoId
    }
    
    %% MP Context
    class Telefono {
        <<entity>>
        +int id
        +String numero
        +int clienteId
        +enum estado
        +DateTime fechaBaja
        +String ubicacion
        +String observaciones
    }
    
    class Linea {
        <<entity>>
        +int id
        +String numero
        +int clienteId
        +enum estado
        +DateTime fechaBaja
        +int tipoLineaId
    }
    
    class Pizarra {
        <<entity>>
        +int id
        +String nombre
        +int tipoPizarraId
        +String ubicacionFisica
        +decimal latitud
        +decimal longitud
        +enum estado
        +DateTime fechaBaja
    }
    
    class Puerto {
        <<entity>>
        +int id
        +int pizarraId
        +int numeroPuerto
        +enum tipoConexion
        +int elementoConectadoId
        +String elementoConectadoTipo
    }
    
    class Queja {
        <<entity>>
        +int id
        +int numReporte
        +int telefonoId
        +int lineaId
        +int pizarraId
        +int tipoQuejaId
        +int servicioId
        +int ubicacionId
        +int claveId
        +String reportadoPor
        +int prioridad
        +enum estado
        +DateTime fecha
        +UUID tecnicoAsignadoId
        +calcularPrioridad()
        +transicionar(nuevoEstado)
        +puedeTransicionar(nuevoEstado)
    }
    
    class FlujoEstadoQueja {
        <<entity>>
        +int id
        +int quejaId
        +enum estadoAnterior
        +enum estadoNuevo
        +UUID usuarioId
        +String observaciones
        +String ip
        +DateTime createdAt
    }
    
    class Prueba {
        <<entity>>
        +int id
        +int quejaId
        +int trabajoId
        +UUID tecnicoId
        +DateTime fecha
        +boolean exitoso
        +json mediciones
        +String observaciones
    }
    
    class Trabajo {
        <<entity>>
        +int id
        +int quejaId
        +String descripcion
        +UUID tecnicoAsignadoId
        +decimal tiempoEstimado
        +decimal tiempoReal
        +enum estado
        +DateTime fechaCreacion
        +DateTime fechaAsignacion
        +DateTime fechaCierre
    }
    
    %% Catálogos MP
    class TipoQueja {
        +int id
        +String nombre
        +int pesoPrioridad
    }
    
    class Servicio {
        +int id
        +String nombre
        +int pesoPrioridad
    }
    
    class Ubicacion {
        +int id
        +String nombre
        +int pesoPrioridad
    }
    
    class Clave {
        +int id
        +String codigo
    }
    
    class TipoLinea {
        +int id
        +String nombre
    }
    
    class TipoPizarra {
        +int id
        +String nombre
    }
    
    %% Materials Context
    class Material {
        <<entity>>
        +int id
        +String codigo
        +String nombre
        +String descripcion
        +decimal precioUnitario
        +int categoriaId
        +int unidadId
        +int stockMinimo
        +boolean activo
    }
    
    class Categoria {
        <<entity>>
        +int id
        +String nombre
        +String descripcion
    }
    
    class UnidadMedida {
        <<entity>>
        +int id
        +String nombre
        +String simbolo
    }
    
    class Asignacion {
        <<entity>>
        +int id
        +UUID trabajadorId
        +int trabajoId
        +DateTime fecha
        +String observaciones
        +enum estado
    }
    
    class AsignacionItem {
        <<entity>>
        +int id
        +int asignacionId
        +int materialId
        +int cantidad
        +decimal costoUnitarioMomento
    }
    
    class Consumo {
        <<entity>>
        +int id
        +UUID trabajadorId
        +int trabajoId
        +int asignacionId
        +DateTime fecha
        +String observaciones
    }
    
    class ConsumoItem {
        <<entity>>
        +int id
        +int consumoId
        +int materialId
        +int cantidad
        +decimal costoUnitarioReal
    }
    
    %% Shared Kernel
    class Money {
        <<value object>>
        +decimal amount
        +String currency
    }
    
    class Pagination {
        <<value object>>
        +int page
        +int limit
        +int total
        +int pages
    }
    
    class Coordinates {
        <<value object>>
        +decimal latitud
        +decimal longitud
    }
    
    class Email {
        <<value object>>
        +String value
    }
    
    %% Relationships
    User "1" --> "*" Sesion : tiene
    User "*" --* "*" Rol : pertenece > UserRoles
    Rol "*" --* "*" Permiso : contiene > RolesPermisos
    
    Queja --> "0..1" Telefono : referencia
    Queja --> "0..1" Linea : referencia
    Queja --> "0..1" Pizarra : referencia
    Queja --> TipoQueja : clasifica
    Queja --> Servicio : afecta
    Queja --> Ubicacion : localiza
    Queja --> Clave : clasifica
    Queja "1" --> "*" FlujoEstadoQueja : genera
    Queja "1" --> "0..1" User : técnico_asignado
    
    Trabajo --> "0..1" Queja : origen
    Trabajo --> "0..1" User : técnico
    
    Prueba --> "0..1" Queja : referencia
    Prueba --> "0..1" Trabajo : referencia
    Prueba --> User : técnico
    
    Pizarra "1" --> "*" Puerto : contiene
    Puerto --> "0..1" Telefono : conecta
    Puerto --> "0..1" Linea : conecta
    
    Material --> Categoria : pertenece
    Material --> UnidadMedida : mide
    Asignacion "1" --> "*" AsignacionItem : contiene
    AsignacionItem --> Material : referencia
    Asignacion --> "0..1" User : trabajador
    Asignacion --> "0..1" Trabajo : orden
    
    Consumo "1" --> "*" ConsumoItem : contiene
    ConsumoItem --> Material : referencia
    Consumo --> "0..1" User : trabajador
    Consumo --> "0..1" Trabajo : orden
    Consumo --> "0..1" Asignacion : origen
    
    Trabajo --> Asignacion : usa
    
    Material ..> Money : precio
    AsignacionItem ..> Money : costo_momento
    ConsumoItem ..> Money : costo_real
    
    Queja ..> Pagination : listado
    Material ..> Coordinates : geolocalización
    User ..> Email : email
    
    TipoQueja <|-- Clave : referencia (indirecta)
    Servicio <|-- Clave : referencia (indirecta)
    Ubicacion <|-- Clave : referencia (indirecta)
```

### Leyenda

| Símbolo | Significado |
|---------|-------------|
| `<<entity>>` | Entidad con identidad única (PK) |
| `<<value object>>` | Valor sin identidad, inmutable |
| `<<context>>` | Contexto delimitado (Bounded Context) |
| 1..* | Uno a Muchos |
| 0..1 | Opcional (cero o uno) |
| *..* | Muchos a Muchos (con tabla pivot) |
| --> | Herencia/Agregación |
| --| | Composición |

---

## 2. Contextos Delimitados (5 Ctx)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e3f2fd', 'secondaryColor': '#e8f5e9', 'tertiaryColor': '#fff3e0', 'lineColor': '#666' }}}%%
classDiagram
    class AuthContext {
        <<Context>>
        User, Sesion, Rol, Permiso
        UserRoles, RolesPermisos
    }
    
    class UsersContext {
        <<Context>>
        User (extendida desde Auth)
        UserProfile, BlacklistedToken
    }
    
    class MPContext {
        <<Context>>
        Telefono, Linea, Pizarra, Puerto
        Queja, FlujoEstadoQueja
        Prueba, Trabajo
        Catálogos: TipoQueja, Servicio, etc.
    }
    
    class MaterialsContext {
        <<Context>>
        Material, Categoria, UnidadMedida
        Asignacion, AsignacionItem
        Consumo, ConsumoItem
    }
    
    class SharedKernel {
        <<Context>>
        Money, Pagination, Coordinates, Email, UUID, DateTime
    }
    
    AuthContext --|> SharedKernel
    UsersContext --|> SharedKernel
    MPContext --|> SharedKernel
    MaterialsContext --|> SharedKernel
    
    note right of AuthContext
        Responsabilidades:\n- Autenticación\n- Sesiones\n- Roles & Permisos
    end note
    
    note right of MPContext
        Responsabilidades:\n- Gestión infraestructura\n- Quejas y flujo\n- Pruebas y trabajos
    end note
    
    note right of MaterialsContext
        Responsabilidades:\n- Catálogo materiales\n- Asignaciones y consumos\n- Dashboard analítico
    end note
```

---

## 3. Diagrama de Objetos (Ejemplo: Asignación con Consumo)

### Escenario: Técnico recibe materiales y consumen parcialmente

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#e8f5e9' }}}%%
classDiagram
    class ObjetoAsignacion {
        <<instance>>
        asignacion_001: Asignacion
        ---fecha: 2026-09-20
        ---estado: "Entregada"
        ---observaciones: "Para trabajo OT-123"
    }
    
    class ObjetoAsignacionItem1 {
        <<instance>>
        item_001: AsignacionItem
        ---cantidad: 10
        ---costoUnitarioMomento: 250.00
        ---material: "Cable CAT6 UTP"
    }
    
    class ObjetoAsignacionItem2 {
        <<instance>>
        item_002: AsignacionItem
        ---cantidad: 5
        ---costoUnitarioMomento: 150.00
        ---material: "Conector RJ45"
    }
    
    class ObjetoMaterial1 {
        <<instance>>
        mat_001: Material
        ---codigo: "CAB-CAT6-UTP"
        ---precioUnitario: 245.00
    }
    
    class ObjetoMaterial2 {
        <<instance>>
        mat_002: Material
        ---codigo: "CON-RJ45"
        ---precioUnitario: 148.00
    }
    
    class ObjetoTrabajo {
        <<instance>>
        trabajo_045: Trabajo
        ---descripcion: "Instalación línea 123"
        ---tiempoEstimado: 4.0
    }
    
    ObjetoAsignacion *-- ObjetoAsignacionItem1 : contiene
    ObjetoAsignacion *-- ObjetoAsignacionItem2 : contiene
    ObjetoAsignacionItem1 --> ObjetoMaterial1 : referencia
    ObjetoAsignacionItem2 --> ObjetoMaterial2 : referencia
    ObjetoAsignacion --> ObjetoTrabajo : referencia
```

### Serialización JSON del Objeto

```json
{
  "id": 1001,
  "trabajador": {
    "id": "uuid-tecnico",
    "nombre": "Carlos",
    "apellido": "Pérez"
  },
  "trabajo_id": 45,
  "fecha": "2026-09-20T10:00:00Z",
  "observaciones": "Para trabajo OT-123",
  "estado": "Entregada",
  "items": [
    {
      "id": 5001,
      "material": {
        "id": 101,
        "codigo": "CAB-CAT6-UTP",
        "nombre": "Cable CAT6 UTP",
        "precio_unitario": 245.00
      },
      "cantidad": 10,
      "costo_unitario_momento": 250.00
    },
    {
      "id": 5002,
      "material": {
        "id": 205,
        "codigo": "CON-RJ45",
        "nombre": "Conector RJ45",
        "precio_unitario": 148.00
      },
      "cantidad": 5,
      "costo_unitario_momento": 150.00
    }
  ],
  "created_at": "2026-09-20T10:00:00Z",
  "updated_at": "2026-09-20T10:05:00Z"
}
```

---

## 4. Herencia y Polimorfismo

### Clase Base: ElementoInfraestructura (abstracta)
```mermaid
classDiagram
    class ElementoInfraestructura {
        <<abstract>>
        +int id
        +int clienteId
        +String codigo
        +enum estado
        +DateTime fechaBaja
        +String observaciones
        +activar()
        +desactivar()
        +estaActivo()
    }
    
    class Telefono {
        +String numero
        +String ubicacion
    }
    
    class Linea {
        +String numero
        +int tipoLineaId
    }
    
    class Pizarra {
        +String nombre
        +String ubicacionFisica
        +int tipoPizarraId
        +decimal latitud
        +decimal longitud
    }
    
    ElementoInfraestructura <|-- Telefono
    ElementoInfraestructura <|-- Linea
    ElementoInfraestructura <|-- Pizarra
```

### Clase Base: ElementoMovimiento (abstracta)
```mermaid
classDiagram
    class ElementoMovimiento {
        <<abstract>>
        +int id
        +String elementoOrigenTipo
        +int elementoOrigenId
        +String elementoDestinoTipo
        +int elementoDestinoId
        +DateTime fecha
        +UUID realizadoPor
    }
    
    class Movimiento {
        +String tipoMovimiento
    }
    
    class Recorrido {
        +DateTime inicio
        +DateTime fin
    }
    
    ElementoMovimiento <|-- Movimiento
    ElementoMovimiento <|-- Recorrido
```

---

## 5. Dependencias entre Contextos

| Origen (Provee) | Destino (Consume) | Tipo de Dependencia |
|-----------------|--------------------|---------------------|
| Users Service (User.id) | MP Service (Queja.tecnico_asignado_id) | Foreign Key |
| Users Service (User.id) | Materials Service (Asignacion.trabajador_id) | Foreign Key |
| MP Service (Trabajo.id) | Materials Service (Asignacion.trabajo_id) | Foreign Key |
| MP Service (Trabajo.id) | Materials Service (Consumo.trabajo_id) | Foreign Key |
| MP Service (Asignacion.id) | Materials Service (Consumo.asignacion_id) | Foreign Key |
| Materials Service (Material.id) | MP Service (n/a) | - |

**Nota:** No hay dependencia circular. Users → MP → Materials (dirección única).

---

## 6. Diagramas Fuente

Ver archivos fuente en: [`docs/diagrams/class_diagrams/`](../diagrams/class_diagrams/)

- `domain_model.mmd` - Diagrama de clases completo (28 clases)
- `contexts_bounded.mmd` - Contextos delimitados
- `inheritance_polymorphism.mmd` - Herencia y polimorfismo
- `object_example.mmd` - Diagrama de objetos (asignación)

---

## 7. Referencias

- [Modelo de Dominio](../07_domain_model.md)
- [Casos de Uso](../03_use_cases.md)
- [Diccionario de Términos](../04_glossary.md)
- [UML Dinámico](practice_06_uml_dynamic.md)
- [Event Storming](practice_03_event_storming.md)