/** @jest-environment jsdom */

import {
  clearPendingPracticeLanguage,
  PENDING_PRACTICE_LANGUAGE_KEY,
  readPendingPracticeLanguage,
  writePendingPracticeLanguage,
} from './pendingPracticeLanguage';

describe('pendingPracticeLanguage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads a stored language and ignores unknown values', () => {
    expect(readPendingPracticeLanguage()).toBeNull();

    writePendingPracticeLanguage('es');
    expect(window.localStorage.getItem(PENDING_PRACTICE_LANGUAGE_KEY)).toBe('es');
    expect(readPendingPracticeLanguage()).toBe('es');

    window.localStorage.setItem(PENDING_PRACTICE_LANGUAGE_KEY, 'not-a-lang');
    expect(readPendingPracticeLanguage()).toBeNull();
  });

  it('clears the stored language', () => {
    writePendingPracticeLanguage('fr');
    clearPendingPracticeLanguage();
    expect(readPendingPracticeLanguage()).toBeNull();
  });
});
