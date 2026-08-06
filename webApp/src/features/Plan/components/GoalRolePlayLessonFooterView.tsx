'use client';

import { Button, Stack, Typography } from '@mui/material';
import { Trophy } from 'lucide-react';
import { useLingui } from '@lingui/react';
import {
  GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES,
  isGoalRolePlayConversation,
} from '@/features/Plan/goalRolePlayCompletion';
import { ConversationType } from '@/features/Conversation/conversation';

export function GoalRolePlayLessonFooterView({
  currentMode,
  userMessageCount,
  canFinishLesson,
  onFinishLesson,
  onSkipLesson,
  showSkipLesson,
}: {
  currentMode: ConversationType;
  userMessageCount: number;
  canFinishLesson: boolean;
  onFinishLesson: () => void;
  onSkipLesson?: () => void;
  showSkipLesson?: boolean;
}) {
  const { i18n } = useLingui();
  const isRolePlay = isGoalRolePlayConversation(currentMode);
  const messagesLeft = Math.max(
    0,
    GOAL_ROLE_PLAY_EARLY_FINISH_USER_MESSAGES - userMessageCount,
  );

  return (
    <Stack
      data-testid="goal-role-play-lesson-footer"
      sx={{
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {canFinishLesson ? (
        <Button
          data-testid="goal-role-play-finish-lesson"
          startIcon={<Trophy />}
          size="large"
          color="info"
          variant="contained"
          sx={{
            height: '48px',
            minWidth: '250px',
          }}
          onClick={onFinishLesson}
        >
          {i18n._('Open results')}
        </Button>
      ) : (
        isRolePlay && (
          <Typography
            data-testid="goal-role-play-early-finish-hint"
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', maxWidth: '280px' }}
          >
            {messagesLeft > 0
              ? i18n._('Send {count} more message(s) to finish this role-play early.', {
                  count: messagesLeft,
                })
              : i18n._('You can finish this role-play early now.')}
          </Typography>
        )
      )}

      {showSkipLesson && onSkipLesson && !canFinishLesson && (
        <Button
          data-testid="goal-role-play-skip-lesson"
          variant="text"
          color="inherit"
          size="small"
          sx={{ opacity: 0.75 }}
          onClick={onSkipLesson}
        >
          {i18n._('Skip this lesson')}
        </Button>
      )}
    </Stack>
  );
}
