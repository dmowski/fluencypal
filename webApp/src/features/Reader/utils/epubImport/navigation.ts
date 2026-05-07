import { BookChapterNavigationItem } from '../../model/types';
import { getElementsByTag, getFirstElementByTag, normalizeText } from './xmlUtils';
import { normalizeImageHref, resolveRelativePath } from './pathUtils';

export interface RawNavigationItem {
  label: string;
  href: string;
  children: RawNavigationItem[];
}

const getDirectChildrenByTag = (element: Element, tag: string): Element[] =>
  Array.from(element.children).filter((child) => child.tagName.toLowerCase() === tag.toLowerCase());

const getOpsTypeAttribute = (element: Element): string =>
  normalizeText(
    element.getAttribute('epub:type') ||
      element.getAttribute('type') ||
      element.getAttributeNS('http://www.idpf.org/2007/ops', 'type') ||
      '',
  ).toLowerCase();

const resolveNavigationHref = (baseDocumentPath: string, href: string): string => {
  const trimmedHref = href.trim();
  if (!trimmedHref) return '';

  const [pathOnly, fragment] = trimmedHref.split('#', 2);
  const baseDir = baseDocumentPath.includes('/')
    ? baseDocumentPath.slice(0, baseDocumentPath.lastIndexOf('/'))
    : '';

  const resolvedPath = pathOnly
    ? resolveRelativePath(baseDir, pathOnly)
    : normalizeImageHref(baseDocumentPath);
  const normalizedPath = normalizeImageHref(resolvedPath);

  if (!normalizedPath) {
    return '';
  }

  return fragment ? `${normalizedPath}#${fragment}` : normalizedPath;
};

const extractNavigationFromHtmlList = (
  listElement: Element,
  baseDocumentPath: string,
): RawNavigationItem[] => {
  const listItems = getDirectChildrenByTag(listElement, 'li');

  return listItems
    .map((listItem) => {
      const directChildren = Array.from(listItem.children);
      const linkElement =
        directChildren.find((child) => child.tagName.toLowerCase() === 'a') || null;
      const labelElement =
        linkElement ||
        directChildren.find((child) => child.tagName.toLowerCase() === 'span') ||
        null;
      const nestedList =
        directChildren.find((child) => {
          const tagName = child.tagName.toLowerCase();
          return tagName === 'ol' || tagName === 'ul';
        }) || null;

      const label = normalizeText(labelElement?.textContent || listItem.textContent);
      const href = resolveNavigationHref(baseDocumentPath, linkElement?.getAttribute('href') || '');
      const children = nestedList
        ? extractNavigationFromHtmlList(nestedList, baseDocumentPath)
        : [];

      if (!label && children.length === 0) {
        return null;
      }

      return {
        label,
        href,
        children,
      };
    })
    .filter((item): item is RawNavigationItem => Boolean(item));
};

export const extractNavigationFromNavDocument = (
  navDoc: Document,
  navDocumentPath: string,
): RawNavigationItem[] => {
  const navElements = getElementsByTag(navDoc, 'nav');
  if (navElements.length === 0) return [];

  const tocNavElement =
    navElements.find((element) => getOpsTypeAttribute(element).split(/\s+/).includes('toc')) ||
    navElements[0];

  const firstListElement =
    getDirectChildrenByTag(tocNavElement, 'ol')[0] ||
    getDirectChildrenByTag(tocNavElement, 'ul')[0] ||
    null;

  if (!firstListElement) return [];

  return extractNavigationFromHtmlList(firstListElement, navDocumentPath);
};

const extractNavigationFromNcxNavPoint = (
  navPointElement: Element,
  ncxPath: string,
): RawNavigationItem => {
  const navLabelElement = getDirectChildrenByTag(navPointElement, 'navLabel')[0] || null;
  const textElement = navLabelElement
    ? getDirectChildrenByTag(navLabelElement, 'text')[0] || null
    : null;
  const contentElement = getDirectChildrenByTag(navPointElement, 'content')[0] || null;
  const childNavPoints = getDirectChildrenByTag(navPointElement, 'navPoint');

  return {
    label: normalizeText(textElement?.textContent || navLabelElement?.textContent || ''),
    href: resolveNavigationHref(ncxPath, contentElement?.getAttribute('src') || ''),
    children: childNavPoints.map((childNavPoint) =>
      extractNavigationFromNcxNavPoint(childNavPoint, ncxPath),
    ),
  };
};

export const extractNavigationFromNcxDocument = (
  ncxDoc: Document,
  ncxPath: string,
): RawNavigationItem[] => {
  const navMapElement = getFirstElementByTag(ncxDoc, 'navMap');
  if (!navMapElement) return [];

  return getDirectChildrenByTag(navMapElement, 'navPoint').map((navPointElement) =>
    extractNavigationFromNcxNavPoint(navPointElement, ncxPath),
  );
};

export const mapRawNavigationToBookChapters = (
  rawItems: RawNavigationItem[],
  paragraphStartBySectionPath: Record<string, number>,
  parentId: string,
): BookChapterNavigationItem[] =>
  rawItems
    .map((item, index) => {
      const chapterId = `${parentId}-${index + 1}`;
      const [pathOnly] = item.href.split('#', 1);
      const normalizedPath = normalizeImageHref(pathOnly || '');
      const targetParagraphIndex =
        normalizedPath && Number.isFinite(paragraphStartBySectionPath[normalizedPath])
          ? paragraphStartBySectionPath[normalizedPath]
          : null;

      const children = mapRawNavigationToBookChapters(
        item.children,
        paragraphStartBySectionPath,
        chapterId,
      );

      if (!item.label && children.length === 0) {
        return null;
      }

      return {
        id: chapterId,
        label: item.label || 'Untitled chapter',
        ...(item.href ? { href: item.href } : {}),
        targetParagraphIndex,
        children,
      };
    })
    .filter((item): item is BookChapterNavigationItem => Boolean(item));
