# Práctica 01 - Project Card (Tarjeta del Proyecto)

> **Disciplina:** Ingeniería de Software / Arquitectura de Información  
> **Fecha:** 2026-09-25  
> **Autor:** Ing. Botet S.Y. (Tesis de Maestría - RTU MIREA)

---

## 1. Identificación del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | SISGAD5 - Sistema de Información para la Gestión y Soporte de la Dirección No. 5 |
| **Cliente** | Dirección No. 5 (ETECSA) |
| **Proveedor** | Ing. Botet S.Y. (Tesis Maestría - RTU MIREA) |
| **Tipo** | Sistema de Información Empresarial |
| **Contexto** | Modernización de procesos de gestión de telecomunicaciones |

---

## 2. Resumen Ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Gestión manual de quejas, trabajos, pruebas y materiales en la Dirección No. 5 usando hojas de cálculo y procesos paper-based |
| **Solución** | Plataforma digital con microservicios para automatizar todo el ciclo de vida de telecomunicaciones |
| **Objetivo** | Centralizar la información, reducir tiempos de respuesta, mejorar trazabilidad y generar KPIs confiables |
| **Ámbito** | Dirección No. 5, ETEM, infraestructura de telecomunicaciones |
| **Usuarios** | 7 actores: Admin, Técnico, Operador, Jefe, Analista, Director, Auditor |

---

## 3. Objetivos

### 3.1 Objetivo General
Desarrollar un sistema integral que digitalice y automatice los procesos de gestión, soporte y análisis de la infraestructura de telecomunicaciones de la Dirección No. 5, permitiendo una operación eficiente, trazable y basada en datos.

### 3.2 Objetivos Específicos
| N° | Objetivo | Métrica |
|----|----------|---------|
| 1 | Digitalizar el registro de quejas | 100% de quejas en sistema |
| 2 | Automatizar flujo de estados | 100% del flujo soportado por FSM |
| 3 | Gestionar inventario de materiales | Asignación y consumo por trabajador |
| 4 | Generar KPIs en tiempo real | Dashboard actualizado cada 5 min |
| 5 | Auditar todas las acciones | Log inmutable de eventos críticos |
| 6 | Controlar acceso por roles | RBAC con 7 roles definidos |
| 7 | Proveer análisis predictivo | Tendencias y alertas configurables |

---

## 4. Alcance

### 4.1 Incluye
- ✅ Autenticación y autorización (JWT + RBAC)
- ✅ Gestión de teléfonos, líneas y pizarras
- ✅ Registro y seguimiento de quejas (24 casos de uso)
- ✅ Gestión de órdenes de trabajo
- ✅ Registro de pruebas técnicas
- ✅ Catálogo de materiales (categorías, unidades)
- ✅ Asignación y consumo de materiales (transacciones ACID)
- ✅ Dashboards y estadísticas
- ✅ Reportes exportables (CSV, PDF)
- ✅ Auditoría completa de acciones
- ✅ Monitoreo y alertas
- ✅ API Gateway con rate limiting

### 4.2 No Incluye
- ❌ Integración con sistemas externos (ERP, CRM) - Futuro
- ❌ SMS/WhatsApp para notificaciones - Futuro
- ❌ IA para diagnóstico automático - Futuro
- ❌ Multi-tenancy para otras direcciones - Futuro

---

## 5. Stakeholders

| Rol | Nombre | Responsabilidad |
|-----|--------|-----------------|
| **Patrocinador** | Dirección No. 5 | Aprobación, requisitos, presupuesto |
| **Product Owner** | Ing. Botet | Prioridades, validación, backlog |
| **Arquitecto** | Ing. Botet | Diseño, decisiones técnicas |
| **Lead Developer** | - | Implementación, code review |
| **DevOps** | - | Infraestructura, CI/CD, monitoreo |
| **QA** | - | Testing, calidad |
| **Usuarios Finales** | Técnicos, Operadores, Jefes | Validación funcional |

---

## 6. Supuestos

1. La infraestructura de red (fibra, centrales) es proporcionada por ETECSA
2. Los datos históricos de quejas están disponibles para migración
3. Los usuarios tienen capacitación básica en herramientas digitales
4. El acceso a internet es confiable dentro de las oficinas
5. Las bases de datos PostgreSQL son mantenidas por el equipo de infraestructura
6. Las direcciones IP corporativas están dentro de la red interna

---

## 7. Restricciones

| Tipo | Restricción |
|------|-------------|
| **Técnica** | PostgreSQL 15+ (no otra BD) |
| **Técnica** | Microservicios (no monolito) |
| **Técnica** | Docker + Docker Compose (producción: Kubernetes) |
| **Técnica** | Auth por JWT RS256 |
| **Legal** | Uso académico - RTU MIREA |
| **Legal** | Datos personales protegidos (Ley de Protección de Datos) |
| **Organizacional** | Sin internet público (intranet) |
| **Organizacional** | Horario laboral para soporte (8h-18h, L-V) |

---

## 8. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Adopción por usuarios | Media | Alto | Capacitación + UI intuitiva |
| Latencia red corporativa | Baja | Medio | Testing de carga con datos reales |
| Falta recursos dev | Media | Alto | Priorizar backlog, MVP |
| Cambios en requisitos | Media | Medio | Reuniones semanales con PO |
| Seguridad datos | Alta | Crítico | RBAC + cifrado + auditoría |

---

## 9. Métricas de Éxito

| Métrica | Baseline | Objetivo |
|---------|----------|----------|
| Tiempo registro queja | 30 min (manual) | < 2 min (digital) |
| Tiempo resolución queja | 72 horas | < 48 horas |
| Precisión inventario | 60% | 95% |
| Cobertura tests | 0% | ≥ 70% |
| Uptime sistema | N/A | 99.9% |
| Satisfacción usuarios | N/A | > 4.0/5 |

---

## 10. Referencias

- [User Story Map](practice_02_user_story_map.md)
- [Event Storming](practice_03_event_storming.md)
- [Requisitos](../05_requirements.md)
- [Roadmap](../17_roadmap.md)