'use client';

import { useLingui } from '@lingui/react';
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { useAuth } from '@/features/Auth/useAuth';
import { useAccess } from '@/features/Usage/useAccess';
import { useGlobalModals } from '@/features/Modal/useGlobalModals';
import {
  decideVoiceChatMembership,
  fetchPendingIntroAudioBlob,
  fetchVoiceChatStatus,
  requestVoiceChatAccess,
} from './api/voiceChatClient';
import {
  VOICE_CHAT_PREVIEW_IMAGE_URL,
  VoiceChatDecision,
  VoiceChatStatusResponse,
} from './types';
import { VoiceChatRecorderPanel } from './components/VoiceChatRecorderPanel';
import { VoiceChatPlayer } from './components/VoiceChatPlayer';

const ChecklistRow = ({
  title,
  info,
  done,
  action,
}: {
  title: string;
  info: string;
  done: boolean;
  action?: ReactNode;
}) => {
  const { i18n } = useLingui();
  const [open, setOpen] = useState(false);
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: done ? 'rgba(40,120,70,0.35)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <Typography sx={{ flex: 1 }} fontWeight={600}>
        {done ? '✓ ' : ''}
        {title}
      </Typography>
      <IconButton size="small" onClick={() => setOpen(true)} aria-label={i18n._('Info')}>
        <InfoOutlined fontSize="small" sx={{ color: '#fff' }} />
      </IconButton>
      {action}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{info}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{i18n._('Close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export const VoiceChatDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const access = useAccess();
  const globalModals = useGlobalModals();
  const [status, setStatus] = useState<VoiceChatStatusResponse | null>(null);
  const [error, setError] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showIntroRecorder, setShowIntroRecorder] = useState(false);
  const [previewIntroUrl, setPreviewIntroUrl] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState('');

  const refresh = useCallback(async () => {
    if (!auth.uid || !auth.isFounder) return;
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

  if (!auth.isFounder) {
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

  const listenPendingIntro = async (userId: string) => {
    const token = await auth.getToken();
    const blob = await fetchPendingIntroAudioBlob({ token, userId });
    if (previewIntroUrl) URL.revokeObjectURL(previewIntroUrl);
    setPreviewIntroUrl(URL.createObjectURL(blob));
  };

  return (
    <Stack gap="20px" data-testid="voice-chat-dashboard-card">
      <SectionHeader
        title={i18n._('Voice chat with people')}
        subTitle={i18n._('A small, voice-only room. No transcripts.')}
      />
      <Badge
        color="error"
        badgeContent={status?.unreadCount || 0}
        invisible={!status?.unreadCount}
        sx={{ width: '100%', '& .MuiBadge-badge': { right: 16, top: 16 } }}
      >
        <StoreCard
          textColor="#fff"
          backgroundColor="rgba(18, 72, 92, 0.92)"
          previewImageUrl={VOICE_CHAT_PREVIEW_IMAGE_URL}
          title={i18n._('Voice chat with people')}
          subTitle={i18n._('Messages are removed after 4 days')}
          items={[]}
          itemsBackgroundColor="rgba(0,0,0,0.2)"
          itemsViewMode="list"
          onClick={() => {
            if (memberStatus === 'approved') {
              globalModals.openVoiceChat();
            }
          }}
        >
          <Stack gap={1.25} sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.35)' }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <ChecklistRow
              title={i18n._('Become a member')}
              info={i18n._(
                'Voice chat is for paying members (or top-5 game winners). This keeps the room small and respectful.',
              )}
              done={!!status?.isEntitled}
              action={
                !status?.isEntitled ? (
                  <Button size="small" variant="contained" onClick={() => access.showPaymentModal()}>
                    {i18n._('Start')}
                  </Button>
                ) : null
              }
            />

            <ChecklistRow
              title={i18n._('Share a short intro (~3 min)')}
              info={i18n._(
                'Record a short audio about yourself so others know who is joining. About 3 minutes is ideal.',
              )}
              done={memberStatus === 'pending' || memberStatus === 'approved'}
              action={
                status?.canRequestAccess ? (
                  <Button size="small" variant="contained" onClick={() => setShowIntroRecorder(true)}>
                    {i18n._('Record')}
                  </Button>
                ) : null
              }
            />

            <ChecklistRow
              title={i18n._('Wait for approval')}
              info={i18n._(
                'A host reviews your intro before you can listen and reply. This protects the group.',
              )}
              done={memberStatus === 'approved'}
            />

            {memberStatus === 'pending' && (
              <Typography variant="body2">
                {i18n._('Thanks — we’re reviewing your intro')}
              </Typography>
            )}
            {memberStatus === 'rejected' && (
              <Typography variant="body2">
                {i18n._('Not this time. You can try again in {days} days', {
                  days: daysLeft ?? 10,
                })}
              </Typography>
            )}
            {memberStatus === 'approved' && (
              <Button variant="contained" onClick={() => globalModals.openVoiceChat()}>
                {i18n._('Open Voice Chat')}
              </Button>
            )}

            {showIntroRecorder && (
              <VoiceChatRecorderPanel
                title={i18n._('Record your intro')}
                submitLabel={i18n._('Send for approval')}
                minSeconds={5}
                onSubmit={onSubmitIntro}
                onCancel={() => setShowIntroRecorder(false)}
              />
            )}

            <Button variant="text" sx={{ color: '#fff' }} onClick={() => setRulesOpen(true)}>
              {i18n._('Rules of chat')}
            </Button>

            {status?.isApprover && !!status.pendingMembers.length && (
              <Stack gap={1} data-testid="voice-chat-pending-list">
                <Typography fontWeight={700}>{i18n._('Pending requests')}</Typography>
                {status.pendingMembers.map((member) => (
                  <Stack
                    key={member.userId}
                    gap={1}
                    sx={{ p: 1, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)' }}
                  >
                    <Typography variant="body2">{member.userId}</Typography>
                    <Typography variant="caption">
                      Intro ~{member.introDurationSec}s · {member.requestedAtIso}
                    </Typography>
                    <Stack direction="row" gap={1}>
                      <Button size="small" onClick={() => void listenPendingIntro(member.userId)}>
                        {i18n._('Listen intro')}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={busyUserId === member.userId}
                        onClick={() => void onDecide(member.userId, 'approved')}
                      >
                        {i18n._('Approve')}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={busyUserId === member.userId}
                        onClick={() => void onDecide(member.userId, 'rejected')}
                      >
                        {i18n._('Reject')}
                      </Button>
                    </Stack>
                  </Stack>
                ))}
                {previewIntroUrl && (
                  <VoiceChatPlayer audioUrl={previewIntroUrl} label={i18n._('Pending intro')} />
                )}
              </Stack>
            )}
          </Stack>
        </StoreCard>
      </Badge>

      <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)}>
        <DialogTitle>{i18n._('Rules of chat')}</DialogTitle>
        <DialogContent>
          <Stack gap={1}>
            <Typography>{i18n._('Be kind. This is a small voice-only space.')}</Typography>
            <Typography>{i18n._('No text messages and no transcripts.')}</Typography>
            <Typography>{i18n._('Messages are removed after 4 days.')}</Typography>
            <Typography>{i18n._('You can remove your own messages anytime.')}</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesOpen(false)}>{i18n._('Close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
