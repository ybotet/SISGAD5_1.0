const { normalizeDateRange, normalizeToDbDateTime } = require("../src/shared/utils/dateUtils");

let passed = 0;
let failed = 0;

function assert(name, condition, detail = "") {
  if (condition) {
    passed++;
    console.log("✅ " + name);
  } else {
    failed++;
    console.error("❌ " + name + (detail ? " — " + detail : ""));
  }
}

function assertNoInjection(name, input) {
  const result = normalizeDateRange({ from: input, to: input });
  const combined = JSON.stringify(result);
  const injectionPatterns = [
    "'",
    "--",
    ";",
    "/*",
    "*/",
    "xp_",
    "DROP",
    "DELETE",
    "INSERT",
    "UPDATE",
    "UNION",
    "SELECT",
    "EXEC",
    "<",
    ">",
  ];
  const found = injectionPatterns.some((p) => combined.includes(p.toUpperCase()));
  assert(name, !found, "Injection pattern found in: " + combined);
}

describe("SQL injection prevention — dateFilter uses Sequelize replacements", () => {
  // Test 1: normalizeDateRange with valid dates
  const validRange = normalizeDateRange({ from: "2025-01-01", to: "2025-12-31" });
  test("Valid date range produces YYYY-MM-DD HH:MM:SS format", () => {
    expect(validRange.from).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(validRange.to).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  // Test 2: normalizeDateRange with invalid dates returns null
  const invalidRange = normalizeDateRange({ from: "not-a-date", to: null });
  test("Invalid date returns null", () => {
    expect(invalidRange.from).toBeNull();
    expect(invalidRange.to).toBeNull();
  });

  // Test 3: SQL injection in date input
  const injectionPayloads = [
    "' OR 1=1 --",
    "'; DROP TABLE tb_queja;",
    "2025-01-01' UNION SELECT *",
    "<script>alert(1)</script>",
  ];

  injectionPayloads.forEach((payload) => {
    test(`SQL injection rejected: ${payload}`, () => {
      const result = normalizeDateRange({ from: payload, to: payload });
      const combined = JSON.stringify(result);
      const injectionPatterns = ["'", "--", ";", "DROP", "DELETE", "INSERT", "UPDATE", "UNION", "SELECT", "<", ">"];
      injectionPatterns.forEach((p) => {
        expect(combined).not.toContain(p.toUpperCase());
      });
    });
  });

  // Test 4: Verify dateFilter uses named placeholders (not string interpolation)
  const fs = require("fs");
  const dateFilterSrc = fs.readFileSync(__dirname + "/../src/features/queja/queja.controller.js", "utf8");

  test("dateFilter uses :fromDate placeholder", () => {
    expect(dateFilterSrc).toContain(":fromDate::timestamp");
  });

  test("dateFilter uses :toDate placeholder", () => {
    expect(dateFilterSrc).toContain(":toDate::timestamp");
  });

  test("No interpolated normalizedRange.from in SQL string", () => {
    expect(dateFilterSrc).not.toContain("${normalizedRange.from}");
  });

  test("No interpolated normalizedRange.to in SQL string", () => {
    expect(dateFilterSrc).not.toContain("${normalizedRange.to}");
  });

  test("Queries pass replacements option to sequelize.query", () => {
    const matches = dateFilterSrc.match(/replacements/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });
});
