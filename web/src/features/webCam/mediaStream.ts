export const getMediaStream = async (): Promise<MediaStream | null> => {
  try {
    const streamFromWindow = (window as any).singleMediaStream as MediaStream | undefined;
    if (streamFromWindow && streamFromWindow.active) {
      return streamFromWindow;
    }
    console.log('CREATE A NEW STREAM');
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    console.log('mediaStream', mediaStream);
    (window as any).singleMediaStream = mediaStream;

    return mediaStream;
  } catch (err) {
    console.log('Error accessing webcam:', err);
    return null;
  }
};
