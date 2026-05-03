export const normalizeSelectedText = (text: string | null | undefined): string =>
  text?.trim() ?? '';
