import { QuizOption, WordTranslationDirection } from '../types';

const normalizeLabel = (value: string): string => value.trim().toLowerCase();

export const isValidWordTranslationQuestion = ({
  promptText,
  options,
}: {
  promptText: string;
  direction: WordTranslationDirection;
  options: QuizOption[];
}): boolean => {
  const normalizedPrompt = normalizeLabel(promptText);
  if (!normalizedPrompt) return false;

  // Reject when the prompt duplicates an option — not a translation task.
  return !options.some((option) => normalizeLabel(option.label) === normalizedPrompt);
};
