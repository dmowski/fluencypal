import { beginPreferredAudioInputCapture, readPreferredMicrophoneId } from '@/libs/mic';

type AudioStreamWindow = Window & { singleMediaStreamAudio?: MediaStream | null };

const audioStreamWindow = (): AudioStreamWindow => window as AudioStreamWindow;

const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const getMediaVideoStreams = async (): Promise<MediaStream | null> => {
  try {
    const streamFromWindow = (window as any).singleMediaStreamVideo as MediaStream | undefined;
    if (streamFromWindow && streamFromWindow.active) {
      return streamFromWindow;
    }
    console.log('CREATE A NEW VIDEO STREAM');
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    console.log('mediaStream', mediaStream);
    (window as any).singleMediaStreamVideo = mediaStream;

    return mediaStream;
  } catch (err) {
    console.log('Error accessing webcam:', err);
    return null;
  }
};

export const closeVideoMediaStream = () => {
  console.log('CLOSING VIDEO STREAM');
  const streamFromWindow = (window as any).singleMediaStreamVideo as MediaStream | undefined;
  if (streamFromWindow) {
    streamFromWindow.getTracks().forEach((track) => {
      track.stop();
    });

    (window as any).singleMediaStreamVideo = null;
  }
};

export const closeAudioMediaStream = () => {
  console.log('CLOSING AUDIO STREAM');
  const streamFromWindow = audioStreamWindow().singleMediaStreamAudio;
  if (streamFromWindow) {
    streamFromWindow.getTracks().forEach((track) => {
      track.stop();
    });

    audioStreamWindow().singleMediaStreamAudio = null;
  }
};

export const setCachedAudioStream = (stream: MediaStream | null) => {
  const previous = audioStreamWindow().singleMediaStreamAudio;
  audioStreamWindow().singleMediaStreamAudio = stream;
  if (previous && previous !== stream) {
    previous.getTracks().forEach((track) => {
      track.stop();
    });
  }
};

/** Capture a new microphone stream without touching the cached singleton. */
export const createMediaAudioStream = async (
  deviceId?: string | null,
): Promise<MediaStream | null> => {
  try {
    const preferredId = deviceId === undefined ? readPreferredMicrophoneId() : deviceId;
    const restore = beginPreferredAudioInputCapture(preferredId);
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: DEFAULT_AUDIO_CONSTRAINTS,
      });
    } finally {
      restore();
    }
  } catch (err) {
    console.log('Error accessing audio:', err);
    return null;
  }
};

const cachedStreamMatchesPreferredMic = (
  stream: MediaStream,
  preferredId: string | null,
): boolean => {
  if (!preferredId) {
    return true;
  }

  const currentId = stream.getAudioTracks()[0]?.getSettings()?.deviceId;
  return Boolean(currentId) && currentId === preferredId;
};

export const getMediaAudioStreams = async (): Promise<MediaStream | null> => {
  try {
    const streamFromWindow = audioStreamWindow().singleMediaStreamAudio;
    const preferredId = readPreferredMicrophoneId();
    if (streamFromWindow && streamFromWindow.active) {
      if (cachedStreamMatchesPreferredMic(streamFromWindow, preferredId)) {
        return streamFromWindow;
      }
    }
    console.log('CREATE A NEW AUDIO STREAM');
    const mediaStream = await createMediaAudioStream(preferredId);
    console.log('mediaStream', mediaStream);
    if (mediaStream) {
      setCachedAudioStream(mediaStream);
    }

    return mediaStream;
  } catch (err) {
    console.log('Error accessing audio:', err);
    return null;
  }
};
