import { buildJustTalkPracticeUrl, isJustTalkHandoff } from './justTalkHandoff';

describe('justTalkHandoff', () => {
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
});
