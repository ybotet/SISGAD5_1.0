const jwt = require("jsonwebtoken");

const { requireJwtSecret } = require("../src/shared/config/jwt");

describe("JWT validation (security-jwt-hardening)", () => {
  test("requireJwtSecret throws if JWT_SECRET missing", () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    expect(() => requireJwtSecret()).toThrow();
    process.env.JWT_SECRET = originalSecret;
  });

  test("requireJwtSecret throws if JWT_SECRET < 32 chars", () => {
    expect(() => requireJwtSecret("short")).toThrow();
  });

  test("requireJwtSecret passes with valid secret", () => {
    const secret = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
    expect(requireJwtSecret(secret)).toBe(secret);
  });
});

describe("JWT token generation and verification", () => {
  const secret = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";

  test("Generates valid token with user claims", () => {
    const token = jwt.sign({ id: 99, email: "test@example.com", roles: ["admin"] }, secret, {
      expiresIn: "24h",
    });
    const decoded = jwt.verify(token, secret);
    expect(decoded.id).toBe(99);
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.roles).toEqual(["admin"]);
  });

  test("Token verification fails with wrong secret", () => {
    const token = jwt.sign({ id: 1 }, "wrong-secret", { expiresIn: "1h" });
    expect(() => jwt.verify(token, secret)).toThrow();
  });

  test("Expired token fails verification", () => {
    const token = jwt.sign({ id: 1 }, secret, { expiresIn: "-1h" });
    expect(() => jwt.verify(token, secret)).toThrow();
  });
});

describe("Route ordering (BUS-02)", () => {
  test("Dashboard routes appear before /:id in queja routes", () => {
    // Load routes without requiring the full app (isolate route ordering)
    const path = require("path");
    const fs = require("fs");
    const routesPath = path.resolve(__dirname, "../src/features/queja/queja.routes.js");
    const src = fs.readFileSync(routesPath, "utf8");

    const dashboardIdx = src.indexOf('router.get("/dashboard/');
    const idIdx = src.indexOf('router.get("/:id"');

    expect(dashboardIdx).toBeGreaterThanOrEqual(0);
    expect(idIdx).toBeGreaterThanOrEqual(0);
    expect(dashboardIdx).toBeLessThan(idIdx);
  });
});
