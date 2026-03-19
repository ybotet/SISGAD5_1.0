const { ZodError } = require("zod");
const apiErrors = require("../utils/apiErrors");

const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      const dataToValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      }[source];

      // ✅ Parsear datos (aplica coerción, defaults, refinements)
      const parsedData = schema.parse(dataToValidate);

      // ✅ Inyectar datos parseados
      if (source === "body") req.body = parsedData;
      else if (source === "query") req.query = parsedData;
      else if (source === "params") req.params = parsedData;
      else if (source === "headers") req.headers = parsedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // ✅ Manejo seguro: error.errors puede ser undefined o vacío
        const firstError = error.errors?.[0];
        const message =
          firstError?.message || error.message || "ERROR.VALIDATION.FAILED";

        // Debug temporal (puedes quitarlo después)
        console.log("🔍 ZodError debug:", {
          hasErrors: !!error.errors,
          errorsCount: error.errors?.length,
          message,
        });

        return next(apiErrors.badRequest(message));
      }
      next(error);
    }
  };

module.exports = validate;
