const DEFAULT_IMAGE_MAX_WIDTH_RATIO = 0.9;
const LANDSCAPE_IMAGE_MAX_WIDTH_RATIO = 0.6;
const CHAPTER_MARKER_IMAGE_MAX_WIDTH_RATIO = 0.18;
const LANDSCAPE_ASPECT_RATIO_THRESHOLD = 1.35;
const WIDTH_HINT_TITLE_REGEX = /(?:^|\s|\|)reader-width:(\d{1,3})(?=$|\s|\|)/i;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const extractWidthHintRatioFromTitle = (title: string | undefined): number | null => {
  if (!title) return null;

  const match = title.match(WIDTH_HINT_TITLE_REGEX);
  if (!match) return null;

  const widthHintPercent = Number(match[1]);
  if (!Number.isFinite(widthHintPercent) || widthHintPercent <= 0) {
    return null;
  }

  return clamp(widthHintPercent, 5, 100) / 100;
};

export const sanitizeReaderImageTitle = (title: string | undefined): string | undefined => {
  if (!title) return undefined;

  const cleanedTitle = title
    .replace(WIDTH_HINT_TITLE_REGEX, ' ')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/(?:^\s*\|\s*|\s*\|\s*$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleanedTitle || undefined;
};

export const resolveReaderImageWidthRatio = ({
  alt,
  title,
  aspectRatio,
}: {
  alt?: string;
  title?: string;
  aspectRatio?: number;
}): number => {
  const widthHintRatio = extractWidthHintRatioFromTitle(title);
  if (widthHintRatio != null) {
    return widthHintRatio;
  }

  const normalizedAlt = (alt || '').trim();
  if (/^\d{1,3}$/.test(normalizedAlt)) {
    return CHAPTER_MARKER_IMAGE_MAX_WIDTH_RATIO;
  }

  if (typeof aspectRatio === 'number' && Number.isFinite(aspectRatio)) {
    if (aspectRatio >= LANDSCAPE_ASPECT_RATIO_THRESHOLD) {
      return LANDSCAPE_IMAGE_MAX_WIDTH_RATIO;
    }
  }

  return DEFAULT_IMAGE_MAX_WIDTH_RATIO;
};
