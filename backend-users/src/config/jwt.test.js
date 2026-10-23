const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { requireJwtSecret } = require("./jwt");

describe("requireJwtSecret", () => {
  it("rechaza secreto ausente", () => {
    assert.throws(() => requireJwtSecret(undefined), /JWT_SECRET/);
    assert.throws(() => requireJwtSecret(""), /JWT_SECRET/);
  });

  it("rechaza secreto menor de 32 caracteres", () => {
    assert.throws(() => requireJwtSecret("secreto"), /JWT_SECRET/);
    assert.throws(() => requireJwtSecret("a".repeat(31)), /JWT_SECRET/);
  });

  it("acepta secreto de 32 caracteres o más", () => {
    const secret = "a".repeat(32);
    assert.equal(requireJwtSecret(secret), secret);
  });
});
