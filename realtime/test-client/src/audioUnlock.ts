import { debugLog } from './debugLog.js';

let playbackContext: AudioContext | null = null;

const getAudioContextCtor = (): typeof AudioContext | undefined =>
  window.AudioContext ??
  (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

/** Shared context for TTS — must stay open and be resumed during a user gesture (Connect / Start call). */
export const getPlaybackAudioContext = (): AudioContext | null => {
  const Ctor = getAudioContextCtor();
  if (!Ctor) {
    return null;
  }

  if (!playbackContext) {
    playbackContext = new Ctor();
  }

  return playbackContext;
};

/**
 * Unlock speaker output on mobile Safari (requires a recent user tap).
 * Do not close the context — iOS will block later HTMLAudioElement / WebAudio playback otherwise.
 */
export const unlockAudioPlayback = async (): Promise<boolean> => {
  const context = getPlaybackAudioContext();
  if (!context) {
    debugLog('audio', 'unlock_skipped', { reason: 'no_audio_context' });
    return false;
  }

  try {
    if (context.state === 'suspended') {
      await context.resume();
    }

    const buffer = context.createBuffer(1, 1, context.sampleRate);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
    source.stop(context.currentTime + 0.01);

    debugLog('audio', 'unlock_ok', { state: context.state });
    return true;
  } catch (error) {
    debugLog('audio', 'unlock_failed', {
      message: error instanceof Error ? error.message : String(error),
      state: context.state,
    });
    return false;
  }
};
