import {
  parseXml,
  serializeNode,
  getFirstElementByTag,
  getElementsByTag,
  getHrefAttribute,
  normalizeText,
} from './xmlUtils';
import { getNearestImageWidthHint, appendImageWidthHintToTitle } from './imageUtils';

export const prepareHtmlForTurndown = (html: string): string => {
  const doc = parseXml(html);
  const body = getFirstElementByTag(doc, 'body');

  if (!body) {
    return html;
  }

  // Remove hidden/system metadata nodes that should not be read as book content.
  const allElements = Array.from(body.getElementsByTagName('*'));
  allElements.forEach((element) => {
    const ariaHidden = normalizeText(element.getAttribute('aria-hidden')).toLowerCase();
    const hasHiddenAttribute = element.hasAttribute('hidden');
    const style = normalizeText(element.getAttribute('style')).toLowerCase();
    const isHiddenByStyle =
      style.includes('display:none') ||
      style.includes('display: none') ||
      style.includes('visibility:hidden') ||
      style.includes('visibility: hidden') ||
      style.includes('opacity:0') ||
      style.includes('opacity: 0');
    const isReleaseIdentifierLine =
      normalizeText(element.getAttribute('id')).toLowerCase() === 'release_identifier_line';

    if (ariaHidden === 'true' || hasHiddenAttribute || isHiddenByStyle || isReleaseIdentifierLine) {
      element.remove();
    }
  });

  // Gutenberg and some EPUBs wrap cover images in SVG <image xlink:href="...">.
  // Convert those wrappers to plain <img> so Turndown emits valid markdown images.
  const svgElements = getElementsByTag(body, 'svg');
  svgElements.forEach((svgElement) => {
    const firstImage = getElementsByTag(svgElement, 'image')[0] || null;
    const href = firstImage ? getHrefAttribute(firstImage) : '';

    if (!href) {
      svgElement.remove();
      return;
    }

    const imgElement = doc.createElement('img');
    imgElement.setAttribute('src', href);

    const alt = normalizeText(
      firstImage?.getAttribute('alt') ||
        svgElement.getAttribute('aria-label') ||
        svgElement.getAttribute('title') ||
        '',
    );
    if (alt) {
      imgElement.setAttribute('alt', alt);
    }

    svgElement.replaceWith(imgElement);
  });

  const imageElements = getElementsByTag(body, 'img');
  imageElements.forEach((imgElement) => {
    const widthHint = getNearestImageWidthHint(imgElement, body);
    if (widthHint == null) {
      return;
    }

    const existingTitle = imgElement.getAttribute('title') || '';
    const titleWithWidthHint = appendImageWidthHintToTitle(existingTitle, widthHint);
    imgElement.setAttribute('title', titleWithWidthHint);
  });

  return Array.from(body.childNodes)
    .map((node) => serializeNode(node))
    .join('\n');
};
