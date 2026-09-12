/**
 * @jest-environment jsdom
 */

import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { QuizSurvey2 } from './types';
import {
  clearGuestAbout,
  consumeGuestAboutTranscript,
  flushGuestAboutToSurvey,
  hasGuestAbout,
  resetGuestAboutForTests,
  saveGuestAboutRecording,
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

describe('quizGuestAboutStorage', () => {
  beforeEach(() => {
    resetGuestAboutForTests();
    sendTranscriptRequestMock.mockReset();
  });

  it('remembers a recording until it is consumed or cleared', () => {
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });

    expect(hasGuestAbout('en')).toBe(true);
    expect(hasGuestAbout('es')).toBe(false);

    clearGuestAbout('en');
    expect(hasGuestAbout('en')).toBe(false);
  });

  it('transcribes a pending recording after sign-in and keeps text until survey write', async () => {
    const blob = new Blob(['audio'], { type: 'audio/webm' });
    saveGuestAboutRecording({
      languageCode: 'en',
      blob,
      format: 'audio/webm',
      durationSec: 4,
    });
    sendTranscriptRequestMock.mockResolvedValue({ transcript: 'I want to speak at work.', error: '' });

    const transcript = await consumeGuestAboutTranscript({
      languageCode: 'en',
      getToken: async () => 'token',
    });

    expect(transcript).toBe('I want to speak at work.');
    expect(hasGuestAbout('en')).toBe(true);
    expect(sendTranscriptRequestMock).toHaveBeenCalledWith({
      audioBlob: blob,
      authKey: 'token',
      languageCode: 'en',
      audioDuration: 4,
      format: 'audio/webm',
    });
    expect(sendTranscriptRequestMock).toHaveBeenCalledTimes(1);

    const again = await consumeGuestAboutTranscript({
      languageCode: 'en',
      getToken: async () => 'token',
    });
    expect(again).toBe('I want to speak at work.');
    expect(sendTranscriptRequestMock).toHaveBeenCalledTimes(1);
  });

  it('writes the transcript into the survey after sign-in and clears once the survey has it', async () => {
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });
    sendTranscriptRequestMock.mockResolvedValue({ transcript: 'I want to speak at work.', error: '' });

    const survey = surveyFixture();
    const updateSurvey = jest.fn(async (next: QuizSurvey2) => next);

    const transcript = await flushGuestAboutToSurvey({
      languageCode: 'en',
      getToken: async () => 'token',
      getSurvey: () => survey,
      loadSurvey: async () => survey,
      updateSurvey,
    });

    expect(transcript).toBe('I want to speak at work.');
    expect(updateSurvey).toHaveBeenCalledWith(
      expect.objectContaining({ aboutUserTranscription: 'I want to speak at work.' }),
      'guest recordAbout',
    );
    expect(hasGuestAbout('en')).toBe(true);

    const saved = surveyFixture('I want to speak at work.');
    const confirmed = await flushGuestAboutToSurvey({
      languageCode: 'en',
      getToken: async () => 'token',
      getSurvey: () => saved,
      loadSurvey: async () => saved,
      updateSurvey,
    });

    expect(confirmed).toBe('I want to speak at work.');
    expect(updateSurvey).toHaveBeenCalledTimes(1);
    expect(hasGuestAbout('en')).toBe(false);
  });

  it('loads the survey after it is created and does not drop the clip if write is not ready', async () => {
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });
    sendTranscriptRequestMock.mockResolvedValue({ transcript: 'I need English for travel.', error: '' });

    const created = surveyFixture();
    const updateSurvey = jest.fn(async (next: QuizSurvey2) => next);

    const first = await flushGuestAboutToSurvey({
      languageCode: 'en',
      getToken: async () => 'token',
      getSurvey: () => null,
      loadSurvey: async () => null,
      updateSurvey,
    });

    expect(first).toBe('I need English for travel.');
    expect(updateSurvey).not.toHaveBeenCalled();
    expect(hasGuestAbout('en')).toBe(true);

    const second = await flushGuestAboutToSurvey({
      languageCode: 'en',
      getToken: async () => 'token',
      getSurvey: () => null,
      loadSurvey: async () => created,
      updateSurvey,
    });

    expect(second).toBe('I need English for travel.');
    expect(updateSurvey).toHaveBeenCalledWith(
      expect.objectContaining({ aboutUserTranscription: 'I need English for travel.' }),
      'guest recordAbout',
    );
    expect(hasGuestAbout('en')).toBe(true);
    expect(sendTranscriptRequestMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the blob when transcription fails so sign-in can retry', async () => {
    saveGuestAboutRecording({
      languageCode: 'en',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });
    sendTranscriptRequestMock.mockRejectedValue(new Error('transcript down'));

    const transcript = await consumeGuestAboutTranscript({
      languageCode: 'en',
      getToken: async () => 'token',
    });

    expect(transcript).toBeNull();
    expect(hasGuestAbout('en')).toBe(true);
  });
});
