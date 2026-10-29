const { ZodError } = require("zod");

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const dataToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    }[source];

    const parsedData = schema.parse(dataToValidate);

    if (source === "body") req.body = parsedData;
    else if (source === "query") req.query = parsedData;
    else if (source === "params") req.params = parsedData;
    else if (source === "headers") req.headers = parsedData;

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors?.[0];
      const message =
        firstError?.message || error.message || "ERROR.VALIDATION.FAILED";

      return res.status(400).json({
        error: "Validación fallida",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(error);
  }
};

module.exports = validate;
