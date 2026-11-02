const express = require("express");
const router = express.Router();

router.use("/auth", require("../features/auth/auth.routes"));
router.use("/user", require("../features/user/user.routes"));
router.use("/roles", require("../features/rol/rol.routes"));
router.use("/permisos", require("../features/permiso/permiso.routes"));
router.use("/user-rol", require("../features/user_rol/user_rol.routes"));
router.use("/roles-permisos", require("../features/roles_permiso/roles_permiso.routes"));

router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint de API no encontrado",
    path: req.originalUrl,
  });
});

module.exports = router;
