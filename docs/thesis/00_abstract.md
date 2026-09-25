# Tesis - Abstract

> **Título:** SISGAD5 - Sistema de Gestión Integral de Diagnóstico 5ª Generación  
> **Autor:** Equipo de Desarrollo SISGAD5  
> **Fecha:** Septiembre 2026  
> **Versión:** 1.0

---

## Resumen

SISGAD5 es un sistema integral de gestión de incidencias y mantenimiento de infraestructura de telecomunicaciones, diseñado específicamente para operadores de red. Desarrollado en Go (Golang) con arquitectura de microservicios, el sistema digitaliza y optimiza todo el ciclo de vida de las quejas, desde su reporte hasta su resolución.

El sistema gestiona cuatro dominios principales: autenticación de usuarios y autorización basada en roles; infraestructura de telecomunicaciones (teléfonos, líneas, pizarras y puertos); ciclo de vida de quejas con pruebas y órdenes de trabajo; y gestión de materiales con control de stock, asignaciones y consumos. Cada dominio está implementado como un microservicio independiente, comunicándose mediante APIs RESTful con autenticación JWT.

SISGAD5 incorpora concurrencia nativa de Go para operaciones críticas como la validación de stock simultáneo, garantizando consistencia transaccional bajo alta concurrencia. El cálculo de prioridades de quejas se realiza de forma determinista basado en pesos configurables por tipo de queja, servicio, ubicación y antigüedad del reporte.

El sistema está desplegado mediante Docker en entornos de producción, con monitoreo vía Prometheus/Grafana, logging vía Loki/Promtail, y pruebas automatizadas con Go testing, Testcontainers y pruebas de integración.

---

## Abstract (English)

SISGAD5 is a comprehensive incident management and infrastructure maintenance system for telecommunications operators, built in Go (Golang) with a microservices architecture. The system digitizes and optimizes the complete lifecycle of incidents from reporting to resolution.

The system manages four main domains: user authentication and role-based authorization; telecommunications infrastructure (phones, lines, distribution frames, and ports); incident lifecycle with tests and work orders; and materials management with stock control, assignments, and consumption tracking. Each domain is implemented as an independent microservice communicating via RESTful APIs with JWT authentication.

SISGAD5 leverages Go's native concurrency for critical operations such as simultaneous stock validation, ensuring transactional consistency under high concurrency. Incident priority calculation is deterministic, based on configurable weights for incident type, service, location, and report age.

The system is deployed via Docker in production environments, with monitoring via Prometheus/Grafana, logging via Loki/Promtail, and automated testing using Go testing and Testcontainers.

---

## Palabras Clave
- Go (Golang)
- Microservicios
- DDD (Domain-Driven Design)
- Event Storming
- DDD
- JWT Authentication
- Docker
- Kubernetes
- Prometheus
- Grafana
- PostgreSQL
- Redis