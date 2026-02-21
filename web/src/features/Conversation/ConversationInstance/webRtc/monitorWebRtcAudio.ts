'use client';

export const monitorWebRtcAudio = (
  stream: MediaStream,
  setIsAiSpeaking: (speaking: boolean) => void,
) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let lastSpeakingState = false; // Store the previous state

  const checkSpeaking = () => {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    const isSpeaking = volume > 10; // Adjust this threshold as needed

    if (isSpeaking !== lastSpeakingState) {
      setIsAiSpeaking(isSpeaking);
      lastSpeakingState = isSpeaking;
    }

    setTimeout(checkSpeaking, 100);
  };

  checkSpeaking();
};
