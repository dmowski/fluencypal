export type DraftQuizOption = {
  label: string;
  isCorrect: boolean;
};

export const normalizeDraftOptions = (
  options: unknown,
  correctOptionLabel?: unknown,
): DraftQuizOption[] | null => {
  if (!Array.isArray(options)) return null;

  const normalizedCorrectLabel =
    typeof correctOptionLabel === 'string' ? correctOptionLabel.trim().toLowerCase() : null;

  const normalized = options
    .map((option): DraftQuizOption | null => {
      if (!option || typeof option !== 'object') return null;
      const raw = option as Record<string, unknown>;
      const label = typeof raw.label === 'string' ? raw.label.trim() : '';
      if (!label) return null;

      if (raw.isCorrect === true) {
        return { label, isCorrect: true };
      }
      if (raw.isCorrect === false) {
        return { label, isCorrect: false };
      }
      if (normalizedCorrectLabel) {
        return { label, isCorrect: label.toLowerCase() === normalizedCorrectLabel };
      }

      return { label, isCorrect: false };
    })
    .filter((option): option is DraftQuizOption => option !== null);

  if (normalized.length < 2) return null;
  return normalized;
};

export const resolveCorrectOptionIdFromDraft = (
  draftOptions: DraftQuizOption[],
  prefix: string,
): { options: { id: string; label: string }[]; correctOptionId: string } | null => {
  const correctIndexes = draftOptions
    .map((option, index) => (option.isCorrect ? index : -1))
    .filter((index) => index >= 0);

  if (correctIndexes.length !== 1) return null;

  const options = draftOptions.map((option, index) => ({
    id: `${prefix}-opt-${index}`,
    label: option.label,
  }));

  return {
    options,
    correctOptionId: options[correctIndexes[0]]?.id ?? '',
  };
};
