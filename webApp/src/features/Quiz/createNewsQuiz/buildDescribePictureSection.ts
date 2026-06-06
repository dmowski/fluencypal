import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { NewsQuizDraft } from './newsQuizSchema';

export const buildDescribePictureSection = (input: {
  imageDescription: string;
  targetLanguageCode: SupportedLanguage;
}): NewsQuizDraft['sections'][number] => {
  const targetLanguageName =
    fullLanguageName[input.targetLanguageCode] || input.targetLanguageCode;

  return {
    type: 'describe-picture-voice',
    title: 'Speaking',
    instructions: 'Look at the image and record your description in the target language.',
    questions: [
      {
        promptText: `Describe what you see in this image in ${targetLanguageName}. Mention the main subjects and what is happening.`,
        minWords: 10,
        maxWords: 120,
        evaluation: {
          instruction: `Grade the spoken description against what is actually visible in the image.

Ground truth (vision analysis):
${input.imageDescription}

Accept paraphrasing and minor grammar mistakes when the learner correctly identifies the main subjects, setting, and actions. Mark partial when only some elements are mentioned. Mark incorrect when the description contradicts the image or is unrelated.

Write the learner-facing Feedback in ${targetLanguageName} (${input.targetLanguageCode}).`,
          maxScore: 1,
        },
      },
    ],
  };
};

export const mergeDescribePictureSection = (
  draft: NewsQuizDraft,
  pictureSection: NewsQuizDraft['sections'][number],
): NewsQuizDraft => ({
  ...draft,
  sections: [
    ...draft.sections.filter((section) => section.type !== 'describe-picture-voice'),
    pictureSection,
  ],
});
