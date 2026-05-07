import { IMAGE_EXT_TO_MIME, IMAGE_WIDTH_CLASS_REGEX, IMAGE_WIDTH_HINT_TITLE_PREFIX } from './constants';
import { normalizeText } from './xmlUtils';

export const getImageMimeType = (href: string): string | null => {
  const lowerHref = href.toLowerCase();
  const matchedExtension = Object.keys(IMAGE_EXT_TO_MIME).find((ext) => lowerHref.endsWith(ext));
  if (!matchedExtension) return null;
  return IMAGE_EXT_TO_MIME[matchedExtension];
};

export const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

export const getImageWidthHintFromClassName = (className: string): number | null => {
  const match = className.match(IMAGE_WIDTH_CLASS_REGEX);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.min(Math.max(value, 5), 100);
};

export const getNearestImageWidthHint = (element: Element, boundary: Element): number | null => {
  let current: Element | null = element;

  while (current && current !== boundary) {
    const className = current.getAttribute('class') || '';
    const widthHint = getImageWidthHintFromClassName(className);
    if (widthHint != null) {
      return widthHint;
    }

    current = current.parentElement;
  }

  return null;
};

export const appendImageWidthHintToTitle = (title: string, widthHint: number): string => {
  const normalizedTitle = normalizeText(title);
  const marker = `${IMAGE_WIDTH_HINT_TITLE_PREFIX}${widthHint}`;

  if (normalizedTitle.toLowerCase().includes(marker.toLowerCase())) {
    return normalizedTitle;
  }

  if (!normalizedTitle) {
    return marker;
  }

  return `${normalizedTitle} | ${marker}`;
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

export const buildImageAspectRatioMap = async (
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
