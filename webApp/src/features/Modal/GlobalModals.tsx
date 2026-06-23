'use client';

import { useMemo } from 'react';
import { useGame } from '@/features/Game/useGame';
import { UserProfileModal } from '@/features/Game/UserProfileModal';
import { useUsage } from '@/features/Usage/useUsage';
import { SubscriptionPaymentModal } from '@/features/Usage/Subscription/SubscriptionPaymentModal';
import { useAuth } from '@/features/Auth/useAuth';
import { TeacherVoiceModal } from './TeacherVoiceModal';
import { ReportModal } from '@/features/User/ReportModal';
import { useStories } from '@/features/Sentence/useStories';
import { StoriesModal } from '@/features/Sentence/StoriesModal';
import { useBattle } from '@/features/Game/Battle/useBattle';
import { BattleActionModal } from '@/features/Game/Battle/BattleActionModal';
import { PublicChatModal } from '@/features/Chat/PublicChatModal';
import { useGlobalModals } from './useGlobalModals';
import { DailyQuestionModal } from '@/features/DailyQuestion/DailyQuestionModal';
import { GrammarImprovementModal } from '@/features/Dashboard/Grammar/GrammarImprovementModal';
import { ProgressStatModal } from '@/features/ProgressStat/ProgressStatModal';
import { EssayModal } from '../Essay/EssayModal';
import { QuizModal } from '@/features/Quiz/components/QuizModal';
import { useAiConversation } from '../Conversation/useAiConversation/useAiConversation';

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const stories = useStories();
  const battles = useBattle();
  const globalModals = useGlobalModals();
  const conversation = useAiConversation();
  const isActiveConversation = conversation.isStarted || !!conversation.isInitializing;

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId, auth.uid, game.isLoading]);

  if (!auth.uid) {
    return <></>;
  }

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
      {globalModals.isShowDailyQuestions && (
        <DailyQuestionModal onClose={globalModals.closeAllModels} />
      )}

      {battles.activeBattle && (
        <BattleActionModal battle={battles.activeBattle} onClose={battles.closeActiveBattle} />
      )}

      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal('')} />
      )}

      {globalModals.isShowProgressStatModal && (
        <ProgressStatModal onClose={globalModals.closeAllModels} />
      )}

      {globalModals.isShowEssay && <EssayModal onClose={globalModals.closeAllModels} />}

      <ReportModal />
      <TeacherVoiceModal />

      {!isActiveConversation && (
        <>
          <GrammarImprovementModal />
          <QuizModal />
        </>
      )}
    </>
  );
};
