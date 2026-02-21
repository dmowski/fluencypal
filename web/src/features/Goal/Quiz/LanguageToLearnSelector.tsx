'use client';
import { Stack, Typography } from '@mui/material';
import { supportedLanguagesToLearn } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { GraduationCap } from 'lucide-react';
import { LangSelectorFullScreen } from '@/features/Lang/LangSelector';
import { useQuiz } from './useQuiz';
import { NextStepButton } from './NextStepButton';

export const LanguageToLearnSelector = () => {
  const { i18n } = useLingui();
  const { languageToLearn, setLanguageToLearn } = useQuiz();
  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <GraduationCap size={'30px'} />
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: '1.1rem',
            boxSizing: 'border-box',
            lineHeight: '1.1',
          }}
        >
          {i18n._(`I want to learn...`)}
        </Typography>
      </Stack>

      <LangSelectorFullScreen
        value={languageToLearn}
        availableList={supportedLanguagesToLearn}
        onChange={(lang) => setLanguageToLearn(lang)}
      />
      <NextStepButton />
    </Stack>
  );
};
