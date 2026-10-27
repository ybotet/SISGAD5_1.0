const { requireJwtSecret } = require("./jwt");

describe("requireJwtSecret (JWT validation)", () => {
  const originalSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("rechaza secreto ausente", () => {
    expect(() => requireJwtSecret(undefined)).toThrow();
    expect(() => requireJwtSecret("")).toThrow();
  });

  it("rechaza secreto menor de 32 caracteres", () => {
    expect(() => requireJwtSecret("secreto")).toThrow();
    expect(() => requireJwtSecret("a".repeat(31))).toThrow();
  });

  it("acepta secreto de 32 caracteres o más", () => {
    const secret = "a".repeat(32);
    expect(requireJwtSecret(secret)).toBe(secret);
  });
});
