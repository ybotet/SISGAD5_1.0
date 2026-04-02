const apiError = require("../utils/apiError");
const { TbAsignacion, TbQueja } = require("../models");
const { Op } = require("sequelize");
const { parseListParams } = require("../utils/parseListParams");
const {
  createAsignacionSchema,
  updateAsignacionSchema,
  listAsignacionSchema,
} = require("../validations/asignacion.schemas");
const validate = require("../middleware/validate");

const create = async (req, res, next) => {
  try {
    const { error } = createAsignacionSchema.validate(req.body);
    if (error) return next(apiError.BadRequest(error.message));

    const data = await TbAsignacion.create(req.body);
    res.status(201).json({
      success: true,
      data,
      message: "Asignacion created successfully",
    });
  } catch (error) {
    return next(error);
  }
};
