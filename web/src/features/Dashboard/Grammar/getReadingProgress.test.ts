import '@testing-library/jest-dom';
import { getReadingProgress } from './getReadingProgress';

describe('getReadingProgress', () => {
  it('returns full text unchanged when transcript is empty', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';

    const result = getReadingProgress(fullText, '');

    expect(result).toEqual({
      isDone: false,
      completionPercentage: 0,
      activeMarkdown: fullText,
    });
  });

  it('marks the pronounced prefix in italics while allowing extra transcript words', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';
    const transcript = 'I practiced English with teacher teach my teacher, and we are reading';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 73,
      activeMarkdown: '*I practiced English with my teacher, and we* read a book.',
    });
  });

  it('handles punctuation differences and returns done when all words are pronounced', () => {
    const fullText = 'Wait, what is this?';
    const transcript = 'wait what is this';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 100,
      activeMarkdown: '*Wait, what is this?*',
    });
  });

  it('keeps text unchanged when first word was not pronounced', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';
    const transcript = 'practiced English with my teacher';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      completionPercentage: 0,
      activeMarkdown: fullText,
    });
  });

  it('supports filler words at the start of transcript', () => {
    const fullText = 'We travel by train every weekend.';
    const transcript = 'well okay we travel by train every';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 83,
      activeMarkdown: '*We travel by train every* weekend.',
    });
  });

  it('tracks partial progress in Chinese text with transcript noise', () => {
    const fullText = '我 练习 英语 和 老师 一起 阅读 书籍。';
    const transcript = '嗯 我 练习 英语 和 老师 一起 啊 阅读';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 88,
      activeMarkdown: '*我 练习 英语 和 老师 一起 阅读* 书籍。',
    });
  });

  it('handles Arabic punctuation and marks completion correctly', () => {
    const fullText = 'أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا.';
    const transcript = 'أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 100,
      activeMarkdown: '*أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا.*',
    });
  });

  it('returns full text when transcript contains only noise with no sentence words', () => {
    const fullText = 'I love reading books every day.';
    const transcript = 'um uh hmm ah er';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      completionPercentage: 0,
      activeMarkdown: fullText,
    });
  });

  it('handles repeated word in sentence and stops at the correct boundary', () => {
    const fullText = 'She took the book and the bag.';
    const transcript = 'she took the book and';

    const result = getReadingProgress(fullText, transcript);

    // second "the" is not yet read — prefix ends after "and"
    expect(result).toEqual({
      isDone: true,
      completionPercentage: 71,
      activeMarkdown: '*She took the book and* the bag.',
    });
  });

  it('marks single-word sentence as done when pronounced', () => {
    const fullText = 'Hello!';
    const transcript = 'hello';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 100,
      activeMarkdown: '*Hello!*',
    });
  });

  it('places the prefix boundary correctly when an ellipsis token normalises to null', () => {
    // "..." normalises to null inside tokenizeText, so it must be skipped
    // when counting matched words and the prefix end must still land after "there?"
    const fullText = 'Wait ... are you there?';
    const transcript = 'wait are you there';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 100,
      activeMarkdown: '*Wait ... are you there?*',
    });
  });

  it('matches Arabic words when STT output lacks diacritics (harakat)', () => {
    // STT engines return unvocalised Arabic; text may carry full tashkeel.
    // "أقرأُ" (with damma) must match "أقرأ", "كلَّ" must match "كل", etc.
    const fullText = 'أنا أقرأُ كلَّ يوم.';
    const transcript = 'أنا أقرأ كل يوم';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 100,
      activeMarkdown: '*أنا أقرأُ كلَّ يوم.*',
    });
  });

  it('highlights multiple met parts while skipping difficult words', () => {
    const fullText = "No, it's a book by Malcolm Gladwell and David Ingoloff.";
    const transcript = "no it's a book by bank account Gladwell and David in golf";

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 80,
      activeMarkdown: "*No, it's a book by* Malcolm *Gladwell and David* Ingoloff.",
    });
  });

  it('does not use language-specific aliases for number words', () => {
    const fullText = 'I have two books.';
    const transcript = 'I have 2 books';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      completionPercentage: 75,
      activeMarkdown: '*I have* two *books.*',
    });
  });

  it('matches sentence start when full text uses curly apostrophe and transcript uses straight apostrophe', () => {
    const fullText = 'It’s a course for beginners and intermediate students.';
    const transcript = "it's a course";

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      completionPercentage: 38,
      activeMarkdown: '*It’s a course* for beginners and intermediate students.',
    });
  });
});
