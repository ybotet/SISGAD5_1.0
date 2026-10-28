---
name: code-audit-methodology
description: Metodología general para auditar cualquier proyecto de software. Úsalo como guía estructurada para el análisis.
---

# Metodología de Auditoría de Código

## Fases de la Auditoría

### Fase 1: Reconocimiento
- Identifica el **stack tecnológico** (lenguajes, frameworks, bases de datos).
- Mapea la **estructura de carpetas** y los módulos principales.
- Localiza los **puntos de entrada** (API Gateway, main.go, server.js, etc.).
- Revisa la **documentación existente** (README, ARCHITECTURE.md, SPEC.md).

### Fase 2: Análisis por Capas
Analiza el proyecto capa por capa, de arriba hacia abajo:
1. **Capa de presentación:** Frontend, interfaces de usuario, accesibilidad.
2. **Capa de API:** Contratos de endpoints, validación de entrada, manejo de errores.
3. **Capa de lógica de negocio:** Servicios, controladores, reglas de negocio.
4. **Capa de datos:** Modelos, consultas, migraciones, integridad referencial.
5. **Capa de infraestructura:** Configuración, despliegue, logs, monitoreo.

### Fase 3: Áreas Transversales
Revisa estas áreas en **todo** el proyecto:
- **Seguridad:** Autenticación, autorización, validación de entrada, secretos.
- **Manejo de errores:** Consistencia, logging, propagación de errores.
- **Calidad de código:** Duplicación, complejidad, acoplamiento.
- **Rendimiento:** Consultas N+1, caché, operaciones costosas.
- **Pruebas:** Cobertura, tipos de pruebas, calidad de las aserciones.

### Fase 4: Priorización
Clasifica cada hallazgo:
- **Crítico:** Riesgo de seguridad explotable, pérdida de datos, caída del sistema.
- **Alto:** Deuda técnica significativa, bugs probables en producción.
- **Medio:** Mejoras de mantenibilidad, optimizaciones no urgentes.
- **Bajo:** Estilo, documentación, mejoras opcionales.

## Principios de la Auditoría
- **Evidencia sobre opinión.** Cada hallazgo debe referenciar código concreto.
- **Contexto importa.** Un patrón puede ser aceptable en un prototipo y crítico en producción.
- **Accionable.** Cada hallazgo debe sugerir un curso de acción claro.