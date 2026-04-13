import { StripeElementLocale } from '@stripe/stripe-js';

export type SupportedLanguage =
  | 'en' // English
  | 'fr' // French
  | 'pl' // Polish
  | 'uk' // Ukrainian
  | 'ru' // Russian
  | 'es' // Spanish
  | 'ar' // Arabic
  | 'de' // German
  | 'id' // Indonesian
  | 'it' // Italian
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'ms' // Malay
  | 'pt' // Portuguese
  | 'th' // Thai
  | 'tr' // Turkish
  | 'vi' // Vietnamese
  | 'zh' // Chinese
  | 'da' // Danish
  | 'no' // Norwegian
  | 'sv' // Swedish
  | 'be'; // Belarusian

export const getLabelFromCode = (lang: SupportedLanguage) => {
  const englishName = fullEnglishLanguageName[lang];
  const name = fullLanguageName[lang];
  if (name === englishName) {
    return name;
  }
  return `${englishName} (${name})`;
};

export const stripeLocaleMap: Record<SupportedLanguage, StripeElementLocale> = {
  en: 'en',
  ru: 'ru',
  de: 'de',
  pl: 'pl',
  uk: 'ru',
  fr: 'fr',
  es: 'es',
  ar: 'ar',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  ms: 'ms',
  pt: 'pt',
  th: 'th',
  tr: 'tr',
  vi: 'vi',
  zh: 'zh',
  da: 'da',
  no: 'no',
  sv: 'sv',
  be: 'ru', // Belarusian - fallback to Russian
};

export const supportedLanguages: SupportedLanguage[] = [
  'en',
  'es',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'ar',
  'pt',

  'it',
  'pl',
  'ru',

  'uk',
  'id',
  'ms',
  'th',
  'tr',
  'vi',
  'da', // Danish
  'no', // Norwegian
  'sv', // Swedish
  'be',
];

export const supportedLanguagesToLearn: SupportedLanguage[] = [
  'en',
  'es',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'ar',
  'pt',

  'it',
  'pl',
  'ru',

  //"uk",
  'id',
  'ms',
  'th',
  'tr',
  'vi',
  //"da", // Danish
  //"no", // Norwegian
  //"sv", // Swedish
];

export const getUserLangCode = (): SupportedLanguage[] => {
  const userLang = navigator.languages;
  const langCodes = supportedLanguages.filter((lang) => userLang.includes(lang));
  return langCodes;
};

export const getPageLangCode = (): SupportedLanguage => {
  const isWindow = typeof window !== 'undefined';
  if (!isWindow) {
    return 'en'; // Default to English if not in a browser environment
  }
  const url = new URL(window.location.href);
  const langParts = url.pathname.split('/');
  const langCode = langParts[1] || 'en'; // Default to English if no language code is found
  if (supportedLanguages.includes(langCode as SupportedLanguage)) {
    return langCode as SupportedLanguage;
  }
  return 'en'; // Default to English if the language code is not supported
};

export const emojiLanguageName: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  ru: '🇷🇺',
  de: '🇩🇪',
  pl: '🇵🇱',
  uk: '🇺🇦',
  fr: '🇫🇷',
  es: '🇪🇸',
  ar: '🇸🇦',
  id: '🇮🇩',
  it: '🇮🇹',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ms: '🇲🇾',
  pt: '🇵🇹',
  th: '🇹🇭',
  tr: '🇹🇷',
  vi: '🇻🇳',
  zh: '🇨🇳',
  da: '🇩🇰', // Danish
  no: '🇳🇴', // Norwegian
  sv: '🇸🇪', // Swedish
  be: '🇧🇾', // Belarusian
};

export const langFlags: Record<string, string> = {
  en: 'https://flagcdn.com/w80/us.png',
  ru: 'https://flagcdn.com/w80/ru.png',
  de: 'https://flagcdn.com/w80/de.png',
  pl: 'https://flagcdn.com/w80/pl.png',
  uk: 'https://flagcdn.com/w80/ua.png',
  fr: 'https://flagcdn.com/w80/fr.png',
  es: 'https://flagcdn.com/w80/es.png',
  ar: 'https://flagcdn.com/w80/sa.png',
  id: 'https://flagcdn.com/w80/id.png',
  it: 'https://flagcdn.com/w80/it.png',
  ja: 'https://flagcdn.com/w80/jp.png',
  ko: 'https://flagcdn.com/w80/kr.png',
  ms: 'https://flagcdn.com/w80/my.png',
  pt: 'https://flagcdn.com/w80/pt.png',
  th: 'https://flagcdn.com/w80/th.png',
  tr: 'https://flagcdn.com/w80/tr.png',
  vi: 'https://flagcdn.com/w80/vn.png',
  zh: 'https://flagcdn.com/w80/cn.png',
  da: 'https://flagcdn.com/w80/dk.png', // Danish
  no: 'https://flagcdn.com/w80/no.png', // Norwegian
  sv: 'https://flagcdn.com/w80/se.png', // Swedish
  be: 'https://flagcdn.com/w80/by.png', // Belarusian
};

