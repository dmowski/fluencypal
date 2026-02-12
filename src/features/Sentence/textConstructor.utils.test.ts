import '@testing-library/jest-dom';
import {
  constructFinalProgress,
  generateRandomWordOptions,
  getActiveSentencePart,
} from './textConstructor.utils';

describe('getActiveSentencePart', () => {
  const sentences = [
    'Lucas goes to school every day of the week.',
    'He has many subjects to go to each school day',
  ];
  const sentencesTranslates = [
    'Лукас ходит в школу каждый день недели.',
    'Ему нужно посещать множество уроков каждый учебный день.',
  ];

  it('returns first sentence and first word for empty progress', () => {
    const result = getActiveSentencePart({ sentences, sentencesTranslates, progress: '' });

    expect(result).toEqual({
      sentenceIndex: 0,
      activeSentence: sentences[0],
      activeTranslation: sentencesTranslates[0],
      activeSentenceWords: ['Lucas', 'goes', 'to', 'school', 'every', 'day', 'of', 'the', 'week.'],
      completedWordsInSentence: 0,
      nextWord: 'Lucas',
    });
  });

  it('returns active translation and next word for partially completed sentence', () => {
    const result = getActiveSentencePart({
      sentences,
      sentencesTranslates,
      progress: 'Lucas goes to school every',
    });

    expect(result?.sentenceIndex).toBe(0);
    expect(result?.activeTranslation).toBe(sentencesTranslates[0]);
    expect(result?.nextWord).toBe('day');
    expect(result?.completedWordsInSentence).toBe(5);
  });

  it('moves to next sentence once previous is complete', () => {
    const result = getActiveSentencePart({
      sentences,
      sentencesTranslates,
      progress: 'Lucas goes to school every day of the week.',
    });

    expect(result?.sentenceIndex).toBe(1);
    expect(result?.activeTranslation).toBe(sentencesTranslates[1]);
    expect(result?.nextWord).toBe('He');
  });

  it('returns null when all sentences are completed', () => {
    const result = getActiveSentencePart({
      sentences,
      sentencesTranslates,
      progress:
        'Lucas goes to school every day of the week. He has many subjects to go to each school day',
    });

    expect(result).toBeNull();
  });
});

describe('generateRandomWordOptions', () => {
  it('contains correct word and uses words from active sentence only', () => {
    const random = jest.fn(() => 0.42);
    const words = ['Lucas', 'goes', 'to', 'school', 'every', 'day'];
    const result = generateRandomWordOptions({
      activeSentenceWords: words,
      completedWordsInSentence: 2,
      correctWord: 'school',
      optionsCount: 3,
      random,
    });

    expect(result).toHaveLength(3);
    expect(result).toContain('school');
    expect(result.every((word) => words.slice(2).includes(word))).toBe(true);
  });

  it('allows repeated word when it appears again later in sentence', () => {
    const result = generateRandomWordOptions({
      activeSentenceWords: ['to', 'go', 'to', 'school', 'to'],
      completedWordsInSentence: 1,
      correctWord: 'go',
      optionsCount: 3,
      random: () => 0.1,
    });

    expect(result).toContain('go');
    expect(result).toContain('to');
    expect(new Set(result).size).toBe(result.length);
  });

  it('does not include words fully used in completed part', () => {
    const result = generateRandomWordOptions({
      activeSentenceWords: ['Lucas', 'goes', 'to', 'school', 'every', 'day'],
      completedWordsInSentence: 3,
      correctWord: 'school',
      optionsCount: 3,
      random: () => 0.1,
    });

    expect(result).toContain('school');
    expect(result).not.toContain('Lucas');
    expect(result).not.toContain('goes');
    expect(result).not.toContain('to');
  });
});

describe('constructFinalProgress', () => {
  it('appends next word to progress', () => {
    const result = constructFinalProgress({ progress: 'Lucas goes to', nextWord: 'school' });

    expect(result).toBe('Lucas goes to school');
  });

  it('handles extra spaces', () => {
    const result = constructFinalProgress({ progress: '  Lucas goes to  ', nextWord: ' school ' });

    expect(result).toBe('Lucas goes to school');
  });
});
