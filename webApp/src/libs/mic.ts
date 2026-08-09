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
  // Detect if microphone is allowed
  return new Promise<boolean>((resolve) => {
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then(function (result) {
      //console.log('Microphone permission state:', result.state);
      if (result.state === 'granted') {
        resolve(true);
      } else if (result.state === 'prompt') {
        resolve(true);
      } else if (result.state === 'denied') {
        return resolve(false);
      }
      return resolve(false);
    });
    return resolve(false);
  });
};

export const requestMicrophoneAccess = async () => {
  try {
    //console.log('Requesting microphone access');
    await navigator.mediaDevices.getUserMedia({ audio: true });
    //console.log('Microphone access granted');
    return true;
  } catch (err) {
    console.error('Microphone access denied', err);
    return false;
  }
};

export type AudioInputDevice = {
  deviceId: string;
  label: string;
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

/**
 * Temporarily routes the next `getUserMedia` audio capture to `deviceId`.
 * Call the returned restore function immediately after kicking off recording
 * (libraries that call `getUserMedia` synchronously inside `startRecording`).
 */
export const beginPreferredAudioInputCapture = (deviceId: string | null | undefined) => {
  if (
    !deviceId ||
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
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

    const audioConstraints =
      typeof base.audio === 'object' && base.audio !== null
        ? { ...base.audio, deviceId: { ideal: deviceId } }
        : { deviceId: { ideal: deviceId } };

    return originalGetUserMedia({ ...base, audio: audioConstraints });
  }) as typeof mediaDevices.getUserMedia;

  return () => {
    mediaDevices.getUserMedia = originalGetUserMedia;
  };
};
