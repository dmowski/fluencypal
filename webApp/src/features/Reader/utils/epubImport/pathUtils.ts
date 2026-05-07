export const normalizeImageHref = (href: string): string => {
  const [pathOnly] = href.split(/[?#]/, 1);
  const trimmed = decodeURI(pathOnly.trim());
  return trimmed.replace(/^([./]+)+/, '').replace(/\\/g, '/');
};

export const resolveRelativePath = (baseDir: string, href: string): string => {
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
