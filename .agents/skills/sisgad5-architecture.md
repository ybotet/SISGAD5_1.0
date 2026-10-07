---
name: sisgad5-architecture
description: Arquitectura específica del proyecto SISGAD5. Cárgalo siempre que audites o trabajes en este repositorio.
---

# Arquitectura de SISGAD5

## Contexto
Sistema de gestión de quejas y servicios de telecomunicaciones. Proyecto de Maestría en Programación Industrial (RTU MIREA).

## Estructura de Microservicios
| Servicio | Puerto | Tecnología | Responsabilidad |
|---|---|---|---|
| API Gateway | 5000 | Node.js + Express | Enrutamiento, auth centralizada, rate-limiting |
| Users Service | 5001 | Node.js + Express + Sequelize | Autenticación, usuarios, roles, permisos |
| MP Service | 5002 | Node.js + Express + Sequelize + Zod | Quejas, pruebas, trabajos, cables, líneas |
| Materials Service | 5003 | Go + Gin | Inventario, entregas, asignación de materiales |
| Frontend | 5004 | React + Vite + TypeScript + Tailwind | Interfaz de usuario, dashboards |

## Bases de Datos
- `bd_users` → Users Service
- `bd_mp` → MP Service
- `bd_materiales` → Materials Service
- PostgreSQL 17+ con extensiones `pg_stat_statements` y `uuid-ossp`.

## Estructura de Carpetas
SISGAD5_1.0/
├── api-gateway/ # API Gateway (Node.js)
├── backend-mp/ # MP Service (Node.js)
├── backend-users/ # Users Service (Node.js)
├── backend-materiales-go/ # Materials Service (Go)
├── frontend/ # React + Vite
├── docs/ # Documentación
├── monitoring/ # Configuración de monitoreo
└── scripts/ # Scripts de utilidad


## Roles RBAC
- `admin`: Acceso total
- `probador`: Crear quejas, realizar pruebas
- `editor`: Editar quejas y trabajos
- `visor`: Solo lectura
- `admin_materiales`: Gestión de inventario

## Flujo de Estados de Queja
`Abierta` → `Probada` → `Asignada` → `Pendiente` → `Resuelta` → `Cerrada`

## Archivos de Contexto Existentes
- `AGENT.md`: Instrucciones generales para agentes.
- `ARCHITECTURE.md`: Documentación de arquitectura.
- `SPEC.md`: Especificación funcional.
- `TASKLIST.md`: Lista de tareas pendientes.
- `ESTRUCTURA.md`: Descripción de la estructura del proyecto.