/**
 * @jest-environment jsdom
 */

import { playElementPreview, stopElementPreview } from './elementPreviewPlayback';

describe('playElementPreview', () => {
  const OriginalAudio = window.Audio;

  afterEach(() => {
    stopElementPreview();
    window.Audio = OriginalAudio;
  });

  it('plays with HTMLAudioElement and does not create an AudioContext', async () => {
    const play = jest.fn().mockResolvedValue(undefined);
    const listeners = new Map<string, () => void>();

    class FakeAudio {
      preload = '';
      src = '';
      paused = true;
      play = () => {
        this.paused = false;
        return play();
      };
      pause = () => {
        this.paused = true;
        listeners.get('pause')?.();
      };
      addEventListener = (name: string, cb: () => void) => {
        listeners.set(name, cb);
      };
      removeEventListener = () => undefined;
    }

    const AudioContextSpy = jest.fn();
    window.Audio = FakeAudio as unknown as typeof Audio;
    window.AudioContext = AudioContextSpy as unknown as typeof AudioContext;

    const pending = playElementPreview('/api/ttsStream?input=hello');
    expect(play).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    await Promise.resolve();
    listeners.get('ended')?.();
    await pending;
    expect(AudioContextSpy).not.toHaveBeenCalled();
  });
});
