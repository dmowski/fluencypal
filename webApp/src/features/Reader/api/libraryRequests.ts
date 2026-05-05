import { ReaderLibraryBook, ReaderLibraryCategory } from '../model/library';
import { normalizeEpubFileName } from '../utils/epubFileName';

interface ReaderLibraryCategoriesResponse {
  categories?: ReaderLibraryCategory[];
  error?: string;
}

interface DownloadReaderLibraryBookParams {
  ebookId: string;
  title: string;
  onProgress?: (progress: {
    progress: number;
    receivedBytes: number;
    totalBytes: number | null;
  }) => void;
}

const FALLBACK_DOWNLOAD_ERROR = 'Failed to download library book.';

const sanitizeFileName = (title: string, ebookId: string) => {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${normalized || `gutenberg-${ebookId}`}.epub`;
};

const getFileNameFromDisposition = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const fileNameMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1] || fallback;
};

export const fetchReaderLibraryCategories = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ReaderLibraryCategory[]> => {
  const response = await fetch('/api/reader/library', {
    signal,
  });

  const payload = (await response.json()) as ReaderLibraryCategoriesResponse;

  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load library.');
  }

  return Array.isArray(payload.categories) ? payload.categories : [];
};

export const downloadReaderLibraryBookFile = async ({
  ebookId,
  title,
  onProgress,
}: DownloadReaderLibraryBookParams): Promise<File> => {
  const response = await fetch(`/api/reader/library/download?ebookId=${ebookId}`);

  if (!response.ok) {
    throw new Error((await response.text()) || FALLBACK_DOWNLOAD_ERROR);
  }

  const fallbackFileName = sanitizeFileName(title, ebookId);
  const dispositionFileName = getFileNameFromDisposition(
    response.headers.get('content-disposition'),
    fallbackFileName,
  );
  const fileName = normalizeEpubFileName(dispositionFileName, fallbackFileName);

  if (!response.body) {
    const blobWithoutStream = await response.blob();
    onProgress?.({
      progress: 100,
      receivedBytes: blobWithoutStream.size,
      totalBytes: blobWithoutStream.size,
    });
    return new File([blobWithoutStream], fileName, {
      type: blobWithoutStream.type || 'application/epub+zip',
    });
  }

  const totalBytesHeader = response.headers.get('content-length');
  const parsedTotalBytes = totalBytesHeader ? Number(totalBytesHeader) : Number.NaN;
  const totalBytes =
    Number.isFinite(parsedTotalBytes) && parsedTotalBytes > 0 ? parsedTotalBytes : null;

  const reader = response.body.getReader();
  const chunks: ArrayBuffer[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    chunks.push(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
    receivedBytes += value.byteLength;

    if (totalBytes) {
      const progress = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
      onProgress?.({ progress, receivedBytes, totalBytes });
    } else {
      onProgress?.({ progress: 0, receivedBytes, totalBytes: null });
    }
  }

  const blob = new Blob(chunks, {
    type: response.headers.get('content-type') || 'application/epub+zip',
  });
  onProgress?.({ progress: 100, receivedBytes, totalBytes });

  return new File([blob], fileName, {
    type: blob.type || 'application/epub+zip',
  });
};

export const formatLibraryBookDownloadCaption = (
  book: Pick<ReaderLibraryBook, 'title'>,
  progress: number,
): string => `Downloading ${book.title} (${progress}%)`;
