let playbackContext: AudioContext | null = null;

const getAudioContextCtor = (): typeof AudioContext | undefined =>
  window.AudioContext ??
  (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

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

export const unlockAudioPlayback = async (): Promise<boolean> => {
  const context = getPlaybackAudioContext();
  if (!context) {
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

    return true;
  } catch {
    return false;
  }
};
