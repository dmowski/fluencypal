'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { InfoStep } from '@/features/Survey/InfoStep';
import { SkipForward } from 'lucide-react';

export function GoalRolePlayIntroView({
  title,
  subTitle,
  details,
  showSkipLesson,
  onContinue,
  onSkipLesson,
}: {
  title: string;
  subTitle: string;
  details: string;
  showSkipLesson: boolean;
  onContinue: () => void;
  onSkipLesson: () => void;
}) {
  const { i18n } = useLingui();

  return (
    <Stack data-testid="goal-role-play-intro-fixture">
      <InfoStep
        title={title}
        subTitle={subTitle}
        subComponent={
          <Stack sx={{ gap: '10px', marginTop: '10px' }}>
            <Typography>{details}</Typography>
            {showSkipLesson && (
              <Typography
                data-testid="goal-role-play-skip-intro-hint"
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {i18n._(
                  'Stuck on this role-play? You can skip it and move to the next lesson.',
                )}
              </Typography>
            )}
          </Stack>
        }
        onClick={onContinue}
        secondButtonTitle={showSkipLesson ? i18n._('Skip this lesson') : undefined}
        onSecondButtonClick={showSkipLesson ? onSkipLesson : undefined}
        secondButtonStartIcon={showSkipLesson ? <SkipForward size={18} /> : undefined}
      />
    </Stack>
  );
}
