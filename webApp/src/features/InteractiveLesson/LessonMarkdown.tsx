'use client';

import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { useTranslate } from '@/features/Translation/useTranslate';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { useSettings } from '@/features/Settings/useSettings';

export const LessonMarkdown = ({ content }: { content: string }) => {
  const translator = useTranslate();
  const settings = useSettings();
  const quizWordAudio = useQuizWordAudio({
    targetLanguage: settings.languageCode || 'en',
  });

  return (
    <>
      <Markdown
        variant="rule"
        onWordClick={(word, element) => {
          void quizWordAudio.playWordAudio(word);
          if (translator.isTranslateAvailable) {
            translator.translateWithModal(word, element);
          }
        }}
      >
        {'\n' + content}
      </Markdown>
      {translator.translateModal}
    </>
  );
};
