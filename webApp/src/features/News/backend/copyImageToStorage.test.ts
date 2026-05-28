jest.mock('@/app/api/config/firebase', () => {
  const savedFiles: Array<{
    path: string;
    buffer: Buffer;
    contentType?: string;
    metadata?: any;
  }> = [];
  const existing = new Map<string, { publicUrl: string }>();

  const makeFile = (path: string) => ({
    save: jest.fn(async (buffer: Buffer, opts: any) => {
      savedFiles.push({
        path,
        buffer,
        contentType: opts?.contentType,
        metadata: opts?.metadata,
      });
      existing.set(path, { publicUrl: `https://storage.example/${path}` });
    }),
    makePublic: jest.fn(async () => {}),
    publicUrl: () => existing.get(path)?.publicUrl ?? `https://storage.example/${path}`,
  });

  const bucket = {
    getFiles: jest.fn(async ({ prefix }: { prefix: string }) => {
      const matches = [...existing.keys()].filter((k) => k.startsWith(prefix));
      return [matches.map((p) => makeFile(p))];
    }),
    file: jest.fn((path: string) => makeFile(path)),
    __saved: savedFiles,
    __existing: existing,
    __reset: () => {
      savedFiles.length = 0;
      existing.clear();
    },
  };

  return {
    getBucket: () => bucket,
    __bucket: bucket,
  };
});

import { copyNewsImageToStorage } from './copyImageToStorage';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const firebaseMock = require('../config/firebase') as { __bucket: any };

describe('copyNewsImageToStorage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    firebaseMock.__bucket.__reset();
    firebaseMock.__bucket.getFiles.mockClear();
    firebaseMock.__bucket.file.mockClear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  const mockFetchOk = (contentType = 'image/png') => {
    const bytes = new Uint8Array([1, 2, 3, 4]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? contentType : null),
      },
      arrayBuffer: async () => bytes.buffer,
    }) as any;
  };

  it('downloads, uploads, makes public, and returns the public URL', async () => {
    mockFetchOk('image/png');

    const url = await copyNewsImageToStorage({
      sourceUrl: 'https://cdn.example.com/foo.png',
      newsId: 'abc123',
    });

    expect(global.fetch).toHaveBeenCalledWith('https://cdn.example.com/foo.png');
    expect(firebaseMock.__bucket.__saved).toHaveLength(1);
    expect(firebaseMock.__bucket.__saved[0].path).toBe('newsImages/abc123.png');
    expect(url).toBe('https://storage.example/newsImages/abc123.png');
  });

  it('infers extension from URL when content-type is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      arrayBuffer: async () => new Uint8Array([0]).buffer,
    }) as any;

    await copyNewsImageToStorage({
      sourceUrl: 'https://cdn.example.com/photo.webp?x=1',
      newsId: 'id-2',
    });

    expect(firebaseMock.__bucket.__saved[0].path).toBe('newsImages/id-2.webp');
  });

  it('is idempotent: returns existing URL without re-uploading', async () => {
    // Pre-populate the in-memory bucket with an existing file.
    firebaseMock.__bucket.__existing.set('newsImages/dup.jpg', {
      publicUrl: 'https://storage.example/newsImages/dup.jpg',
    });

    global.fetch = jest.fn();

    const url = await copyNewsImageToStorage({
      sourceUrl: 'https://cdn.example.com/anything.jpg',
      newsId: 'dup',
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(firebaseMock.__bucket.__saved).toHaveLength(0);
    expect(url).toBe('https://storage.example/newsImages/dup.jpg');
  });

  it('throws when the source download fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as any;

    await expect(
      copyNewsImageToStorage({
        sourceUrl: 'https://cdn.example.com/missing.png',
        newsId: 'err',
      }),
    ).rejects.toThrow(/Failed to download news image/);
  });
});
