import { supportedLanguagesToLearn } from '@/features/Lang/lang';
import { getLearnLandingCopy } from './copy';
import {
  isLearnPageLocale,
  isLearnTarget,
  learnLandingPath,
  learnPageLocales,
  learnTargetLanguages,
  learnTargetsMatchCatalog,
} from './targets';

describe('learn landing copy', () => {
  test('target list matches the languages the product can teach', () => {
    expect(learnTargetsMatchCatalog()).toBe(true);
    expect([...learnTargetLanguages].sort()).toEqual([...supportedLanguagesToLearn].sort());
  });

  test('English and Russian share titles use the requested wording', () => {
    expect(getLearnLandingCopy('en', 'pl').shareTitle).toBe('Learn Polish with FluencyPal');
    expect(getLearnLandingCopy('en', 'sr').shareTitle).toBe('Learn Serbian with FluencyPal');
    expect(getLearnLandingCopy('ru', 'sr').shareTitle).toBe('Изучай сербский с FluencyPal');
    expect(getLearnLandingCopy('ru', 'pl').shareTitle).toBe('Изучай польский с FluencyPal');
  });

  test('every interface language names every target, and the title contains that name', () => {
    for (const ui of learnPageLocales) {
      for (const target of learnTargetLanguages) {
        const copy = getLearnLandingCopy(ui, target);
        expect(copy.name.length).toBeGreaterThan(0);
        expect(copy.shareTitle).toContain('FluencyPal');
        expect(copy.shareTitle).toContain(copy.name);
        expect(copy.headline).toContain(copy.name);
        expect(copy.description).toContain(copy.name);
        expect(`${copy.headline} ${copy.imageLine2}`.replace(/\s+/g, ' ')).toContain(copy.name);
      }
    }
  });

  test('paths put English at the root and other languages in a prefix', () => {
    expect(learnLandingPath('en', 'pl')).toBe('/learn/pl');
    expect(learnLandingPath('ru', 'sr')).toBe('/ru/learn/sr');
    expect(learnLandingPath('pl', 'en')).toBe('/pl/learn/en');
  });

  test('guards reject unknown codes', () => {
    expect(isLearnPageLocale('ru')).toBe(true);
    expect(isLearnPageLocale('sr')).toBe(false);
    expect(isLearnTarget('sr')).toBe(true);
    expect(isLearnTarget('uk')).toBe(false);
  });
});
