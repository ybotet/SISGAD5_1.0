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
