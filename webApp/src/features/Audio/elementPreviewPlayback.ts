let activePreview: HTMLAudioElement | null = null;

export const stopElementPreview = (): void => {
  const el = activePreview;
  if (!el) return;
  activePreview = null;
  try {
    el.pause();
  } catch {
    // The element may already be detached.
  }
};

export const isElementPreviewPlaying = (): boolean => !!activePreview && !activePreview.paused;

/**
 * Preview speech with a plain audio element. Creating an AudioContext from a
 * tap crashes the Twitter/X iOS in-app browser, so teacher-card preview stays
 * off the Web Audio graph.
 */
export const playElementPreview = async (url: string): Promise<void> => {
  stopElementPreview();

  const el = new Audio();
  el.preload = 'auto';
  el.src = url;
  activePreview = el;

  try {
    await el.play();
  } catch (error) {
    if (activePreview === el) activePreview = null;
    throw error;
  }

  await new Promise<void>((resolve) => {
    const finish = () => {
      el.removeEventListener('ended', finish);
      el.removeEventListener('pause', finish);
      el.removeEventListener('error', finish);
      if (activePreview === el) activePreview = null;
      resolve();
    };
    el.addEventListener('ended', finish);
    el.addEventListener('pause', finish);
    el.addEventListener('error', finish);
  });
};
