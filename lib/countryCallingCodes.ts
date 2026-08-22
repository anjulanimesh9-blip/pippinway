export const COUNTRY_CALLING_CODES: Record<string, string> = {
  Singapore: "+65",
  India: "+91",
  Thailand: "+66",
  Zimbabwe: "+263",
  USA: "+1",
  Maldives: "+960",
  "Sri Lanka": "+94",
  "South Africa": "+27",
  "United Kingdom": "+44",
  Canada: "+1",
};

const CALLING_CODES_BY_LENGTH = Array.from(
  new Set(Object.values(COUNTRY_CALLING_CODES))
).sort((a, b) => b.length - a.length);

function stripCallingCodePrefix(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  for (const code of CALLING_CODES_BY_LENGTH) {
    const digits = code.slice(1);

    if (trimmed.startsWith(code)) {
      return trimmed.slice(code.length).replace(/^[\s-]+/, "");
    }

    if (
      trimmed.startsWith(digits) &&
      (trimmed.length === digits.length ||
        /[\s-]/.test(trimmed[digits.length] ?? ""))
    ) {
      return trimmed.slice(digits.length).replace(/^[\s-]+/, "");
    }
  }

  return trimmed;
}

/** Swap or set the calling-code prefix. Empty country leaves the number unchanged. */
export function applyCountryCallingCode(
  phone: string,
  country: string
): string {
  if (!country) {
    return phone;
  }

  const code = COUNTRY_CALLING_CODES[country];
  if (!code) {
    return phone;
  }

  const local = stripCallingCodePrefix(phone);
  if (!local) {
    return code;
  }

  return `${code} ${local}`;
}
