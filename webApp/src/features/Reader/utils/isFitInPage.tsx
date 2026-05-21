import { ReaderSettings } from '../model/types';
import { getReaderParagraphTextIndent } from './readerParagraphFormatting';
import { getReaderListStyle } from './readerMarkdownBlockLayout';
import { resolveReaderImageWidthRatio } from './readerImageSizing';

export interface MeasuredParagraph {
  text: string;
  sourceStartCharOffset: number;
}

const fontFamily = 'serif';
const IMAGE_MAX_HEIGHT_RATIO = 0.9;
const DEFAULT_IMAGE_ASPECT_RATIO = 1.5;

const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g;

interface MarkdownImageToken {
  alt: string;
  href: string;
  title?: string;
}

const extractMarkdownImageTokens = (paragraph: string): MarkdownImageToken[] => {
  const tokens: MarkdownImageToken[] = [];
  let match: RegExpExecArray | null;

  MARKDOWN_IMAGE_REGEX.lastIndex = 0;
  while ((match = MARKDOWN_IMAGE_REGEX.exec(paragraph)) !== null) {
    const rawAlt = (match[1] ?? '').trim();
    const rawHref = (match[2] ?? '').trim();
    const rawTitle = (match[3] ?? '').trim();
    if (!rawHref) continue;
    tokens.push({
      alt: rawAlt,
      href: rawHref,
      title: rawTitle || undefined,
    });
  }

  return tokens;
};

const stripInlineMarkdown = (text: string): string =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

const stripMarkdownForMeasurement = (paragraph: string): string => stripInlineMarkdown(paragraph);

const applyMeasuredTextTypography = ({
  element,
  paragraphText,
  sourceStartCharOffset,
  settings,
  strippedText,
}: {
  element: HTMLElement;
  paragraphText: string;
  sourceStartCharOffset: number;
  settings: ReaderSettings;
  strippedText: string;
}) => {
  element.textContent = strippedText;
  element.style.margin = '0';
  element.style.padding = '0';
  element.style.fontSize = `${settings.fontSize}px`;
  element.style.lineHeight = `${settings.lineHeight}`;
  element.style.textAlign = settings.justifyText ? 'justify' : 'left';
  element.style.textIndent = String(
    getReaderParagraphTextIndent({
      paragraphText,
      isParagraphStart: sourceStartCharOffset === 0,
    }),
  );
  element.style.fontFamily = fontFamily;
  element.style.wordBreak = 'break-word';
  element.style.boxSizing = 'border-box';
  element.style.width = '100%';
};

