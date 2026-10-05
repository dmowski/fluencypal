export function rmsFromTimeDomain(samples: Uint8Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const value = ((samples[i] ?? 128) - 128) / 128;
    sum += value * value;
  }
  return Math.sqrt(sum / samples.length);
}

export function readLevel(analyser: AnalyserNode | null, buffer: Uint8Array<ArrayBuffer>): number {
  if (!analyser) return 0;
  analyser.getByteTimeDomainData(buffer);
  return rmsFromTimeDomain(buffer);
}
