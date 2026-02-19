import { ImageJpgConverter } from './imageJpgConverter';

let converter: ImageJpgConverter | null = null;

const FALLBACK_FILE_NAME = 'story-image';

function toProxyMediaUrl(url: string): string {
  if (!url.startsWith('https://')) {
    return url;
  }

  return `/api/proxyMedia?url=${encodeURIComponent(url)}`;
}

function extractFileNameFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const pathname = parsedUrl.pathname;
    const fileName = pathname.split('/').pop();
    return fileName && fileName.length > 0 ? fileName : FALLBACK_FILE_NAME;
  } catch {
    return FALLBACK_FILE_NAME;
  }
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export const downloadAsJpg = async (imageUrl: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const fetchUrl = toProxyMediaUrl(imageUrl);
    console.log('[downloadAsJpg] Starting download+convert', {
      originalUrl: imageUrl,
      fetchUrl,
    });

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    console.log('[downloadAsJpg] Fetch successful', {
      status: response.status,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    });

    const inputBlob = await response.blob();
    console.log('[downloadAsJpg] Blob created', {
      blobType: inputBlob.type,
      blobSize: inputBlob.size,
    });

    const fileName = extractFileNameFromUrl(imageUrl);
    const inputFile = new File([inputBlob], fileName, {
      type: inputBlob.type || 'application/octet-stream',
    });

    console.log('[downloadAsJpg] Input file prepared', {
      fileName: inputFile.name,
      fileType: inputFile.type,
      fileSize: inputFile.size,
    });

    if (!converter) {
      console.log('[downloadAsJpg] Creating ImageJpgConverter instance');
      converter = new ImageJpgConverter();
    }

    const result = await converter.convert(inputFile);
    console.log('[downloadAsJpg] Conversion finished', {
      outputName: result.imageName,
      outputSize: result.imageData.length,
    });

    const jpgBlob = new Blob([result.imageData.slice()], { type: 'image/jpeg' });
    triggerBlobDownload(jpgBlob, result.imageName || `${FALLBACK_FILE_NAME}.jpg`);
    console.log('[downloadAsJpg] Download triggered');
  } catch (error) {
    console.error('Failed to convert image to JPG:', error);
    if (error instanceof Error) {
      console.error('[downloadAsJpg] Error message:', error.message);
      console.error('[downloadAsJpg] Error stack:', error.stack);
    }
    alert('Failed to convert image to JPG. Please try again.');
  }
};
