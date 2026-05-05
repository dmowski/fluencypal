import { BookChapterNavigationItem } from '../model/types';
import { PagedParagraph } from './splitParagraphsIntoPages';

export interface ReaderChapterNavigationItem {
  id: string;
  label: string;
  targetPage: number | null;
  children: ReaderChapterNavigationItem[];
}

const EXTERNAL_LINK_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

const getPathVariants = (path: string): string[] => {
  const variants = new Set<string>([path]);

  if (path.endsWith('.htm.html')) {
    variants.add(path.slice(0, -'.htm.html'.length) + '.htm.xhtml');
  }

  if (path.endsWith('.html')) {
    variants.add(path.slice(0, -'.html'.length) + '.xhtml');
  }

  if (path.endsWith('.xhtml')) {
    variants.add(path.slice(0, -'.xhtml'.length) + '.html');
  }

  return Array.from(variants);
};

const getPathBasename = (path: string): string => {
  const segments = path.split('/').filter(Boolean);
  return segments[segments.length - 1] || '';
};

const normalizeInternalHref = (
  href: string,
): {
  full: string;
  path: string;
  fragment: string | null;
} | null => {
  const trimmedHref = href.trim();
  if (!trimmedHref) return null;
  if (EXTERNAL_LINK_SCHEME.test(trimmedHref) || trimmedHref.startsWith('//')) {
    return null;
  }

  const [pathAndQuery, fragmentRaw] = trimmedHref.split('#', 2);
  const [pathOnly] = pathAndQuery.split('?', 1);
  const normalizedPath = decodeURI(pathOnly.trim())
    .replace(/^([./]+)+/, '')
    .replace(/\\/g, '/');
  const fragment = fragmentRaw?.trim() || null;

  const full =
    normalizedPath && fragment
      ? `${normalizedPath}#${fragment}`
      : fragment
        ? `#${fragment}`
        : normalizedPath;

  if (!full) {
    return null;
  }

  return {
    full,
    path: normalizedPath,
    fragment,
  };
};

export const findTargetPageForChapter = ({
  pages,
  targetParagraphIndex,
}: {
  pages: PagedParagraph[][];
  targetParagraphIndex: number | null;
}): number | null => {
  if (!Number.isFinite(targetParagraphIndex) || targetParagraphIndex == null) {
    return null;
  }

  const pageIndex = pages.findIndex((page) =>
    page.some((pagedParagraph) => pagedParagraph.sourceParagraphIndex === targetParagraphIndex),
  );

  return pageIndex >= 0 ? pageIndex + 1 : null;
};

export const findActiveChapterId = (
  items: ReaderChapterNavigationItem[],
  activePage: number,
): string | null => {
  let bestId: string | null = null;
  let bestPage = 0;

  const walk = (list: ReaderChapterNavigationItem[]) => {
    for (const item of list) {
      const target = item.targetPage;
      if (target !== null && target > 0 && target <= activePage && target >= bestPage) {
        bestPage = target;
        bestId = item.id;
      }
      walk(item.children);
    }
  };

  walk(items);
  return bestId;
};

export const mapChaptersToPages = ({
  chapters,
  pages,
}: {
  chapters: BookChapterNavigationItem[];
  pages: PagedParagraph[][];
}): ReaderChapterNavigationItem[] =>
  chapters.map((chapter) => ({
    id: chapter.id,
    label: chapter.label,
    targetPage: findTargetPageForChapter({
      pages,
      targetParagraphIndex: chapter.targetParagraphIndex,
    }),
    children: mapChaptersToPages({ chapters: chapter.children, pages }),
  }));

export const findTargetPageForInternalChapterHref = ({
  chapters,
  pages,
  href,
}: {
  chapters: BookChapterNavigationItem[];
  pages: PagedParagraph[][];
  href: string;
}): number | null => {
  const normalizedHref = normalizeInternalHref(href);
  if (!normalizedHref) {
    return null;
  }

  const normalizedHrefPathVariants = new Set(getPathVariants(normalizedHref.path));

  let pathFallback: number | null = null;
  let fragmentFallback: number | null = null;

  const walk = (items: BookChapterNavigationItem[]): number | null => {
    for (const item of items) {
      const targetPage = findTargetPageForChapter({
        pages,
        targetParagraphIndex: item.targetParagraphIndex,
      });
      const normalizedChapterHref = item.href ? normalizeInternalHref(item.href) : null;

      if (targetPage !== null && normalizedChapterHref) {
        const chapterPathVariants = new Set(getPathVariants(normalizedChapterHref.path));
        const hasPathVariantMatch =
          normalizedHrefPathVariants.size > 0 &&
          Array.from(chapterPathVariants).some((pathVariant) =>
            normalizedHrefPathVariants.has(pathVariant),
          );
        const hasPathBasenameMatch =
          normalizedHref.path.length > 0 &&
          normalizedChapterHref.path.length > 0 &&
          Array.from(chapterPathVariants).some((pathVariant) => {
            const chapterBasename = getPathBasename(pathVariant);
            const hrefBasename = getPathBasename(normalizedHref.path);
            return chapterBasename.length > 0 && chapterBasename === hrefBasename;
          });

        const hasFragmentMatch =
          normalizedChapterHref.fragment === normalizedHref.fragment ||
          (!normalizedChapterHref.fragment && !normalizedHref.fragment);

        if (normalizedChapterHref.full === normalizedHref.full) {
          return targetPage;
        }

        if ((hasPathVariantMatch || hasPathBasenameMatch) && hasFragmentMatch) {
          return targetPage;
        }

        if (
          pathFallback == null &&
          normalizedHref.path &&
          (hasPathVariantMatch || hasPathBasenameMatch)
        ) {
          pathFallback = targetPage;
        }

        if (
          fragmentFallback == null &&
          normalizedHref.fragment &&
          normalizedChapterHref.fragment === normalizedHref.fragment
        ) {
          fragmentFallback = targetPage;
        }
      }

      const nestedResult = walk(item.children);
      if (nestedResult !== null) {
        return nestedResult;
      }
    }

    return null;
  };

  const exactMatch = walk(chapters);
  if (exactMatch !== null) {
    return exactMatch;
  }

  return pathFallback ?? fragmentFallback;
};
