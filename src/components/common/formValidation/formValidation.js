/**
 * Shared form validation helpers.
 * Save as: src/utils/form-validation.js
 *
 * Every check returns an error message (string) or null when the value is OK.
 */

export const MOBILE_REGEX = /^\d{10}$/; // exactly 10 digits
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // needs "@" and a domain
export const DIGITS_REGEX = /[0-9\u0966-\u096F]/g; // English + Devanagari digits

/** Counts letters/digits (English, Latin extended, Marathi). Ignores spaces and symbols. */
export const countRealChars = (v) =>
  Array.from(String(v ?? "")).filter((ch) =>
    /[A-Za-z0-9\u00C0-\u024F\u0900-\u0963\u0966-\u097F]/.test(ch)
  ).length;

/** Required text. Rejects empty, spaces, "-", ".", "..." and other symbol-only values. */
export const checkText = (value, label, minChars = 2) => {
  if (!value || !String(value).trim()) return `${label} is required.`;
  if (countRealChars(value) < minChars) {
    return `Please enter an appropriate ${label.toLowerCase()} (at least ${minChars} letters or numbers, not only spaces, '-' or '.').`;
  }
  return null;
};

/** Required text that must not contain numbers (person / occupant names). */
export const checkName = (value, label, minChars = 2) => {
  const err = checkText(value, label, minChars);
  if (err) return err;
  if (/[0-9\u0966-\u096F]/.test(String(value))) {
    return `${label} must contain text only (numbers are not allowed).`;
  }
  return null;
};

/** Required 10-digit mobile number, digits only. */
export const checkMobile = (value, label) => {
  if (!value || !String(value).trim()) return `${label} is required.`;
  if (!MOBILE_REGEX.test(String(value).trim())) {
    return `${label} must be exactly 10 digits (numbers only).`;
  }
  return null;
};

/** Required email containing "@" and a domain. */
export const checkEmail = (value, label) => {
  const err = checkText(value, label, 1);
  if (err) return err;
  if (!EMAIL_REGEX.test(String(value).trim())) {
    return `${label} must be valid and contain '@' (e.g. name@example.com).`;
  }
  return null;
};

/** Required dropdown / select value. */
export const checkSelect = (value, label) =>
  value ? null : `Please select ${label.toLowerCase()}.`;

/** At least one uploaded document ({ documentId, documentURLbase64 }). */
export const checkDocuments = (documents) =>
  (documents || []).some((d) => d && d.documentId && d.documentURLbase64)
    ? null
    : "Please upload at least one document.";

/** Typing helpers (use inside onChange). */
export const cleanInput = (name, value, kind = "text") => {
  if (kind === "mobile") return value.replace(/\D/g, "").slice(0, 10);
  if (kind === "email") return value.replace(/\s/g, "");
  if (kind === "name") return value.replace(/^\s+/, "").replace(DIGITS_REGEX, "");
  return value.replace(/^\s+/, ""); // plain text: no leading space
};
