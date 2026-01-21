export const isAllowedMicrophone = async () => {
  // Detect if microphone is allowed
  return new Promise<boolean>((resolve) => {
    console.log('Checking microphone permission');
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then(function (result) {
      console.log('Microphone permission state:', result.state);
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
    console.log('Requesting microphone access');
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Microphone access granted');
    return true;
  } catch (err) {
    console.error('Microphone access denied', err);
    return false;
  }
};
