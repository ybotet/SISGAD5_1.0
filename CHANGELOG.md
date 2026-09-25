# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-20

### Added
- **Auth Module**: JWT-based authentication with access/refresh token rotation
- **Users Module**: CRUD for usuarios with RBAC (5 roles: admin, probador, editor, visor, admin_materiales)
- **MP Module**: 
  - Gestión de Teléfonos (CRUD con clasificación de cliente)
  - Gestión de Líneas (CRUD)
  - Gestión de Pizarras (CRUD, mapeo de puertos, ubicación física)
  - Gestión de Quejas (registro, priorización automática, FSM de estados)
  - Gestión de Pruebas (registro con resultados y mediciones)
  - Gestión de Trabajos (órdenes, asignación, cierre con tiempo real)
- **Materials Module**:
  - Catálogo de Materiales (CRUD con categorías y unidades)
  - Asignaciones (transaccional, captura de precio momento)
  - Consumos (transaccional, captura de precio real)
  - Dashboard analítico con KPIs y saldo lógico
- **API Gateway**: Rutas agrupadas, health checks agregados
- **Frontend**: Dashboard principal, módulos de quejas y materiales

### Changed
- Migración de sistema monolítico Access → arquitectura de microservicios
- Separación de bases de datos por servicio (bd_users, bd_mp, bd_materiales)

### Fixed
- Control de concurrencia en operaciones de stock (lock distribuido con Redis)

### Security
- JWT con expiración corta (15 min access, 7 días refresh)
- Rate limiting por IP y usuario

---

## [0.3.0] - 2025-08-25

### Added
- Workers de Telegram para notificaciones de stock bajo
- Dashboard de materiales en frontend
- Endpoint de estadísticas MP

### Changed
- Refactorización de servicios de materiales a Go (backend-materiales-go)
- Implementación de concurrencia con goroutines para validación de stock

---

## [0.2.0] - 2025-07-15

### Added
- FSM para estados de queja
- Registro de pruebas técnicas
- Dashboard de KPIs

### Changed
- Separación del módulo de materiales como microservicio independiente

---

## [0.1.0] - 2025-06-01

### Added
- Estructura base de microservicios
- Auth Service (Node.js + Express + Sequelize)
- MP Service (Node.js + Express + Sequelize)
- Docker Compose para desarrollo

---

## Formato del Changelog

| Símbolo | Tipo de Cambio |
|---------|----------------|
| 📈 | Feature nueva |
| 🐛 | Bug fix |
| ⚡ | Mejora de performance |
| 🔒 | Seguridad |
| 📚 | Documentación |
| 🎨 | Estética / UI |
| ♻️ | Refactor |
| 🗑️ | Deprecación / remoción |
| 🚀 | Deploy / CI-CD |
| ✅ | Test |
| ⚠️ | Nota importante |

---

## Estado de Reglas de Negocio por Versión

| Versión | Reglas cubiertas |
|---------|-----------------|
| v1.0.0 | BR-01 ✅, BR-02 ✅, BR-03 ✅, BR-04 ✅, BR-05 ✅, BR-06 ✅, BR-07 ✅, BR-08 ⚠️, BR-09 ✅, BR-10 ✅, BR-11 ⚠️, BR-12 ✅ |
| v0.3.0 | BR-03 ✅, BR-04 ✅, BR-07 ✅, BR-08 ⚠️, BR-09 ⚠️ |
| v0.2.0 | BR-03 ✅, BR-04 ✅ |
| v0.1.0 | BR-01 ✅ |

---

## Referencias

- [TASKLIST.md](./TASKLIST.md)
- [SPEC.md](./SPEC.md)
- [Tesis - Testing](../docs/thesis/05_results.md)
