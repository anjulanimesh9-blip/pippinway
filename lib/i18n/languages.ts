export type ScriptId =
  | "latin"
  | "sinhala"
  | "tamil"
  | "thai"
  | "devanagari"
  | "han"
  | "thaana";

export type LanguageCode =
  | "en"
  | "sn"
  | "nd"
  | "si"
  | "ta"
  | "zu"
  | "xh"
  | "af"
  | "es"
  | "fr"
  | "hi"
  | "zh"
  | "ms"
  | "th"
  | "dv";

export type AppLanguage = {
  code: LanguageCode;
  englishName: string;
  nativeName: string;
  script: ScriptId;
  rtl?: boolean;
};

export const FALLBACK_LANGUAGE: LanguageCode = "en";
export const LANGUAGE_STORAGE_KEY = "pippinway.selectedLanguage";

export const APP_LANGUAGES: AppLanguage[] = [
  { code: "en", englishName: "English", nativeName: "English", script: "latin" },
  { code: "sn", englishName: "Shona", nativeName: "ChiShona", script: "latin" },
  { code: "nd", englishName: "Ndebele", nativeName: "isiNdebele", script: "latin" },
  { code: "si", englishName: "Sinhala", nativeName: "සිංහල", script: "sinhala" },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்", script: "tamil" },
  { code: "zu", englishName: "Zulu", nativeName: "isiZulu", script: "latin" },
  { code: "xh", englishName: "Xhosa", nativeName: "isiXhosa", script: "latin" },
  { code: "af", englishName: "Afrikaans", nativeName: "Afrikaans", script: "latin" },
  { code: "es", englishName: "Spanish", nativeName: "Español", script: "latin" },
  { code: "fr", englishName: "French", nativeName: "Français", script: "latin" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", script: "devanagari" },
  { code: "zh", englishName: "Chinese", nativeName: "中文", script: "han" },
  { code: "ms", englishName: "Malay", nativeName: "Bahasa Melayu", script: "latin" },
  { code: "th", englishName: "Thai", nativeName: "ไทย", script: "thai" },
  { code: "dv", englishName: "Dhivehi", nativeName: "ދިވެހި", script: "thaana", rtl: true },
];

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return APP_LANGUAGES.some((language) => language.code === value);
}

export function getLanguage(code: LanguageCode): AppLanguage {
  return APP_LANGUAGES.find((language) => language.code === code) ?? APP_LANGUAGES[0];
}
