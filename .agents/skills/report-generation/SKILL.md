---
name: report-generation
description: Estructura y formato para generar informes de auditoría claros y accionables.
---

# Generación de Informes de Auditoría

## Estructura del Informe

Genera un archivo `AUDITORIA.md` en la raíz del proyecto con esta estructura:

### 1. Resumen Ejecutivo
- **Proyecto auditado:** [nombre]
- **Fecha:** [fecha]
- **Alcance:** [qué se auditó y qué no]
- **Veredicto general:** [estado del proyecto en 2-3 frases]

### 2. Estadísticas
- Total de hallazgos por severidad (Crítico / Alto / Medio / Bajo).
- Módulos o carpetas con más hallazgos.

### 3. Hallazgos por Área
Para cada área auditada (seguridad, arquitectura, calidad, etc.):

#### [Área]
| ID | Severidad | Descripción | Ubicación | Recomendación |
|----|-----------|-------------|-----------|---------------|
| SEC-01 | Crítico | JWT_SECRET hardcodeado | `backend-users/src/config/env.js:12` | Mover a variable de entorno |
| SEC-02 | Alto | Sin validación de rol en endpoint | `backend-mp/src/routes/queja.js:45` | Añadir middleware de RBAC |

### 4. Recomendaciones Priorizadas
Lista ordenada de acciones, de mayor a menor impacto:
1. [Acción crítica]
2. [Acción alta]
3. ...

### 5. Anexos (opcional)
- Diagramas de arquitectura detectados.
- Lista de dependencias desactualizadas.
- Enlaces a documentación relevante.

## Formato
- Usa Markdown válido.
- Incluye rutas de archivo y números de línea.
- Sé conciso pero completo.
- No incluyas opiniones sin evidencia en el código.