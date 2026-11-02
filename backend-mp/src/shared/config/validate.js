const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = req.method === "GET" ? req.query : req.body;
    schema.parse(dataToValidate);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
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
