# Manual Operativo (SISGAD5)

> **Versión:** 1.0  
> **Público:** Operadores, Técnicos de Campo  
> **Última actualización:** Septiembre 2026

---

## 1. Introducción

Este manual está dirigido a operadores (que registran quejas y gestionan infraestructura) y técnicos (que ejecutan pruebas y trabajos de campo).

## 2. Acceso al Sistema

### 2.1. Login
1. Acceder a la URL corporativa: `https://sisgad5.tuempresa.com`
2. Ingresar email y contraseña
3. Si es primera vez, seguir instrucciones del email de bienvenida
4. Seleccionar "Recordar sesión" solo en equipos personales seguros

### 2.2. Recuperar Contraseña
1. En login → **¿Olvidó su contraseña?**
2. Ingresar email registrado
3. Revisar bandeja → Click en enlace
4. Ingresar nueva contraseña (mínimo 8 caracteres, incluir número y letra)

## 3. Para Operadores

### 3.1. Reportar una Queja

#### Paso 1: Navegar
- Menú lateral → **MP** → **Quejas** → **Nueva Queja**

#### Paso 2: Clasificar
Completar todos los campos:
- **Tipo de queja** (Falla de Señal, Corte de Cable, etc.)
- **Servicio** (telefonía, internet, etc.)
- **Ubicación** (sector, municipio)
- **Clave** (número de teléfono/línea/pizarra conectada)

> **Nota:** La prioridad se calcula automáticamente. Si es prioridad 1 (urgente), se notifica inmediatamente.

#### Paso 3: Confirmar
- Verificar datos
- Hacer clic en **Crear**
- Anotar el número de reporte (ej: 1001) que aparece en pantalla

```
[ Ejemplo de pantalla ]
Queja creada exitosamente
Número de reporte: 1001
Prioridad: 2 - Media
Estado actual: Reportada → Priorizada → Abierta
```

### 3.2. Ver y Buscar Quejas

#### Listado
- Menú → **MP** → **Quejas** → **Listado**
- Columnas: Núm. Reporte, Prioridad, Tipo, Servicio, Estado, Técnico, Fecha

#### Filtros
- Estado (Abierta, En Progreso, Cerrada, Pendiente)
- Prioridad (1-4)
- Servicio
- Fecha (desde/hasta)
- Técnico asignado
- Texto libre (busca en descripción, clave, etc.)

### 3.3. Ver Detalle de Queja

#### Información Mostrada
- Datos de clasificación (tipo, servicio, ubicación, clave)
- Prioridad calculada y justificación
- Estado actual y flujo de historial
- Técnico asignado
- Pruebas registradas (si existen)
- Trabajos asociados (si existen)
- Botón: **Ver auditoría** (quién hizo qué y cuándo)

#### Acciones Disponibles (según rol y estado)
| Estado | Operador puede |
|--------|---------------|
| Reportada/Priorizada | - |
| Abierta | Ver, asignar prueba, cambiar estado (si FSM válido) |
| En Progreso | Ver, registrar prueba, cambiar estado |
| Cerrada | Reabrir |
| Pendiente Prueba | Ver, registrar prueba |

### 3.4. Registrar Prueba

**Cuándo:** Después de ejecutar medición en sitio.

#### Formulario
- **Queja ID:** Pre-seleccionado al abrir desde detalle de queja
- **Trabajo ID:** Opcional (si está asociado)
- **Resultado:** ✅ Exitosa / ❌ Fallida
- **Mediciones:** JSON con valores (latencia, packet loss, señal, etc.)
- **Observaciones:** Texto libre

> **Importante:** Si la prueba falla, la queja vuelve a estado "En Progreso" y requiere nueva prueba.

### 3.5. Gestionar Infraestructura

#### Teléfonos
- **Listar:** Menú → **MP** → **Infraestructura** → **Teléfonos**
- **Crear:** Formulario con número, cliente, ubicación
- **Editar:** Cambiar datos, estado (activo/baja)
- **Baja:** Marcar como "baja" con fecha, no eliminar

