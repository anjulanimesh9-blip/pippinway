import {
  FALLBACK_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguage,
  isLanguageCode,
  type LanguageCode,
} from "./languages";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;
  try {
    const stored =
      localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? readCookie(LANGUAGE_STORAGE_KEY);
    return isLanguageCode(stored) ? stored : FALLBACK_LANGUAGE;
  } catch {
    return FALLBACK_LANGUAGE;
  }
}

export function persistLanguage(code: LanguageCode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    // Ignore quota / private-mode failures.
  }
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${encodeURIComponent(code)};path=/;max-age=31536000;SameSite=Lax`;
}

export function applyDocumentLanguage(code: LanguageCode) {
  if (typeof document === "undefined") return;
  const meta = getLanguage(code);
  document.documentElement.lang = code;
  document.documentElement.dataset.lang = code;
  document.documentElement.dataset.script = meta.script;
  document.documentElement.removeAttribute("dir");
}
