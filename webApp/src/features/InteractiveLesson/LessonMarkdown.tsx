'use client';

import { Stack } from '@mui/material';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { useTranslate } from '@/features/Translation/useTranslate';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { useSettings } from '@/features/Settings/useSettings';
import { lessonSx } from './lessonTheme';

export const LessonMarkdown = ({
  content,
  size = 'lesson',
}: {
  content: string;
  size?: 'lesson' | 'feedback';
}) => {
  const translator = useTranslate();
  const settings = useSettings();
  const quizWordAudio = useQuizWordAudio({
    targetLanguage: settings.languageCode || 'en',
  });

  return (
    <>
      <Stack
        sx={size === 'feedback' ? lessonSx.feedbackMarkdown : undefined}
      >
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
      </Stack>
      {translator.translateModal}
    </>
  );
};
