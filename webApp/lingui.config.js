/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: [
    'en',
    'ru',
    'es',
    'de',
    'pl',
    'uk',
    'fr',
    'ar',
    'id',
    'it',
    'ja',
    'ko',
    'ms',
    'pt',
    'th',
    'tr',
    'vi',
    'zh',
    'da',
    'no',
    'sv',
    'be',
    'sr',
  ],
  pseudoLocale: 'pseudo',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en',
  },
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['src/'],
      // Vitest screenshot dirs are named `*.browser.test.tsx`, so the extractor tries to read them.
      exclude: ['**/__screenshots__/**'],
    },
  ],
};
