# ADR 0001 — Estado global: Zustand (no Context ampliado)

- **Estado:** Aceptado
- **Fecha:** 2026-11-10
- **Decisor:** frontend-dev (TASK-700-04)
- **Contexto:** Ver TASK-700-04 + PROMPTS 1.2.

## Contexto

El frontend SISGAD5 usa React Context API para dos responsabilidades:

- `contexts/AuthContext.tsx` — autenticación (ativo, service-backed, con RBAC).
- `contexts/ErrorContext.tsx` — un único `error: string | null` + `handleApiError`.
  - No tiene cola de notificaciones, no está montado globalmente (`ErrorDisplay`
    comentado en `main.tsx`), y no puede representar múltiples toasts simultáneos.

No hay store de datos de dominio. Las necesidades actuales y cercanas son:

1. **Notificaciones/toasts** — reemplazar `alert()`/`ErrorDisplay` ad-hoc por una cola
   de toasts (TASK-720-04/05, PROMPTS 1.3).
2. **Caché de listas con paginación** — evitar requests duplicados al cambiar de página
   o volver a una pantalla (futuro, no big-bang).
3. **Auth** — ya funciona en Context; se desea un único patrón predecible.

## Decisión

**Usar Zustand como store global. No ampliar Context API.**

Zustand se elige por:

- **Tamaño:** ~3 KB, sin proveedor anidado. No toca el árbol de providers.
- **API minimalista:** `create((set) => ({ ... }))` + hook `useXStore()`.
- **Cola de toasts nativa:** un store con array `toasts` + `add/remove` resuelve el
  problema del Context actual (único string).
- **Compatibilidad hook:** los consumidores existentes no necesitan cambia de
  proveedor si se hace un wrapper compatible.
- **Sin romper la arquitectura:** no añade dependencias pesadas (no Redux/Recoil/MobX).

## Migación (prohibido big-bang)

| Fase | Qué | Cómo | Riesgo |
|------|-----|------|--------|
| 1 (ahora) | Notificaciones | Crear `src/store/useNotificationStore.ts` (Zustand) + `src/utils/notify.ts`. Montar `<Toaster/>` en `App.tsx`. | Bajo — nueva funcionalidad, nada consume aún. |
| 2 (futuro) | Auth | Crear `src/store/useAuthStore.ts` como **wrapper hook-compatible** que re-exporta `useAuth` de `AuthContext`. Los consumidores no cambian. | Cero — solo una indirección. |
| 3 (futuro) | Auth (real) | Mover el estado de `AuthContext` a `useAuthStore` (Zustand) y dejar `AuthContext` como shim. | Medio — requiere tests de login. |

## Consecuencias

- ✅ Un único patrón de estado global documentado (Zustand) para notificaciones.
- ✅ `ErrorContext` se mantiene intacto (no se toca) hasta la Fase 2/3.
- ✅ `useAuth.ts` (hook muerto, QA-03) **no se toca** — se elimina en TASK separado.
- ⏳ La caché de listas con paginación se añade cuando haya dolor real.
- ⚠️ Zustand no provee `Suspense`/`useSyncExternalStore` para libs externas; si se
  necesita, se evalúa `zustand` + `persist` middleware más adelante.

## Criterio de aceptación

- `npm i zustand` en `frontend/package.json`.
- `src/store/useNotificationStore.ts` exporta `useNotificationStore` con cola de toasts.
- `npm run build` verde.
- Cero regresiones visuales (login, sidebar, tabs funcionan igual).