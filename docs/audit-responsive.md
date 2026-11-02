# Auditoría de Diseño Responsive — SISGAD5 Frontend

> **Fecha:** 2026-11-02  
> **Tarea:** TASK-720-02 — Responsive design sistemático  
> **Viewports probados:** 375px (móvil), 768px (tablet), 1280px (desktop)  
> **Método:** Análisis de código fuente (clases Tailwind, breakpoints sm/md/lg)

## Resumen Ejecutivo

| Viewport | Páginas analizadas | Páginas con problemas | Páginas sin problemas |
|----------|-------------------|----------------------|----------------------|
| 375px (móvil) | 12 | 12 | 0 |
| 768px (tablet) | 12 | 8 | 4 |
| 1280px (desktop) | 12 | 0 | 12 |

**Problema crítico:** Todas las tablas de datos usan `overflow-x-auto` sin fallback a vista de tarjetas en móvil, provocando scroll horizontal y dificultad de uso en pantallas pequeñas.

---

## Tabla Página × Problema

| Página | Ruta | 375px | 768px | 1280px | Problema principal |
|--------|------|-------|-------|--------|-------------------|
| Login | `/auth/login` | ⚠️ | ✅ | ✅ | Contenedor `max-w-xl` sin padding lateral en móvil muy estrecho; inputs sin `sm:` ajuste |
| Dashboard | `/sistema/main/dashboard` | ⚠️ | ✅ | ✅ | Grid de stats `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` OK; segundo grid `grid-cols-1 lg:grid-cols-2` carece de `sm:` breakpoint |
| Quejas | `/sistema/main/quejas` | ❌ | ❌ | ✅ | Tabla con `overflow-x-auto` sin fallback a cards; header `flex justify-between` no se apila en móvil |
| Teléfonos | `/sistema/main/telefonos` | ❌ | ❌ | ✅ | Tabla `overflow-x-auto`; botones de acción en `whitespace-nowrap` se cortan |
| Líneas | `/sistema/main/lineas` | ❌ | ❌ | ✅ | Igual que Teléfonos; tabla ancha con 6 columnas |
| Pizarras | `/sistema/main/pizarras` | ❌ | ❌ | ✅ | Igual que Teléfonos |
| Trabajadores | `/sistema/operarios` | ❌ | ❌ | ✅ | Tabla `overflow-x-auto`; header y acciones no responsivas |
| Usuarios/Roles/Permisos | `/admin/*` | ❌ | ❌ | ✅ | Tabla con selección múltiple; header con barra de selección no se apila; `whitespace-nowrap` |
| Estadísticas | `/sistema/stats` | ⚠️ | ✅ | ✅ | Gráficos pueden desbordar en móvil muy estrecho |
| Materiales | `/sistema/main/materiales` | ❌ | ❌ | ✅ | Tabla `overflow-x-auto`; filtros en `flex flex-wrap` pueden apretarse |
| Asignación | `/sistema/main/asignacion` | ❌ | ❌ | ✅ | Tabla ancha; modales no tienen `max-w` móvil |
| Nomencladores (ej. Clasificación) | `/sistema/main/nomencladores/*` | ❌ | ❌ | ✅ | Todas las tablas de nomenclador usan patrón idéntico sin fallback móvil |

---

## Hallazgos Detallados por Categoría

### 1. Tablas de datos (Crítico, afecta 10 páginas)

Todas las tablas (`*Table.tsx`) usan el mismo patrón:

```jsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    ...
    <td className="px-6 py-4 whitespace-nowrap">...</td>
  </table>
</div>
```

**Problema:** En 375px, `overflow-x-auto` permite scroll horizontal pero las columnas `whitespace-nowrap` hacen que el contenido sea ilegible. No hay vista alternativa de tarjetas.

**Solución:** Crear `components/ui/Table.tsx` con colapso a vista de tarjetas (`hidden md:table` / `md:hidden`) aplicado una sola vez.

### 2. Grids sin breakpoint `sm:` (Medio, afecta Dashboard)

Dashboard usa `grid-cols-1 lg:grid-cols-2` en la segunda sección, saltando `sm:`. En tablet (768px) las tarjetas quedan muy estrechas.

### 3. Headers de página (Medio, afecta Quejas, Usuarios, Materiales)

Headers con `flex justify-between` no se apilan en móvil; título y botón "Nuevo" compiten por espacio.

### 4. Modales (Medio, afecta todas las páginas CRUD)

Los modales (`*Modal.tsx`) no tienen `max-w-xs sm:max-w-md` ni `p-4 sm:p-6`, quedando con márgenes excesivos en móvil.

### 5. Botones de acción en tablas (Crítico, afecta todas las tablas)

Los grupos de botones usan `whitespace-nowrap` y `flex space-x-2`, forzando ancho mínimo grande en móvil.

---

## Plan de Corrección por Lotes

### Lote 1 (Prioridad Alta) — Login, Dashboard, Quejas

1. **LoginPage/LoginForm:** Añadir `px-4 sm:px-0` al contenedor, asegurar inputs full-width en móvil.
2. **DashboardPage:** Añadir `sm:` al segundo grid; asegurar tarjetas de stats apiladas en móvil.
3. **QuejaPage/QuejaTable:** Reemplazar tabla por `ui/Table` con vista de tarjetas en móvil; apilar header acciones.

### Lote 2 (Prioridad Media) — Teléfonos, Líneas, Pizarras, Trabajadores

4. Todas las `*Table.tsx` de nomencladores: migrar a `ui/Table` con colapso responsive.

### Lote 3 (Prioridad Media) — Admin, Materiales, Asignación, Estadísticas

5. `UsuariosTable`, `RolesTable`, `PermisosTable`: migrar a `ui/Table`.
6. `MaterialesTable`, `AsignacionTable`, `StatsPage`: ajustes de grid y contenedor.

### Lote 4 (Componente Común)

7. Crear `components/ui/Table.tsx` con patrón `hidden md:table` + `md:hidden` cards.

---

## Criterio de Aceptación

- [ ] Las 3 vistas objetivo (Login, Dashboard, Quejas) usables en móvil (375px) sin scroll horizontal.
- [ ] `components/ui/Table.tsx` creado con colapso a tarjetas en móvil.
- [ ] Al menos 6 tablas de nomencladores migradas al componente común.
- [ ] `docs/audit-responsive.md` entregado con tabla de hallazgos.
- [ ] Evidencia de screenshots en `docs/memory/` (pendiente de ejecución visual).
