'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import { useAccess } from '@/features/Usage/useAccess';
import { DailyQuestionFullCard } from './DailyQuestionFullCard';
import { UserDailyQuestion } from './types';
import {
  canDeleteUserDailyQuestion,
  canEditUserDailyQuestion,
  toCommunityDailyQuestion,
} from './userDailyQuestion';
import { deleteUserDailyQuestion, UserDailyQuestionFormModal } from './UserDailyQuestionFormModal';

export const UserDailyQuestionCard = ({
  question,
  badge,
  skipPaywall = false,
}: {
  question: UserDailyQuestion;
  badge?: string;
  skipPaywall?: boolean;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = canDeleteUserDailyQuestion(question, auth.uid, auth.isFounder);
  const canEdit = canEditUserDailyQuestion(auth.isFounder);
  const authorBadge = 'By: ' + game.getUserName(question.authorUserId);

  const onDelete = async () => {
    if (!canDelete || isDeleting) return;
    const confirmed = window.confirm(i18n._('Remove this question?'));
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteUserDailyQuestion(question.id);
    } catch (error) {
      console.error(error);
      alert(i18n._('Could not remove this question. Please try again.'));
      setIsDeleting(false);
    }
  };

  return (
    <Stack sx={{ gap: '10px' }}>
      <DailyQuestionFullCard
        question={toCommunityDailyQuestion(question)}
        badge={badge ? badge + ' · ' + authorBadge : authorBadge}
        skipPaywall={skipPaywall}
      />
      {(canEdit || canDelete) && (
        <Stack sx={{ flexDirection: 'row', gap: '10px' }}>
          {canEdit && (
            <Button variant="text" onClick={() => setIsEditing(true)}>
              {i18n._('Edit')}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="text"
              color="error"
              disabled={isDeleting}
              onClick={() => void onDelete()}
            >
              {i18n._('Remove')}
            </Button>
          )}
        </Stack>
      )}
      {isEditing && (
        <UserDailyQuestionFormModal existing={question} onClose={() => setIsEditing(false)} />
      )}
    </Stack>
  );
};

export const AddMyDailyQuestionButton = ({
  requireMembership = true,
}: {
  requireMembership?: boolean;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const access = useAccess();
  const [isOpen, setIsOpen] = useState(false);
  if (!auth.uid) return null;
  if (requireMembership && (access.communityAccessLoading || !access.canReadCommunity)) return null;

  return (
    <>
      <Button
        variant="outlined"
        data-testid="add-my-daily-question"
        onClick={() => setIsOpen(true)}
        sx={{ width: 'max-content' }}
      >
        {i18n._('Add my question')}
      </Button>
      {isOpen && <UserDailyQuestionFormModal onClose={() => setIsOpen(false)} />}
    </>
  );
};
