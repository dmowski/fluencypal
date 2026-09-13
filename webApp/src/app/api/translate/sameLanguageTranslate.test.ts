import { areTranslateLanguagesEqual, isSameLanguageTranslateError } from './sameLanguageTranslate';

describe('areTranslateLanguagesEqual', () => {
  it('treats a region suffix as the same language', () => {
    expect(areTranslateLanguagesEqual('en', 'en-US')).toBe(true);
    expect(areTranslateLanguagesEqual('zh-CN', 'zh')).toBe(true);
  });

  it('does not skip when languages differ or source is auto', () => {
    expect(areTranslateLanguagesEqual('en', 'es')).toBe(false);
    expect(areTranslateLanguagesEqual(null, 'en')).toBe(false);
  });
});

describe('isSameLanguageTranslateError', () => {
  it('matches the Google Translate same-language INVALID_ARGUMENT', () => {
    expect(
      isSameLanguageTranslateError(
        new Error('3 INVALID_ARGUMENT: Target language can\'t be equal to source language.'),
      ),
    ).toBe(true);
    expect(isSameLanguageTranslateError(new Error('INVALID_ARGUMENT'))).toBe(false);
  });
});
