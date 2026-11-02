/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/src/**/*.test.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/config/database.js",
    "!src/config/swagger.js",
  ],
  testTimeout: 15000,
  verbose: true,
};
