export async function isSilentAudio(
  arrayBuffer: ArrayBuffer,
  {
    sampleWindowMs = 25,
    thresholdDb = -45, // tweak between -40 and -55
  }: {
    sampleWindowMs?: number;
    thresholdDb?: number;
  } = {},
): Promise<boolean> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const channels = audioBuffer.numberOfChannels;

  // Mix to mono
  const mono = new Float32Array(length);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += data[i] / channels;
    }
  }

  const windowSize = Math.max(1, Math.floor(sampleRate * (sampleWindowMs / 1000)));

  for (let start = 0; start < mono.length; start += windowSize) {
    const end = Math.min(mono.length, start + windowSize);

    let sumSquares = 0;
    for (let i = start; i < end; i++) {
      sumSquares += mono[i] * mono[i];
    }

    const rms = Math.sqrt(sumSquares / (end - start));

    const db = 20 * Math.log10(Math.max(rms, 1e-8));

    // If ANY window has sound above threshold → NOT silent
    if (db > thresholdDb) {
      return false;
    }
  }

  // All windows below threshold → silent
  return true;
}
