const env = require("../config/env");
const logger = require("../config/logger");

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 500;

async function fetchWithRetry(url, options = {}, maxAttempts = DEFAULT_MAX_ATTEMPTS, baseDelayMs = DEFAULT_BASE_DELAY_MS) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (!response.ok && attempt < maxAttempts) {
        lastError = new Error(`HTTP ${response.status}`);
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        logger.alerta(`Materials service returned ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        logger.alerta(`Materials service unreachable, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw lastError;
}

class MaterialesService {
  constructor(serviceUrl = env.MATERIALES_SERVICE_URL) {
    this.serviceUrl = serviceUrl;
  }

  async registrarConsumo(payload, token) {
    const url = `${this.serviceUrl}/api/materiales/consumos`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify(payload),
    });
    return response.json();
  }
}

module.exports = {
  MaterialesService,
  fetchWithRetry,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_BASE_DELAY_MS,
};
