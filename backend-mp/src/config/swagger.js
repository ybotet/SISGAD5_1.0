// backend-mp/src/config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SISGAD5 API - Backend MP",
      version: "1.0.0",
      description:
        "API para gestión de quejas, pruebas y trabajos en telecomunicaciones",
      contact: {
        name: "Yaisel Botet",
        email: "yaiselbotet@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5002/api/mp",
        description: "Desarrollo local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT: Bearer <token>",
        },
      },
      schemas: {
        Queja: {
          type: "object",
          properties: {
            id_queja: { type: "integer", example: 20234 },
            num_reporte: { type: "integer", example: 100001 },
            id_telefono: { type: "integer", nullable: true },
            id_linea: { type: "integer", nullable: true },
            id_pizarra: { type: "integer", nullable: true },
            id_tipoqueja: { type: "integer", example: 63 },
            estado: {
              type: "string",
              enum: [
                "Abierta",
                "En Proceso",
                "Pendiente",
                "Resuelto",
                "Cerrada",
              ],
              example: "Abierta",
            },
            prioridad: { type: "integer", minimum: 0, maximum: 5, example: 3 },
            fecha: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "ERROR.QUEJA.NOT_FOUND" },
            statusCode: { type: "integer", example: 404 },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJsdoc(options);
