'use client';

import { useMemo } from 'react';
import { useGame } from '../Game/useGame';
import { UserProfileModal } from '../Game/UserProfileModal';
import { useUsage } from '../Usage/useUsage';
import { SubscriptionPaymentModal } from '../Usage/Subscription/SubscriptionPaymentModal';
import { useAuth } from '../Auth/useAuth';
import { TeacherVoiceModal } from './TeacherVoiceModal';
import { ReportModal } from '../User/ReportModal';
import { useStories } from '../Sentence/useStories';
import { StoriesModal } from '../Sentence/StoriesModal';
import { useBattle } from '../Game/Battle/useBattle';
import { BattleActionModal } from '../Game/Battle/BattleActionModal';
import { PublicChatModal } from '../Chat/PublicChatModal';
import { useGlobalModals } from './useGlobalModals';

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const stories = useStories();
  const battles = useBattle();
  const globalModals = useGlobalModals();

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId, auth.uid, game.isLoading]);

  return (
    <>
      {stories.selectedStory && (
        <StoriesModal
          data={stories.selectedStory}
          onClose={stories.closeStory}
          onNext={stories.openNextStory}
          onPrev={stories.onPrevStory}
        />
      )}

      {globalModals.isShowPublicChat && <PublicChatModal onClose={globalModals.closeAllModels} />}

      {battles.activeBattle && (
        <BattleActionModal battle={battles.activeBattle} onClose={battles.closeActiveBattle} />
      )}

      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal('')} />
      )}
      <ReportModal />
      <TeacherVoiceModal />
    </>
  );
};