#### Líneas
- Similar a teléfonos

#### Pizarras
- Listar → Ver puertos → Ver conectores
- Al crear pizarra: ingresar ubicación física y coordenadas GPS

## 4. Para Técnicos

### 4.1. Ver Mis Asignaciones

#### Quejas Asignadas
- Menú → **Técnico** → **Mis Quejas**
- Muestra: número de reporte, prioridad, clasificación, estado
- Color: Prioridad 1 = rojo, Prioridad 2 = naranja

#### Trabajos Asignados
- Menú → **Técnico** → **Mis Trabajos**
- Muestra: OT número, descripción, queja origen, estado, tiempo estimado/real

### 4.2. Ejecutar Trabajo

#### Iniciar
1. Abrir trabajo asignado
2. Click **Iniciar** (registra hora de inicio en campo)

#### Registrar Consumo
1. En detalle de trabajo → pestaña **Consumir Materiales**
2. Para cada material:
   - Seleccionar del catálogo
   - Cantidad utilizada
   - Precio unitario real (se autocompleta si coincide)
3. Click **Guardar** (valida stock y límites de asignación)

> **Regla:** No puedes consumir más de lo asignado. El sistema bloqueará si excedes.

#### Cerrar Trabajo
1. Completar todos los ítems
2. Ingresar **tiempo real** (horas)
3. Click **Cerrar**
4. El tiempo real no debe exceder 2x el tiempo estimado (regla BR-07)

### 4.3. Registrar Prueba (desde técnico)
1. Abrir queja → pestaña **Pruebas**
2. Click **Nueva Prueba**
3. Completar resultados y mediciones
4. Click **Guardar**

## 5. Códigos de Estado y Prioridad

### Estados de Queja
| Estado | Color | Descripción |
|--------|-------|-------------|
| Reportada | Gris | Creada, pendiente de clasificación |
| Priorizada | Azul | Sistema calculó prioridad |
| Abierta | Azul claro | Lista para asignar |
| En Progreso | Naranja | Técnico asignado |
| Pendiente Prueba | Amarillo | Requiere prueba |
| Prueba Exitosa | Verde | Prueba pasó |
| Cerrada | Verde oscuro | Resuelta |
| Cancelada | Rojo | Cancelada |

### Prioridades
| Prioridad | Color | SLA Máximo |
|-----------|-------|------------|
| 1 - Urgente | Rojo | 2 horas |
| 2 - Alta | Naranja | 8 horas |
| 3 - Media | Amarillo | 24 horas |
| 4 - Baja | Verde | 72 horas |

## 6. Preguntas Frecuentes (Operativo)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Puedo cambiar el estado de una queja? | Solo transiciones válidas del FSM (ver manual técnico) |
| ¿Qué pasa si cierro un trabajo con tiempo real muy alto? | El sistema avisa si supera 2× el estimado, pero permite guardar |
| ¿Puedo consumir materiales sin trabajo? | No, siempre deben estar vinculados a una orden |
| ¿Cómo veo mi historial de trabajos? | Menú → **Técnico** → **Historial** |
| ¿Qué significa "bloqueado" en rojo? | Intentaste algo que la FSM no permite |

## 7. Contactos de Soporte

| Necesidad | Contacto | SLA |
|-----------|----------|-----|
| Bug en sistema | soporte@sisgad5.com | 4h |
| Credenciales | IT Help Desk | 2h |
| Infraestructura caída | noc@sisgad5.com | 30min |
| Mejora funcional | product@sisgad5.com | 3 días hábiles |

## 8. Referencias

- [Manual Administrativo](manual_administracion.md)
- [Manual de Explotación](manual_explotacion_general.md)
- [Manual Técnico](manual_tecnico.md)
- [Tesis - Implementación](../thesis/04_development.md)
- [BPMN](../practices/practice_04_bpmn.md)
