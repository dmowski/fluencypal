/** True when the URL points at our Firebase / GCS bucket (not a third-party host). */
export const isHostedNewsImageUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    if (hostname === 'storage.googleapis.com') return true;
    if (hostname === 'firebasestorage.googleapis.com') return true;
    if (hostname.endsWith('.firebasestorage.app')) return true;
    // Firebase storage emulator (dev only).
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
};

export const needsNewsImageUpload = (item: {
  imageUrl: string;
  sourceImageUrl: string;
}): boolean => !!item.sourceImageUrl && !isHostedNewsImageUrl(item.imageUrl);
