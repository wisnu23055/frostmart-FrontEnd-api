/**
 * Utility to format dates and times dynamically based on the user's local timezone (e.g. WIB, WITA, WIT, etc.)
 */

export const getTimezoneAbbreviation = (date = new Date()) => {
  try {
    const tzString = date.toLocaleString("id-ID", { timeZoneName: "short" });
    const match = tzString.match(/\s([A-Z]{3,4}|GMT[+-]\d+|\+\d+)$/);
    if (match) {
      return match[1];
    }
    // Fallback split
    const parts = tzString.trim().split(/[\s,]+/);
    const lastPart = parts[parts.length - 1];
    if (lastPart && (/^[A-Z]{3,4}$/.test(lastPart) || lastPart.startsWith("GMT"))) {
      return lastPart;
    }
  } catch (e) {
    // Ignore error
  }

  // Fallback by GMT offset
  const offset = -date.getTimezoneOffset() / 60;
  if (offset === 7) return "WIB";
  if (offset === 8) return "WITA";
  if (offset === 9) return "WIT";
  if (offset === 0) return "UTC";

  const sign = offset >= 0 ? "+" : "";
  return `GMT${sign}${offset}`;
};

/**
 * Formats a raw date string to Indonesian locale with local timezone abbreviation
 * Example: "6 Juni 2026 20.50 WIB"
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const formattedBase = date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tz = getTimezoneAbbreviation(date);
  return `${formattedBase.replace(",", "")} ${tz}`;
};

/**
 * Formats a raw date string (short version)
 * Example: "6 Jun 2026 20:50 WIB"
 */
export const formatDateTimeShort = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  const formattedBase = date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const tz = getTimezoneAbbreviation(date);
  return `${formattedBase.replace(",", "")} ${tz}`;
};

/**
 * Formats date only, but still dynamic to local timezone
 * Example: "6 Juni 2026"
 */
export const formatDateOnly = (dateInput) => {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
