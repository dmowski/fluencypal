/**
 * @jest-environment jsdom
 */
import {
  buildJustTalkPracticeUrl,
  consumeJustTalkAutoStart,
  getPracticeIdleSurface,
  hasUserSpokenInConversation,
  isJustTalkHandoff,
  JUST_TALK_AUTO_START_KEY,
  markJustTalkAutoStart,
  peekJustTalkAutoStart,
} from './justTalkHandoff';

describe('justTalkHandoff', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('treats open and true as a handoff', () => {
    expect(isJustTalkHandoff('open')).toBe(true);
    expect(isJustTalkHandoff('true')).toBe(true);
    expect(isJustTalkHandoff('')).toBe(false);
    expect(isJustTalkHandoff(null)).toBe(false);
  });

  it('sends quiz finish to practice with justTalk=open', () => {
    expect(buildJustTalkPracticeUrl({ pageLanguage: 'en' })).toBe('/practice?justTalk=open');
    expect(buildJustTalkPracticeUrl({ pageLanguage: 'id' })).toBe('/id/practice?justTalk=open');
    expect(buildJustTalkPracticeUrl({ pageLanguage: 'ja', paymentModal: true })).toBe(
      '/ja/practice?justTalk=open&paymentModal=true',
    );
  });

  it('marks and consumes quiz mic-prime auto-start once', () => {
    expect(peekJustTalkAutoStart()).toBe(false);
    expect(consumeJustTalkAutoStart()).toBe(false);
    markJustTalkAutoStart();
    expect(peekJustTalkAutoStart()).toBe(true);
    expect(window.sessionStorage.getItem(JUST_TALK_AUTO_START_KEY)).toBe('1');
    expect(consumeJustTalkAutoStart()).toBe(true);
    expect(peekJustTalkAutoStart()).toBe(false);
    expect(consumeJustTalkAutoStart()).toBe(false);
    expect(window.sessionStorage.getItem(JUST_TALK_AUTO_START_KEY)).toBeNull();
  });

  it('counts a non-empty user message as spoken', () => {
    expect(hasUserSpokenInConversation([{ isBot: true, text: 'Hello' }])).toBe(false);
    expect(hasUserSpokenInConversation([{ isBot: false, text: '   ' }])).toBe(false);
    expect(
      hasUserSpokenInConversation([
        { isBot: true, text: 'Hello' },
        { isBot: false, text: 'Hi' },
      ]),
    ).toBe(true);
  });

  it('keeps the handoff screen when Just Talk is open and the call is not started', () => {
    expect(
      getPracticeIdleSurface({
        isStarted: false,
        isHandoff: true,
        isInitializing: '',
      }),
    ).toBe('handoff');
    expect(
      getPracticeIdleSurface({
        isStarted: false,
        isHandoff: true,
        errorInitiating: 'Please enable microphone',
        isInitializing: '',
      }),
    ).toBe('handoff');
    expect(
      getPracticeIdleSurface({
        isStarted: false,
        isHandoff: false,
        errorInitiating: 'boom',
        isInitializing: '',
      }),
    ).toBe('error');
    expect(
      getPracticeIdleSurface({
        isStarted: true,
        isHandoff: true,
        isInitializing: '',
      }),
    ).toBe('conversation');
    expect(
      getPracticeIdleSurface({
        isStarted: false,
        isHandoff: false,
        isInitializing: '',
      }),
    ).toBe('dashboard');
  });
});
