/**
 * @jest-environment jsdom
 */

import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import {
  appendGuestReplyToInstruction,
  clearGuestReply,
  consumeGuestReplyTranscript,
  hasGuestReply,
  resetGuestReplyForTests,
  saveGuestReplyRecording,
  shouldInjectGuestReply,
} from './rolePlayGuestReplyStorage';

jest.mock('@/app/api/transcript/sendTranscriptRequest', () => ({
  sendTranscriptRequest: jest.fn(),
}));

const sendTranscriptRequestMock = sendTranscriptRequest as jest.MockedFunction<
  typeof sendTranscriptRequest
>;

describe('rolePlayGuestReplyStorage', () => {
  beforeEach(() => {
    resetGuestReplyForTests();
    sendTranscriptRequestMock.mockReset();
  });

  it('injects a guest reply into the scene instruction', () => {
    expect(
      appendGuestReplyToInstruction('You are the receptionist.', 'Yes, I have a reservation.'),
    ).toContain('Yes, I have a reservation.');
    expect(appendGuestReplyToInstruction('Stay.', '   ')).toBe('Stay.');
  });

  it('does not inject Alias replies because words are generated after Start', () => {
    expect(shouldInjectGuestReply('hotel-check-in')).toBe(true);
    expect(shouldInjectGuestReply('alias-game')).toBe(false);
    expect(shouldInjectGuestReply('')).toBe(false);
  });

  it('remembers a recording until it is consumed or cleared', () => {
    saveGuestReplyRecording({
      rolePlayId: 'hotel-check-in',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });

    expect(hasGuestReply('hotel-check-in')).toBe(true);
    expect(hasGuestReply('alias-game')).toBe(false);

    clearGuestReply('hotel-check-in');
    expect(hasGuestReply('hotel-check-in')).toBe(false);
  });

  it('transcribes a pending recording after sign-in', async () => {
    saveGuestReplyRecording({
      rolePlayId: 'hotel-check-in',
      blob: new Blob(['audio'], { type: 'audio/webm' }),
      format: 'audio/webm',
      durationSec: 4,
    });
    sendTranscriptRequestMock.mockResolvedValue({ transcript: 'I am checking in.', error: '' });

    const transcript = await consumeGuestReplyTranscript({
      rolePlayId: 'hotel-check-in',
      getToken: async () => 'token',
      languageCode: 'en',
    });

    expect(transcript).toBe('I am checking in.');
    expect(hasGuestReply('hotel-check-in')).toBe(false);
    expect(sendTranscriptRequestMock).toHaveBeenCalledTimes(1);
  });

  it('returns stored text without calling transcript again', async () => {
    window.sessionStorage.setItem(
      'fp:rolePlayGuestReplyText',
      JSON.stringify({ rolePlayId: 'small-talk-with-a-stranger', transcript: 'Hi there.' }),
    );

    const transcript = await consumeGuestReplyTranscript({
      rolePlayId: 'small-talk-with-a-stranger',
      getToken: async () => 'token',
      languageCode: 'en',
    });

    expect(transcript).toBe('Hi there.');
    expect(sendTranscriptRequestMock).not.toHaveBeenCalled();
  });
});
