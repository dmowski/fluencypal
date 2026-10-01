'use client';

import { useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useAccess } from '@/features/Usage/useAccess';
import { useUrlState } from '@/features/Url/useUrlState';
import { formatCallStartLabel, getCallCountdown, isHttpUrl, splitLocalDateTime } from './callTime';
import { ensureFluencyCallChat, fluencyCallChatSpaceId } from './fluencyCallChat';
import { setFluencyCallRsvp } from './fluencyCallStore';
import { FluencyCallCardView } from './FluencyCallCardView';
import { FluencyCallChatModal } from './FluencyCallChatModal';
import { FluencyCallEmptyCard } from './FluencyCallEmptyCard';
import { FluencyCallRequestModal } from './FluencyCallRequestModal';
import {
  isPendingCallRequest,
  useFluencyCallRequest,
  useFluencyCallRsvps,
  useFluencyCallUnreadCount,
  useVisibleFluencyCall,
} from './useFluencyCalls';
import { useNow } from './useNow';

export const FluencyCallDashboardCard = () => {
  const auth = useAuth();
  const access = useAccess();
  const now = useNow(1_000);
  const { call, loading } = useVisibleFluencyCall(now);
  const { request, loading: requestLoading } = useFluencyCallRequest();
  const rsvps = useFluencyCallRsvps(call?.id ?? null);
  const unreadCount = useFluencyCallUnreadCount(call?.id ?? null);
  const [callChatId, setCallChatId] = useUrlState('callChatId', '', false);
  const [isJoinPending, setIsJoinPending] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  if (!auth.uid || loading || requestLoading) {
    return null;
  }

  const isMember = access.canReadCommunity;
  const membershipReady = !access.communityAccessLoading;

  if (!call) {
    const pendingRequest = isPendingCallRequest(request) ? request : null;
    const requestedSlot = pendingRequest ? splitLocalDateTime(pendingRequest.startsAtIso) : null;
    return (
      <>
        {isRequestOpen ? (
          <FluencyCallRequestModal
            initialDate={requestedSlot?.date}
            initialTime={requestedSlot?.time}
            onClose={() => setIsRequestOpen(false)}
          />
        ) : null}
        <FluencyCallEmptyCard
          isMember={isMember}
          membershipReady={membershipReady}
          requestedAtLabel={
            pendingRequest ? formatCallStartLabel(pendingRequest.startsAtIso) : null
          }
          onInitiateCall={() => setIsRequestOpen(true)}
          onJoinMembership={() => access.showPaymentModal()}
        />
      </>
    );
  }

  const countdown = getCallCountdown(call.startsAtIso, now);
  if (!countdown) {
    return null;
  }

  const onToggleJoin = async () => {
    if (!isMember || isJoinPending) return;
    setIsJoinPending(true);
    try {
      await setFluencyCallRsvp(call.id, auth.uid, !rsvps.isJoining);
    } finally {
      setIsJoinPending(false);
    }
  };

  const chatSpaceId = fluencyCallChatSpaceId(call.id);
  const isChatOpen = isMember && callChatId === chatSpaceId;

  const onShowChat = async () => {
    if (!isMember) return;
    await ensureFluencyCallChat(auth.uid, call.id);
    await setCallChatId(chatSpaceId);
  };

  return (
    <>
      {isChatOpen ? (
        <FluencyCallChatModal
          callId={call.id}
          startsAtLabel={formatCallStartLabel(call.startsAtIso)}
          onClose={() => {
            void setCallChatId('');
          }}
        />
      ) : null}
      <FluencyCallCardView
        startsAtLabel={formatCallStartLabel(call.startsAtIso)}
        countdown={countdown}
        isMember={isMember}
        membershipReady={membershipReady}
        isJoining={rsvps.isJoining}
        joinCount={rsvps.joinCount}
        canOpenCall={isMember && countdown.isLive && isHttpUrl(call.link)}
        isJoinPending={isJoinPending}
        onToggleJoin={() => {
          void onToggleJoin();
        }}
        unreadCount={unreadCount}
        onShowChat={() => {
          void onShowChat();
        }}
        onJoinMembership={() => access.showPaymentModal()}
        onOpenCall={() => {
          if (!isHttpUrl(call.link)) return;
          window.open(call.link, '_blank', 'noopener,noreferrer');
        }}
      />
    </>
  );
};
