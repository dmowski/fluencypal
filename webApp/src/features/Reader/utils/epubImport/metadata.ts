import { getElementsByTag, getFirstElementByTag, normalizeText } from './xmlUtils';

const splitTitleAndSubtitle = (title: string): { title: string; subtitle: string } => {
  const delimiters = [' - ', ': ', ' | '];

  for (const delimiter of delimiters) {
    if (!title.includes(delimiter)) continue;
    const [mainTitle, ...rest] = title.split(delimiter);
    const subtitle = rest.join(delimiter).trim();
    if (mainTitle.trim() && subtitle) {
      return {
        title: mainTitle.trim(),
        subtitle,
      };
    }
  }

  return {
    title,
    subtitle: '',
  };
};

export const extractMetadataFromOpf = (
  opfDoc: Document,
): { title: string; subtitle: string; author: string } => {
  const metadataNode = getFirstElementByTag(opfDoc, 'metadata');
  const sourceNode = metadataNode || opfDoc;

  const titleElements = getElementsByTag(sourceNode, 'title');
  const creatorElements = getElementsByTag(sourceNode, 'creator');
  const subtitleElements = getElementsByTag(sourceNode, 'subtitle');
  const metaElements = getElementsByTag(sourceNode, 'meta');

  const mainTitleFromTitleTag = normalizeText(titleElements[0]?.textContent);
  const author = normalizeText(creatorElements[0]?.textContent);

  const subtitleByRefine = (() => {
    for (const meta of metaElements) {
      const property = normalizeText(meta.getAttribute('property'));
      const refines = normalizeText(meta.getAttribute('refines'));
      const value = normalizeText(meta.getAttribute('content') || meta.textContent);
      if (property !== 'title-type' || value.toLowerCase() !== 'subtitle' || !refines) continue;

      const titleId = refines.replace(/^#/, '');
      const refinedTitle = titleElements.find((element) => element.getAttribute('id') === titleId);
      const refinedValue = normalizeText(refinedTitle?.textContent);
      if (refinedValue) return refinedValue;
    }

    return '';
  })();

  const subtitleFromTag = normalizeText(subtitleElements[0]?.textContent);
  const subtitleFromMeta = (() => {
    const matchingMeta = metaElements.find((meta) => {
      const property = normalizeText(meta.getAttribute('property')).toLowerCase();
      const name = normalizeText(meta.getAttribute('name')).toLowerCase();
      return property === 'subtitle' || name === 'subtitle';
    });

    return normalizeText(matchingMeta?.getAttribute('content') || matchingMeta?.textContent);
  })();

  const explicitSubtitle = subtitleByRefine || subtitleFromTag || subtitleFromMeta;
  if (explicitSubtitle) {
    return {
      title: mainTitleFromTitleTag,
      subtitle: explicitSubtitle,
      author,
    };
  }

  const split = splitTitleAndSubtitle(mainTitleFromTitleTag);
  return {
    title: split.title,
    subtitle: split.subtitle,
    author,
  };
};
