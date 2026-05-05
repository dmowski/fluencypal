export const normalizeEpubFileName = (fileName: string, fallback?: string) => {
  const normalizedName = fileName.trim() || fallback || 'book.epub';

  if (/\.epub\.noimages$/i.test(normalizedName)) {
    return normalizedName.replace(/\.epub\.noimages$/i, '.epub');
  }

  if (/\.epub$/i.test(normalizedName)) {
    return normalizedName;
  }

  if (/\.noimages$/i.test(normalizedName)) {
    return normalizedName.replace(/\.noimages$/i, '.epub');
  }

  return `${normalizedName.replace(/\.+$/g, '')}.epub`;
};

export const getDownloadFileName = (fileName: string) => normalizeEpubFileName(fileName);