import { createMediaAudioStream, getMediaAudioStreams } from './mediaStream';
import { beginPreferredAudioInputCapture, readPreferredMicrophoneId } from '@/libs/mic';

jest.mock('@/libs/mic', () => ({
  beginPreferredAudioInputCapture: jest.fn(() => () => undefined),
  readPreferredMicrophoneId: jest.fn(() => null),
}));

const mockedBeginPreferredAudioInputCapture =
  beginPreferredAudioInputCapture as jest.MockedFunction<typeof beginPreferredAudioInputCapture>;
const mockedReadPreferredMicrophoneId = readPreferredMicrophoneId as jest.MockedFunction<
  typeof readPreferredMicrophoneId
>;

const createStream = (deviceId: string, active = true) => {
  const stop = jest.fn();
  const track = {
    stop,
    getSettings: () => ({ deviceId }),
  };
  const stream = {
    active,
    getAudioTracks: () => [track],
    getTracks: () => [track],
  } as unknown as MediaStream;
  return { stream, stop };
};

const audioWindow = () =>
  window as Window & { singleMediaStreamAudio?: MediaStream | null };

const resetAudioWindow = () => {
  Object.defineProperty(global, 'window', {
    value: { singleMediaStreamAudio: null },
    configurable: true,
  });
};

describe('createMediaAudioStream', () => {
  beforeEach(() => {
    resetAudioWindow();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('captures audio through the preferred device helper', async () => {
    const restore = jest.fn();
    mockedBeginPreferredAudioInputCapture.mockReturnValue(restore);
    const { stream } = createStream('mic-usb');
    const getUserMedia = jest.fn(async () => stream);
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia } },
      configurable: true,
    });

    await expect(createMediaAudioStream('mic-usb')).resolves.toBe(stream);
    expect(mockedBeginPreferredAudioInputCapture).toHaveBeenCalledWith('mic-usb');
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    expect(restore).toHaveBeenCalled();
  });
});

describe('getMediaAudioStreams', () => {
  beforeEach(() => {
    resetAudioWindow();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('replaces a cached stream when it does not match the preferred microphone', async () => {
    const { stream: cached, stop: cachedStop } = createStream('mic-old');
    const { stream: next } = createStream('mic-usb');
    audioWindow().singleMediaStreamAudio = cached;
    mockedReadPreferredMicrophoneId.mockReturnValue('mic-usb');
    mockedBeginPreferredAudioInputCapture.mockReturnValue(() => undefined);

    const getUserMedia = jest.fn(async () => next);
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia } },
      configurable: true,
    });

    await expect(getMediaAudioStreams()).resolves.toBe(next);
    expect(audioWindow().singleMediaStreamAudio).toBe(next);
    expect(cachedStop).toHaveBeenCalled();
  });
});
