import { resolvePracticeLanguage } from './resolvePracticeLanguage';

describe('resolvePracticeLanguage', () => {
  it('prefers the saved settings language', () => {
    expect(
      resolvePracticeLanguage({
        settingsLanguage: 'es',
        pendingLanguage: 'fr',
        pageLanguage: 'ar',
      }),
    ).toBe('es');
  });

  it('uses the quiz pending language before the page locale', () => {
    expect(
      resolvePracticeLanguage({
        settingsLanguage: null,
        pendingLanguage: 'id',
        pageLanguage: 'en',
      }),
    ).toBe('id');
  });

  it('uses an explicit quiz snapshot before hydrated settings or page locale', () => {
    expect(
      resolvePracticeLanguage({
        explicitLanguage: 'en',
        settingsLanguage: 'ar',
        pendingLanguage: null,
        pageLanguage: 'ar',
      }),
    ).toBe('en');
  });

  it('falls back to the page locale, then English, instead of crashing', () => {
    expect(
      resolvePracticeLanguage({
        settingsLanguage: null,
        pendingLanguage: null,
        pageLanguage: 'ar',
      }),
    ).toBe('ar');

    expect(
      resolvePracticeLanguage({
        settingsLanguage: null,
        pendingLanguage: null,
      }),
    ).toBe('en');
  });
});
