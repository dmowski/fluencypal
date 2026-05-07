export const parseXml = (xml: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'application/xml');
};

export const serializeNode = (node: Node): string => new XMLSerializer().serializeToString(node);

export const getFirstElementByTag = (root: Document | Element, tag: string): Element | null => {
  const withNs = root.getElementsByTagNameNS('*', tag)[0] || null;
  if (withNs) return withNs;
  return root.getElementsByTagName(tag)[0] || null;
};

export const getElementsByTag = (root: Document | Element, tag: string): Element[] => {
  const withNs = Array.from(root.getElementsByTagNameNS('*', tag));
  if (withNs.length > 0) return withNs;
  return Array.from(root.getElementsByTagName(tag));
};

export const getHrefAttribute = (element: Element): string => {
  const href = element.getAttribute('href') || element.getAttribute('xlink:href') || '';
  if (href.trim()) {
    return href.trim();
  }

  const hrefNs = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href') || '';
  return hrefNs.trim();
};

export const normalizeText = (value: string | null | undefined): string =>
  (value || '').replace(/\s+/g, ' ').trim();