const appendMeasuredTextBlock = ({
  wrapper,
  paragraphText,
  sourceStartCharOffset,
  settings,
  strippedText,
}: {
  wrapper: HTMLElement;
  paragraphText: string;
  sourceStartCharOffset: number;
  settings: ReaderSettings;
  strippedText: string;
}) => {
  if (!strippedText) {
    return;
  }

  const headingMatch = paragraphText.match(/^(#{1,6})\s+(\S.*)$/u);
  if (headingMatch) {
    const level = Math.min(6, headingMatch[1].length);
    const heading = document.createElement(`h${level}`);
    applyMeasuredTextTypography({
      element: heading,
      paragraphText,
      sourceStartCharOffset,
      settings,
      strippedText,
    });
    wrapper.appendChild(heading);
    return;
  }

  if (/^>\s+\S/u.test(paragraphText)) {
    const blockquote = document.createElement('blockquote');
    blockquote.style.margin = '0';
    blockquote.style.padding = '0';
    applyMeasuredTextTypography({
      element: blockquote,
      paragraphText,
      sourceStartCharOffset,
      settings,
      strippedText,
    });
    wrapper.appendChild(blockquote);
    return;
  }

  if (/^[-*+]\s+\S/u.test(paragraphText)) {
    const list = document.createElement('ul');
    const listStyle = getReaderListStyle();
    list.style.margin = listStyle.margin;
    list.style.padding = listStyle.padding;
    list.style.fontSize = `${settings.fontSize}px`;
    list.style.lineHeight = `${settings.lineHeight}`;
    list.style.fontFamily = fontFamily;
    list.style.boxSizing = 'border-box';
    list.style.width = '100%';

    const item = document.createElement('li');
    applyMeasuredTextTypography({
      element: item,
      paragraphText,
      sourceStartCharOffset,
      settings,
      strippedText,
    });
    list.appendChild(item);
    wrapper.appendChild(list);
    return;
  }

  if (/^\d+\.\s+\S/u.test(paragraphText)) {
    const list = document.createElement('ol');
    const listStyle = getReaderListStyle();
    list.style.margin = listStyle.margin;
    list.style.padding = listStyle.padding;
    list.style.fontSize = `${settings.fontSize}px`;
    list.style.lineHeight = `${settings.lineHeight}`;
    list.style.fontFamily = fontFamily;
    list.style.boxSizing = 'border-box';
    list.style.width = '100%';

    const item = document.createElement('li');
    applyMeasuredTextTypography({
      element: item,
      paragraphText,
      sourceStartCharOffset,
      settings,
      strippedText,
    });
    list.appendChild(item);
    wrapper.appendChild(list);
    return;
  }

  const paragraphElement = document.createElement('p');
  applyMeasuredTextTypography({
    element: paragraphElement,
    paragraphText,
    sourceStartCharOffset,
    settings,
    strippedText,
  });
  wrapper.appendChild(paragraphElement);
};

export const buildMeasuredParagraphWrapper = ({
  paragraphText,
  sourceStartCharOffset,
  settings,
}: {
  paragraphText: string;
  sourceStartCharOffset: number;
  settings: ReaderSettings;
}): HTMLElement => {
  const paragraphWrapper = document.createElement('div');
  paragraphWrapper.style.margin = '0';
  paragraphWrapper.style.padding = '0';
  paragraphWrapper.style.width = '100%';
  paragraphWrapper.style.boxSizing = 'border-box';

  appendMeasuredTextBlock({
    wrapper: paragraphWrapper,
    paragraphText,
    sourceStartCharOffset,
    settings,
    strippedText: stripMarkdownForMeasurement(paragraphText),
  });

  return paragraphWrapper;
};

export const measurePageColumnHeight = ({
  paragraphs,
  settings,
  imageAspectRatioByHref,
}: {
  paragraphs: MeasuredParagraph[];
  settings: ReaderSettings;
  imageAspectRatioByHref?: Record<string, number>;
}): number => {
  if (typeof document === 'undefined' || paragraphs.length === 0) {
    return 0;
  }

  const measureContainer = document.createElement('div');
  measureContainer.style.position = 'fixed';
  measureContainer.style.left = '-99980px';
  measureContainer.style.top = '0';
  measureContainer.style.visibility = 'hidden';
  measureContainer.style.pointerEvents = 'none';
  measureContainer.style.boxSizing = 'border-box';
  measureContainer.style.display = 'flex';
  measureContainer.style.flexDirection = 'column';
  measureContainer.style.gap = `${Math.max(0, settings.paragraphGap)}px`;
  measureContainer.style.width = `${settings.contentWidth}px`;

  const renderedImageMaxHeight = Math.max(0, settings.contentHeight * IMAGE_MAX_HEIGHT_RATIO);

  paragraphs.forEach((paragraph) => {
    const paragraphWrapper = document.createElement('div');
    paragraphWrapper.style.margin = '0';
    paragraphWrapper.style.padding = '0';
    paragraphWrapper.style.width = '100%';
    paragraphWrapper.style.boxSizing = 'border-box';

    const paragraphText = paragraph.text;
    const strippedText = stripMarkdownForMeasurement(paragraphText);

    appendMeasuredTextBlock({
      wrapper: paragraphWrapper,
      paragraphText,
      sourceStartCharOffset: paragraph.sourceStartCharOffset,
      settings,
      strippedText,
    });

    const imageTokens = extractMarkdownImageTokens(paragraphText);
    imageTokens.forEach((token, imageIndex) => {
      const href = token.href;
      const normalizedHref = normalizeImageHref(href);
      const resolvedAspectRatio =
        imageAspectRatioByHref?.[normalizedHref] ??
        imageAspectRatioByHref?.[href] ??
        DEFAULT_IMAGE_ASPECT_RATIO;
      const safeAspectRatio =
        Number.isFinite(resolvedAspectRatio) && resolvedAspectRatio > 0
          ? resolvedAspectRatio
          : DEFAULT_IMAGE_ASPECT_RATIO;

      const renderedImageWidth = Math.max(
        0,
        settings.contentWidth *
          resolveReaderImageWidthRatio({
            alt: token.alt,
            title: token.title,
            aspectRatio: safeAspectRatio,
          }),
      );
      const imageElement = document.createElement('div');
      const measuredImageHeight = renderedImageWidth / safeAspectRatio;
      imageElement.style.display = 'block';
      imageElement.style.width = `${Math.min(
        renderedImageWidth,
        renderedImageMaxHeight * safeAspectRatio,
      )}px`;
      imageElement.style.height = `${Math.min(measuredImageHeight, renderedImageMaxHeight)}px`;
      imageElement.style.marginTop = imageIndex === 0 && strippedText ? '8px' : '0';
      imageElement.style.marginBottom = imageIndex < imageTokens.length - 1 ? '8px' : '0';

      paragraphWrapper.appendChild(imageElement);
    });

    measureContainer.appendChild(paragraphWrapper);
  });

  document.body.appendChild(measureContainer);
  const contentHeight = measureContainer.scrollHeight;
  document.body.removeChild(measureContainer);

  return contentHeight;
};

export function isFitInPage({
  paragraphs,
  settings,
  imageAspectRatioByHref,
}: {
  paragraphs: MeasuredParagraph[];
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

  const measuredHeight = measurePageColumnHeight({
    paragraphs,
    settings,
    imageAspectRatioByHref,
  });

  return measuredHeight <= settings.contentHeight;
}
