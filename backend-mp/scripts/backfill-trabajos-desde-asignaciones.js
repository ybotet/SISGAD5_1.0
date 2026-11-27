/**
 * Backfill retroactivo (TASK-220-04 / flujo Asignada→Trabajo).
 *
 * Para cada queja hoy en estado "Asignada" que NO tenga un trabajo abierto,
 * genera un trabajo en estado "Abierto" con `fecha` = fecha de la asignación
 * (fechaInicio) y los operarios de esa asignación.
 *
 * Uso:
 *   node scripts/backfill-trabajos-desde-asignaciones.js            # dry-run (solo lista)
 *   node scripts/backfill-trabajos-desde-asignaciones.js --apply    # aplica cambios
 *
 * Es idempotente: las quejas que ya tienen trabajo Abierto se omiten.
 */
const { Queja, Trabajo, Asignacion, AsignacionTrabajadores, TrabajoTrabajadores } =
  require("../src/features");
const { getEstadoClave } = require("../src/features/trabajo/trabajoEstados");

const APPLY = process.argv.includes("--apply");

async function main() {
  const idAbierto = await getEstadoClave("ABIERTO");

  const asignadas = await Queja.findAll({ where: { estado: "Asignada" } });
  console.log(`Quejas en estado Asignada: ${asignadas.length}`);

  let creados = 0;
  let omitidos = 0;

  for (const queja of asignadas) {
    // ¿Ya tiene un trabajo abierto?
    const abierto = await Trabajo.findOne({
      where: { id_queja: queja.id_queja, estado: idAbierto },
    });
    if (abierto) {
      omitidos++;
      continue;
    }

    // Tomar la última asignación (fechaInicio = fecha de la asignación).
    const asignacion = await Asignacion.findOne({
      where: { id_queja: queja.id_queja },
      order: [["fechaAsignacion", "DESC"]],
    });

    const fechaInicio = asignacion?.fechaAsignacion || null;
    const trabajadores = asignacion
      ? await AsignacionTrabajadores.findAll({ where: { id_asignacion: asignacion.id_asignacion } })
      : [];

    console.log(
      `${APPLY ? "CREAR" : "WOULD CREATE"} trabajo para queja ${queja.id_queja} (fechaInicio=${fechaInicio}, operarios=${trabajadores.length})`,
    );

    if (APPLY) {
      const t = await Trabajo.sequelize.transaction();
      try {
        const trabajo = await Trabajo.create(
          {
            id_queja: queja.id_queja,
            fecha: fechaInicio,
            estado: idAbierto,
            probador: trabajadores.length > 0 ? trabajadores[0].id_trabajador : null,
            observaciones: "Trabajo generado por backfill (asignación previa sin trabajo)",
          },
          { transaction: t },
        );
        if (trabajadores.length > 0) {
          await TrabajoTrabajadores.bulkCreate(
            trabajadores.map((w) => ({ id_trabajo: trabajo.id_trabajo, id_trabajador: w.id_trabajador })),
            { transaction: t },
          );
        }
        await t.commit();
        creados++;
      } catch (err) {
        await t.rollback();
        console.error(`  ERROR en queja ${queja.id_queja}: ${err.message}`);
      }
    } else {
      creados++;
    }
  }

  console.log(`\nResumen: ${creados} ${APPLY ? "creados" : "a crear"}, ${omitidos} omitidos (ya tenían trabajo abierto).`);
  if (!APPLY && creados > 0) {
    console.log("Dry-run. Ejecute con --apply para aplicar los cambios.");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Error en backfill:", err);
  process.exit(1);
});