import {
  APP_LANGUAGES,
  FALLBACK_LANGUAGE,
  getLanguage,
  type AppLanguage,
  type LanguageCode,
} from "./languages";

/** Firestore / app country labels → preferred UI languages, most relevant first. */
const COUNTRY_LANGUAGES: Record<string, LanguageCode[]> = {
  Zimbabwe: ["en", "sn", "nd"],
  "Sri Lanka": ["en", "si", "ta"],
  "South Africa": ["en", "zu", "xh", "af"],
  USA: ["en", "es"],
  "United States": ["en", "es"],
  "United Kingdom": ["en"],
  Canada: ["en", "fr"],
  India: ["en", "hi"],
  Singapore: ["en", "zh", "ms", "ta"],
  Thailand: ["th", "en"],
  Maldives: ["dv", "en"],
};

function normalizeCountry(country?: string | null): string {
  return country?.trim() ?? "";
}

export function preferredLanguagesForCountry(
  country?: string | null
): LanguageCode[] {
  const key = normalizeCountry(country);
  return COUNTRY_LANGUAGES[key] ?? [FALLBACK_LANGUAGE];
}

/** Suggested languages first, then every other supported language. */
export function rankedLanguagesForCountry(country?: string | null): AppLanguage[] {
  const preferred = preferredLanguagesForCountry(country);
  const seen = new Set<LanguageCode>();
  const ranked: AppLanguage[] = [];

  preferred.forEach((code) => {
    if (seen.has(code)) return;
    seen.add(code);
    ranked.push(getLanguage(code));
  });

  APP_LANGUAGES.forEach((language) => {
    if (seen.has(language.code)) return;
    ranked.push(language);
  });

  return ranked;
}
