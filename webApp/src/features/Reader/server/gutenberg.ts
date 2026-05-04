import { ReaderLibraryBook, ReaderLibraryCategory } from '../model/library';

const GUTENBERG_BASE_URL = 'https://www.gutenberg.org';
const BOOKS_PER_CATEGORY = 8;
const EBOOK_ID_PATTERN = /^\d+$/;

const CATEGORY_CONFIG = [
  { id: 'romance', title: 'Romance', bookshelfId: '639' },
  { id: 'science-fiction-fantasy', title: 'Science Fiction & Fantasy', bookshelfId: '638' },
  { id: 'history', title: 'History', bookshelfId: '656' },
  { id: 'philosophy', title: 'Philosophy & Ethics', bookshelfId: '691' },
] as const;

const BOOK_LINK_PATTERN =
  /<li class="booklink">[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>[\s\S]*?(?:<img class="cover-thumb" src="([^"]*)"[^>]*>)?[\s\S]*?<span class="title">([\s\S]*?)<\/span>(?:[\s\S]*?<span class="subtitle">([\s\S]*?)<\/span>)?[\s\S]*?<span class="extra">([\d,]+) downloads<\/span>[\s\S]*?<\/li>/g;
const EPUB_LINK_PATTERN =
  /<a href="([^"]+)"[^>]*type="application\/epub\+zip"[^>]*>([^<]+)<\/a>/g;

const HTML_ENTITY_MAP: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  eacute: 'é',
  Eacute: 'É',
  egrave: 'è',
  agrave: 'à',
  uuml: 'ü',
  ouml: 'ö',
  auml: 'ä',
  ccedil: 'ç',
};

const decodeHtml = (value: string): string =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-zA-Z]+);/g, (match, entity: string) => HTML_ENTITY_MAP[entity] ?? match)
    .replace(/\s+/g, ' ')
    .trim();

const toAbsoluteUrl = (value: string) => new URL(value, GUTENBERG_BASE_URL).toString();

const getPreferredEpubRank = (href: string) => {
  if (href.includes('.epub.noimages')) return 0;
  if (href.includes('.epub.images')) return 1;
  if (href.includes('.epub3.images')) return 2;
  if (href.includes('.epub3')) return 3;
  if (href.includes('.epub')) return 4;
  return 5;
};

const parseBooksFromBookshelfHtml = (html: string): ReaderLibraryBook[] => {
  const matches = Array.from(html.matchAll(BOOK_LINK_PATTERN));

  return matches.slice(0, BOOKS_PER_CATEGORY).map((match) => {
    const [, href, coverSrc = '', rawTitle, rawAuthor = '', rawDownloads] = match;
    const ebookId = href.match(/\/ebooks\/(\d+)/)?.[1] ?? href;

    return {
      ebookId,
      title: decodeHtml(rawTitle),
      author: decodeHtml(rawAuthor) || 'Unknown author',
      downloads: Number(rawDownloads.replace(/,/g, '')),
      coverUrl: coverSrc ? toAbsoluteUrl(coverSrc) : null,
      bookUrl: toAbsoluteUrl(href),
    };
  });
};

export const getReaderLibraryCategories = async (): Promise<ReaderLibraryCategory[]> => {
  const categories = await Promise.all(
    CATEGORY_CONFIG.map(async (category) => {
      const response = await fetch(`${GUTENBERG_BASE_URL}/ebooks/bookshelf/${category.bookshelfId}`, {
        headers: {
          Accept: 'text/html,application/xhtml+xml',
        },
        next: { revalidate: 60 * 60 * 12 },
      });

      if (!response.ok) {
        throw new Error(`Failed to load Gutenberg category ${category.id}`);
      }

      const html = await response.text();

      return {
        id: category.id,
        title: category.title,
        books: parseBooksFromBookshelfHtml(html),
      } satisfies ReaderLibraryCategory;
    }),
  );

  return categories.filter((category) => category.books.length > 0);
};

export const isValidGutenbergEbookId = (ebookId: string) => EBOOK_ID_PATTERN.test(ebookId);

export const resolveGutenbergEpubDownload = async (ebookId: string) => {
  if (!isValidGutenbergEbookId(ebookId)) {
    throw new Error('Invalid Gutenberg ebook id.');
  }

  const response = await fetch(`${GUTENBERG_BASE_URL}/ebooks/${ebookId}`, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Gutenberg ebook ${ebookId}`);
  }

  const html = await response.text();
  const matches = Array.from(html.matchAll(EPUB_LINK_PATTERN)).map((match) => ({
    href: match[1],
    label: decodeHtml(match[2]),
  }));

  if (matches.length === 0) {
    throw new Error(`No EPUB download found for Gutenberg ebook ${ebookId}`);
  }

  const selected = matches.sort((left, right) => {
    return getPreferredEpubRank(left.href) - getPreferredEpubRank(right.href);
  })[0];

  const downloadUrl = toAbsoluteUrl(selected.href);
  const fileName = downloadUrl.split('/').pop() || `${ebookId}.epub`;

  return {
    downloadUrl,
    fileName,
    label: selected.label,
  };
};
