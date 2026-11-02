const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATETIME_REGEX =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/;

const pad = (value) => String(value).padStart(2, "0");

const toDbDateTimeString = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const normalizeLocalDateTimeString = (value, endOfDay = false) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY_REGEX.test(trimmed)) {
    return `${trimmed} ${endOfDay ? "23:59:59" : "00:00:00"}`;
  }

  if (LOCAL_DATETIME_REGEX.test(trimmed)) {
    const [datePart, timePartRaw] = trimmed.replace("T", " ").split(" ");
    const [hh = "00", mm = "00", ssRaw = "00"] = timePartRaw.split(":");
    const ss = ssRaw.split(".")[0];
    return `${datePart} ${hh}:${mm}:${ss}`;
  }

  return null;
};

const hasTimezoneInfo = (value) =>
  typeof value === "string" && (/[zZ]$/.test(value.trim()) || /[+\-]\d{2}:?\d{2}$/.test(value.trim()));

const parseInputDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getTime());
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeToISOString = (value, options = {}) => {
  const parsed = parseInputDate(value);
  return parsed ? parsed.toISOString() : null;
};

const normalizeToDbDateTime = (value, options = {}) => {
  if (value == null) return null;
  if (typeof value === "string") {
    const normalizedLocal = normalizeLocalDateTimeString(value, !!options.endOfDayIfDateOnly);
    if (normalizedLocal) return normalizedLocal;
    if (hasTimezoneInfo(value)) {
      const parsed = parseInputDate(value);
      return toDbDateTimeString(parsed);
    }
  }

  const parsed = parseInputDate(value);
  return toDbDateTimeString(parsed);
};

const getCurrentDateTime = () => toDbDateTimeString(new Date());

const getCurrentTimestamp = () => new Date();

const normalizeDateRange = ({ from, to }) => ({
  from: normalizeToDbDateTime(from, { endOfDayIfDateOnly: false }),
  to: normalizeToDbDateTime(to, { endOfDayIfDateOnly: true }),
});

module.exports = {
  getCurrentDateTime,
  getCurrentTimestamp,
  normalizeToISOString,
  normalizeToDbDateTime,
  normalizeDateRange,
};
