import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { QuizSurvey2 } from './types';

export type QuizGuestAboutRecording = {
  languageCode: string;
  blob: Blob;
  format: string;
  durationSec: number;
};

export const hasAboutTranscription = (
  survey: Pick<QuizSurvey2, 'aboutUserTranscription'> | null | undefined,
): boolean => Boolean(survey?.aboutUserTranscription?.trim());

export const transcribeAboutRecording = async (input: {
  recording: QuizGuestAboutRecording;
  getToken: () => Promise<string>;
}): Promise<string | null> => {
  const token = await input.getToken();
  if (!token) {
    return null;
  }

  try {
    const result = await sendTranscriptRequest({
      audioBlob: input.recording.blob,
      authKey: token,
      languageCode: input.recording.languageCode,
      audioDuration: input.recording.durationSec || 5,
      format: input.recording.format,
    });
    if (result.error) {
      return null;
    }
    const transcript = result.transcript?.trim() || '';
    return transcript || null;
  } catch {
    return null;
  }
};

export const writeAboutTranscriptionToSurvey = async (input: {
  transcript: string;
  getSurvey: () => QuizSurvey2 | null;
  loadSurvey: () => Promise<QuizSurvey2 | null>;
  updateSurvey: (survey: QuizSurvey2, label: string) => Promise<QuizSurvey2>;
}): Promise<string | null> => {
  const transcript = input.transcript.trim();
  if (!transcript) {
    return null;
  }

  let survey = input.getSurvey();
  if (!survey) {
    survey = await input.loadSurvey();
  }
  if (!survey) {
    return null;
  }

  const existing = (survey.aboutUserTranscription || '').trim();
  if (existing.includes(transcript)) {
    return transcript;
  }

  const combined = existing ? `${existing} ${transcript}` : transcript;
  await input.updateSurvey(
    {
      ...survey,
      aboutUserTranscription: combined,
    },
    'recordAbout',
  );
  return transcript;
};
