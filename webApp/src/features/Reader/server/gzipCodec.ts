const hasCompressionStream = (): boolean =>
  typeof globalThis !== 'undefined' && typeof (globalThis as any).CompressionStream === 'function';

const hasDecompressionStream = (): boolean =>
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).DecompressionStream === 'function';

export const supportsGzipCodec = hasCompressionStream;

export const gzipEncodeText = async (input: string): Promise<Uint8Array> => {
  const bytes = new TextEncoder().encode(input);
  if (!hasCompressionStream()) {
    return bytes;
  }
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new (globalThis as any).CompressionStream('gzip'));
  const compressed = await new Response(stream).arrayBuffer();
  return new Uint8Array(compressed);
};

export const gzipDecodeBytes = async (bytes: Uint8Array): Promise<string> => {
  const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  if (!isGzip || !hasDecompressionStream()) {
    return new TextDecoder().decode(bytes);
  }
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new (globalThis as any).DecompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buffer);
};
