# 🔄 Plan de Migración: backend-mp (de capas a features)

> **Objetivo:** Reorganizar `backend-mp/src/` de estructura por capas a estructura por features.
> **Estrategia:** Por lotes de 5 entidades. Un commit por lote. Tests después de cada lote.

---

## Mapeo de archivos

| Archivo actual                                     | Nueva ubicación                                                        | Lote |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ---- |
| `src/controllers/AsignacionController.js`          | `src/features/asignacion/asignacion.controller.js`                     | 1    |
| `src/routes/asignacion.js`                         | `src/features/asignacion/asignacion.routes.js`                         | 1    |
| `src/models/Asignacion.js`                         | `src/features/asignacion/asignacion.model.js`                          | 1    |
| `src/validations/asignacion.schemas.js`            | `src/features/asignacion/asignacion.validation.js`                     | 1    |
| `src/models/AsignacionTrabajadores.js`             | `src/features/asignacion/asignacion_trabajadores.model.js`             | 1    |
| `src/controllers/CableController.js`               | `src/features/cable/cable.controller.js`                               | 1    |
| `src/routes/cable.js`                              | `src/features/cable/cable.routes.js`                                   | 1    |
| `src/models/Cable.js`                              | `src/features/cable/cable.model.js`                                    | 1    |
| `src/validations/cable.schemas.js`                 | `src/features/cable/cable.validation.js`                               | 1    |
| `src/controllers/ClaveController.js`               | `src/features/clave/clave.controller.js`                               | 1    |
| `src/routes/clave.js`                              | `src/features/clave/clave.routes.js`                                   | 1    |
| `src/models/Clave.js`                              | `src/features/clave/clave.model.js`                                    | 1    |
| `src/validations/clave.schemas.js`                 | `src/features/clave/clave.validation.js`                               | 1    |
| `src/controllers/ClasificacionController.js`       | `src/features/clasificacion/clasificacion.controller.js`               | 2    |
| `src/routes/clasificacion.js`                      | `src/features/clasificacion/clasificacion.routes.js`                   | 2    |
| `src/models/Clasificacion.js`                      | `src/features/clasificacion/clasificacion.model.js`                    | 2    |
| `src/validations/clasificacion.schemas.js`         | `src/features/clasificacion/clasificacion.validation.js`               | 2    |
| `src/controllers/ClasificadorclaveController.js`   | `src/features/clasificadorclave/clasificadorclave.controller.js`       | 2    |
| `src/routes/clasificadorclave.js`                  | `src/features/clasificadorclave/clasificadorclave.routes.js`           | 2    |
| `src/models/Clasificadorclave.js`                  | `src/features/clasificadorclave/clasificadorclave.model.js`            | 2    |
| `src/validations/clasificadorclave.schemas.js`     | `src/features/clasificadorclave/clasificadorclave.validation.js`       | 2    |
| `src/controllers/ClasifpizarraController.js`       | `src/features/clasifpizarra/clasifpizarra.controller.js`               | 2    |
| `src/routes/clasifpizarra.js`                      | `src/features/clasifpizarra/clasifpizarra.routes.js`                   | 2    |
| `src/models/Clasifpizarra.js`                      | `src/features/clasifpizarra/clasifpizarra.model.js`                    | 2    |
| `src/validations/clasifpizarra.schemas.js`         | `src/features/clasifpizarra/clasifpizarra.validation.js`               | 2    |
| `src/controllers/GrupowController.js`              | `src/features/grup0w/grup0w.controller.js`                             | 3    |
| `src/routes/grupow.js`                             | `src/features/grup0w/grup0w.routes.js`                                 | 3    |
| `src/models/Grupow.js`                             | `src/features/grup0w/grup0w.model.js`                                  | 3    |
| `src/validations/grupow.schemas.js`                | `src/features/grup0w/grup0w.validation.js`                             | 3    |
| `src/controllers/LineaController.js`               | `src/features/linea/linea.controller.js`                               | 3    |
| `src/routes/linea.js`                              | `src/features/linea/linea.routes.js`                                   | 3    |
| `src/models/Linea.js`                              | `src/features/linea/linea.model.js`                                    | 3    |
| `src/validations/linea.schemas.js`                 | `src/features/linea/linea.validation.js`                               | 3    |
| `src/controllers/MandoController.js`               | `src/features/mando/mando.controller.js`                               | 3    |
| `src/routes/mando.js`                              | `src/features/mando/mando.routes.js`                                   | 3    |
| `src/models/Mando.js`                              | `src/features/mando/mando.model.js`                                    | 3    |
| `src/validations/mando.schemas.js`                 | `src/features/mando/mando.validation.js`                               | 3    |
| `src/controllers/MovimientoController.js`          | `src/features/movimiento/movimiento.controller.js`                     | 4    |
| `src/routes/movimiento.js`                         | `src/features/movimiento/movimiento.routes.js`                         | 4    |
| `src/models/Movimiento.js`                         | `src/features/movimiento/movimiento.model.js`                          | 4    |
| `src/validations/movimiento.schemas.js`            | `src/features/movimiento/movimiento.validation.js`                     | 4    |
| `src/controllers/PizarraController.js`             | `src/features/pizarra/pizarra.controller.js`                           | 4    |
| `src/routes/pizarra.js`                            | `src/features/pizarra/pizarra.routes.js`                               | 4    |
| `src/models/Pizarra.js`                            | `src/features/pizarra/pizarra.model.js`                                | 4    |
| `src/validations/pizarra.schemas.js`               | `src/features/pizarra/pizarra.validation.js`                           | 4    |
| `src/controllers/PlantaController.js`              | `src/features/planta/planta.controller.js`                             | 4    |
| `src/routes/planta.js`                             | `src/features/planta/planta.routes.js`                                 | 4    |
| `src/models/Planta.js`                             | `src/features/planta/planta.model.js`                                  | 4    |
| `src/validations/planta.schemas.js`                | `src/features/planta/planta.validation.js`                             | 4    |
| `src/controllers/PropietarioController.js`         | `src/features/propietario/propietario.controller.js`                   | 5    |
| `src/routes/propietario.js`                        | `src/features/propietario/propietario.routes.js`                       | 5    |
| `src/models/Propietario.js`                        | `src/features/propietario/propietario.model.js`                        | 5    |
| `src/validations/propietario.schemas.js`           | `src/features/propietario/propietario.validation.js`                   | 5    |
| `src/controllers/PruebaController.js`              | `src/features/prueba/prueba.controller.js`                             | 5    |
| `src/routes/prueba.js`                             | `src/features/prueba/prueba.routes.js`                                 | 5    |
| `src/models/Prueba.js`                             | `src/features/prueba/prueba.model.js`                                  | 5    |
| `src/validations/prueba.schemas.js`                | `src/features/prueba/prueba.validation.js`                             | 5    |
| `src/controllers/QuejaController.js`               | `src/features/queja/queja.controller.js`                               | 6    |
| `src/routes/queja.js`                              | `src/features/queja/queja.routes.js`                                   | 6    |
| `src/models/Queja.js`                              | `src/features/queja/queja.model.js`                                    | 6    |
| `src/validations/queja.schemas.js`                 | `src/features/queja/queja.validation.js`                               | 6    |
| `src/utils/quejaFlow.js`                           | `src/features/queja/queja.flow.js`                                     | 6    |
| `src/controllers/RecorridoController.js`           | `src/features/recorrido/recorrido.controller.js`                       | 6    |
| `src/routes/recorrido.js`                          | `src/features/recorrido/recorrido.routes.js`                           | 6    |
| `src/models/Recorrido.js`                          | `src/features/recorrido/recorrido.model.js`                            | 6    |
| `src/validations/recorrido.schemas.js`             | `src/features/recorrido/recorrido.validation.js`                       | 6    |
| `src/controllers/ResultadopruebaController.js`     | `src/features/resultadoprueba/resultadoprueba.controller.js`           | 7    |
| `src/routes/resultadoprueba.js`                    | `src/features/resultadoprueba/resultadoprueba.routes.js`               | 7    |
| `src/models/Resultadoprueba.js`                    | `src/features/resultadoprueba/resultadoprueba.model.js`                | 7    |
| `src/validations/resultadoprueba.schemas.js`       | `src/features/resultadoprueba/resultadoprueba.validation.js`           | 7    |
| `src/controllers/SenalizacionController.js`        | `src/features/senalizacion/senalizacion.controller.js`                 | 7    |
| `src/routes/senalizacion.js`                       | `src/features/senalizacion/senalizacion.routes.js`                     | 7    |
| `src/models/Senalizacion.js`                       | `src/features/senalizacion/senalizacion.model.js`                      | 7    |
| `src/validations/senalizacion.schemas.js`          | `src/features/senalizacion/senalizacion.validation.js`                 | 7    |
| `src/controllers/SistemaController.js`             | `src/features/sistema/sistema.controller.js`                           | 7    |
| `src/routes/sistema.js`                            | `src/features/sistema/sistema.routes.js`                               | 7    |
| `src/models/Sistema.js`                            | `src/features/sistema/sistema.model.js`                                | 7    |
| `src/validations/sistema.schemas.js`               | `src/features/sistema/sistema.validation.js`                           | 7    |
| `src/controllers/TelefonoController.js`            | `src/features/telefono/telefono.controller.js`                         | 8    |
| `src/routes/telefono.js`                           | `src/features/telefono/telefono.routes.js`                             | 8    |
| `src/models/Telefono.js`                           | `src/features/telefono/telefono.model.js`                              | 8    |
| `src/validations/telefono.schemas.js`              | `src/features/telefono/telefono.validation.js`                         | 8    |
| `src/controllers/TipolineaController.js`           | `src/features/tipolinea/tipolinea.controller.js`                       | 8    |
| `src/routes/tipolinea.js`                          | `src/features/tipolinea/tipolinea.routes.js`                           | 8    |
| `src/models/Tipolinea.js`                          | `src/features/tipolinea/tipolinea.model.js`                            | 8    |
| `src/validations/tipolinea.schemas.js`             | `src/features/tipolinea/tipolinea.validation.js`                       | 8    |
| `src/controllers/TipomovimientoController.js`      | `src/features/tipomovimiento/tipomovimiento.controller.js`             | 8    |
| `src/routes/tipomovimiento.js`                     | `src/features/tipomovimiento/tipomovimiento.routes.js`                 | 8    |
| `src/models/Tipomovimiento.js`                     | `src/features/tipomovimiento/tipomovimiento.model.js`                  | 8    |
| `src/validations/tipomovimiento.schemas.js`        | `src/features/tipomovimiento/tipomovimiento.validation.js`             | 8    |
| `src/controllers/TipopizarraController.js`         | `src/features/tipopizarra/tipopizarra.controller.js`                   | 9    |
| `src/routes/tipopizarra.js`                        | `src/features/tipopizarra/tipopizarra.routes.js`                       | 9    |
| `src/models/Tipopizarra.js`                        | `src/features/tipopizarra/tipopizarra.model.js`                        | 9    |
| `src/validations/tipopizarra.schemas.js`           | `src/features/tipopizarra/tipopizarra.validation.js`                   | 9    |
| `src/controllers/TipoquejaController.js`           | `src/features/tipoqueja/tipoqueja.controller.js`                       | 9    |
| `src/routes/tipoqueja.js`                          | `src/features/tipoqueja/tipoqueja.routes.js`                           | 9    |
| `src/models/Tipoqueja.js`                          | `src/features/tipoqueja/tipoqueja.model.js`                            | 9    |
| `src/validations/tipoqueja.schemas.js`             | `src/features/tipoqueja/tipoqueja.validation.js`                       | 9    |
| `src/controllers/TrabajadorController.js`          | `src/features/trabajador/trabajador.controller.js`                     | 9    |
| `src/routes/trabajador.js`                         | `src/features/trabajador/trabajador.routes.js`                         | 9    |
| `src/models/Trabajador.js`                         | `src/features/trabajador/trabajador.model.js`                          | 9    |
| `src/validations/trabajador.schemas.js`            | `src/features/trabajador/trabajador.validation.js`                     | 9    |
| `src/controllers/TrabajoController.js`             | `src/features/trabajo/trabajo.controller.js`                           | 10   |
| `src/routes/trabajo.js`                            | `src/features/trabajo/trabajo.routes.js`                               | 10   |
| `src/models/Trabajo.js`                            | `src/features/trabajo/trabajo.model.js`                                | 10   |
| `src/validations/trabajo.schemas.js`               | `src/features/trabajo/trabajo.validation.js`                           | 10   |
| `src/controllers/TrabajoTrabajadoresController.js` | `src/features/trabajo_trabajadores/trabajo_trabajadores.controller.js` | 10   |
| `src/routes/trabajoTrabajadores.js`                | `src/features/trabajo_trabajadores/trabajo_trabajadores.routes.js`     | 10   |
| `src/models/Trabajo_trabajadores.js`               | `src/features/trabajo_trabajadores/trabajo_trabajadores.model.js`      | 10   |
| `src/models/index.js`                              | `src/features/index.js`                                                | 10   |

