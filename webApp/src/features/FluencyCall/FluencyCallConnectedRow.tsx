'use client';

import { useState } from 'react';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import {
  fluencyCallRowTitle,
  formatCallLabel,
  getCallCountdown,
  isHttpUrl,
  viewerTimeZone,
} from './callTime';
import { setFluencyCallRsvp } from './fluencyCallStore';
import { notifyFluencyCallJoin } from './notifyFluencyCallJoin';
import { FluencyCallRowView } from './FluencyCallCardView';
import { FluencyCall } from './types';
import { useFluencyCallRsvps, useFluencyCallUnreadCount } from './useFluencyCalls';

export const FluencyCallConnectedRow = ({
  call,
  now,
  canJoin,
  conductAgreed,
  conductReady,
  onNeedConduct,
  onShowChat,
}: {
  call: FluencyCall;
  now: Date;
  canJoin: boolean;
  conductAgreed: boolean;
  conductReady: boolean;
  onNeedConduct: (callId: string) => void;
  onShowChat: (callId: string) => void;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [isJoinPending, setIsJoinPending] = useState(false);
  const rsvps = useFluencyCallRsvps(call.id);
  const unreadCount = useFluencyCallUnreadCount(call.id);

  const label = formatCallLabel(call.startsAtIso, now, i18n.locale || 'en', viewerTimeZone());
  if (!label) return null;

  const countdown = getCallCountdown(call.startsAtIso, now);
  const isLive = Boolean(countdown?.isLive);
  const canOpenCall = canJoin && isLive && isHttpUrl(call.link);
  const title = fluencyCallRowTitle(label, isLive, {
    today: i18n._('Today'),
    tomorrow: i18n._('Tomorrow'),
    now: i18n._('Now'),
  });

  const commit = async (joining: boolean) => {
    if (!auth.uid || isJoinPending) return;
    setIsJoinPending(true);
    try {
      await setFluencyCallRsvp(call.id, auth.uid, joining);
      if (joining) {
        try {
          await notifyFluencyCallJoin(call, await auth.getToken());
        } catch (error) {
          console.error('Fluency call join notice failed', error);
        }
      }
    } finally {
      setIsJoinPending(false);
    }
  };

  const onToggleJoin = () => {
    if (!canJoin) return;
    if (!conductReady) return;
    if (!rsvps.isJoining && !conductAgreed) {
      onNeedConduct(call.id);
      return;
    }
    void commit(!rsvps.isJoining);
  };

  const onOpenCall = () => {
    if (!canJoin) return;
    if (!conductReady) return;
    if (!rsvps.isJoining && !conductAgreed) {
      onNeedConduct(call.id);
      return;
    }
    if (isHttpUrl(call.link)) {
      window.open(call.link, '_blank', 'noopener,noreferrer');
    }
    if (!rsvps.isJoining) {
      void commit(true);
    }
  };

  return (
    <FluencyCallRowView
      callId={call.id}
      month={label.month}
      day={label.day}
      title={title}
      joinCount={rsvps.joinCount}
      isJoining={rsvps.isJoining}
      isLive={isLive}
      canOpenCall={canOpenCall}
      unreadCount={unreadCount}
      isJoinPending={isJoinPending}
      onToggleJoin={onToggleJoin}
      onShowChat={() => {
        if (!canJoin) return;
        onShowChat(call.id);
      }}
      onOpenCall={onOpenCall}
    />
  );
};
