import { pickVoiceForLanguage, toSpeechLanguage } from './speechVoices';

describe('toSpeechLanguage', () => {
  it('maps supported codes to BCP-47 tags', () => {
    expect(toSpeechLanguage('en')).toBe('en-US');
    expect(toSpeechLanguage('pl')).toBe('pl-PL');
    expect(toSpeechLanguage('ru')).toBe('ru-RU');
  });
});

describe('pickVoiceForLanguage', () => {
  const voices = [
    { lang: 'en-US', name: 'Compact English', localService: true, voiceURI: 'en-compact' },
    { lang: 'en-US', name: 'Google US English', localService: false, voiceURI: 'en-google' },
    { lang: 'pl-PL', name: 'Zosia', localService: true, voiceURI: 'pl-zosia' },
  ] as SpeechSynthesisVoice[];

  it('picks the highest quality matching voice', () => {
    expect(pickVoiceForLanguage('en', voices)?.voiceURI).toBe('en-google');
    expect(pickVoiceForLanguage('pl', voices)?.voiceURI).toBe('pl-zosia');
    expect(pickVoiceForLanguage('ru', voices)).toBeNull();
  });
});