### Archivos compartidos (mover a `shared/`)

| Archivo actual                    | Nueva ubicación                          | Lote      |
| --------------------------------- | ---------------------------------------- | --------- |
| `src/middleware/auth.js`          | `src/shared/middleware/auth.js`          | 0 (antes) |
| `src/middleware/errorHandler.js`  | `src/shared/middleware/errorHandler.js`  | 0         |
| `src/middleware/permissions.js`   | `src/shared/middleware/permissions.js`   | 0         |
| `src/middleware/requestLogger.js` | `src/shared/middleware/requestLogger.js` | 0         |
| `src/middleware/roles.js`         | `src/shared/middleware/roles.js`         | 0         |
| `src/middleware/user.js`          | `src/shared/middleware/user.js`          | 0         |
| `src/middleware/validate.js`      | `src/shared/middleware/validate.js`      | 0         |
| `src/utils/apiErrors.js`          | `src/shared/utils/apiErrors.js`          | 0         |
| `src/utils/AppError.js`           | `src/shared/utils/AppError.js`           | 0         |
| `src/utils/dateUtils.js`          | `src/shared/utils/dateUtils.js`          | 0         |
| `src/utils/parseListParams.js`    | `src/shared/utils/parseListParams.js`    | 0         |
| `src/config/database.js`          | `src/shared/config/database.js`          | 0         |
| `src/config/env.js`               | `src/shared/config/env.js`               | 0         |
| `src/config/logger.js`            | `src/shared/config/logger.js`            | 0         |
| `src/config/rateLimit.js`         | `src/shared/config/rateLimit.js`         | 0         |
| `src/config/security.js`          | `src/shared/config/security.js`          | 0         |
| `src/config/swagger.js`           | `src/shared/config/swagger.js`           | 0         |
| `src/config/validate.js`          | `src/shared/config/validate.js`          | 0         |

