import { gzipDecodeBytes, gzipEncodeText, supportsGzipCodec } from './gzipCodec';

describe('gzipCodec', () => {
  it('round-trips a JSON-like string through gzip when the codec is supported', async () => {
    if (!supportsGzipCodec()) {
      // Node 20+ exposes CompressionStream; skip on older runtimes.
      return;
    }

    const fixture = JSON.stringify(
      Array.from({ length: 200 }, (_, paragraphIndex) =>
        Array.from({ length: 30 }, (_, wordIndex) => `word_${paragraphIndex}_${wordIndex}`),
      ),
    );

    const encoded = await gzipEncodeText(fixture);

    expect(encoded.byteLength).toBeLessThan(fixture.length);
    expect(encoded[0]).toBe(0x1f);
    expect(encoded[1]).toBe(0x8b);

    const decoded = await gzipDecodeBytes(encoded);
    expect(decoded).toBe(fixture);
  });

  it('decodes plain UTF-8 bytes when the input lacks the gzip magic header', async () => {
    const plain = new TextEncoder().encode('hello world');
    const decoded = await gzipDecodeBytes(plain);
    expect(decoded).toBe('hello world');
  });
});
