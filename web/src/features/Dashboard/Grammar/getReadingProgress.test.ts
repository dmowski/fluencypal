import '@testing-library/jest-dom';
import { getReadingProgress } from './getReadingProgress';

describe('getReadingProgress', () => {
  it('returns full text unchanged when transcript is empty', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';

    const result = getReadingProgress(fullText, '');

    expect(result).toEqual({
      isDone: false,
      activeMarkdown: fullText,
    });
  });

  it('marks the pronounced prefix in italics while allowing extra transcript words', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';
    const transcript = 'I practiced English with teacher teach my teacher, and we are reading';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      activeMarkdown: '*I practiced English with my teacher, and we* read a book.',
    });
  });

  it('handles punctuation differences and returns done when all words are pronounced', () => {
    const fullText = 'Wait, what is this?';
    const transcript = 'wait what is this';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      activeMarkdown: '*Wait, what is this?*',
    });
  });

  it('keeps text unchanged when first word was not pronounced', () => {
    const fullText = 'I practiced English with my teacher, and we read a book.';
    const transcript = 'practiced English with my teacher';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      activeMarkdown: fullText,
    });
  });

  it('supports filler words at the start of transcript', () => {
    const fullText = 'We travel by train every weekend.';
    const transcript = 'well okay we travel by train every';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      activeMarkdown: '*We travel by train every* weekend.',
    });
  });

  it('tracks partial progress in Chinese text with transcript noise', () => {
    const fullText = '我 练习 英语 和 老师 一起 阅读 书籍。';
    const transcript = '嗯 我 练习 英语 和 老师 一起 啊 阅读';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: false,
      activeMarkdown: '*我 练习 英语 和 老师 一起 阅读* 书籍。',
    });
  });

  it('handles Arabic punctuation and marks completion correctly', () => {
    const fullText = 'أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا.';
    const transcript = 'أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا';

    const result = getReadingProgress(fullText, transcript);

    expect(result).toEqual({
      isDone: true,
      activeMarkdown: '*أنا أتمرن على الإنجليزية مع معلمي، ثم نقرأ كتابًا.*',
    });
  });
});
