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
  | "sv"
  | "be";

export const getLabelFromCode = (lang: SupportedLanguage) => {
  const englishName = fullEnglishLanguageName[lang];
  const name = fullLanguageName[lang];
  return `${englishName} (${name})`;
};

export const supportedLanguages: SupportedLanguage[] = [
  "en",
  "es",
  "zh",
  "fr",
  "de",
  "ja",
  "ko",
  "ar",
  "pt",

  "it",
  "pl",
  "ru",

  "uk",
  "id",
  "ms",
  "th",
  "tr",
  "vi",
  "da", // Danish
  "nb", // Norwegian
  "sv", // Swedish
  "be",
];

export const getUserLangCode = (): SupportedLanguage[] => {
  const userLang = navigator.languages;
  const langCodes = supportedLanguages.filter((lang) => userLang.includes(lang));
  return langCodes;
};

export const emojiLanguageName: Record<SupportedLanguage, string> = {
  en: "🇺🇸",
  ru: "🇷🇺",
  de: "🇩🇪",
  pl: "🇵🇱",
  uk: "🇺🇦",
  fr: "🇫🇷",
  es: "🇪🇸",
  ar: "🇸🇦",
  id: "🇮🇩",
  it: "🇮🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  ms: "🇲🇾",
  pt: "🇵🇹",
  th: "🇹🇭",
  tr: "🇹🇷",
  vi: "🇻🇳",
  zh: "🇨🇳",
  da: "🇩🇰", // Danish
  nb: "🇳🇴", // Norwegian
  sv: "🇸🇪", // Swedish
  be: "🇧🇾", // Belarusian
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
  be: "Беларуская", // Belarusian
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
  be: "Belarusian",
};

export const accentsList: Record<SupportedLanguage, string[]> = {
  en: ["American", "British", "Australian", "Indian"],
  fr: ["France", "Canadian (Quebec)", "Belgian"],
  pl: ["Standard Polish"],
  uk: ["Kyiv", "Western Ukraine"],
  ru: ["Moscow", "St. Petersburg"],
  es: ["Spain", "Mexican", "Argentinian", "Colombian"],
  ar: ["Modern Standard Arabic", "Egyptian", "Levantine", "Gulf"],
  de: ["High German", "Austrian", "Swiss German"],
  id: ["Jakarta (Standard Indonesian)"],
  it: ["Standard Italian", "Roman", "Neapolitan"],
  ja: ["Tokyo (Standard Japanese)", "Kansai"],
  ko: ["Seoul (Standard Korean)"],
  ms: ["Standard Malay (Malaysia)", "Singaporean"],
  pt: ["European Portuguese", "Brazilian Portuguese"],
  th: ["Central Thai (Bangkok)"],
  tr: ["Istanbul (Standard Turkish)"],
  vi: ["Northern (Hanoi)", "Southern (Ho Chi Minh City)"],
  zh: ["Mandarin (Beijing)", "Taiwanese Mandarin", "Cantonese (Hong Kong)"],
  da: ["Standard Danish"],
  nb: ["Eastern Norwegian (Oslo)"],
  sv: ["Standard Swedish (Stockholm)"],
  be: ["Standard Belarusian (Minsk)"],
};

export const availableOnLabelMap: Record<SupportedLanguage, string> = {
  ru: "Доступно на русском",
  en: "Available in English",
  es: "Disponible en español",
  fr: "Disponible en français",
  de: "Verfügbar auf Deutsch",
  it: "Disponibile in italiano",
  pt: "Disponível em português",
  ja: "日本語で利用可能",
  ko: "한국어로 이용 가능",
  zh: "中文可用",
  ar: "متوفر باللغة العربية",
  tr: "Türkçe mevcut",
  pl: "Dostępne w języku polskim",
  uk: "Доступно на українській",
  id: "Tersedia dalam bahasa Indonesia",
  ms: "Tersedia dalam Bahasa Melayu",
  th: "มีให้บริการในภาษาไทย",
  vi: "Có sẵn bằng tiếng Việt",
  da: "Tilgængelig på dansk",
  nb: "Tilgjengelig på norsk",
  sv: "Tillgänglig på svenska",
  be: "Даступна на беларускай",
};

export const firstAiMessage: Record<SupportedLanguage, string> = {
  en: "Hello... I am here!",
  ru: "Привет... Я здесь!",
  de: "Hallo... Ich bin hier!",
  pl: "Cześć... Jestem tutaj!",
  uk: "Привіт... Я тут!",
  fr: "Bonjour... Je suis là!",
  es: "Hola... Estoy aquí!",
  ar: "مرحبًا... أنا هنا!",
  id: "Halo... Saya di sini!",
  it: "Ciao... Sono qui!",
  ja: "こんにちは... ここにいます！",
  ko: "안녕하세요... 여기 있습니다!",
  ms: "Hello... Saya di sini!",
  pt: "Olá... Estou aqui!",
  th: "สวัสดี... ฉันอยู่ที่นี่!",
  tr: "Merhaba... Buradayım!",
  vi: "Xin chào... Tôi ở đây!",
  zh: "你好... 我在这里！",
  da: "Hej... Jeg er her!",
  nb: "Hei... Jeg er her!",
  sv: "Hej... Jag är här!",
  be: "Прывітанне... Я тут!",
};
