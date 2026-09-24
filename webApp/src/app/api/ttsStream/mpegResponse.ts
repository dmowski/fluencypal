/**
 * Safari's media element probes MP3s with `Range: bytes=0-1` and treats a
 * response it cannot slice as MEDIA_ERR_SRC_NOT_SUPPORTED.
 */
export const mpegResponse = (
  bytes: Uint8Array,
  rangeHeader: string | null,
  cacheControl: string,
): Response => {
  const total = bytes.byteLength;
  const headers = {
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
  };

  const range = parseByteRange(rangeHeader, total);
  if (range === 'unsatisfiable') {
    return new Response(null, {
      status: 416,
      headers: {
        ...headers,
        'Content-Range': `bytes */${total}`,
      },
    });
  }

  if (range) {
    const slice = bytes.slice(range.start, range.end + 1);
    return new Response(audioBody(slice), {
      status: 206,
      headers: {
        ...headers,
        'Content-Length': String(slice.byteLength),
        'Content-Range': `bytes ${range.start}-${range.end}/${total}`,
      },
    });
  }

  return new Response(audioBody(bytes), {
    headers: {
      ...headers,
      'Content-Length': String(total),
    },
  });
};

const audioBody = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const parseByteRange = (
  rangeHeader: string | null,
  total: number,
): { start: number; end: number } | 'unsatisfiable' | null => {
  if (!rangeHeader || total <= 0) return null;
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : total - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= total || end < start) {
    return 'unsatisfiable';
  }

  return { start, end: Math.min(end, total - 1) };
};
