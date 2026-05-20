export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Version of the local EPUB → markdown / chapters / images parsing pipeline.
 *
 * Bump this whenever the parser output changes in a way that requires
 * already-imported books to be re-parsed (e.g. paragraph splitting changes,
 * chapter extraction fixes, image href normalization). Books whose stored
 * `epubParserVersion` does not equal this constant are automatically
 * re-imported on the client when their EPUB source is available.
 */
export const EPUB_PARSER_VERSION = 1;

export const IMAGE_EXT_TO_MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export const IMAGE_WIDTH_CLASS_REGEX = /(?:^|\s)width_(\d{1,3})(?=$|\s)/i;
export const IMAGE_WIDTH_HINT_TITLE_PREFIX = 'reader-width:';
