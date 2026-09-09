'use client';

import { useEffect, useRef } from 'react';
import { useLingui } from '@lingui/react';
import { AuthWall } from '@/features/Auth/AuthWall';
import { useAuth } from '@/features/Auth/useAuth';
import { QuizRecordAboutPrompt } from './QuizRecordAboutPrompt';

const AdvanceWhenSignedIn = ({ onAdvance }: { onAdvance: () => void }) => {
  const auth = useAuth();
  const didAdvance = useRef(false);

  useEffect(() => {
    if (didAdvance.current || auth.loading || !auth.uid) {
      return;
    }
    didAdvance.current = true;
    onAdvance();
  }, [auth.loading, auth.uid, onAdvance]);

  return null;
};

export const QuizBeforeRecordAboutGate = ({
  promptText,
  onSignedIn,
}: {
  promptText: string;
  onSignedIn: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <AuthWall
      startOnAuth
      authListAfterActions
      signInTitle={i18n._('Tell me about yourself')}
      singInSubTitle={i18n._(
        `Let's talk a little about you. This will help me to create a practice plan. Why do you want to practice speaking?`,
      )}
      authActionTitle={i18n._('Continue to talk')}
      authSubComponent={<QuizRecordAboutPrompt text={promptText} />}
    >
      <AdvanceWhenSignedIn onAdvance={onSignedIn} />
    </AuthWall>
  );
};
