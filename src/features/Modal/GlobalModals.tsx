'use client';

import { useMemo } from 'react';
import { useGame } from '../Game/useGame';
import { UserProfileModal } from '../Game/UserProfileModal';
import { useUsage } from '../Usage/useUsage';
import { SubscriptionPaymentModal } from '../Usage/SubscriptionPaymentModal';
import { useAuth } from '../Auth/useAuth';
import { TeacherVoiceModal } from './TeacherVoiceModal';
import { HoursPaymentModal } from '../Usage/HoursPaymentModal/HoursPaymentModal';

const isUsePerHourModal = true; // TODO: remove when per hour modal will be fully implemented

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId, auth.uid, game.isLoading]);

  return (
    <>
      {usage.isShowPaymentModal && isUsePerHourModal && <HoursPaymentModal />}
      {usage.isShowPaymentModal && !isUsePerHourModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal('')} />
      )}
      <TeacherVoiceModal />
    </>
  );
};
