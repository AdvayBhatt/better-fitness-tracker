// Shared input sanitizers and validators used by the settings and
// onboarding forms. Sanitizers strip disallowed characters as the user
// types. Validators return an error message string, or null when valid.

export function sanitizeInteger(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export function sanitizeDecimal(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  // Keep only the first decimal point.
  return parts[0] + "." + parts.slice(1).join("");
}

export function validateName(value: string): string | null {
  if (value.trim().length === 0) {
    return "Please enter a name";
  }
  return null;
}

export function validateHeight(value: string): string | null {
  if (value.trim().length === 0) {
    return "Please enter a height";
  }
  return null;
}

export function validateBodyweight(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Please enter a bodyweight";
  }
  const number = Number(trimmed);
  if (!Number.isFinite(number) || number <= 0) {
    return "Enter a number greater than zero";
  }
  if (number > 2000) {
    return "That number looks too high";
  }
  return null;
}

export function validateAge(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Please enter an age";
  }
  const number = Number(trimmed);
  if (!Number.isInteger(number) || number <= 0) {
    return "Enter a whole number of years";
  }
  if (number > 120) {
    return "Enter an age under 120";
  }
  return null;
}
