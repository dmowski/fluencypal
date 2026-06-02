export const AUDIO_SAMPLE_RATE_HZ = 24_000;
export const AUDIO_CHANNELS = 1;
export const AUDIO_BYTES_PER_SAMPLE = 2;
export const AUDIO_ENCODING = 'pcm16le' as const;

/** Max binary audio chunk accepted from client (~250 ms at 24 kHz mono PCM16). */
export const MAX_AUDIO_CHUNK_BYTES = 64 * 1024;

export const BINARY_AUDIO_IN_TYPE = 0x01;

export type ParsedBinaryFrame =
  | { kind: 'audio_in'; payload: Buffer }
  | { kind: 'raw'; payload: Buffer };

/**
 * MVP accepts raw PCM16 chunks. Optional prefixed framing:
 * [0x01][uint32 length][payload]
 */
export const parseBinaryFrame = (data: Buffer): ParsedBinaryFrame => {
  if (data.length > MAX_AUDIO_CHUNK_BYTES) {
    throw new Error(`Audio chunk exceeds max size (${MAX_AUDIO_CHUNK_BYTES} bytes)`);
  }

  if (data.length >= 5 && data[0] === BINARY_AUDIO_IN_TYPE) {
    const length = data.readUInt32BE(1);
    const payload = data.subarray(5, 5 + length);

    if (payload.length === length && length > 0 && length <= MAX_AUDIO_CHUNK_BYTES) {
      return { kind: 'audio_in', payload: normalizePcm16Chunk(payload) };
    }
  }

  return { kind: 'raw', payload: normalizePcm16Chunk(data) };
};

/** PCM16 samples are 2 bytes; ignore a trailing odd byte from buggy clients. */
export const normalizePcm16Chunk = (data: Buffer): Buffer => {
  if (data.length % 2 === 0) {
    return data;
  }

  return data.subarray(0, data.length - 1);
};

export const estimateAudioDurationMs = (byteLength: number): number => {
  const samples = byteLength / (AUDIO_BYTES_PER_SAMPLE * AUDIO_CHANNELS);
  return Math.round((samples / AUDIO_SAMPLE_RATE_HZ) * 1000);
};
