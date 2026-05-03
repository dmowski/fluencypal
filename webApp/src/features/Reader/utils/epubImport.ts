import JSZip from 'jszip';
import TurndownService from 'turndown';

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

export const validateEpubFile = (
  file: File,
  translate: (message: string) => string,
): string | null => {
  if (!isEpubFile(file)) {
    return translate('Please select a valid EPUB file.');
  }

  if (file.size > MAX_EPUB_FILE_SIZE) {
    return translate('File size must be less than 50MB');
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

const normalizeText = (value: string | null | undefined): string =>
  (value || '').replace(/\s+/g, ' ').trim();

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

    return {
      id,
      href,
      mediaType,
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

  const turndown = new TurndownService();
  const markdownSections: string[] = [];

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

    const markdown = turndown
      .turndown(html)
      .trim()
      .split(`<?xml version='1.0' encoding='utf-8'?>`)
      .join('\n');

    if (markdown) {
      markdownSections.push(markdown);
    }
  }

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
  imageDataUrlByHref: Record<string, string>;
  imageAspectRatioByHref: Record<string, number>;
}

export interface EpubImportProgressUpdate {
  progress: number;
  message: string;
}

export const convertEpubFile = async ({
  file,
  translate,
  onProgress,
}: {
  file: File;
  translate: (message: string) => string;
  onProgress?: (update: EpubImportProgressUpdate) => void;
}): Promise<EpubImportPayload> => {
  onProgress?.({ progress: 10, message: translate('Reading EPUB...') });
  onProgress?.({ progress: 35, message: translate('Converting EPUB to markdown...') });

  const parsed = await parseEpubOnClient(file);
  const markdown = parsed.markdown.trim();

  if (!markdown) {
    throw new Error(translate('Could not extract text from this EPUB.'));
  }

  const metadata = parsed.metadata;

  onProgress?.({ progress: 75, message: translate('Extracting title, subtitle and author...') });

  const imageDataUrlByHref = parsed.imageDataUrlByHref;

  onProgress?.({
    progress: 92,
    message: translate('Extracting embedded images...'),
  });

  const imageAspectRatioByHref = await buildImageAspectRatioMap(imageDataUrlByHref);

  return {
    text: markdown,
    title: metadata.title,
    subtitle: metadata.subtitle,
    author: metadata.author,
    imageDataUrlByHref,
    imageAspectRatioByHref,
  };
};
