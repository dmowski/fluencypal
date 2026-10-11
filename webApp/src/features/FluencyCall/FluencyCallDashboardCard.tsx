'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { ChatProvider, useChat } from '@/features/Chat/useChat';
import { useUrlState } from '@/features/Url/useUrlState';
import { selectListedCalls } from './callTime';
import { ensureFluencyCallCommunityChat, FLUENCY_CALL_COMMUNITY_SPACE_ID } from './fluencyCallChat';
import { FLUENCY_CALL_WELCOME_VIDEO_SRC, FluencyCallCardView } from './FluencyCallCardView';
import { useFluencyCallAccess } from './useFluencyCallAccess';
import { useFluencyCallRequest, useFluencyCalls } from './useFluencyCalls';
import { useNow } from './useNow';

const communityChatMetadata = {
  spaceId: FLUENCY_CALL_COMMUNITY_SPACE_ID,
  allowedUserIds: null,
  isPrivate: false as const,
  type: 'fluencyCall' as const,
};

export const FluencyCallDashboardCard = () => {
  const auth = useAuth();
  const now = useNow(15_000);
  const { calls, loading } = useFluencyCalls();
  const { loading: requestLoading } = useFluencyCallRequest();
  const access = useFluencyCallAccess();
  const searchParams = useSearchParams();
  const [callChatId] = useUrlState('callChatId', '', false);
  const listed = selectListedCalls(calls, now);

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
    <ChatProvider metadata={communityChatMetadata}>
      <FluencyCallDashboardBody
        paidNotice={searchParams.get('fluencyCall') === 'paid'}
        initialChatExpanded={Boolean(callChatId)}
      />
    </ChatProvider>
  );
};

const FluencyCallDashboardBody = ({
  paidNotice,
  initialChatExpanded,
}: {
  paidNotice: boolean;
  initialChatExpanded: boolean;
}) => {
  const auth = useAuth();
  const chat = useChat();

  useEffect(() => {
    if (!auth.uid) return;
    void ensureFluencyCallCommunityChat(auth.uid);
  }, [auth.uid]);

  const messages = [...chat.topLevelMessages]
    .filter(
      (message) =>
        !message.isDeleted &&
        (message.content.trim().length > 0 || (message.attachments?.length ?? 0) > 0),
    )
    .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));

  return (
    <FluencyCallCardView
      messages={messages}
      onSendMessage={async (text) => {
        await chat.addMessage({
          messageContent: text,
          parentMessageId: '',
          attachments: [],
        });
      }}
      canJoin
      paidNotice={paidNotice}
      initialChatExpanded={initialChatExpanded}
      welcomeVideoSrc={FLUENCY_CALL_WELCOME_VIDEO_SRC}
    />
  );
};
