import { readFileSync } from 'node:fs';

const TARGET_SAMPLE_RATE = 24_000;

type WavInfo = {
  pcm: Buffer;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
};

/** Parse PCM WAV (8/16-bit linear). */
export const parseWavFile = (filePath: string): WavInfo => {
  const data = readFileSync(filePath);
  if (data.length < 44 || data.toString('ascii', 0, 4) !== 'RIFF') {
    throw new Error(`Not a RIFF WAV: ${filePath}`);
  }

  let offset = 12;
  let fmt: {
    audioFormat: number;
    channels: number;
    sampleRate: number;
    bitsPerSample: number;
  } | null = null;
  let pcm: Buffer | null = null;

  while (offset + 8 <= data.length) {
    const chunkId = data.toString('ascii', offset, offset + 4);
    const chunkSize = data.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === 'fmt ') {
      fmt = {
        audioFormat: data.readUInt16LE(chunkStart),
        channels: data.readUInt16LE(chunkStart + 2),
        sampleRate: data.readUInt32LE(chunkStart + 4),
        bitsPerSample: data.readUInt16LE(chunkStart + 14),
      };
    } else if (chunkId === 'data') {
      pcm = data.subarray(chunkStart, chunkStart + chunkSize);
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!fmt || !pcm) {
    throw new Error(`Invalid WAV (missing fmt/data): ${filePath}`);
  }

  if (fmt.audioFormat !== 1) {
    throw new Error(`Unsupported WAV format ${fmt.audioFormat} (expected PCM): ${filePath}`);
  }

  if (fmt.bitsPerSample !== 16) {
    throw new Error(`Unsupported bits per sample ${fmt.bitsPerSample}: ${filePath}`);
  }

  return {
    pcm,
    sampleRate: fmt.sampleRate,
    channels: fmt.channels,
    bitsPerSample: fmt.bitsPerSample,
  };
};

const pcm16ToMono = (pcm: Buffer, channels: number): Int16Array => {
  const sampleCount = Math.floor(pcm.length / 2);
  const samples = new Int16Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    samples[i] = pcm.readInt16LE(i * 2);
  }

  if (channels === 1) {
    return samples;
  }

  const frameCount = Math.floor(sampleCount / channels);
  const mono = new Int16Array(frameCount);
  for (let i = 0; i < frameCount; i++) {
    let sum = 0;
    for (let ch = 0; ch < channels; ch++) {
      sum += samples[i * channels + ch] ?? 0;
    }
    mono[i] = Math.round(sum / channels);
  }

  return mono;
};

const resamplePcm16 = (input: Int16Array, inputRate: number, outputRate: number): Int16Array => {
  if (inputRate === outputRate) {
    return input;
  }

  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = Math.min(input.length - 1, Math.round(i * ratio));
    output[i] = input[sourceIndex] ?? 0;
  }

  return output;
};

export const loadWavAsPcm24kMono = (filePath: string): Buffer => {
  const { pcm, sampleRate, channels, bitsPerSample } = parseWavFile(filePath);
  const mono = pcm16ToMono(pcm, channels);
  const resampled = resamplePcm16(mono, sampleRate, TARGET_SAMPLE_RATE);
  return Buffer.from(resampled.buffer, resampled.byteOffset, resampled.byteLength);
};

/** Boost quiet TTS fixtures so turn detector RMS thresholds are met. */
export const amplifyPcm16Buffer = (pcm: Buffer, peakTarget = 20_000): Buffer => {
  const sampleCount = Math.floor(pcm.length / 2);
  if (sampleCount === 0) {
    return pcm;
  }

  let peak = 1;
  for (let i = 0; i < sampleCount; i++) {
    peak = Math.max(peak, Math.abs(pcm.readInt16LE(i * 2)));
  }

  const gain = peakTarget / peak;
  const out = Buffer.alloc(pcm.length);

  for (let i = 0; i < sampleCount; i++) {
    const amplified = Math.round((pcm.readInt16LE(i * 2) ?? 0) * gain);
    out.writeInt16LE(Math.max(-32_768, Math.min(32_767, amplified)), i * 2);
  }

  return out;
};

export const chunkPcmBuffer = (pcm: Buffer, chunkMs = 100): Buffer[] => {
  const bytesPerChunk = Math.max(
    2,
    Math.round((TARGET_SAMPLE_RATE * 2 * chunkMs) / 1000),
  );
  const chunks: Buffer[] = [];

  for (let offset = 0; offset < pcm.length; offset += bytesPerChunk) {
    chunks.push(pcm.subarray(offset, Math.min(offset + bytesPerChunk, pcm.length)));
  }

  return chunks;
};
