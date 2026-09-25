# Introducción y Contexto - SISGAD5

> **Versión:** 1.0  
> **Fecha:** 2026-09-25

---

## 1. Visión General

**SISGAD5** (Sistema de Información para la Gestión y Soporte de la Dirección No. 5) es una plataforma integral desarrollada como tesis de maestría en la **RTU MIREA** (Universidad Técnica Estatal de Rusia - MIREA) por el **Ing. Yaisel Botet S.Y.**

El sistema gestiona los procesos de telecomunicaciones de la Dirección No. 5, cubriendo:
- Gestión de teléfonos, líneas y pizarras
- Registro y seguimiento de quejas
- Pruebas técnicas y órdenes de trabajo
- Gestión de materiales y consumos
- Estadísticas y dashboards operativos

---

## 2. Contexto Organizacional

La **Dirección No. 5** es una unidad organizativa responsable de la infraestructura de telecomunicaciones. El sistema reemplaza procesos manuales y hojas de cálculo por una solución digital integrada.

### Actores Principales
- **Administrador del Sistema** - Configuración y gestión de usuarios
- **Técnico de Campo** - Ejecución de pruebas y trabajos
- **Operador de Mesa de Ayuda** - Registro y clasificación de quejas
- **Jefe de Departamento** - Supervisión y reportes
- **Analista de Materiales** - Gestión de inventario y consumos
- **Director** - Visión estratégica y KPIs
- **Auditor** - Trazabilidad y cumplimiento

---

## 3. Alcance del Sistema

### Módulos Funcionales
| Módulo | Descripción | Servicio |
|--------|-------------|----------|
| Autenticación | Login, registro, JWT, refresh tokens | Users Service |
| Usuarios y Roles | CRUD usuarios, RBAC, permisos | Users Service |
| Teléfonos | CRUD, estados, historial | MP Service |
| Líneas | CRUD, estados, historial | MP Service |
| Pizarras | CRUD, puertos, conexiones, ubicación | MP Service |
| Quejas | Registro, flujo de estados, asignación, auditoría | MP Service |
| Pruebas | Registro, resultados, vinculación | MP Service |
| Trabajos | Órdenes, asignación, tiempos, cierre | MP Service |
| Materiales | Catálogo, categorías, unidades | Materials Service |
| Asignaciones | Múltiples ítems, precio momento, stock | Materials Service |
| Consumos | Registro, validación vs asignación | Materials Service |
| Dashboard | KPIs, distribución, alertas, exportación | Materials Service |

---

## 4. Arquitectura Técnica

### Estilo Arquitectónico
- **Microservicios** con API Gateway
- **Comunicación síncrona** REST/JSON
- **Base de datos por servicio** (3 instancias PostgreSQL)
- **Autenticación centralizada** JWT con refresh tokens

### Stack Tecnológico
| Capa | Tecnología |
|------|------------|
| API Gateway | Node.js + Express |
| Users Service | Node.js + Express + Sequelize |
| MP Service | Node.js + Express + Sequelize + Zod |
| Materials Service | Go + Gin + GORM |
| Frontend | React 18 + Vite + TypeScript + Tailwind |
| Base de Datos | PostgreSQL 15+ |
| Contenerización | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Monitoreo | Prometheus + Grafana + Loki |

---

## 5. Repositorios

| Repositorio | URL | Estado |
|-------------|-----|--------|
| Implementación (monorepo) | https://github.com/ybotet/SISGAD5_1.0 | ✅ Activo |
| Documentación (archivado) | https://github.com/ybotet/SISGAD5_doc | 📦 Archivado |

> **Nota:** El contenido de `SISGAD5_doc` ha sido migrado a `docs/practices/` y `docs/diagrams/` en este repositorio.

---

## 6. Documentación Relacionada

- [Actores del Sistema](02_actors.md)
- [Casos de Uso](03_use_cases.md)
- [Arquitectura Técnica](../ARCHITECTURE.md)
- [Especificación Completa](../SPEC.md)
- [Lista de Tareas](../TASKLIST.md)