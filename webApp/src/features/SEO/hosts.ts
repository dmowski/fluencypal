export const isBookHost = (host: string | null): boolean => {
  if (!host) return false;
  return host.split(':')[0].toLowerCase().startsWith('book.');
};