export const fullLanguageName: Record<SupportedLanguage, string> = {
  en: 'English',
  ru: 'Русский',
  de: 'Deutsch',
  pl: 'Polski',
  uk: 'Українська',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  ms: 'Bahasa Melayu',
  pt: 'Português',
  th: 'ไทย',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
  zh: '中文',
  da: 'Dansk', // Danish
  no: 'Norsk', // Norwegian
  sv: 'Svenska', // Swedish
  be: 'Беларуская', // Belarusian
};

export const fullEnglishLanguageName: Record<SupportedLanguage, string> = {
  en: 'English',
  ru: 'Russian',
  de: 'German',
  pl: 'Polish',
  uk: 'Ukrainian',
  fr: 'French',
  es: 'Spanish',
  ar: 'Arabic',
  id: 'Indonesian',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  ms: 'Malay',
  pt: 'Portuguese',
  th: 'Thai',
  tr: 'Turkish',
  vi: 'Vietnamese',
  zh: 'Chinese',
  da: 'Danish',
  no: 'Norwegian',
  sv: 'Swedish',
  be: 'Belarusian',
};

export const languageInstructionForVoice: Record<SupportedLanguage, string> = {
  en: 'Use english language',
  ru: 'Используй русский язык',
  de: 'Benutze die deutsche Sprache',
  pl: 'Użyj języka polskiego',
  uk: 'Використовуйте українську мову',
  fr: 'Utilisez la langue française',
  es: 'Usa el idioma español',
  ar: 'استخدم اللغة العربية',
  id: 'Gunakan bahasa Indonesia',
  it: 'Usa la lingua italiana',
  ja: '日本語を使用してください',
  ko: '한국어를 사용하세요',
  ms: 'Gunakan bahasa Melayu',
  pt: 'Use o idioma português',
  th: 'ใช้ภาษาไทย',
  tr: 'Türkçe kullanın',
  vi: 'Sử dụng tiếng Việt',
  zh: '使用中文',
  da: 'Brug dansk', // Danish
  no: 'Bruk norsk', // Norwegian
  sv: 'Använd svenska', // Swedish
  be: 'Выкарыстоўвайце беларускую мову', // Belarusian
};

export const speechRecognitionLanguages: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  de: 'de-DE',
  pl: 'pl-PL',
  uk: 'uk-UA',
  fr: 'fr-FR',
  es: 'es-ES',
  ar: 'ar-SA',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ms: 'ms-MY',
  pt: 'pt-PT',
  th: 'th-TH',
  tr: 'tr-TR',
  vi: 'vi-VN',
  zh: 'zh-CN',
  da: 'da-DK', // Danish
  no: 'nb-NO', // Norwegian
  sv: 'sv-SE', // Swedish
  be: 'uk-UA', // Belarusian
};

export const availableOnLabelMap: Record<SupportedLanguage, string> = {
  ru: 'Доступно на русском',
  en: 'Available in English',
  es: 'Disponible en español',
  fr: 'Disponible en français',
  de: 'Verfügbar auf Deutsch',
  it: 'Disponibile in italiano',
  pt: 'Disponível em português',
  ja: '日本語で利用可能',
  ko: '한국어로 이용 가능',
  zh: '中文可用',
  ar: 'متوفر باللغة العربية',
  tr: 'Türkçe mevcut',
  pl: 'Dostępne w języku polskim',
  uk: 'Доступно на українській',
  id: 'Tersedia dalam bahasa Indonesia',
  ms: 'Tersedia dalam Bahasa Melayu',
  th: 'มีให้บริการในภาษาไทย',
  vi: 'Có sẵn bằng tiếng Việt',
  da: 'Tilgængelig på dansk',
  no: 'Tilgjengelig på norsk',
  sv: 'Tillgänglig på svenska',
  be: 'Даступна на беларускай',
};

export const firstAiMessage: Record<SupportedLanguage, string> = {
  en: 'Hello... I am here!',
  ru: 'Привет... Я здесь!',
  de: 'Hallo... Ich bin hier!',
  pl: 'Cześć... Jestem tutaj!',
  uk: 'Привіт... Я тут!',
  fr: 'Bonjour... Je suis là!',
  es: 'Hola... Estoy aquí!',
  ar: 'مرحبًا... أنا هنا!',
  id: 'Halo... Saya di sini!',
  it: 'Ciao... Sono qui!',
  ja: 'こんにちは... ここにいます！',
  ko: '안녕하세요... 여기 있습니다!',
  ms: 'Hello... Saya di sini!',
  pt: 'Olá... Estou aqui!',
  th: 'สวัสดี... ฉันอยู่ที่นี่!',
  tr: 'Merhaba... Buradayım!',
  vi: 'Xin chào... Tôi ở đây!',
  zh: '你好... 我在这里！',
  da: 'Hej... Jeg er her!',
  no: 'Hei... Jeg er her!',
  sv: 'Hej... Jag är här!',
  be: 'Прывітанне... Я тут!',
};
