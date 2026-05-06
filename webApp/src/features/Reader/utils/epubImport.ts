import JSZip from 'jszip';
import TurndownService from 'turndown';
import { sendConvertDocToTextRequest } from '@/app/api/convertDocToText/sendConvertDocToTextRequest';
import { BookChapterNavigationItem } from '../model/types';
import { splitTextIntoParagraphs } from './splitParagraphsIntoPages';

export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024;

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const isEpubFile = (file: File): boolean => {
  const fileName = file.name.toLowerCase();
  return (
    file.type === 'application/epub+zip' ||
    fileName.endsWith('.epub') ||
    file.type === 'application/octet-stream'
  );
};

export const validateEpubFile = (file: File): string | null => {
  if (!isEpubFile(file)) {
    return 'Please select a valid EPUB file.';
  }

  if (file.size > MAX_EPUB_FILE_SIZE) {
    return 'File size must be less than 50MB';
  }

  return null;
};

const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

const resolveRelativePath = (baseDir: string, href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const normalizedHref = decodeURI(pathOnly.trim()).replace(/\\/g, '/');
  const combined = normalizedHref.startsWith('/')
    ? normalizedHref.slice(1)
    : [baseDir, normalizedHref].filter(Boolean).join('/');

  const segments = combined.split('/').filter(Boolean);
  const stack: string[] = [];

  segments.forEach((segment) => {
    if (segment === '.') return;
    if (segment === '..') {
      stack.pop();
      return;
    }
    stack.push(segment);
  });

  return stack.join('/');
};

