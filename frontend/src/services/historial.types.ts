export interface HistorialEvento {
  tipo: "queja" | "movimiento" | "recorrido";
  id: number | null;
  fecha: string | null;
  entidad: string;
  descripcion: string;
  [key: string]: any;
}

export interface HistorialResponse {
  entidad: string;
  id: number | string;
  total: number;
  eventos: HistorialEvento[];
}
