import { mpegResponse } from './mpegResponse';

const bytes = new Uint8Array([0, 1, 2, 3, 4]);

describe('mpegResponse', () => {
  it('returns the full MP3 with a length Safari can probe', () => {
    const response = mpegResponse(bytes, null, 'public, max-age=31536000, immutable');

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Length')).toBe('5');
  });

  it('answers the Safari bytes=0-1 probe with a partial body', async () => {
    const response = mpegResponse(bytes, 'bytes=0-1', 'public, max-age=31536000, immutable');

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 0-1/5');
    expect(response.headers.get('Content-Length')).toBe('2');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([0, 1]));
  });

  it('rejects a range that starts past the end', () => {
    const response = mpegResponse(bytes, 'bytes=9-10', 'no-store');

    expect(response.status).toBe(416);
    expect(response.headers.get('Content-Range')).toBe('bytes */5');
  });
});
