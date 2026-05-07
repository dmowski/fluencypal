export const MAX_EPUB_FILE_SIZE = 50 * 1024 * 1024;

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
