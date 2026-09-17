/**
 * @jest-environment jsdom
 */

import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { QuizSurvey2 } from './types';
import {
  hasAboutTranscription,
  transcribeAboutRecording,
  writeAboutTranscriptionToSurvey,
} from './quizGuestAboutStorage';

jest.mock('@/app/api/transcript/sendTranscriptRequest', () => ({
  sendTranscriptRequest: jest.fn(),
}));

const sendTranscriptRequestMock = sendTranscriptRequest as jest.MockedFunction<
  typeof sendTranscriptRequest
>;

const surveyFixture = (aboutUserTranscription = ''): QuizSurvey2 => ({
  learningLanguageCode: 'en',
  nativeLanguageCode: 'es',
  pageLanguageCode: 'es',
  aboutUserTranscription,
  aboutUserFollowUpQuestion: {
    sourceTranscription: '',
    title: '',
    subtitle: '',
    hash: '',
  },
  aboutUserFollowUpTranscription: '',
  goalFollowUpQuestion: {
    sourceTranscription: '',
    title: '',
    subtitle: '',
    hash: '',
  },
  goalUserTranscription: '',
  exampleOfWelcomeMessage: '',
  goalData: null,
  goalHash: '',
  advancedUserRecords: [],
  createdAtIso: '2026-09-12T00:00:00.000Z',
  updatedAtIso: '2026-09-12T00:00:00.000Z',
});

const recording = {
  languageCode: 'en',
  blob: new Blob(['audio'], { type: 'audio/webm' }),
  format: 'audio/webm',
  durationSec: 4,
};

describe('quizGuestAboutStorage', () => {
  beforeEach(() => {
    sendTranscriptRequestMock.mockReset();
  });

  it('treats a survey with about text as already recorded', () => {
    expect(hasAboutTranscription(null)).toBe(false);
    expect(hasAboutTranscription(surveyFixture())).toBe(false);
    expect(hasAboutTranscription(surveyFixture('I want to speak at work.'))).toBe(true);
  });

  it('transcribes a recording with the auth token', async () => {
    sendTranscriptRequestMock.mockResolvedValue({
      transcript: 'I want to speak at work.',
      error: '',
    });

    const transcript = await transcribeAboutRecording({
      recording,
      getToken: async () => 'token',
    });

    expect(transcript).toBe('I want to speak at work.');
    expect(sendTranscriptRequestMock).toHaveBeenCalledWith({
      audioBlob: recording.blob,
      authKey: 'token',
      languageCode: 'en',
      audioDuration: 4,
      format: 'audio/webm',
    });
  });

  it('writes the transcript into the survey and skips a second write once it is there', async () => {
    const survey = surveyFixture();
    const updateSurvey = jest.fn(async (next: QuizSurvey2) => next);

    const transcript = await writeAboutTranscriptionToSurvey({
      transcript: 'I want to speak at work.',
      getSurvey: () => survey,
      loadSurvey: async () => survey,
      updateSurvey,
    });

    expect(transcript).toBe('I want to speak at work.');
    expect(updateSurvey).toHaveBeenCalledWith(
      expect.objectContaining({ aboutUserTranscription: 'I want to speak at work.' }),
      'guest recordAbout',
    );

    const saved = surveyFixture('I want to speak at work.');
    const confirmed = await writeAboutTranscriptionToSurvey({
      transcript: 'I want to speak at work.',
      getSurvey: () => saved,
      loadSurvey: async () => saved,
      updateSurvey,
    });

    expect(confirmed).toBe('I want to speak at work.');
    expect(updateSurvey).toHaveBeenCalledTimes(1);
  });

  it('loads the survey after it is created', async () => {
    const created = surveyFixture();
    const updateSurvey = jest.fn(async (next: QuizSurvey2) => next);

    const first = await writeAboutTranscriptionToSurvey({
      transcript: 'I need English for travel.',
      getSurvey: () => null,
      loadSurvey: async () => null,
      updateSurvey,
    });

    expect(first).toBeNull();
    expect(updateSurvey).not.toHaveBeenCalled();

    const second = await writeAboutTranscriptionToSurvey({
      transcript: 'I need English for travel.',
      getSurvey: () => null,
      loadSurvey: async () => created,
      updateSurvey,
    });

    expect(second).toBe('I need English for travel.');
    expect(updateSurvey).toHaveBeenCalledWith(
      expect.objectContaining({ aboutUserTranscription: 'I need English for travel.' }),
      'guest recordAbout',
    );
  });

  it('returns null when transcription fails so the guest can retry', async () => {
    sendTranscriptRequestMock.mockRejectedValue(new Error('transcript down'));

    const transcript = await transcribeAboutRecording({
      recording,
      getToken: async () => 'token',
    });

    expect(transcript).toBeNull();
  });
});
