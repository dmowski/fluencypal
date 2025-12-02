/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: [
    "en",
    "ru",
    "es",
    "de",
    "pl",
    "uk",
    "fr",
    "ar",
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
    "da",
    "no",
    "sv",
    "be",
  ],
  pseudoLocale: "pseudo",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src/"],
    },
  ],
};
