/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/src/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/database.js",
  ],
  testTimeout: 15000,
  verbose: true,
  // coverageThreshold se habilitará cuando todos los archivos de src/features y src/shared
  // tengan tests (TASK-800-01 cubre los prioritarios: user.controller, middlewares, validaciones).
};
