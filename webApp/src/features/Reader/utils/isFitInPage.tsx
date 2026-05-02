import { ReaderUiSettings } from '../model/types';

const fontFamily = 'serif';

export function isFitInPage({
  paragraphs,
  settings,
}: {
  paragraphs: string[];
  settings: ReaderUiSettings;
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

  paragraphs.forEach((paragraph, index) => {
    const paragraphElement = document.createElement('p');
    paragraphElement.textContent = paragraph;
    paragraphElement.style.margin = '0';
    paragraphElement.style.padding = '0';
    paragraphElement.style.fontSize = `${settings.fontSize}px`;
    paragraphElement.style.lineHeight = `${settings.lineHeight}`;
    paragraphElement.style.textAlign = settings.justifyText ? 'justify' : 'left';
    paragraphElement.style.fontFamily = fontFamily;
    paragraphElement.style.wordBreak = 'break-word';

    if (index < paragraphs.length - 1) {
      paragraphElement.style.marginBottom = `${paragraphGap}px`;
    }

    measureContainer.appendChild(paragraphElement);
  });

  document.body.appendChild(measureContainer);

  const contentHeight = measureContainer.scrollHeight;
  const isFit = contentHeight <= settings.contentHeight;

  document.body.removeChild(measureContainer);

  return isFit;
}
