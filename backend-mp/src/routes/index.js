const express = require("express");
const router = express.Router();

// Importar y usar todas las rutas automáticamente
router.use("/asignacion", require("../features/asignacion/asignacion.routes"));
router.use("/cable", require("../features/cable/cable.routes"));
router.use("/clasificacion", require("../features/clasificacion/clasificacion.routes"));
router.use("/clasificadorclave", require("../features/clasificadorclave/clasificadorclave.routes"));
router.use("/clasifpizarra", require("../features/clasifpizarra/clasifpizarra.routes"));
router.use("/clave", require("../features/clave/clave.routes"));
router.use("/grupow", require("../features/grupow/grupow.routes"));
router.use("/linea", require("../features/linea/linea.routes"));
router.use("/mando", require("../features/mando/mando.routes"));
router.use("/movimiento", require("../features/movimiento/movimiento.routes"));
router.use("/pizarra", require("../features/pizarra/pizarra.routes"));
router.use("/planta", require("../features/planta/planta.routes"));
router.use("/propietario", require("../features/propietario/propietario.routes"));
router.use("/prueba", require("../features/prueba/prueba.routes"));
router.use("/queja", require("../features/queja/queja.routes"));
router.use("/tipolinea", require("../features/tipolinea/tipolinea.routes"));
router.use("/recorrido", require("../features/recorrido/recorrido.routes"));
router.use("/resultadoprueba", require("../features/resultadoprueba/resultadoprueba.routes"));
router.use("/senalizacion", require("../features/senalizacion/senalizacion.routes"));
router.use("/sistema", require("../features/sistema/sistema.routes"));
router.use("/telefono", require("../features/telefono/telefono.routes"));
router.use("/tipomovimiento", require("../features/tipomovimiento/tipomovimiento.routes"));
router.use("/tipopizarra", require("./tipopizarra"));
router.use("/tipoqueja", require("./tipoqueja"));
router.use("/trabajador", require("./trabajador"));
router.use("/trabajo", require("./trabajo"));
router.use("/trabajotrabajadores", require("./trabajoTrabajadores"));

// router.use('/tbMaterial', require('./tbMaterial'));
// router.use('/tbMaterialempleado', require('./tbMaterialempleado'));
// router.use('/tbMaterialEntregado', require('./tbMaterialEntregado'));
// router.use('/tbOs', require('./tbOs'));

// Ruta de fallback para APIs no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint de API no encontrado",
    path: req.originalUrl,
  });
});

module.exports = router;
