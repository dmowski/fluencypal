import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';

export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024;

const isEpubFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return (
    file.type === 'application/epub+zip' ||
    fileName.endsWith('.epub') ||
    file.type === 'application/octet-stream'
  );
};

export const validateEpubFile = (
  file: File,
  translate: (message: string) => string,
): string | null => {
  if (!isEpubFile(file)) {
    return translate('Please select a valid EPUB file.');
  }

  if (file.size > MAX_EPUB_FILE_SIZE) {
    return translate('File size must be less than 50MB');
  }

  return null;
};

const getImageAspectRatio = (src: string): Promise<number | null> =>
  new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        resolve(null);
        return;
      }

      resolve(image.naturalWidth / image.naturalHeight);
    };

    image.onerror = () => resolve(null);
    image.src = src;
  });

const buildImageAspectRatioMap = async (
  imageDataUrlByHref: Record<string, string>,
): Promise<Record<string, number>> => {
  const entries = Object.entries(imageDataUrlByHref);
  if (!entries.length) return {};

  const ratios = await Promise.all(
    entries.map(async ([href, src]) => {
      const ratio = await getImageAspectRatio(src);
      return [href, ratio] as const;
    }),
  );

  return ratios.reduce<Record<string, number>>((acc, [href, ratio]) => {
    if (!ratio || !Number.isFinite(ratio) || ratio <= 0) {
      return acc;
    }

    acc[href] = ratio;
    return acc;
  }, {});
};

export interface EpubImportPayload {
  text: string;
  title: string;
  subtitle: string;
  author: string;
  imageDataUrlByHref: Record<string, string>;
  imageAspectRatioByHref: Record<string, number>;
}

export interface EpubImportProgressUpdate {
  progress: number;
  message: string;
}

export const convertEpubFile = async ({
  file,
  translate,
  onProgress,
}: {
  file: File;
  translate: (message: string) => string;
  onProgress?: (update: EpubImportProgressUpdate) => void;
}): Promise<EpubImportPayload> => {
  onProgress?.({ progress: 10, message: translate('Uploading EPUB...') });
  onProgress?.({ progress: 35, message: translate('Converting EPUB to markdown...') });
  onProgress?.({ progress: 80, message: translate('Extracting plain text...') });

  const result = await sendConvertDocToTextRequest({ file });
  if (result.error) {
    throw new Error(result.error || translate('Failed to convert EPUB.'));
  }

  const imageDataUrlByHref = result.imageDataUrlByHref ?? {};
  const metadata = result.metadata;

  onProgress?.({
    progress: 90,
    message: translate('Extracting title, subtitle and author...'),
  });

  onProgress?.({
    progress: 95,
    message: translate('Extracting embedded images...'),
  });

  const imageAspectRatioByHref = await buildImageAspectRatioMap(imageDataUrlByHref);

  return {
    text: result.markdown ?? '',
    title: metadata?.title?.trim() ?? '',
    subtitle: metadata?.subtitle?.trim() ?? '',
    author: metadata?.author?.trim() ?? '',
    imageDataUrlByHref,
    imageAspectRatioByHref,
  };
};
