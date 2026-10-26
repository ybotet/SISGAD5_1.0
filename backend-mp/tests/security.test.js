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
    "'", "--", ";", "/*", "*/", "xp_", "DROP", "DELETE", "INSERT", "UPDATE",
    "UNION", "SELECT", "EXEC", "<", ">",
  ];
  const found = injectionPatterns.some((p) => combined.includes(p.toUpperCase()));
  assert(name, !found, "Injection pattern found in: " + combined);
}

// Test 1: normalizeDateRange with valid dates
const validRange = normalizeDateRange({ from: "2025-01-01", to: "2025-12-31" });
assert(
  "Valid date range produces YYYY-MM-DD HH:MM:SS format",
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(validRange.from) &&
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(validRange.to),
  JSON.stringify(validRange),
);

// Test 2: normalizeDateRange with invalid dates returns null
const invalidRange = normalizeDateRange({ from: "not-a-date", to: null });
assert("Invalid date returns null", invalidRange.from === null && invalidRange.to === null);

// Test 3: SQL injection in date input
assertNoInjection("SQL injection: ' OR 1=1 --", "' OR 1=1 --");
assertNoInjection("SQL injection: '; DROP TABLE tb_queja;", "'; DROP TABLE tb_queja;");
assertNoInjection("SQL injection: 2025-01-01' UNION SELECT *", "2025-01-01' UNION SELECT *");
assertNoInjection("SQL injection: <script>alert(1)</script>", "<script>alert(1)</script>");

// Test 4: Verify dateFilter uses named placeholders (not string interpolation)
const dateFilterSrc = require("fs").readFileSync(__dirname + "/../src/features/queja/queja.controller.js", "utf8");

assert(
  "dateFilter uses :fromDate placeholder",
  dateFilterSrc.includes(":fromDate::timestamp"),
);
assert(
  "dateFilter uses :toDate placeholder",
  dateFilterSrc.includes(":toDate::timestamp"),
);

assert(
  "No interpolated normalizedRange.from in SQL string",
  !dateFilterSrc.includes("${normalizedRange.from}"),
  "Found ${normalizedRange.from} in source",
);
assert(
  "No interpolated normalizedRange.to in SQL string",
  !dateFilterSrc.includes("${normalizedRange.to}"),
  "Found ${normalizedRange.to} in source",
);

assert(
  "Queries pass replacements option to sequelize.query",
  (dateFilterSrc.match(/replacements/g) || []).length >= 5,
  "Expected at least 5 usages of replacements",
);

console.log("\n========================================");
console.log("Resultados: " + passed + " passed, " + failed + " failed");
console.log("========================================");
process.exit(failed > 0 ? 1 : 0);