const getImageMimeType = (href: string): string | null => {
  const lowerHref = href.toLowerCase();
  const matchedExtension = Object.keys(IMAGE_EXT_TO_MIME).find((ext) => lowerHref.endsWith(ext));
  if (!matchedExtension) return null;
  return IMAGE_EXT_TO_MIME[matchedExtension];
};

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const parseXml = (xml: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

const serializeNode = (node: Node): string => new XMLSerializer().serializeToString(node);

const getFirstElementByTag = (root: Document | Element, tag: string): Element | null => {
  const withNs = root.getElementsByTagNameNS('*', tag)[0] || null;
  if (withNs) return withNs;
  return root.getElementsByTagName(tag)[0] || null;
};

const getElementsByTag = (root: Document | Element, tag: string): Element[] => {
  const withNs = Array.from(root.getElementsByTagNameNS('*', tag));
  if (withNs.length > 0) return withNs;
  return Array.from(root.getElementsByTagName(tag));
};

const getHrefAttribute = (element: Element): string => {
  const href = element.getAttribute('href') || element.getAttribute('xlink:href') || '';
  if (href.trim()) {
    return href.trim();
  }

  const hrefNs = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
  return hrefNs.trim();
};

const normalizeText = (value: string | null | undefined): string =>
  (value || '').replace(/\s+/g, ' ').trim();

const IMAGE_WIDTH_CLASS_REGEX = /(?:^|\s)width_(\d{1,3})(?=$|\s)/i;
const IMAGE_WIDTH_HINT_TITLE_PREFIX = 'reader-width:';

const getImageWidthHintFromClassName = (className: string): number | null => {
  const match = className.match(IMAGE_WIDTH_CLASS_REGEX);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.min(Math.max(value, 5), 100);
};

const getNearestImageWidthHint = (element: Element, boundary: Element): number | null => {
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

const appendImageWidthHintToTitle = (title: string, widthHint: number): string => {
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

const normalizeMarkdownInlineLinks = (markdown: string): string => {
  const normalizeImageTitleToken = (rawTitle: string | undefined): string => {
    if (!rawTitle) return '';

    const decoded = rawTitle.replace(/&quot;/g, '"').trim();
    const titleMatch = decoded.match(/^(["'])([\s\S]*)\1$/);
    const titleValue = titleMatch ? titleMatch[2].trim() : decoded;
    if (!titleValue) return '';

    return `"${titleValue.replace(/"/g, '&quot;')}"`;
  };

  const splitEmbeddedEncodedTitleFromHref = (
    href: string,
  ): { normalizedHref: string; encodedTitle: string } => {
    const embeddedTitleMatch = href.match(/^(.*?)(?:&quot;)([^&]+)(?:&quot;)$/i);
    if (!embeddedTitleMatch) {
      return {
        normalizedHref: href,
        encodedTitle: '',
      };
    }

    return {
      normalizedHref: embeddedTitleMatch[1].trim(),
      encodedTitle: `"${embeddedTitleMatch[2].trim()}"`,
    };
  };

  const normalizedImageLinks = markdown.replace(
    /!\[([^\]]*)\]\s*\((\S+)(?:\s+("[^"]*"|'[^']*'|&quot;[^&]+&quot;))?\)/g,
    (_, alt: string, href: string, title: string | undefined) => {
      const normalizedAlt = alt.replace(/\s+/g, ' ').trim();
      const compactHref = href.replace(/\s+/g, '');
      const split = splitEmbeddedEncodedTitleFromHref(compactHref);
      const normalizedHref = split.normalizedHref;
      const normalizedTitle =
        normalizeImageTitleToken(title) || normalizeImageTitleToken(split.encodedTitle);

      if (!normalizedHref) {
        return `![${normalizedAlt}]()`;
      }

      return normalizedTitle
        ? `![${normalizedAlt}](${normalizedHref} ${normalizedTitle})`
        : `![${normalizedAlt}](${normalizedHref})`;
    },
  );

  return normalizedImageLinks.replace(
    /(^|[^!])\[([^\]]+)\]\s*\(([^)]+)\)/g,
    (_, prefix: string, label: string, href: string) => {
      const normalizedLabel = label.replace(/\s+/g, ' ').trim();
      const normalizedHref = href.replace(/\s+/g, '');
      return `${prefix}[${normalizedLabel}](${normalizedHref})`;
    },
  );
};

const normalizeBrokenUnderscoreEmphasis = (markdown: string): string => {
  // Some EPUB conversions emit comma-separated italics as `_part1,_ part2_, part3_`.
  // Collapse those into one valid markdown emphasis span.
  return markdown.replace(
    /_([^_\n]+),_\s+([^_\n]+)_,\s+([^_\n]+)_/g,
    (_, part1: string, part2: string, part3: string) => `_${part1}, ${part2}, ${part3}_`,
  );
};

const normalizeSetextHeadings = (markdown: string): string => {
  // Convert setext-style headings (`Title\n-----`) to ATX headings so downstream
  // markdown renderers that do not support setext still display semantic headings.
  const lines = markdown.split('\n');
  const normalized: string[] = [];

  const isHeadingUnderline = (line: string): 1 | 2 | null => {
    const trimmed = line.trim();
    if (!trimmed || !/^[=-]{3,}$/.test(trimmed)) {
      return null;
    }

    return trimmed[0] === '=' ? 1 : 2;
  };

  const canPromoteToHeading = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,6}\s/.test(trimmed)) return false;
    if (/^(?:[-*+]\s|\d+\.\s)/.test(trimmed)) return false;
    if (/^>\s/.test(trimmed)) return false;
    if (/^```/.test(trimmed)) return false;
    return true;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = lines[i + 1];
    const headingLevel = next ? isHeadingUnderline(next) : null;

    if (headingLevel && canPromoteToHeading(current)) {
      normalized.push(`${'#'.repeat(headingLevel)} ${current.trim()}`);
      i += 1;
      continue;
    }

    normalized.push(current);
  }

  return normalized.join('\n');
};

const normalizeStandaloneEqualsSeparators = (markdown: string): string => {
  const lines = markdown.split('\n');
  const normalized: string[] = [];
  let isInFencedCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      isInFencedCodeBlock = !isInFencedCodeBlock;
      normalized.push(line);
      continue;
    }

    if (!isInFencedCodeBlock && /^={3,}$/.test(trimmed)) {
      normalized.push('---');
      continue;
    }

    normalized.push(line);
  }

  return normalized.join('\n');
};

const prepareHtmlForTurndown = (html: string): string => {
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

interface RawNavigationItem {
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

const extractNavigationFromNavDocument = (
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

const extractNavigationFromNcxDocument = (
  ncxDoc: Document,
  ncxPath: string,
): RawNavigationItem[] => {
  const navMapElement = getFirstElementByTag(ncxDoc, 'navMap');
  if (!navMapElement) return [];

  return getDirectChildrenByTag(navMapElement, 'navPoint').map((navPointElement) =>
    extractNavigationFromNcxNavPoint(navPointElement, ncxPath),
  );
};

const mapRawNavigationToBookChapters = (
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

const splitTitleAndSubtitle = (title: string): { title: string; subtitle: string } => {
  const delimiters = [' - ', ': ', ' | '];

  for (const delimiter of delimiters) {
    if (!title.includes(delimiter)) continue;
    const [mainTitle, ...rest] = title.split(delimiter);
    const subtitle = rest.join(delimiter).trim();
    if (mainTitle.trim() && subtitle) {
      return {
        title: mainTitle.trim(),
        subtitle,
      };
    }
  }

  return {
    title,
    subtitle: '',
  };
};

const extractMetadataFromOpf = (
  opfDoc: Document,
): { title: string; subtitle: string; author: string } => {
  const metadataNode = getFirstElementByTag(opfDoc, 'metadata');
  const sourceNode = metadataNode || opfDoc;

  const titleElements = getElementsByTag(sourceNode, 'title');
  const creatorElements = getElementsByTag(sourceNode, 'creator');
  const subtitleElements = getElementsByTag(sourceNode, 'subtitle');
  const metaElements = getElementsByTag(sourceNode, 'meta');

  const mainTitleFromTitleTag = normalizeText(titleElements[0]?.textContent);
  const author = normalizeText(creatorElements[0]?.textContent);

  const subtitleByRefine = (() => {
    for (const meta of metaElements) {
      const property = normalizeText(meta.getAttribute('property'));
      const refines = normalizeText(meta.getAttribute('refines'));
      const value = normalizeText(meta.getAttribute('content') || meta.textContent);
      if (property !== 'title-type' || value.toLowerCase() !== 'subtitle' || !refines) continue;

      const titleId = refines.replace(/^#/, '');
      const refinedTitle = titleElements.find((element) => element.getAttribute('id') === titleId);
      const refinedValue = normalizeText(refinedTitle?.textContent);
      if (refinedValue) return refinedValue;
    }

    return '';
  })();

  const subtitleFromTag = normalizeText(subtitleElements[0]?.textContent);
  const subtitleFromMeta = (() => {
    const matchingMeta = metaElements.find((meta) => {
      const property = normalizeText(meta.getAttribute('property')).toLowerCase();
      const name = normalizeText(meta.getAttribute('name')).toLowerCase();
      return property === 'subtitle' || name === 'subtitle';
    });

    return normalizeText(matchingMeta?.getAttribute('content') || matchingMeta?.textContent);
  })();

  const explicitSubtitle = subtitleByRefine || subtitleFromTag || subtitleFromMeta;
  if (explicitSubtitle) {
    return {
      title: mainTitleFromTitleTag,
      subtitle: explicitSubtitle,
      author,
    };
  }

  const split = splitTitleAndSubtitle(mainTitleFromTitleTag);
  return {
    title: split.title,
    subtitle: split.subtitle,
    author,
  };
};

const parseEpubOnClient = async (
  file: File,
): Promise<{
  markdown: string;
  metadata: { title: string; subtitle: string; author: string };
  chapters: BookChapterNavigationItem[];
  imageDataUrlByHref: Record<string, string>;
}> => {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());

  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) {
    throw new Error('Invalid EPUB file: missing container.xml');
  }

  const containerDoc = parseXml(containerXml);
  const rootFileElement = getFirstElementByTag(containerDoc, 'rootfile');
  const opfPath = rootFileElement?.getAttribute('full-path')?.trim() || '';
  if (!opfPath) {
    throw new Error('Invalid EPUB file: missing OPF path');
  }

  const opfXml = await zip.file(opfPath)?.async('string');
  if (!opfXml) {
    throw new Error('Invalid EPUB file: missing OPF manifest');
  }

  const opfDoc = parseXml(opfXml);
  const metadata = extractMetadataFromOpf(opfDoc);
  const opfDir = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : '';

  const manifestItems = getElementsByTag(opfDoc, 'item').map((item) => {
    const id = item.getAttribute('id')?.trim() || '';
    const href = item.getAttribute('href')?.trim() || '';
    const mediaType = item.getAttribute('media-type')?.trim() || '';
    const properties = item.getAttribute('properties')?.trim() || '';

    return {
      id,
      href,
      mediaType,
      properties,
      resolvedPath: resolveRelativePath(opfDir, href),
    };
  });

  const manifestById = manifestItems.reduce<Record<string, (typeof manifestItems)[number]>>(
    (acc, item) => {
      if (item.id) {
        acc[item.id] = item;
      }
      return acc;
    },
    {},
  );

  const spineIds = getElementsByTag(opfDoc, 'itemref')
    .map((itemRef) => itemRef.getAttribute('idref')?.trim() || '')
    .filter(Boolean);

  const spineElement = getFirstElementByTag(opfDoc, 'spine');
  const ncxIdFromSpine = spineElement?.getAttribute('toc')?.trim() || '';

  let rawNavigationItems: RawNavigationItem[] = [];

  const navManifestItem = manifestItems.find((item) =>
    item.properties.split(/\s+/).filter(Boolean).includes('nav'),
  );

  if (navManifestItem) {
    const navXml = await zip.file(navManifestItem.resolvedPath)?.async('string');
    if (navXml) {
      rawNavigationItems = extractNavigationFromNavDocument(
        parseXml(navXml),
        navManifestItem.resolvedPath,
      );
    }
  }

  if (rawNavigationItems.length === 0) {
    const ncxManifestItem =
      (ncxIdFromSpine ? manifestById[ncxIdFromSpine] : undefined) ||
      manifestItems.find(
        (item) => item.mediaType === 'application/x-dtbncx+xml' || /\.ncx$/i.test(item.href),
      );

    if (ncxManifestItem) {
      const ncxXml = await zip.file(ncxManifestItem.resolvedPath)?.async('string');
      if (ncxXml) {
        rawNavigationItems = extractNavigationFromNcxDocument(
          parseXml(ncxXml),
          ncxManifestItem.resolvedPath,
        );
      }
    }
  }

  const turndown = new TurndownService();
  const markdownSections: string[] = [];
  const paragraphStartBySectionPath: Record<string, number> = {};
  let paragraphOffset = 0;

  for (const spineId of spineIds) {
    const item = manifestById[spineId];
    if (!item) continue;

    const isHtmlDocument =
      item.mediaType.includes('xhtml') ||
      item.mediaType.includes('html') ||
      /\.(xhtml|html|htm)$/i.test(item.href);

    if (!isHtmlDocument) continue;

    const html = await zip.file(item.resolvedPath)?.async('string');
    if (!html) continue;

    const markdown = normalizeStandaloneEqualsSeparators(
      normalizeSetextHeadings(
        normalizeBrokenUnderscoreEmphasis(
          normalizeMarkdownInlineLinks(
            turndown
              .turndown(prepareHtmlForTurndown(html))
              .trim()
              .split(`<?xml version='1.0' encoding='utf-8'?>`)
              .join('\n'),
          ),
        ),
      ),
    );

    if (markdown) {
      const normalizedSectionPath = normalizeImageHref(item.resolvedPath);
      if (
        normalizedSectionPath &&
        !Number.isFinite(paragraphStartBySectionPath[normalizedSectionPath])
      ) {
        paragraphStartBySectionPath[normalizedSectionPath] = paragraphOffset;
      }
      markdownSections.push(markdown);
      paragraphOffset += splitTextIntoParagraphs(markdown).length;
    }
  }

  const chapters = mapRawNavigationToBookChapters(
    rawNavigationItems,
    paragraphStartBySectionPath,
    'chapter',
  );

  const imageDataUrlByHref: Record<string, string> = {};

  for (const item of manifestItems) {
    const inferredMimeType = getImageMimeType(item.href);
    const mimeType = item.mediaType.startsWith('image/') ? item.mediaType : inferredMimeType;
    if (!mimeType) continue;

    const bytes = await zip.file(item.resolvedPath)?.async('uint8array');
    if (!bytes || bytes.length === 0) continue;

    const dataUrl = `data:${mimeType};base64,${uint8ArrayToBase64(bytes)}`;
    const normalizedHref = normalizeImageHref(item.href);
    const normalizedResolvedPath = normalizeImageHref(item.resolvedPath);

    if (normalizedHref) {
      imageDataUrlByHref[normalizedHref] = dataUrl;
    }

    if (normalizedResolvedPath && normalizedResolvedPath !== normalizedHref) {
      imageDataUrlByHref[normalizedResolvedPath] = dataUrl;
    }
  }

  return {
    markdown: markdownSections.join('\n\n'),
    metadata,
    chapters,
    imageDataUrlByHref,
  };
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
  chapters: BookChapterNavigationItem[];
  imageDataUrlByHref: Record<string, string>;
  imageAspectRatioByHref: Record<string, number>;
}

export interface EpubImportProgressUpdate {
  progress: number;
  message: string;
}

export const convertEpubFile = async ({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (update: EpubImportProgressUpdate) => void;
}): Promise<EpubImportPayload> => {
  onProgress?.({ progress: 10, message: 'Reading EPUB...' });
  onProgress?.({ progress: 35, message: 'Converting EPUB to markdown...' });

  const parsed = await parseEpubOnClient(file);
  const markdown = parsed.markdown.trim();

  if (!markdown) {
    throw new Error('Could not extract text from this EPUB.');
  }

  const metadata = parsed.metadata;

  onProgress?.({ progress: 75, message: 'Extracting title, subtitle and author...' });

  const needsAiMetadata = !metadata.subtitle.trim();
  console.log('metadata.subtitle', metadata.subtitle);
  let finalMetadata = metadata;

  if (needsAiMetadata) {
    onProgress?.({
      progress: 82,
      message: 'No subtitle found. Parsing metadata with AI...',
    });

    const aiResponse = await sendConvertDocToTextRequest({
      textPreview: markdown.slice(0, 600),
    });

    if (aiResponse.metadata) {
      finalMetadata = {
        title: aiResponse.metadata.title.trim() || metadata.title,
        subtitle: aiResponse.metadata.subtitle.trim() || metadata.subtitle,
        author: aiResponse.metadata.author.trim() || metadata.author,
      };
    }
  }

  const imageDataUrlByHref = parsed.imageDataUrlByHref;

  onProgress?.({
    progress: 92,
    message: 'Extracting embedded images...',
  });

  const imageAspectRatioByHref = await buildImageAspectRatioMap(imageDataUrlByHref);

  return {
    text: markdown,
    title: finalMetadata.title,
    subtitle: finalMetadata.subtitle,
    author: finalMetadata.author,
    chapters: parsed.chapters,
    imageDataUrlByHref,
    imageAspectRatioByHref,
  };
};
