export type SupportedLanguage =
  | "en" // English
  | "fr" // French
  | "pl" // Polish
  | "uk" // Ukrainian
  | "ru" // Russian
  | "es" // Spanish
  | "ar" // Arabic
  | "de" // German
  | "id" // Indonesian
  | "it" // Italian
  | "ja" // Japanese
  | "ko" // Korean
  | "ms" // Malay
  | "pt" // Portuguese
  | "th" // Thai
  | "tr" // Turkish
  | "vi" // Vietnamese
  | "zh" // Chinese
  | "da" // Danish
  | "nb" // Norwegian
  | "sv"; // Swedish

export const supportedLanguages: SupportedLanguage[] = [
  "en",
  "fr",
  "pl",
  "uk",
  "ru",
  "es",
  "ar",
  "de",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "pt",
  "th",
  "tr",
  "vi",
  "zh",
  "da", // Danish
  "nb", // Norwegian
  "sv", // Swedish
];

export const getUserLangCode = () => {
  const userLang = navigator.languages;
  const langCodes = supportedLanguages.filter((lang) => userLang.includes(lang));
  return langCodes;
};

export const fullLanguageName: Record<SupportedLanguage, string> = {
  en: "English",
  ru: "Русский",
  de: "Deutsch",
  pl: "Polski",
  uk: "Українська",
  fr: "Français",
  es: "Español",
  ar: "العربية",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  ms: "Bahasa Melayu",
  pt: "Português",
  th: "ไทย",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  zh: "中文",
  da: "Dansk", // Danish
  nb: "Norsk", // Norwegian
  sv: "Svenska", // Swedish
};

export const fullEnglishLanguageName: Record<SupportedLanguage, string> = {
  en: "English",
  ru: "Russian",
  de: "German",
  pl: "Polish",
  uk: "Ukrainian",
  fr: "French",
  es: "Spanish",
  ar: "Arabic",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  ms: "Malay",
  pt: "Portuguese",
  th: "Thai",
  tr: "Turkish",
  vi: "Vietnamese",
  zh: "Chinese",
  da: "Danish",
  nb: "Norwegian",
  sv: "Swedish",
};
