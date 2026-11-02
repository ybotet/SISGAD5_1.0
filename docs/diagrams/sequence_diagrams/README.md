# Diagramas de Secuencia — SISGAD5 (canon único)

> **Estado:** ✅ Documento canónico v2.0 (fusionado el 2026-11-02)
> **Contenido:** 7 escenarios UML de secuencia con diagramas Mermaid + tablas de mensajes

Este directorio contiene el **único** conjunto de diagramas de secuencia del proyecto.

## Escenarios incluidos en [`sequence_diagrams.md`](sequence_diagrams.md)

| # | Escenario | Tipo | Cobertura |
|---|-----------|------|-----------|
| 1 | Flujo completo de queja (Abierta → Cerrada) | Crítico | Operador, Técnico, Jefe, MP, Materials |
| 2 | Login y autenticación JWT (+ refresh rotativo) | Crítico | Gateway, Users, bd_users, Redis |
| 3 | Acceso a recurso protegido (claims `x-user-*`) | Crítico | Gateway, MP Service |
| 4 | Asignación de materiales con validación de stock | Crítico | Materials, locks Redis, transacción ACID |
| 5 | Consumo de materiales (validación consumo ≤ asignación) | Crítico | Materials, MP |
| 6 | Cierre de queja con saga orquestada + compensación | Crítico | MP Saga, Materials, rollback |
| 7 | Predicción de demanda de materiales | Complementario | Prediction Service |

## Convenciones

- Cada escenario tiene: **diagrama Mermaid** (render nativo en GitHub) + **tabla de mensajes**.
- Los endpoints reflejan las rutas reales implementadas (`/api/mp/*`, `/api/auth/*`, `/api/materials/*`).
- Al editar un escenario, actualizar también su tabla de mensajes.

## Referencias cruzadas

Los documentos temáticos (`docs/03_use_cases.es.md`, `docs/07_domain_model.es.md`, `docs/09_state_machines.es.md`, `docs/13_security.es.md` y sus versiones `.ru.md`) enlazan a este archivo como fuente única.
