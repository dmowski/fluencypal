export function toMusicProxyUrl(url: string): string {
  if (!url.startsWith('https://')) {
    return url;
  }

  return `/api/proxyMedia?url=${encodeURIComponent(url)}`;
}
