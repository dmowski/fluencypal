const BLOCK_MARKDOWN_PATTERNS = [/^#{1,6}\s+\S/u, /^>\s+\S/u, /^[-*+]\s+\S/u, /^\d+\.\s+\S/u];

const BLOCK_MARKDOWN_DIVIDER_PATTERN =
  /^(?:-{3,}|_{3,}|\*{3,}|(?:-\s+){2,}-?|(?:_\s+){2,}_?|(?:\*\s+){2,}\*?)$/u;

export const hasBlockMarkdownFormatting = (paragraphText: string): boolean =>
  BLOCK_MARKDOWN_PATTERNS.some((pattern) => pattern.test(paragraphText)) ||
  BLOCK_MARKDOWN_DIVIDER_PATTERN.test(paragraphText.trim());

export const PARAGRAPH_TEXT_INDENT = 1.5;

export const getReaderParagraphTextIndent = ({
  paragraphText,
  isParagraphStart,
}: {
  paragraphText: string;
  isParagraphStart: boolean;
}): string | number => {
  if (!isParagraphStart || hasBlockMarkdownFormatting(paragraphText)) {
    return 0;
  }

  return `${PARAGRAPH_TEXT_INDENT}rem`;
};
