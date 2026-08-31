import { SPEECH_SURFACES, SpeechSurface } from './types';
import { sendAnalyticsEvent } from './sendAnalyticsEvent';

const sentSurfaces = new Set<SpeechSurface>();

export const sendSpeechStart = (surface: SpeechSurface): void => {
  if (!SPEECH_SURFACES.includes(surface)) return;
  if (sentSurfaces.has(surface)) return;
  sentSurfaces.add(surface);
  sendAnalyticsEvent({
    name: 'speech_start',
    speechSurface: surface,
  });
};

export const resetSpeechStartForTests = (): void => {
  sentSurfaces.clear();
};
