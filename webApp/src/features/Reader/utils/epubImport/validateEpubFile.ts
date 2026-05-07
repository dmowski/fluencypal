import { MAX_EPUB_FILE_SIZE } from './constants';

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
