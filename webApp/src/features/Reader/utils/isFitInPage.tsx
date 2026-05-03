import { ReaderSettings } from '../model/types';

const fontFamily = 'serif';
const MARKDOWN_IMAGE_REGEX = /!\[[^\]]*\]\(([^)]+)\)/g;
const IMAGE_WIDTH_RATIO = 0.9;
const DEFAULT_IMAGE_ASPECT_RATIO = 1.5;

const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

const extractMarkdownImageHrefs = (paragraph: string): string[] => {
  const hrefs: string[] = [];
  let match: RegExpExecArray | null;

  MARKDOWN_IMAGE_REGEX.lastIndex = 0;
  while ((match = MARKDOWN_IMAGE_REGEX.exec(paragraph)) !== null) {
    const rawHref = (match[1] ?? '').trim();
    if (!rawHref) continue;
    hrefs.push(rawHref);
  }

  return hrefs;
};

const stripMarkdownImages = (paragraph: string): string => {
  MARKDOWN_IMAGE_REGEX.lastIndex = 0;
  return paragraph.replace(MARKDOWN_IMAGE_REGEX, ' ').replace(/\s{2,}/g, ' ').trim();
};

export function isFitInPage({
  paragraphs,
  settings,
  imageAspectRatioByHref,
}: {
  paragraphs: string[];
  settings: ReaderSettings;
  imageAspectRatioByHref?: Record<string, number>;
}): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  if (settings.contentWidth <= 0 || settings.contentHeight <= 0) {
    return false;
  }

  if (paragraphs.length === 0) {
    return true;
  }

  const measureContainer = document.createElement('div');
  measureContainer.style.position = 'fixed';
  measureContainer.style.left = '-99999px';
  measureContainer.style.top = '0';
  measureContainer.style.visibility = 'hidden';
  measureContainer.style.pointerEvents = 'none';
  measureContainer.style.boxSizing = 'border-box';
  measureContainer.style.width = `${settings.contentWidth}px`;

  const paragraphGap = Math.max(0, settings.paragraphGap);
  const renderedImageWidth = Math.max(0, settings.contentWidth * IMAGE_WIDTH_RATIO);

  paragraphs.forEach((paragraph, index) => {
    const paragraphWrapper = document.createElement('div');
    paragraphWrapper.style.margin = '0';
    paragraphWrapper.style.padding = '0';

    if (index < paragraphs.length - 1) {
      paragraphWrapper.style.marginBottom = `${paragraphGap}px`;
    }

    const paragraphText = stripMarkdownImages(paragraph);
    if (paragraphText) {
      const paragraphElement = document.createElement('p');
      paragraphElement.textContent = paragraphText;
      paragraphElement.style.margin = '0';
      paragraphElement.style.padding = '0';
      paragraphElement.style.fontSize = `${settings.fontSize}px`;
      paragraphElement.style.lineHeight = `${settings.lineHeight}`;
      paragraphElement.style.textAlign = settings.justifyText ? 'justify' : 'left';
      paragraphElement.style.fontFamily = fontFamily;
      paragraphElement.style.wordBreak = 'break-word';
      paragraphWrapper.appendChild(paragraphElement);
    }

    const imageHrefs = extractMarkdownImageHrefs(paragraph);
    imageHrefs.forEach((href, imageIndex) => {
      const normalizedHref = normalizeImageHref(href);
      const resolvedAspectRatio =
        imageAspectRatioByHref?.[normalizedHref] ??
        imageAspectRatioByHref?.[href] ??
        DEFAULT_IMAGE_ASPECT_RATIO;
      const safeAspectRatio =
        Number.isFinite(resolvedAspectRatio) && resolvedAspectRatio > 0
          ? resolvedAspectRatio
          : DEFAULT_IMAGE_ASPECT_RATIO;

      const imageElement = document.createElement('div');
      imageElement.style.display = 'block';
      imageElement.style.width = `${renderedImageWidth}px`;
      imageElement.style.height = `${renderedImageWidth / safeAspectRatio}px`;
      imageElement.style.marginTop = imageIndex === 0 && paragraphText ? '8px' : '0';
      imageElement.style.marginBottom = imageIndex < imageHrefs.length - 1 ? '8px' : '0';

      paragraphWrapper.appendChild(imageElement);
    });

    measureContainer.appendChild(paragraphWrapper);
  });

  document.body.appendChild(measureContainer);

  const contentHeight = measureContainer.scrollHeight;
  const isFit = contentHeight <= settings.contentHeight;

  document.body.removeChild(measureContainer);

  return isFit;
}
