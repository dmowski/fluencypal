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

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const stories = useStories();

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

      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal('')} />
      )}
      <ReportModal />
      <TeacherVoiceModal />
    </>
  );
};
