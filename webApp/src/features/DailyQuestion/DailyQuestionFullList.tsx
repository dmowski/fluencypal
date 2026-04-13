import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAccess } from '@/features/Usage/useAccess';
import { DailyQuestionFullCard } from './DailyQuestionFullCard';
import { useDailyQuestion } from './useDailyQuestion';

export const DailyQuestionFullList = () => {
  const { i18n } = useLingui();
  const questions = useDailyQuestion();

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        gap: '90px',
      }}
    >
      <DailyQuestionFullCard
        question={questions.todaysQuestion}
        badge={i18n._("Today's Question")}
      />

      <Stack
        sx={{
          gap: '20px',
        }}
      >
        <Stack>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
            }}
          >
            {i18n._('Previous Questions')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {i18n._('Explore past questions and their discussions.')}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: '50px',
          }}
        >
          {questions.otherQuestions.map((question) => {
            return <DailyQuestionFullCard key={question.id} question={question} />;
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
