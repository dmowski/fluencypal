'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { useAccess } from '@/features/Usage/useAccess';
import { useGlobalModals } from '@/features/Modal/useGlobalModals';
import {
  decideVoiceChatMembership,
  fetchVoiceChatStatus,
  requestVoiceChatAccess,
} from './api/voiceChatClient';
import { VoiceChatDashboardView } from './components/VoiceChatDashboardView';
import {
  VOICE_CHAT_PREVIEW_IMAGE_URL,
  VoiceChatDecision,
  VoiceChatStatusResponse,
} from './types';

export const VoiceChatDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const access = useAccess();
  const globalModals = useGlobalModals();
  const [status, setStatus] = useState<VoiceChatStatusResponse | null>(null);
  const [error, setError] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showIntroRecorder, setShowIntroRecorder] = useState(false);
  const [busyUserId, setBusyUserId] = useState('');

  const refresh = useCallback(async () => {
    if (!auth.uid) return;
    try {
      const token = await auth.getToken();
      const next = await fetchVoiceChatStatus(token);
      setStatus(next);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : i18n._('Failed to load voice chat status'));
    }
  }, [auth, i18n]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!auth.uid) {
    return null;
  }

  const memberStatus = status?.member?.status;
  const daysLeft = (() => {
    if (!status?.reRequestAvailableAtIso) return null;
    const ms = new Date(status.reRequestAvailableAtIso).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  })();

  const onSubmitIntro = async (blob: Blob, durationSec: number) => {
    const token = await auth.getToken();
    await requestVoiceChatAccess({ token, audioBlob: blob, durationSec });
    setShowIntroRecorder(false);
    await refresh();
  };

  const onDecide = async (targetUserId: string, decision: VoiceChatDecision) => {
    setBusyUserId(targetUserId);
    try {
      const token = await auth.getToken();
      await decideVoiceChatMembership({ token, targetUserId, decision });
      await refresh();
    } finally {
      setBusyUserId('');
    }
  };

  return (
    <VoiceChatDashboardView
      rootTestId="voice-chat-dashboard-card"
      previewImageUrl={VOICE_CHAT_PREVIEW_IMAGE_URL}
      unreadCount={status?.unreadCount || 0}
      rulesOpen={rulesOpen}
      onCloseRules={() => setRulesOpen(false)}
      onCardClick={
        memberStatus === 'approved' ? () => globalModals.openVoiceChat() : undefined
      }
      error={error}
      isEntitled={!!status?.isEntitled}
      memberStatus={memberStatus}
      canRequestAccess={!!status?.canRequestAccess}
      reRequestDaysLeft={daysLeft}
      showIntroRecorder={showIntroRecorder}
      onStartMembership={() => access.showPaymentModal()}
      onRecordIntro={() => setShowIntroRecorder(true)}
      onOpenVoiceChat={() => globalModals.openVoiceChat()}
      onSubmitIntro={onSubmitIntro}
      onCancelIntro={() => setShowIntroRecorder(false)}
      onOpenRules={() => setRulesOpen(true)}
      isApprover={status?.isApprover}
      pendingMembers={status?.pendingMembers}
      busyUserId={busyUserId}
      onApproveMember={(userId) => void onDecide(userId, 'approved')}
      onRejectMember={(userId) => void onDecide(userId, 'rejected')}
    />
  );
};
