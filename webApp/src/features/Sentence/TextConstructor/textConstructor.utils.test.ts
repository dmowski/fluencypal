import '@testing-library/jest-dom';
import {
  constructFinalProgress,
  generateRandomWordOptions,
  getActiveSentencePart,
  splitWords,
} from './textConstructor.utils';

describe('splitWords', () => {
  it('splits Japanese text without spaces into words', () => {
    const result = splitWords('私は学校に行きます');

    expect(result).toEqual(['私', 'は', '学校', 'に', '行き', 'ます']);
  });

  it('splits em-dash-joined words into separate tokens', () => {
    expect(splitWords('hoping for—and what')).toEqual(['hoping', 'for—', 'and', 'what']);
  });

  it('keeps a trailing em-dash attached to the preceding word', () => {
    expect(splitWords('She whispered—')).toEqual(['She', 'whispered—']);
  });

  it('handles em-dash adjacent to quote characters', () => {
    expect(splitWords('you“—he points to another stack—”these')).toEqual([
      'you“—',
      'he',
      'points',
      'to',
      'another',
      'stack—',
      '”these',
    ]);
  });

  it('handles multiple em-dash splits within a sentence', () => {
    expect(splitWords('she said one—two—three things')).toEqual([
      'she',
      'said',
      'one—',
      'two—',
      'three',
      'things',
    ]);
  });

  it('splits Chinese text without spaces into words', () => {
    const result = splitWords('我每天去学校');

    expect(result).toEqual(['我', '每天', '去', '学校']);
  });

  it('splits Arabic text with spaces into words', () => {
    const result = splitWords('أنا أذهب إلى المدرسة كل يوم');

    expect(result).toEqual(['أنا', 'أذهب', 'إلى', 'المدرسة', 'كل', 'يوم']);
  });

  it('splits Thai text without spaces into words', () => {
    const result = splitWords('ฉันไปโรงเรียนทุกวัน');

    expect(result.length).toBeGreaterThan(1);
    expect(result.join('')).toBe('ฉันไปโรงเรียนทุกวัน');
  });

  it('supports all currently supported app languages', () => {
    const samples: Array<{ lang: string; text: string; minWords: number }> = [
      { lang: 'en', text: 'I go to school every day.', minWords: 6 },
      { lang: 'es', text: 'Voy a la escuela cada día.', minWords: 6 },
      { lang: 'zh', text: '我每天去学校', minWords: 2 },
      { lang: 'fr', text: 'Je vais à lécole chaque jour.', minWords: 6 },
      { lang: 'de', text: 'Ich gehe jeden Tag zur Schule.', minWords: 6 },
      { lang: 'ja', text: '私は毎日学校に行きます', minWords: 2 },
      { lang: 'ko', text: '나는 매일 학교에 간다.', minWords: 4 },
      { lang: 'ar', text: 'أنا أذهب إلى المدرسة كل يوم', minWords: 6 },
      { lang: 'pt', text: 'Eu vou para a escola todos os dias.', minWords: 8 },
      { lang: 'it', text: 'Vado a scuola ogni giorno.', minWords: 5 },
      { lang: 'pl', text: 'Codziennie chodzę do szkoły.', minWords: 4 },
      { lang: 'ru', text: 'Я хожу в школу каждый день.', minWords: 6 },
      { lang: 'uk', text: 'Я ходжу до школи щодня.', minWords: 5 },
      { lang: 'id', text: 'Saya pergi ke sekolah setiap hari.', minWords: 6 },
      { lang: 'ms', text: 'Saya pergi ke sekolah setiap hari.', minWords: 6 },
      { lang: 'th', text: 'ฉันไปโรงเรียนทุกวัน', minWords: 2 },
      { lang: 'tr', text: 'Her gün okula giderim.', minWords: 4 },
      { lang: 'vi', text: 'Tôi đi học mỗi ngày.', minWords: 5 },
      { lang: 'da', text: 'Jeg går i skole hver dag.', minWords: 6 },
      { lang: 'no', text: 'Jeg går på skolen hver dag.', minWords: 6 },
      { lang: 'sv', text: 'Jag går till skolan varje dag.', minWords: 6 },
      { lang: 'be', text: 'Я хаджу ў школу кожны дзень.', minWords: 6 },
    ];

    for (const sample of samples) {
      const words = splitWords(sample.text);

      expect(words.length).toBeGreaterThanOrEqual(sample.minWords);
      expect(words.every((word) => word.trim().length > 0)).toBe(true);
    }
  });
});

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
