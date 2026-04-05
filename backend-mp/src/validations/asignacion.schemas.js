const { z } = require("zod");

const asignacionBaseSchema = z.object({
  id_queja: z
    .number()
    .int()
    .positive("ERROR.QUEJA.INVALID")
    .optional()
    .nullable(),
  fechaAsignacion: z.coerce.date().optional().nullable(), // 👈 coerce convierte string a date
  trabajadores: z
    .array(
      z.object({
        id_trabajador: z.coerce
          .number()
          .int()
          .positive("ERROR.TRABAJADOR.INVALID"), // 👈 coerce convierte string a número
      }),
    )
    .optional(),
});

const createAsignacionSchema = asignacionBaseSchema
  .refine((data) => data.id_queja != null, {
    message: "ERROR.ASIGNACION.ID_QUEJA.REQUIRED",
    path: ["id_queja"],
  })
  .refine((data) => data.trabajadores != null && data.trabajadores.length > 0, {
    message: "ERROR.ASIGNACION.TRABAJADORES.REQUIRED",
    path: ["trabajadores"],
  })
  .refine(
    (data) => {
      if (!data.trabajadores) return true;
      return data.trabajadores.every(
        (trabajador) => trabajador.id_trabajador > 0,
      );
    },
    {
      message: "ERROR.ASIGNACION.TRABAJADORES.INVALID",
      path: ["trabajadores"],
    },
  );

const listAsignacionSchema = z.object({
  limit: z
    .string()
    .regex(/^[0-9]+$/, "ERROR.ASIGNACION.LIMIT.INVALID_FORMAT")
    .optional(),
  offset: z
    .string()
    .regex(/^[0-9]+$/, "ERROR.ASIGNACION.OFFSET.INVALID_FORMAT")
    .optional(),
});

module.exports = {
  createAsignacionSchema,
  listAsignacionSchema,
};
