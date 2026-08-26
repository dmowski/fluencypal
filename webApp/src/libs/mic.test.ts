import {
  beginPreferredAudioInputCapture,
  isAllowedMicrophone,
  listAudioInputDevices,
  loadAudioInputDevices,
  readPreferredMicrophoneId,
  requestMicrophoneAccess,
  writePreferredMicrophoneId,
} from './mic';

const PREFERRED_MICROPHONE_KEY = 'preferredMicrophoneId';
const LEGACY_PREFERRED_MICROPHONE_KEY = 'voiceChatPreferredMicrophoneId';

const createLocalStorage = () => {
  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
  };
};

describe('preferred microphone storage', () => {
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: { localStorage: createLocalStorage() },
      configurable: true,
    });
  });

  it('reads the current key, then the voice-chat legacy key', () => {
    window.localStorage.setItem(LEGACY_PREFERRED_MICROPHONE_KEY, 'legacy-mic');
    expect(readPreferredMicrophoneId()).toBe('legacy-mic');

    window.localStorage.setItem(PREFERRED_MICROPHONE_KEY, 'current-mic');
    expect(readPreferredMicrophoneId()).toBe('current-mic');
  });

  it('writes the current key and clears the legacy key', () => {
    window.localStorage.setItem(LEGACY_PREFERRED_MICROPHONE_KEY, 'legacy-mic');
    writePreferredMicrophoneId('usb-mic');

    expect(window.localStorage.getItem(PREFERRED_MICROPHONE_KEY)).toBe('usb-mic');
    expect(window.localStorage.getItem(LEGACY_PREFERRED_MICROPHONE_KEY)).toBeNull();
  });

  it('clears both keys when selecting the system default', () => {
    window.localStorage.setItem(PREFERRED_MICROPHONE_KEY, 'usb-mic');
    window.localStorage.setItem(LEGACY_PREFERRED_MICROPHONE_KEY, 'legacy-mic');
    writePreferredMicrophoneId(null);

    expect(readPreferredMicrophoneId()).toBeNull();
  });
});

describe('isAllowedMicrophone', () => {
  it('returns true when permission is granted or can still be prompted', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        permissions: { query: async () => ({ state: 'granted' }) },
      },
      configurable: true,
    });
    await expect(isAllowedMicrophone()).resolves.toBe(true);

    Object.defineProperty(global, 'navigator', {
      value: {
        permissions: { query: async () => ({ state: 'prompt' }) },
      },
      configurable: true,
    });
    await expect(isAllowedMicrophone()).resolves.toBe(true);
  });

  it('returns false only when permission is denied', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        permissions: { query: async () => ({ state: 'denied' }) },
      },
      configurable: true,
    });
    await expect(isAllowedMicrophone()).resolves.toBe(false);
  });
});

describe('requestMicrophoneAccess', () => {
  it('stops the permission stream so a later recording can use another device', async () => {
    const stop = jest.fn();
    const getUserMedia = jest.fn(async () => ({
      getTracks: () => [{ stop }],
    }));
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia } },
      configurable: true,
    });

    await expect(requestMicrophoneAccess('mic-usb')).resolves.toBe(true);
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: { deviceId: { exact: 'mic-usb' } },
    });
    expect(stop).toHaveBeenCalled();
  });
});

describe('listAudioInputDevices', () => {
  it('returns only audioinput devices that have a deviceId', async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        mediaDevices: {
          enumerateDevices: async () => [
            { kind: 'audioinput', deviceId: 'mic-1', label: ' Built-in Mic ' },
            { kind: 'audiooutput', deviceId: 'speaker-1', label: 'Speakers' },
            { kind: 'audioinput', deviceId: '', label: 'Hidden' },
            { kind: 'audioinput', deviceId: 'mic-2', label: '' },
          ],
        },
      },
      configurable: true,
    });

    await expect(listAudioInputDevices()).resolves.toEqual([
      { deviceId: 'mic-1', label: 'Built-in Mic' },
      { deviceId: 'mic-2', label: 'Microphone 2' },
    ]);
  });
});

describe('loadAudioInputDevices', () => {
  it('requests microphone access when permission is not granted', async () => {
    const stop = jest.fn();
    const getUserMedia = jest.fn(async () => ({
      getTracks: () => [{ stop }],
    }));
    const enumerateDevices = jest.fn(async () => [
      { kind: 'audioinput', deviceId: 'mic-1', label: 'USB Headset' },
    ]);

    Object.defineProperty(global, 'navigator', {
      value: {
        permissions: {
          query: async () => ({ state: 'prompt' }),
        },
        mediaDevices: { getUserMedia, enumerateDevices },
      },
      configurable: true,
    });

    await expect(loadAudioInputDevices()).resolves.toEqual([
      { deviceId: 'mic-1', label: 'USB Headset' },
    ]);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(stop).toHaveBeenCalled();
  });
});

describe('beginPreferredAudioInputCapture', () => {
  it('injects the preferred deviceId into getUserMedia audio constraints', async () => {
    const originalGetUserMedia = jest.fn(async (constraints) => constraints);
    const mediaDevices = { getUserMedia: originalGetUserMedia };

    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices },
      configurable: true,
    });

    const restore = beginPreferredAudioInputCapture('mic-usb');
    const result = await navigator.mediaDevices.getUserMedia({ audio: true });
    restore();

    expect(result).toEqual({
      audio: { deviceId: { exact: 'mic-usb' } },
    });
    expect(originalGetUserMedia).toHaveBeenCalledWith({
      audio: { deviceId: { exact: 'mic-usb' } },
    });

    originalGetUserMedia.mockClear();
    await navigator.mediaDevices.getUserMedia({ audio: true });
    expect(originalGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('merges deviceId into existing audio constraint objects', async () => {
    const originalGetUserMedia = jest.fn(async (constraints) => constraints);
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia: originalGetUserMedia } },
      configurable: true,
    });

    const restore = beginPreferredAudioInputCapture('mic-usb');
    await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true },
    });
    restore();

    expect(originalGetUserMedia).toHaveBeenCalledWith({
      audio: { echoCancellation: true, deviceId: { exact: 'mic-usb' } },
    });
  });

  it('falls back to the unconstrained mic when the preferred device is unavailable', async () => {
    const originalGetUserMedia = jest.fn(async (constraints: MediaStreamConstraints) => {
      const audio = constraints.audio;
      if (typeof audio === 'object' && audio && 'deviceId' in audio) {
        const error = new Error('Overconstrained');
        error.name = 'OverconstrainedError';
        throw error;
      }
      return constraints;
    });
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia: originalGetUserMedia } },
      configurable: true,
    });

    const restore = beginPreferredAudioInputCapture('missing-mic');
    const result = await navigator.mediaDevices.getUserMedia({ audio: true });
    restore();

    expect(result).toEqual({ audio: true });
  });

  it('does not patch getUserMedia when no device is selected', () => {
    const originalGetUserMedia = jest.fn();
    Object.defineProperty(global, 'navigator', {
      value: { mediaDevices: { getUserMedia: originalGetUserMedia } },
      configurable: true,
    });

    const restore = beginPreferredAudioInputCapture(null);
    restore();

    expect(navigator.mediaDevices.getUserMedia).toBe(originalGetUserMedia);
  });
});
