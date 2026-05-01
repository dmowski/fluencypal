import { fitTextToWidth } from './fitTextToWidth';

const MIN_READABLE_FONT_SIZE_PX = 8;

const measureIntrinsicTextWidth = ({
  element,
  text,
  fontSizePx,
}: {
  element: HTMLElement;
  text: string;
  fontSizePx: number;
}) => {
  const computedStyles = getComputedStyle(element);
  const measurementElement = element.cloneNode(false) as HTMLElement;

  measurementElement.textContent = text;
  measurementElement.setAttribute('aria-hidden', 'true');
  measurementElement.style.position = 'absolute';
  measurementElement.style.left = '-99999px';
  measurementElement.style.top = '0';
  measurementElement.style.width = 'auto';
  measurementElement.style.minWidth = 'max-content';
  measurementElement.style.maxWidth = 'none';
  measurementElement.style.display = 'inline-block';
  measurementElement.style.margin = '0';
  measurementElement.style.padding = '0';
  measurementElement.style.boxSizing = 'content-box';
  measurementElement.style.visibility = 'hidden';
  measurementElement.style.pointerEvents = 'none';
  measurementElement.style.fontFamily = computedStyles.fontFamily;
  measurementElement.style.fontStyle = computedStyles.fontStyle;
  measurementElement.style.fontWeight = computedStyles.fontWeight;
  measurementElement.style.fontStretch = computedStyles.fontStretch;
  measurementElement.style.fontVariant = computedStyles.fontVariant;
  measurementElement.style.letterSpacing = computedStyles.letterSpacing;
  measurementElement.style.wordSpacing = computedStyles.wordSpacing;
  measurementElement.style.textTransform = computedStyles.textTransform;
  measurementElement.style.whiteSpace = 'nowrap';
  measurementElement.style.fontSize = `${fontSizePx}px`;

  document.body.appendChild(measurementElement);
  const measuredWidth = measurementElement.getBoundingClientRect().width;
  measurementElement.remove();

  return measuredWidth;
};

export const fitElementFontSizeToWidth = ({
  element,
  text,
  availableWidth,
}: {
  element: HTMLElement;
  text: string;
  availableWidth: number;
}) => {
  const bestFit = fitTextToWidth({
    availableWidth,
    measureCandidateWidth: (fontSizePx) =>
      measureIntrinsicTextWidth({ element, text, fontSizePx }),
    measureRenderedWidth: (fontSizePx) => measureIntrinsicTextWidth({ element, text, fontSizePx }),
  });

  if (!bestFit || bestFit < MIN_READABLE_FONT_SIZE_PX) return undefined;

  element.style.fontSize = `${bestFit.toFixed(2)}px`;

  return `${bestFit.toFixed(2)}px`;
};
