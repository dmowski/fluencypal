/**
 * @jest-environment jsdom
 */
import {
  clipQuizTalkAbout,
  markQuizTalkAbout,
  MAX_QUIZ_TALK_ABOUT_CHARS,
  MIN_QUIZ_TALK_CHOICE_WORDS,
  QUIZ_TALK_ABOUT_KEY,
  quizTalkAboutHasChoiceMaterial,
  quizTalkAboutWordCount,
  readQuizTalkAbout,
} from './quizTalk';

describe('quizTalk about snapshot', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('clips whitespace and long transcripts', () => {
    expect(clipQuizTalkAbout('  I want to speak.  ')).toBe('I want to speak.');
    expect(clipQuizTalkAbout('   ')).toBe('');
    const long = 'word '.repeat(200).trim();
    const clipped = clipQuizTalkAbout(long);
    expect(clipped.endsWith('…')).toBe(true);
    expect(clipped.length).toBe(MAX_QUIZ_TALK_ABOUT_CHARS + 1);
  });

  it('stores and reads the quiz about-you clip', () => {
    markQuizTalkAbout('  I want English for work.  ');
    expect(window.sessionStorage.getItem(QUIZ_TALK_ABOUT_KEY)).toBe('I want English for work.');
    expect(readQuizTalkAbout()).toBe('I want English for work.');
  });

  it('clears an empty snapshot', () => {
    markQuizTalkAbout('kept');
    markQuizTalkAbout('   ');
    expect(readQuizTalkAbout()).toBe('');
    expect(window.sessionStorage.getItem(QUIZ_TALK_ABOUT_KEY)).toBeNull();
  });

  it('needs five words before a closed first-question choice', () => {
    expect(MIN_QUIZ_TALK_CHOICE_WORDS).toBe(5);
    expect(quizTalkAboutWordCount('I want English')).toBe(3);
    expect(quizTalkAboutHasChoiceMaterial('I want English')).toBe(false);
    expect(quizTalkAboutHasChoiceMaterial('I want to speak English at work.')).toBe(true);
    expect(quizTalkAboutHasChoiceMaterial('   ')).toBe(false);
  });
});
