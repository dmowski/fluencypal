export const getMediaVideoStreams = async (): Promise<MediaStream | null> => {
  try {
    const streamFromWindow = (window as any).singleMediaStreamVideo as MediaStream | undefined;
    if (streamFromWindow && streamFromWindow.active) {
      return streamFromWindow;
    }
    console.log('CREATE A NEW STREAM');
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

export const getMediaAudioStreams = async (): Promise<MediaStream | null> => {
  try {
    const streamFromWindow = (window as any).singleMediaStreamAudio as MediaStream | undefined;
    if (streamFromWindow && streamFromWindow.active) {
      return streamFromWindow;
    }
    console.log('CREATE A NEW AUDIO STREAM');
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    console.log('mediaStream', mediaStream);
    (window as any).singleMediaStreamAudio = mediaStream;

    return mediaStream;
  } catch (err) {
    console.log('Error accessing audio:', err);
    return null;
  }
};
