import JSZip from 'jszip';
import TurndownService from 'turndown';
import { BookChapterNavigationItem } from '../../model/types';
import { splitTextIntoParagraphs } from '../splitParagraphsIntoPages';
import { parseXml } from './xmlUtils';
import { getElementsByTag, getFirstElementByTag } from './xmlUtils';
import { normalizeImageHref, resolveRelativePath } from './pathUtils';
import { getImageMimeType, uint8ArrayToBase64 } from './imageUtils';
import {
  normalizeMarkdownInlineLinks,
  normalizeBrokenUnderscoreEmphasis,
  normalizeBlockquoteSpacerLines,
  normalizeSetextHeadings,
  normalizeStandaloneEqualsSeparators,
  normalizeThematicBreaks,
} from './markdownNormalize';
import { prepareHtmlForTurndown } from './htmlPreprocess';
import {
  RawNavigationItem,
  extractNavigationFromNavDocument,
  extractNavigationFromNcxDocument,
  mapRawNavigationToBookChapters,
} from './navigation';
import { extractMetadataFromOpf } from './metadata';

export const parseEpubOnClient = async (
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

    const markdown = normalizeThematicBreaks(
      normalizeStandaloneEqualsSeparators(
        normalizeSetextHeadings(
          normalizeBrokenUnderscoreEmphasis(
            normalizeBlockquoteSpacerLines(
              normalizeMarkdownInlineLinks(
                turndown
                  .turndown(prepareHtmlForTurndown(html))
                  .trim()
                  .split(`<?xml version='1.0' encoding='utf-8'?>`)
                  .join('\n'),
              ),
            ),
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
