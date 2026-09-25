# Tesis - Introducción

## 1.1. Problema de Negocio

Los operadores de telecomunicaciones enfrentan desafíos significativos en la gestión de incidencias de red: la falta de un sistema integrado para registrar, clasificar, priorizar y resolver quejas de manera eficiente. Los procesos tradicionales suelen ser manuales, propenso a errores y carecen de trazabilidad completa.

**Problemas identificados:**
- Registro manual de quejas en libretas o archivos dispersos
- Dificultad para localizar rápidamente información de infraestructura
- Stock de materiales mal controlado (sobre-stock y faltantes)
- Falta de trazabilidad en movimientos y consumos de materiales
- Priorización subjetiva de quejas críticas
- Dificultad para medir KPIs operativos (tiempo de cierre, eficiencia técnica)

## 1.2. Objetivo

Desarrollar un sistema digital que permita:

1. **Digitalizar el ciclo de vida de quejas** desde el reporte hasta el cierre
2. **Gestionar infraestructura** (teléfonos, líneas, pizarras) de forma estructurada
3. **Controlar materiales** con asignación, consumo y stock lógico
4. **Proveer autenticación y autorización** basadas en roles
5. **Proveer dashboards analíticos** para la toma de decisiones

## 1.3. Alcance

### Incluido (In Scope)
- Microservicio de usuarios y autenticación
- Microservicio de infraestructura MP (teléfonos, líneas, pizarras)
- Microservicio de materiales (catálogo, asignaciones, consumos)
- API Gateway con rutas agrupadas
- Monitoreo con Prometheus/Grafana
- Logging con Loki/Promtail
- Tests unitarios, de integración y E2E
- Despliegue con Docker

### No Incluido (Out of Scope)
- Facturación y cobro
- SMS gateway para notificaciones
- Chatbot de soporte N1
- App móvil nativa (se usa web responsiva)
- API pública externa
- Multi-tenancy (para futuras versiones)

## 1.4. Arquitectura del Documento

Este documento está organizado de la siguiente manera:
- **Capítulo 1:** Introducción (este documento)
- **Capítulo 2:** Fundamentos teóricos
- **Capítulo 3:** Diseño del sistema
- **Capítulo 4:** Implementación
- **Capítulo 5:** Pruebas y validación
- **Capítulo 6:** Resultados y conclusiones
- **Capítulo 7:** Lecciones aprendidas
- **Capítulo 8:** Apéndices

## 1.5. Glosario de Acrónimos

| Acrónimo | Definición |
|----------|------------|
| SISGAD5 | Sistema de Gestión de Diagnóstico 5ª Generación |
| API | Interfaz de Programación de Aplicaciones |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| DDD | Domain-Driven Design |
| REST | Representational State Transfer |
| HTTP | Hypertext Transfer Protocol |
| CRUD | Create, Read, Update, Delete |
| KPI | Key Performance Indicator |
| CI/CD | Continuous Integration / Continuous Deployment |
| TDD | Test-Driven Development |
| E2E | End-to-End Testing |

## 1.6. Referencias

- [User Story Map](../practices/practice_02_user_story_map.md)
- [Evento Storming](../practices/practice_03_event_storming.md)
- [UML Estático](../practices/practice_05_uml_static.md)