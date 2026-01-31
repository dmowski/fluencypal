'use client';

import { useMemo } from 'react';
import { useGame } from '../Game/useGame';
import { UserProfileModal } from '../Game/UserProfileModal';
import { useUsage } from '../Usage/useUsage';
import { SubscriptionPaymentModal } from '../Usage/SubscriptionPaymentModal';
import { useAuth } from '../Auth/useAuth';
import { useTeacherSettings } from '../Conversation/CallMode/useTeacherSettings';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SelectTeacher } from '../Conversation/CallMode/SelectTeacher';
import { useSettings } from '../Settings/useSettings';
import { Check } from 'lucide-react';
import { TeacherVoiceModal } from './TeacherVoiceModal';

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();

  const teacherSettings = useTeacherSettings();

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId, auth.uid, game.isLoading]);

  return (
    <>
      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal('')} />
      )}
      <TeacherVoiceModal />
    </>
  );
};
