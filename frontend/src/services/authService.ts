import api from "./api";

// La URL de tu backend - puedes usar variables de entorno
// const VITE_FRONT_URL = import.meta.env.VITE_FRONT_URL || 'http://localhost:5004/';

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => {
    return api.post("/auth/login", credentials);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // redirect to login page using Vite BASE_URL so it works in prod subfolder
    const base = import.meta.env.BASE_URL || "/";
    window.location.href = base + "auth/login";
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  setAuthData: (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },

  getUser: () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  getPerfil: async () => {
    const resp = await api.get("/auth/perfil");
    console.log(resp.data.data);
    // backend responde { success: true, data: usuario }
    return resp.data.data;
  },

  // Actualizar perfil del usuario autenticado (PUT /api/user/:id)
  actualizarPerfil: async (id: number, data: { email?: string; nombre?: string; apellidos?: string; activo?: boolean }) => {
    const resp = await api.put(`/user/${id}`, data);
    return resp.data.data;
  },
};

export default authService;
