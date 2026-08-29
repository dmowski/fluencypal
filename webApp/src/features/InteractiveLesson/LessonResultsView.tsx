'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { NewsContentWithParagraphs } from '@/features/News/NewsContentWithParagraphs';
import { ThinkingProgress } from './ThinkingProgress';
import { LessonResults } from './types';

export const LessonResultsView = ({
  results,
  languageCode,
  isGeneratingResults,
  isGeneratingNext,
  onNextLesson,
  onFinish,
}: {
  results: LessonResults | null;
  languageCode: SupportedLanguage;
  isGeneratingResults: boolean;
  isGeneratingNext: boolean;
  onNextLesson: () => void;
  onFinish: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '16px', width: '100%' }} data-testid="interactive-lesson-results">
      {isGeneratingResults && !results && <ThinkingProgress />}

      {results && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {i18n._('Your results')}
          </Typography>
          <NewsContentWithParagraphs
            content={results.motivationTextToUserMD}
            languageCode={languageCode}
          />
          <NewsContentWithParagraphs content={results.whatWentWellMD} languageCode={languageCode} />
          <Stack sx={{ flexDirection: 'row', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="info"
              onClick={onNextLesson}
              data-testid="interactive-lesson-next"
              sx={{ padding: '10px 24px' }}
            >
              {isGeneratingNext ? i18n._('Preparing next lesson...') : i18n._('Next lesson')}
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={onFinish}
              data-testid="interactive-lesson-finish"
              sx={{ padding: '10px 24px' }}
            >
              {i18n._('Finish')}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
};
