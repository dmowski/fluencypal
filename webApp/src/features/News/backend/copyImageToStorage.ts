import { getBucket } from '@/app/api/config/firebase';

const FOLDER = 'newsImages';

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

const inferExtension = (sourceUrl: string, contentType: string | null): string => {
  if (contentType) {
    const mapped = EXTENSION_BY_CONTENT_TYPE[contentType.split(';')[0].trim().toLowerCase()];
    if (mapped) return mapped;
  }
  try {
    const pathname = new URL(sourceUrl).pathname;
    const fromUrl = pathname.split('.').pop()?.toLowerCase();
    if (fromUrl && fromUrl.length >= 2 && fromUrl.length <= 5) return fromUrl;
  } catch {
    // not a parseable URL; fall through
  }
  return 'jpg';
};

export interface CopyNewsImageInput {
  sourceUrl: string;
  newsId: string;
}

/**
 * Copy a remote news image into our storage bucket and return its public URL.
 *
 * Idempotent: if `newsImages/<newsId>.<ext>` already exists in the bucket, the
 * existing public URL is returned without re-downloading.
 *
 * No resizing or re-encoding is performed; the original bytes are stored as-is.
 */
export const copyNewsImageToStorage = async ({
  sourceUrl,
  newsId,
}: CopyNewsImageInput): Promise<string> => {
  const bucket = getBucket();

  // Idempotency check: scan for any existing object that matches this newsId.
  const [existing] = await bucket.getFiles({ prefix: `${FOLDER}/${newsId}.` });
  if (existing.length > 0) {
    const first = existing[0];
    try {
      await first.makePublic();
    } catch {
      // Already public or no permission to re-publish — ignore.
    }
    return first.publicUrl();
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download news image (${response.status}): ${sourceUrl}`);
  }
  const contentType = response.headers.get('content-type');
  const extension = inferExtension(sourceUrl, contentType);
  const buffer = Buffer.from(await response.arrayBuffer());

  const filePath = `${FOLDER}/${newsId}.${extension}`;
  const storageFile = bucket.file(filePath);
  await storageFile.save(buffer, {
    contentType: contentType?.split(';')[0].trim() || `image/${extension}`,
    resumable: false,
    metadata: {
      metadata: {
        newsId,
        sourceUrl,
        uploadedAt: Date.now().toString(),
      },
    },
  });

  await storageFile.makePublic();
  return storageFile.publicUrl();
};
