const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SISGAD5 API - Backend Users",
      version: "1.0.0",
      description: "API para gestión de autenticación, usuarios y roles (RBAC)",
      contact: {
        name: "Yaisel Botet",
        email: "yaiselbotet@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5001/api",
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
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js", "./src/features/**/*.routes.js"],
};

module.exports = swaggerJsdoc(options);
