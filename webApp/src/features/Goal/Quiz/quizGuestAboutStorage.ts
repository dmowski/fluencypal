import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { QuizSurvey2 } from './types';

const GUEST_ABOUT_TEXT_KEY = 'fp:quizGuestAboutText';

export type QuizGuestAboutRecording = {
  languageCode: string;
  blob: Blob;
  format: string;
  durationSec: number;
};

type QuizGuestAboutText = {
  languageCode: string;
  transcript: string;
};

let pendingRecording: QuizGuestAboutRecording | null = null;
let consumeInFlight: Promise<string | null> | null = null;

const readStoredText = (): QuizGuestAboutText | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(GUEST_ABOUT_TEXT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as QuizGuestAboutText;
    if (!parsed?.languageCode || typeof parsed.transcript !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeStoredText = (value: QuizGuestAboutText | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(GUEST_ABOUT_TEXT_KEY);
    return;
  }

  window.sessionStorage.setItem(GUEST_ABOUT_TEXT_KEY, JSON.stringify(value));
};

export const saveGuestAboutRecording = (recording: QuizGuestAboutRecording): void => {
  pendingRecording = recording;
};

export const peekGuestAboutRecording = (): QuizGuestAboutRecording | null => pendingRecording;

export const hasGuestAbout = (languageCode: string): boolean => {
  if (!languageCode) {
    return false;
  }
  if (pendingRecording?.languageCode === languageCode) {
    return true;
  }
  return readStoredText()?.languageCode === languageCode;
};

export const peekGuestAboutTranscript = (languageCode: string): string | null => {
  const stored = readStoredText();
  if (stored?.languageCode === languageCode && stored.transcript.trim()) {
    return stored.transcript.trim();
  }
  return null;
};

export const clearGuestAbout = (languageCode?: string): void => {
  if (!languageCode) {
    pendingRecording = null;
    writeStoredText(null);
    return;
  }

  if (pendingRecording?.languageCode === languageCode) {
    pendingRecording = null;
  }

  const stored = readStoredText();
  if (stored?.languageCode === languageCode) {
    writeStoredText(null);
  }
};

const consumeGuestAboutTranscriptOnce = async (input: {
  languageCode: string;
  getToken: () => Promise<string>;
}): Promise<string | null> => {
  const stored = readStoredText();
  if (stored?.languageCode === input.languageCode && stored.transcript.trim()) {
    return stored.transcript.trim();
  }

  const recording =
    pendingRecording?.languageCode === input.languageCode ? pendingRecording : null;
  if (!recording) {
    return null;
  }

  const token = await input.getToken();
  if (!token) {
    return null;
  }

  try {
    const result = await sendTranscriptRequest({
      audioBlob: recording.blob,
      authKey: token,
      languageCode: input.languageCode,
      audioDuration: recording.durationSec || 5,
      format: recording.format,
    });
    const transcript = result.transcript?.trim() || '';
    if (!transcript) {
      return null;
    }
    writeStoredText({ languageCode: input.languageCode, transcript });
    pendingRecording = null;
    return transcript;
  } catch {
    return null;
  }
};

export const consumeGuestAboutTranscript = async (input: {
  languageCode: string;
  getToken: () => Promise<string>;
}): Promise<string | null> => {
  if (consumeInFlight) {
    return consumeInFlight;
  }

  consumeInFlight = consumeGuestAboutTranscriptOnce(input).finally(() => {
    consumeInFlight = null;
  });
  return consumeInFlight;
};

export const flushGuestAboutToSurvey = async (input: {
  languageCode: string;
  getToken: () => Promise<string>;
  getSurvey: () => QuizSurvey2 | null;
  loadSurvey: () => Promise<QuizSurvey2 | null>;
  updateSurvey: (survey: QuizSurvey2, label: string) => Promise<QuizSurvey2>;
}): Promise<string | null> => {
  const transcript = await consumeGuestAboutTranscript({
    languageCode: input.languageCode,
    getToken: input.getToken,
  });
  if (!transcript) {
    return null;
  }

  let survey = input.getSurvey();
  if (!survey) {
    survey = await input.loadSurvey();
  }
  if (!survey) {
    return transcript;
  }

  const existing = (survey.aboutUserTranscription || '').trim();
  if (existing.includes(transcript)) {
    clearGuestAbout(input.languageCode);
    return transcript;
  }

  const combined = existing ? `${existing} ${transcript}` : transcript;
  await input.updateSurvey(
    {
      ...survey,
      aboutUserTranscription: combined,
    },
    'guest recordAbout',
  );
  return transcript;
};

export const resetGuestAboutForTests = (): void => {
  pendingRecording = null;
  consumeInFlight = null;
  writeStoredText(null);
};
