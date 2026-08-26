export const isMicrophoneGranted = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state === 'granted';
  } catch {
    return false;
  }
};

export const isMicrophoneDenied = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state === 'denied';
  } catch {
    return false;
  }
};

export const isAllowedMicrophone = async () => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return true;
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return result.state !== 'denied';
  } catch {
    return true;
  }
};

const audioConstraintsForDevice = (
  deviceId?: string | null,
  baseAudio?: boolean | MediaTrackConstraints,
): boolean | MediaTrackConstraints => {
  if (baseAudio === false) {
    return false;
  }

  const base = typeof baseAudio === 'object' && baseAudio !== null ? { ...baseAudio } : {};
  if (!deviceId) {
    return Object.keys(base).length > 0 ? base : true;
  }

  return { ...base, deviceId: { exact: deviceId } };
};

export const requestMicrophoneAccess = async (deviceId?: string | null) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraintsForDevice(deviceId),
    });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    if (deviceId) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      } catch (fallbackErr) {
        console.error('Microphone access denied', fallbackErr);
        return false;
      }
    }
    console.error('Microphone access denied', err);
    return false;
  }
};

export type AudioInputDevice = {
  deviceId: string;
  label: string;
};

const PREFERRED_MICROPHONE_KEY = 'preferredMicrophoneId';
const LEGACY_PREFERRED_MICROPHONE_KEY = 'voiceChatPreferredMicrophoneId';

export const readPreferredMicrophoneId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem(PREFERRED_MICROPHONE_KEY) ||
    window.localStorage.getItem(LEGACY_PREFERRED_MICROPHONE_KEY)
  );
};

export const writePreferredMicrophoneId = (deviceId: string | null) => {
  if (typeof window === 'undefined') return;
  if (deviceId) {
    window.localStorage.setItem(PREFERRED_MICROPHONE_KEY, deviceId);
    window.localStorage.removeItem(LEGACY_PREFERRED_MICROPHONE_KEY);
  } else {
    window.localStorage.removeItem(PREFERRED_MICROPHONE_KEY);
    window.localStorage.removeItem(LEGACY_PREFERRED_MICROPHONE_KEY);
  }
};

/** List available microphones. Labels are empty until mic permission has been granted. */
export const listAudioInputDevices = async (): Promise<AudioInputDevice[]> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === 'audioinput' && device.deviceId)
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label.trim() || `Microphone ${index + 1}`,
    }));
};

/** Request mic access if needed, then list devices with labels. */
export const loadAudioInputDevices = async (): Promise<AudioInputDevice[]> => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return [];
  }

  const granted = await isMicrophoneGranted();
  if (!granted && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      // Permission denied — labels stay empty until access is granted.
    }
  }

  return listAudioInputDevices();
};

/**
 * Routes `getUserMedia` audio capture to `deviceId` until the returned restore runs.
 * Keep the patch installed until recording's `getUserMedia` has actually been invoked
 * (including any permission request that happens first).
 */
export const beginPreferredAudioInputCapture = (deviceId: string | null | undefined) => {
  if (!deviceId || typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return () => {};
  }

  const mediaDevices = navigator.mediaDevices;
  const originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);

  mediaDevices.getUserMedia = ((constraints?: MediaStreamConstraints) => {
    const base: MediaStreamConstraints =
      typeof constraints === 'object' && constraints !== null
        ? { ...constraints }
        : { audio: true };

    if (base.audio === false) {
      return originalGetUserMedia(base);
    }

    const preferred = { ...base, audio: audioConstraintsForDevice(deviceId, base.audio) };
    return originalGetUserMedia(preferred).catch((error: unknown) => {
      const name = error instanceof Error ? error.name : '';
      if (name === 'OverconstrainedError' || name === 'NotFoundError') {
        return originalGetUserMedia(base.audio === false ? base : { ...base, audio: true });
      }
      throw error;
    });
  }) as typeof mediaDevices.getUserMedia;

  return () => {
    mediaDevices.getUserMedia = originalGetUserMedia;
  };
};
