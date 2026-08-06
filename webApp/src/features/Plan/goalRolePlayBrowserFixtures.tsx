import { Stack } from '@mui/material';
import { type ReactNode } from 'react';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { GoalRolePlayIntroView } from './components/GoalRolePlayIntroView';
import { GoalRolePlayLessonFooterView } from './components/GoalRolePlayLessonFooterView';
import { ConversationType } from '@/features/Conversation/conversation';

export const FIXTURE_ROLE_PLAY_LESSON = {
  title: 'Job interview',
  subTitle: 'Practice answering common questions',
  details: 'You are interviewing for a junior developer role. Answer clearly and stay confident.',
};

export function GoalRolePlayTestShell({
  children,
  testId,
  width = 720,
}: {
  children: ReactNode;
  testId: string;
  width?: number;
}) {
  return (
    <BrowserAppShell>
      <Stack
        data-testid={testId}
        sx={{
          width: `${width}px`,
          maxWidth: '100%',
          bgcolor: '#181818',
          color: 'var(--foreground)',
          p: 3,
          gap: 2,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Stack>
    </BrowserAppShell>
  );
}

export function GoalRolePlayIntroFixture({
  showSkipLesson = false,
  testId = 'goal-role-play-intro-fixture-shell',
}: {
  showSkipLesson?: boolean;
  testId?: string;
}) {
  return (
    <GoalRolePlayTestShell testId={testId}>
      <GoalRolePlayIntroView
        title={FIXTURE_ROLE_PLAY_LESSON.title}
        subTitle={FIXTURE_ROLE_PLAY_LESSON.subTitle}
        details={FIXTURE_ROLE_PLAY_LESSON.details}
        showSkipLesson={showSkipLesson}
        onContinue={() => undefined}
        onSkipLesson={() => undefined}
      />
    </GoalRolePlayTestShell>
  );
}

export function GoalRolePlayLessonFooterFixture({
  currentMode = 'goal-role-play' as ConversationType,
  userMessageCount = 2,
  canFinishLesson = false,
  showSkipLesson = false,
  testId = 'goal-role-play-footer-fixture-shell',
}: {
  currentMode?: ConversationType;
  userMessageCount?: number;
  canFinishLesson?: boolean;
  showSkipLesson?: boolean;
  testId?: string;
}) {
  return (
    <GoalRolePlayTestShell testId={testId}>
      <GoalRolePlayLessonFooterView
        currentMode={currentMode}
        userMessageCount={userMessageCount}
        canFinishLesson={canFinishLesson}
        onFinishLesson={() => undefined}
        showSkipLesson={showSkipLesson}
        onSkipLesson={() => undefined}
      />
    </GoalRolePlayTestShell>
  );
}
