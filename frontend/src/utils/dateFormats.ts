/**
 * Formatea una fecha a formato datetime-local (YYYY-MM-DDTHH:mm)
 * @param date - Fecha opcional. Si no se proporciona, usa la fecha actual
 * @returns String en formato YYYY-MM-DDTHH:mm
 */
export const formatDateTimeLocal = (date?: Date | string | null): string => {
  let d: Date;

  if (!date) {
    d = new Date();
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  // Validar que sea una fecha válida
  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formatea una fecha a formato date (YYYY-MM-DD)
 * @param date - Fecha opcional. Si no se proporciona, usa la fecha actual
 * @returns String en formato YYYY-MM-DD
 */
export const formatDateLocal = (date?: Date | string | null): string => {
  let d: Date;

  if (!date) {
    d = new Date();
  } else if (typeof date === "string") {
    d = new Date(date);
  } else {
    d = date;
  }

  // Validar que sea una fecha válida
  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ✅ NUEVA FUNCIÓN: Para mostrar fechas en la interfaz de usuario
/**
 * Formatea una fecha para mostrar en la interfaz (DD/MM/YYYY HH:MM)
 * @param dateString - String de fecha en cualquier formato válido
 * @returns String formateado para mostrar, o texto de "No definida" si no hay fecha
 */
export const formatToDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "No definida";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

// ✅ NUEVA FUNCIÓN: Para formatear fecha corta (solo fecha, sin hora)
/**
 * Formatea una fecha para mostrar en la interfaz (DD/MM/YYYY)
 * @param dateString - String de fecha en cualquier formato válido
 * @returns String formateado para mostrar, o texto de "No definida" si no hay fecha
 */
export const formatDateToDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "No definida";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};