### Archivos a eliminar

| Archivo                               | Razón                           |
| ------------------------------------- | ------------------------------- |
| `src/routes/tbOs.js`                  | Legacy, verificar si se usa     |
| `src/controllers/AuthController.js`   | Duplica lógica de backend-users |
| `src/middleware/auth.js` (si duplica) | Verificar                       |

### Archivos raíz de MP

| Archivo                         | Acción                              |
| ------------------------------- | ----------------------------------- |
| `src/server.js`                 | Mantener (punto de entrada)         |
| `src/routes/index.js`           | Mantener (agrega rutas de features) |
| `scripts/debug-db.js`           | Mover a `scripts/dev/` o eliminar   |
| `scripts/fix-existing-dates.js` | Mover a `migrations/`               |
| `scripts/migrate-timezone.js`   | Mover a `migrations/`               |
| `scripts/test-db.js`            | Mover a `tests/`                    |

---

## Orden de ejecución

1. **Lote 0:** Crear `src/shared/` y mover middleware, utils, config. Actualizar imports. Verificar que levanta.
2. **Lotes 1–10:** Por cada lote, crear carpetas, mover archivos con `git mv`, actualizar imports, ejecutar tests.
3. **Lote final:** Actualizar `src/routes/index.js` para agregar rutas desde features. Verificar `docker compose up`.

---

## Comandos de ejemplo (Lote 1)

```bash
# Crear carpeta
mkdir -p backend-mp/src/features/asignacion

# Mover archivos
git mv backend-mp/src/controllers/AsignacionController.js backend-mp/src/features/asignacion/asignacion.controller.js
git mv backend-mp/src/routes/asignacion.js backend-mp/src/features/asignacion/asignacion.routes.js
git mv backend-mp/src/models/Asignacion.js backend-mp/src/features/asignacion/asignacion.model.js
git mv backend-mp/src/validations/asignacion.schemas.js backend-mp/src/features/asignacion/asignacion.validation.js

# Actualizar imports (manual o con script)
# En asignacion.routes.js: require('../controllers/AsignacionController') → require('./asignacion.controller')
# En asignacion.controller.js: require('../models/Asignacion') → require('./asignacion.model')

# Tests
cd backend-mp && npm test

# Commit
git add .
git commit -m "refactor(mp): migrate asignacion to feature-based structure"

Mantenido por: Ing. Botet S.Y.
Última actualización: 2026-10-23