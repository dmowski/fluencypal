import { expect, Page } from '@playwright/test';
import { SpokenWindow } from './shared';

export const installSpeechMock = async (page: Page) => {
  await page.addInitScript(() => {
    const spokenTexts: string[] = [];

    class MockUtterance {
      text: string;

      lang = '';

      voice: SpeechSynthesisVoice | null = null;

      onend: null | (() => void) = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    const voices = [
      {
        default: true,
        lang: 'en-US',
        localService: true,
        name: 'Mock English Voice',
        voiceURI: 'mock-en-us-voice',
      },
    ] as SpeechSynthesisVoice[];

    const speechSynthesisMock = {
      _listeners: new Map<string, Set<() => void>>(),
      cancel: () => undefined,
      pause: () => undefined,
      resume: () => undefined,
      getVoices: () => voices,
      speak: (utterance: { text?: string; onend?: (() => void) | null }) => {
        spokenTexts.push((utterance.text || '').trim());
        if (utterance.onend) {
          setTimeout(() => utterance.onend?.(), 0);
        }
      },
      addEventListener: (eventName: string, listener: () => void) => {
        const listeners = speechSynthesisMock._listeners.get(eventName) ?? new Set<() => void>();
        listeners.add(listener);
        speechSynthesisMock._listeners.set(eventName, listeners);
      },
      removeEventListener: (eventName: string, listener: () => void) => {
        const listeners = speechSynthesisMock._listeners.get(eventName);
        listeners?.delete(listener);
      },
    };

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: speechSynthesisMock,
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockUtterance,
    });

    Object.defineProperty(window, '__spokenTexts', {
      configurable: true,
      writable: true,
      value: spokenTexts,
    });
  });
};

export const assertVoicePreviewWasPlayed = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        return (window as SpokenWindow).__spokenTexts?.length ?? 0;
      }),
    )
    .toBeGreaterThan(0);
};

export const assertCriticizingWordWasSpoken = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const spoken = (window as SpokenWindow).__spokenTexts ?? [];
        return spoken.some((text) => /criticizing/i.test(text));
      }),
    )
    .toBeTruthy();
};
