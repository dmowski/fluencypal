'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { useGlobalModals } from '@/features/Modal/useGlobalModals';
import { FLUENCY_CALL_WELCOME_VIDEO_SRC, FluencyCallCardView } from './FluencyCallCardView';
import { useFluencyCallAccess } from './useFluencyCallAccess';
import { useFluencyCallRequest, useFluencyCalls } from './useFluencyCalls';
import { selectListedCalls } from './callTime';
import { useNow } from './useNow';

export const FluencyCallDashboardCard = () => {
  const auth = useAuth();
  const now = useNow(15_000);
  const { calls, loading } = useFluencyCalls();
  const { loading: requestLoading } = useFluencyCallRequest();
  const access = useFluencyCallAccess();
  const searchParams = useSearchParams();
  const modals = useGlobalModals();
  const listed = selectListedCalls(calls, now);
  const callChatId = searchParams.get('callChatId');

  useEffect(() => {
    if (callChatId) modals.openVoiceChat();
  }, [callChatId]);

  if (
    !auth.uid ||
    loading ||
    !access.ready ||
    !access.canJoin ||
    (listed.length === 0 && requestLoading)
  ) {
    return null;
  }

  return (
    <FluencyCallCardView
      canJoin
      paidNotice={searchParams.get('fluencyCall') === 'paid'}
      welcomeVideoSrc={FLUENCY_CALL_WELCOME_VIDEO_SRC}
      onOpenVoiceChat={modals.openVoiceChat}
    />
  );
};
