import { getNativeLanguageQuizNextUrl } from './quizLocaleUrl';

const defaultState = {
  learn: 'en',
  nativeLang: 'en',
  pageLang: 'en',
  currentStep: 'learnLanguage',
};

const nextState = {
  learn: 'en',
  nativeLang: 'ru',
  pageLang: 'en',
  currentStep: 'teacherSelection',
};

describe('getNativeLanguageQuizNextUrl', () => {
  it('goes straight to the localized teacher step from /quiz', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'nativeLanguage',
        nativeLanguage: 'ru',
        currentPageLang: 'en',
        nextState,
        defaultState,
        pathname: '/quiz',
        search: '?nativeLang=ru&currentStep=nativeLanguage',
      }),
    ).toBe('/ru/quiz?nativeLang=ru&currentStep=teacherSelection');
  });

  it('replaces an existing locale prefix without an intermediate unprefixed URL', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'nativeLanguage',
        nativeLanguage: 'ru',
        currentPageLang: 'pl',
        nextState: {
          ...nextState,
          pageLang: 'pl',
        },
        defaultState: {
          ...defaultState,
          nativeLang: 'pl',
          pageLang: 'pl',
        },
        pathname: '/pl/quiz',
        search: '?nativeLang=ru&currentStep=nativeLanguage',
      }),
    ).toBe('/ru/quiz?nativeLang=ru&currentStep=teacherSelection');
  });

  it('keeps extra query params', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'nativeLanguage',
        nativeLanguage: 'ru',
        currentPageLang: 'en',
        nextState,
        defaultState,
        pathname: '/quiz',
        search: '?utm_source=ads&nativeLang=ru&currentStep=nativeLanguage',
      }),
    ).toBe('/ru/quiz?utm_source=ads&nativeLang=ru&currentStep=teacherSelection');
  });

  it('does not redirect when the native language already matches the page locale', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'nativeLanguage',
        nativeLanguage: 'en',
        currentPageLang: 'en',
        nextState: {
          ...nextState,
          nativeLang: 'en',
        },
        defaultState,
        pathname: '/quiz',
        search: '?currentStep=nativeLanguage',
      }),
    ).toBeNull();
  });

  it('does not redirect for a native language that is not a UI locale', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'nativeLanguage',
        nativeLanguage: 'hi',
        currentPageLang: 'en',
        nextState: {
          ...nextState,
          nativeLang: 'hi',
        },
        defaultState,
        pathname: '/quiz',
        search: '?nativeLang=hi&currentStep=nativeLanguage',
      }),
    ).toBeNull();
  });

  it('only applies on the native language step', () => {
    expect(
      getNativeLanguageQuizNextUrl({
        currentStep: 'teacherSelection',
        nativeLanguage: 'ru',
        currentPageLang: 'en',
        nextState,
        defaultState,
        pathname: '/quiz',
        search: '?nativeLang=ru&currentStep=teacherSelection',
      }),
    ).toBeNull();
  });
});
