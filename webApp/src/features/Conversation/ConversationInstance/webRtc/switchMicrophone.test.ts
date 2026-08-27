import { createMediaAudioStream, setCachedAudioStream } from '@/features/webCam/mediaStream';
import { writePreferredMicrophoneId } from '@/libs/mic';
import { switchMicrophone } from './switchMicrophone';
import { WebRtcState } from './types';

jest.mock('@/features/webCam/mediaStream', () => ({
  createMediaAudioStream: jest.fn(),
  setCachedAudioStream: jest.fn(),
}));

jest.mock('@/libs/mic', () => ({
  writePreferredMicrophoneId: jest.fn(),
}));

const mockedCreateMediaAudioStream = createMediaAudioStream as jest.MockedFunction<
  typeof createMediaAudioStream
>;
const mockedSetCachedAudioStream = setCachedAudioStream as jest.MockedFunction<
  typeof setCachedAudioStream
>;
const mockedWritePreferredMicrophoneId = writePreferredMicrophoneId as jest.MockedFunction<
  typeof writePreferredMicrophoneId
>;

const createTrack = (id: string) => {
  const stop = jest.fn();
  return {
    id,
    kind: 'audio' as const,
    enabled: true,
    stop,
  };
};

describe('switchMicrophone', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('replaces the peer connection audio track and persists the device', async () => {
    const previousTrack = createTrack('old');
    const nextTrack = createTrack('new');
    const previousStream = {
      getAudioTracks: () => [previousTrack],
      getTracks: () => [previousTrack],
    } as unknown as MediaStream;
    const nextStream = {
      getAudioTracks: () => [nextTrack],
      getTracks: () => [nextTrack],
    } as unknown as MediaStream;

    const replaceTrack = jest.fn(async () => undefined);
    const state = {
      currentMuted: true,
      userMedia: previousStream,
      peerConnection: {
        getSenders: () => [{ track: previousTrack, replaceTrack }],
      },
    } as unknown as WebRtcState;

    mockedCreateMediaAudioStream.mockResolvedValue(nextStream);

    await switchMicrophone('mic-usb', state);

    expect(mockedWritePreferredMicrophoneId).toHaveBeenCalledWith('mic-usb');
    expect(mockedCreateMediaAudioStream).toHaveBeenCalledWith('mic-usb');
    expect(replaceTrack).toHaveBeenCalledWith(nextTrack);
    expect(state.userMedia).toBe(nextStream);
    expect(mockedSetCachedAudioStream).toHaveBeenCalledWith(nextStream);
    expect(previousTrack.stop).toHaveBeenCalled();
    expect(nextTrack.enabled).toBe(false);
  });

  it('keeps the current stream when a new microphone cannot be opened', async () => {
    const previousTrack = createTrack('old');
    const previousStream = {
      getAudioTracks: () => [previousTrack],
      getTracks: () => [previousTrack],
    } as unknown as MediaStream;

    const replaceTrack = jest.fn(async () => undefined);
    const state = {
      currentMuted: false,
      userMedia: previousStream,
      peerConnection: {
        getSenders: () => [{ track: previousTrack, replaceTrack }],
      },
    } as unknown as WebRtcState;

    mockedCreateMediaAudioStream.mockResolvedValue(null);

    await switchMicrophone(null, state);

    expect(replaceTrack).not.toHaveBeenCalled();
    expect(state.userMedia).toBe(previousStream);
    expect(mockedSetCachedAudioStream).not.toHaveBeenCalled();
    expect(previousTrack.stop).not.toHaveBeenCalled();
  });
});
