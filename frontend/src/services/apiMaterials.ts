import axios from "axios";
import { ApiError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/ApiError";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance para el namespace /api/materials del gateway
const api = axios.create({
  baseURL: `${API_BASE_URL}/materiales`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function getBackendMessage(
  data: { message?: string; error?: string; details?: string[] } | string | undefined,
): string {
  if (!data) return "Error del servidor";
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.details) && data.details.length > 0) return data.details.join(". ");
  return "Error del servidor";
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = getBackendMessage(data);

      switch (status) {
        case 403:
          throw new ForbiddenError(message);
        case 401:
          throw new UnauthorizedError(message);
        case 404:
          throw new NotFoundError(message);
        default:
          throw new ApiError(message, status);
      }
    }
    throw error;
  },
);

export default api;
