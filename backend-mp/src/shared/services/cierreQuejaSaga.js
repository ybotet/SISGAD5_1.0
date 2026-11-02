const { sequelize } = require("../config/database");
const { Queja, Trabajo } = require("../../features");
const { MaterialesService } = require("./materialesService");
const logger = require("../config/logger");

class CierreQuejaSaga {
  constructor(options = {}) {
    this.materialesService = options.materialesService || new MaterialesService();
    this.timeoutMs = options.timeoutMs || 15000;
  }

  async execute(quejaId, { id_clavecierre, fechaok, userId, token }) {
    const t = await sequelize.transaction();
    const result = {
      success: false,
      queja: null,
      consumo: null,
      trabajos: [],
      compensacion: null,
    };

    try {
      const queja = await Queja.findByPk(quejaId, {
        attributes: ["id_queja", "estado", "id_telefono", "id_linea", "id_pizarra", "fecha"],
        transaction: t,
      });

      if (!queja) {
        result.compensacion = { motivo: "QUEJA_NO_ENCONTRADA" };
        await t.rollback();
        return result;
      }

      if (queja.estado === "Cerrada") {
        result.compensacion = { motivo: "YA_CERRADA" };
        await t.rollback();
        return result;
      }

      const estadosValidos = ["Resuelta", "Probada"];
      if (!estadosValidos.includes(queja.estado)) {
        result.compensacion = { motivo: "ESTADO_INVALIDO", estado: queja.estado };
        await t.rollback();
        return result;
      }

      result.queja = await this._cerrarQuejaEnDB(quejaId, { id_clavecierre, fechaok, userId, transaction: t });

      let trabajos = [];
      try {
        trabajos = await Trabajo.findAll({
          where: { id_queja: quejaId },
          attributes: ["id_trabajo", "id_trabajador", "fecha", "observaciones"],
          transaction: t,
        });
      } catch (err) {
        logger.alerta("Saga: No se pudieron obtener trabajos asociados: %s", err.message);
      }
      result.trabajos = trabajos;

      let consumoCreado = null;
      if (trabajos.length > 0) {
        const payload = this._buildConsumoPayload(queja, trabajos, userId, fechaok);
        try {
          consumoCreado = await this.materialesService.registrarConsumo(payload, token);
          result.consumo = consumoCreado;
        } catch (materialesError) {
          logger.alerta("Saga: Materials service falló (post-cierre): %s", materialesError.message);
          result.compensacion = {
            motivo: "MATERIALES_FALLA",
            error: materialesError.message,
            accion: "REVERTIR_CIERRE",
          };
          await this._revertirCierre(quejaId, { transaction: t });
          await t.rollback();
          result.queja = null;
          return result;
        }
      }

      await t.commit();
      result.success = true;
      return result;
    } catch (error) {
      logger.error("Saga: Error inesperado: %s", error);
      result.compensacion = { motivo: "ERROR_INESPERADO", error: error.message };
      await t.rollback();
      return result;
    }
  }

  async _cerrarQuejaEnDB(quejaId, { id_clavecierre, fechaok, userId, transaction }) {
    const { normalizeToDbDateTime } = require("../utils/dateUtils");
    const fechaokNormalized = normalizeToDbDateTime(fechaok);

    await Queja.update(
      {
        estado: "Cerrada",
        id_clavecierre: id_clavecierre,
        fechaok: fechaokNormalized,
        updated_by: userId,
      },
      {
        where: { id_queja: parseInt(quejaId) },
        validate: false,
        individualHooks: false,
        transaction,
      },
    );

    return Queja.findByPk(quejaId, {
      include: [
        { association: "tb_clave", attributes: ["id_clave", "clave"] },
        {
          association: "tb_clave_cierre",
          attributes: ["id_clave", "clave", "es_pendiente"],
          required: false,
        },
      ],
      transaction,
    });
  }

  _buildConsumoPayload(queja, trabajos, userId, fechaok) {
    const trabajo = trabajos[0];
    const fecha = fechaok || trabajo?.fecha || new Date().toISOString();

    return {
      id_trabajo: trabajo?.id_trabajo || null,
      id_trabajador: trabajo?.id_trabajador || null,
      fecha_consumo: fecha,
      observaciones: `Cierre de queja ${queja.id_queja} - saga orchestrator`,
      id_creado_por: userId,
    };
  }

  async _revertirCierre(quejaId, { transaction }) {
    try {
      await Queja.update(
        { estado: "Resuelta", updated_by: null },
        {
          where: { id_queja: parseInt(quejaId) },
          validate: false,
          individualHooks: false,
          transaction,
        },
      );
      logger.informacion("Saga: Cierre revertido para queja %s", quejaId);
    } catch (err) {
      logger.error("Saga: Falló reversión de cierre para queja %s: %s", quejaId, err);
    }
  }
}

module.exports = { CierreQuejaSaga };
