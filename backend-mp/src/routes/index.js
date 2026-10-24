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
router.use("/movimiento", require("./movimiento"));
router.use("/pizarra", require("./pizarra"));
router.use("/planta", require("./planta"));
router.use("/propietario", require("./propietario"));
router.use("/prueba", require("./prueba"));
router.use("/queja", require("./queja"));
router.use("/tipolinea", require("./tipolinea"));
router.use("/recorrido", require("./recorrido"));
router.use("/resultadoprueba", require("./resultadoprueba"));
router.use("/senalizacion", require("./senalizacion"));
router.use("/sistema", require("./sistema"));
router.use("/telefono", require("./telefono"));
router.use("/tipomovimiento", require("./tipomovimiento"));
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
