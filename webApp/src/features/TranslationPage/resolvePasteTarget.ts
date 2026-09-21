import { NativeLangCode } from '@/libs/language/type';

export const resolvePasteTargetLanguage = ({
  focusedLanguage,
  hoveredLanguage,
  languages,
}: {
  focusedLanguage: NativeLangCode | null;
  hoveredLanguage: NativeLangCode | null;
  languages: NativeLangCode[];
}): NativeLangCode | null => {
  if (focusedLanguage && languages.includes(focusedLanguage)) {
    return focusedLanguage;
  }
  if (hoveredLanguage && languages.includes(hoveredLanguage)) {
    return hoveredLanguage;
  }
  return languages[0] || null;
};

export const shouldInterceptDocumentPaste = (eventTarget: EventTarget | null): boolean => {
  if (!(eventTarget instanceof Element)) {
    return true;
  }

  return !eventTarget.closest('input, textarea, select, [contenteditable="true"]');
};
