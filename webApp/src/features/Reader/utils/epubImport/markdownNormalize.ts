export const normalizeMarkdownInlineLinks = (markdown: string): string => {
  const normalizeImageTitleToken = (rawTitle: string | undefined): string => {
    if (!rawTitle) return '';

    const decoded = rawTitle.replace(/&quot;/g, '"').trim();
    const titleMatch = decoded.match(/^(["'])([\s\S]*)\1$/);
    const titleValue = titleMatch ? titleMatch[2].trim() : decoded;
    if (!titleValue) return '';

    return `"${titleValue.replace(/"/g, '&quot;')}"`;
  };

  const splitEmbeddedEncodedTitleFromHref = (
    href: string,
  ): { normalizedHref: string; encodedTitle: string } => {
    const embeddedTitleMatch = href.match(/^(.*?)(?:&quot;)([^&]+)(?:&quot;)$/i);
    if (!embeddedTitleMatch) {
      return {
        normalizedHref: href,
        encodedTitle: '',
      };
    }

    return {
      normalizedHref: embeddedTitleMatch[1].trim(),
      encodedTitle: `"${embeddedTitleMatch[2].trim()}"`,
    };
  };

  const normalizedImageLinks = markdown.replace(
    /!\[([^\]]*)\]\s*\((\S+)(?:\s+("[^"]*"|'[^']*'|&quot;[^&]+&quot;))?\)/g,
    (_, alt: string, href: string, title: string | undefined) => {
      const normalizedAlt = alt.replace(/\s+/g, ' ').trim();
      const compactHref = href.replace(/\s+/g, '');
      const split = splitEmbeddedEncodedTitleFromHref(compactHref);
      const normalizedHref = split.normalizedHref;
      const normalizedTitle =
        normalizeImageTitleToken(title) || normalizeImageTitleToken(split.encodedTitle);

      if (!normalizedHref) {
        return `![${normalizedAlt}]()`;
      }

      return normalizedTitle
        ? `![${normalizedAlt}](${normalizedHref} ${normalizedTitle})`
        : `![${normalizedAlt}](${normalizedHref})`;
    },
  );

  return normalizedImageLinks.replace(
    /(^|[^!])\[([^\]]+)\]\s*\(([^)]+)\)/g,
    (_, prefix: string, label: string, href: string) => {
      const normalizedLabel = label.replace(/\s+/g, ' ').trim();
      const normalizedHref = href.replace(/\s+/g, '');
      return `${prefix}[${normalizedLabel}](${normalizedHref})`;
    },
  );
};

export const normalizeBrokenUnderscoreEmphasis = (markdown: string): string => {
  // Some EPUB conversions emit comma-separated italics as `_part1,_ part2_, part3_`.
  // Collapse those into one valid markdown emphasis span.
  return markdown.replace(
    /_([^_\n]+),_\s+([^_\n]+)_,\s+([^_\n]+)_/g,
    (_, part1: string, part2: string, part3: string) => `_${part1}, ${part2}, ${part3}_`,
  );
};

export const normalizeSetextHeadings = (markdown: string): string => {
  // Convert setext-style headings (`Title\n-----`) to ATX headings so downstream
  // markdown renderers that do not support setext still display semantic headings.
  const lines = markdown.split('\n');
  const normalized: string[] = [];

  const isHeadingUnderline = (line: string): 1 | 2 | null => {
    const trimmed = line.trim();
    if (!trimmed || !/^[=-]{3,}$/.test(trimmed)) {
      return null;
    }

    return trimmed[0] === '=' ? 1 : 2;
  };

  const canPromoteToHeading = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (/^#{1,6}\s/.test(trimmed)) return false;
    if (/^(?:[-*+]\s|\d+\.\s)/.test(trimmed)) return false;
    if (/^>\s/.test(trimmed)) return false;
    if (/^```/.test(trimmed)) return false;
    return true;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = lines[i + 1];
    const headingLevel = next ? isHeadingUnderline(next) : null;

    if (headingLevel && canPromoteToHeading(current)) {
      normalized.push(`${'#'.repeat(headingLevel)} ${current.trim()}`);
      i += 1;
      continue;
    }

    normalized.push(current);
  }

  return normalized.join('\n');
};

export const normalizeStandaloneEqualsSeparators = (markdown: string): string => {
  const lines = markdown.split('\n');
  const normalized: string[] = [];
  let isInFencedCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      isInFencedCodeBlock = !isInFencedCodeBlock;
      normalized.push(line);
      continue;
    }

    if (!isInFencedCodeBlock && /^={3,}$/.test(trimmed)) {
      normalized.push('---');
      continue;
    }

    normalized.push(line);
  }

  return normalized.join('\n');
};

export const normalizeBlockquoteSpacerLines = (markdown: string): string => {
  const normalized: string[] = [];
  let isInFencedCodeBlock = false;

  for (const line of markdown.split('\n')) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      isInFencedCodeBlock = !isInFencedCodeBlock;
      normalized.push(line);
      continue;
    }

    // EPUB conversions sometimes emit quote-only spacer lines (`>`),
    // which later surface as visible `>` artifacts after pagination splitting.
    if (!isInFencedCodeBlock && /^>\s*$/.test(trimmed)) {
      continue;
    }

    normalized.push(line);
  }

  return normalized.join('\n');
};

export const normalizeEpubNoterefLinks = (markdown: string): string => {
  // EPUB footnote anchors produce two kinds of markdown links after Turndown:
  //
  // 1. Inline noteref (epub:type="noteref", in main text):
  //      <a href="#_footnote_d1-abc" title="footnote">[*]</a>
  //    → [\[\*\]](#_footnote_d1-abc "footnote")
  //    (Turndown escapes the `[*]` label to `\[\*\]`)
  //
  // 2. Backlink (in the notes section, points back to inline cite):
  //      <a href="#_footnote_referrer_d1-abc" title="footnote reference">*</a>
  //    → [\*](#_footnote_referrer_d1-abc "footnote reference")
  //
  // Both are internal fragment links that are not navigable in our reader and
  // produce raw markdown artefacts in the rendered text. Strip both entirely.
  //
  // The href discriminator `_footnote_` covers both `#_footnote_<id>` and
  // `#_footnote_referrer_<id>`. Non-greedy `.*?` on the label handles the
  // escaped-bracket form `\[\*\]` via backtracking as well as plain `\*`.
  return markdown.replace(/\[.*?\]\(#[^)]*_footnote_[^)]*\)/g, '');
};

export const normalizeThematicBreaks = (markdown: string): string => {
  const lines = markdown.split('\n');
  const normalized: string[] = [];
  let isInFencedCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      isInFencedCodeBlock = !isInFencedCodeBlock;
      normalized.push(line);
      continue;
    }

    if (
      !isInFencedCodeBlock &&
      /^(?:-{3,}|_{3,}|\*{3,}|(?:-\s+){2,}-?|(?:_\s+){2,}_?|(?:\*\s+){2,}\*?)$/.test(trimmed)
    ) {
      normalized.push('---');
      continue;
    }

    normalized.push(line);
  }

  return normalized.join('\n');
};
