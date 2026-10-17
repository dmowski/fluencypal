'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useUrlState } from '@/features/Url/useUrlState';
import {
  createSpeakingRoom,
  fetchRoomDetail,
  fetchSpeakingAudio,
  fetchSpeakingRooms,
  generateRoomPreviews,
  introAudioPath,
  markSpeakingRoomRead,
  messageAudioPath,
  reviewRoomMember,
  RoomDetail,
  sendRoomVoiceMessage,
  submitRoomJoin,
  updateSpeakingRoom,
  deleteRoomMessage,
} from './api/speakingClubClient';
import { JoinRoomView } from './components/JoinRoomView';
import { MembersPanel } from './components/MembersPanel';
import { RoomForm } from './components/RoomForm';
import { RoomListView } from './components/RoomListView';
import { RoomThread } from './components/RoomThread';
import { VoiceComposer } from './components/VoiceComposer';
import { clearRoomDraft, readRoomDraft, writeRoomDraft } from './roomDraft';
import { emptyRoomDraft, RoomDraft, RoomListItem, SpeakingRoom } from './types';
import { useVoiceTake } from './useVoiceTake';
import { SpeakingNotificationSettings } from './SpeakingNotificationSettings';

const draftFromRoom = (room: SpeakingRoom): RoomDraft => ({
  ...emptyRoomDraft(),
  title: room.title,
  subtitle: room.subtitle,
  reviewMode: room.reviewMode,
  joinPromptMarkdown: room.joinPromptMarkdown,
  isPublic: room.isPublic,
  rulesMarkdown: room.rulesMarkdown,
  discussMarkdown: room.discussMarkdown,
  previewUrls: room.previewImageUrl ? [room.previewImageUrl] : [],
  selectedPreviewUrl: room.previewImageUrl,
});

export const VoiceChatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const [voiceRoom, setVoiceRoom] = useUrlState('voiceRoom', '', false);
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [screen, setScreen] = useState<'list' | 'create' | 'room'>('list');
  const [draft, setDraft] = useState<RoomDraft>(() => readRoomDraft());
  const [editDraft, setEditDraft] = useState<RoomDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingPictures, setIsCreatingPictures] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomMenuOpen, setRoomMenuOpen] = useState(false);
  const [roomTab, setRoomTab] = useState<'settings' | 'notifications' | 'members'>('notifications');
  const [joinSent, setJoinSent] = useState(false);
  const take = useVoiceTake();

  const showError = (reason: unknown) => {
    setError(
      reason instanceof Error ? reason.message : i18n._('Something went wrong. Please try again.'),
    );
  };

  const loadList = async () => {
    const token = await auth.getToken();
    if (!token) return;
    const data = await fetchSpeakingRooms(token);
    setRooms(data.rooms);
  };

  const openRoom = async (roomId: string) => {
    setScreen('room');
    setVoiceRoom(roomId);
    setError('');
    const token = await auth.getToken();
    if (!token) return;
    const next = await fetchRoomDetail(token, roomId);
    setDetail(next);
    setEditDraft(draftFromRoom(next.room));
    if (next.membership?.status === 'approved') {
      await markSpeakingRoomRead(token, roomId);
      const urls: Record<string, string> = {};
      for (const message of next.messages) {
        urls[message.id] = await fetchSpeakingAudio(token, messageAudioPath(roomId, message.id));
      }
      setAudioUrls(urls);
      setRooms((current) =>
        current.map((item) => (item.room.id === roomId ? { ...item, unreadCount: 0 } : item)),
      );
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = await auth.getToken();
        if (!token || cancelled) return;
        const data = await fetchSpeakingRooms(token);
        if (cancelled) return;
        setRooms(data.rooms);
        const roomFromUrl = new URLSearchParams(window.location.search).get('voiceRoom');
        if (roomFromUrl) await openRoom(roomFromUrl);
      } catch (reason) {
        if (!cancelled) showError(reason);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [auth.uid]);

  const addPictures = async (target: RoomDraft, apply: (next: RoomDraft) => void) => {
    setIsCreatingPictures(true);
    setError('');
    try {
      const token = await auth.getToken();
      if (!token) return;
      const { urls } = await generateRoomPreviews(
        token,
        target.title.trim(),
        target.subtitle.trim(),
      );
      const previewUrls = [
        ...target.previewUrls,
        ...urls.filter((url) => !target.previewUrls.includes(url)),
      ];
      apply({
        ...target,
        previewUrls,
        selectedPreviewUrl: target.selectedPreviewUrl || previewUrls[0] || '',
      });
    } catch (reason) {
      showError(reason);
    } finally {
      setIsCreatingPictures(false);
    }
  };

  const backToList = () => {
    setScreen('list');
    setVoiceRoom('');
    setDetail(null);
    setRoomMenuOpen(false);
    void loadList().catch(showError);
  };

  return (
    <CustomModal isOpen onClose={onClose} data-testid="voice-chat-modal-shell" zIndex={1200}>
      <Stack sx={{ width: '100%', alignItems: 'center', gap: '12px' }}>
        {screen === 'room' && !detail ? <Typography>{i18n._('Loading room...')}</Typography> : null}
        {screen !== 'list' ? (
          <Button onClick={backToList} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
            {i18n._('All rooms')}
          </Button>
        ) : null}
        {screen === 'list' ? (
          <RoomListView
            rooms={rooms}
            isLoading={isLoading}
            error={error}
            onOpenRoom={(roomId) => {
              void openRoom(roomId).catch(showError);
            }}
            onCreate={() => {
              setError('');
              setScreen('create');
            }}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        ) : null}
        {screen === 'create' ? (
          <RoomForm
            draft={draft}
            error={error}
            isSaving={isSaving}
            isCreatingPictures={isCreatingPictures}
            submitLabel={i18n._('Create room')}
            onChange={(next) => {
              setDraft(next);
              writeRoomDraft(next);
            }}
            onCreatePictures={() => {
              void addPictures(draft, (next) => {
                setDraft(next);
                writeRoomDraft(next);
              });
            }}
            onShowMore={() => {
              void addPictures(draft, (next) => {
                setDraft(next);
                writeRoomDraft(next);
              });
            }}
            onSubmit={() => {
              setIsSaving(true);
              setError('');
              void (async () => {
                try {
                  const token = await auth.getToken();
                  if (!token) return;
                  const { room } = await createSpeakingRoom(token, draft);
                  clearRoomDraft();
                  setDraft(emptyRoomDraft());
                  await openRoom(room.id);
                } catch (reason) {
                  showError(reason);
                } finally {
                  setIsSaving(false);
                }
              })();
            }}
          />
        ) : null}
        {screen === 'room' && detail?.membership?.status === 'approved' ? (
          <RoomThread
            room={detail.room}
            messages={detail.messages}
            audioUrls={audioUrls}
            currentUserId={auth.uid || ''}
            onOpenSettings={() => {
              setRoomTab(detail.isAdmin ? 'settings' : 'notifications');
              setRoomMenuOpen(true);
            }}
            onRemove={(messageId) => {
              void (async () => {
                const token = await auth.getToken();
                if (!token) return;
                await deleteRoomMessage(token, detail.room.id, messageId);
                setDetail({
                  ...detail,
                  messages: detail.messages.filter((message) => message.id !== messageId),
                });
              })().catch(showError);
            }}
            composer={
              <VoiceComposer
                isSending={isSaving}
                onSend={async (params) => {
                  setIsSaving(true);
                  try {
                    const token = await auth.getToken();
                    if (!token) return;
                    const { message } = await sendRoomVoiceMessage(token, detail.room.id, params);
                    const url = await fetchSpeakingAudio(
                      token,
                      messageAudioPath(detail.room.id, message.id),
                    );
                    setAudioUrls((current) => ({ ...current, [message.id]: url }));
                    setDetail({ ...detail, messages: [...detail.messages, message] });
                  } finally {
                    setIsSaving(false);
                  }
                }}
              />
            }
          />
        ) : null}
        {screen === 'room' && detail && detail.membership?.status !== 'approved' ? (
          <JoinRoomView
            room={detail.room}
            isPending={detail.membership?.status === 'pending'}
            isRecording={take.recorder.isRecording}
            isTranscribing={take.recorder.isTranscribing}
            transcript={take.transcript}
            suggestion={take.suggestion}
            corrected={take.corrected}
            isSending={isSaving}
            onRecord={() => {
              if (take.recorder.isRecording) take.recorder.stopRecording();
              else void take.recorder.startRecording();
            }}
            onRecordAgain={() => {
              take.recorder.removeTranscript();
              void take.recorder.startRecording();
            }}
            onSend={() => {
              const blob = take.recorder.transcriptionBlob;
              if (!blob) return;
              setIsSaving(true);
              void (async () => {
                try {
                  const token = await auth.getToken();
                  if (!token) return;
                  const { member } = await submitRoomJoin(token, detail.room.id, {
                    blob,
                    durationSec: take.durationSec,
                    transcript: take.transcript,
                    suggestion: take.suggestion,
                  });
                  setDetail({ ...detail, membership: member });
                  take.recorder.removeTranscript();
                  setJoinSent(true);
                } catch (reason) {
                  showError(reason);
                } finally {
                  setIsSaving(false);
                }
              })();
            }}
          />
        ) : null}
        {screen === 'room' && error ? <Typography color="error">{error}</Typography> : null}
      </Stack>
      {settingsOpen ? (
        <CustomModal isOpen onClose={() => setSettingsOpen(false)} zIndex={1300}>
          <SpeakingNotificationSettings />
        </CustomModal>
      ) : null}
      {roomMenuOpen && detail ? (
        <CustomModal
          isOpen
          onClose={() => setRoomMenuOpen(false)}
          zIndex={1300}
          data-testid="voice-room-settings"
        >
          <Stack sx={{ width: '100%', maxWidth: 760, gap: '12px' }}>
            <Tabs
              value={roomTab}
              onChange={(_event, value: 'settings' | 'notifications' | 'members') =>
                setRoomTab(value)
              }
            >
              {detail.isAdmin ? <Tab value="settings" label={i18n._('Settings')} /> : null}
              <Tab value="notifications" label={i18n._('Notifications')} />
              <Tab value="members" label={i18n._('People')} />
            </Tabs>
            {roomTab === 'settings' && detail.isAdmin && editDraft ? (
              <RoomForm
                draft={editDraft}
                error={error}
                isSaving={isSaving}
                isCreatingPictures={isCreatingPictures}
                submitLabel={i18n._('Save')}
                onChange={setEditDraft}
                onCreatePictures={() => void addPictures(editDraft, setEditDraft)}
                onShowMore={() => void addPictures(editDraft, setEditDraft)}
                onSubmit={() => {
                  setIsSaving(true);
                  void (async () => {
                    try {
                      const token = await auth.getToken();
                      if (!token) return;
                      const { room } = await updateSpeakingRoom(token, detail.room.id, editDraft);
                      setDetail({ ...detail, room });
                      setRoomMenuOpen(false);
                    } catch (reason) {
                      showError(reason);
                    } finally {
                      setIsSaving(false);
                    }
                  })();
                }}
              />
            ) : null}
            {roomTab === 'notifications' ? (
              <SpeakingNotificationSettings roomId={detail.room.id} />
            ) : null}
            {roomTab === 'members' ? (
              <MembersPanel
                members={detail.members}
                canReview={detail.canReview}
                onPlayIntro={async (userId) => {
                  const token = await auth.getToken();
                  if (!token) return '';
                  return fetchSpeakingAudio(token, introAudioPath(detail.room.id, userId));
                }}
                onDecide={(userId, decision) => {
                  void (async () => {
                    const token = await auth.getToken();
                    if (!token) return;
                    await reviewRoomMember(token, detail.room.id, userId, decision);
                    await openRoom(detail.room.id);
                  })().catch(showError);
                }}
              />
            ) : null}
          </Stack>
        </CustomModal>
      ) : null}
      {joinSent ? (
        <CustomModal
          isOpen
          onClose={() => setJoinSent(false)}
          zIndex={1400}
          data-testid="voice-join-sent"
        >
          <Stack sx={{ width: '100%', maxWidth: 520, gap: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {i18n._('Your introduction was sent')}
            </Typography>
            <Typography>
              {i18n._('Turn on notifications so you do not miss the answer.')}
            </Typography>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                setJoinSent(false);
                setRoomTab('notifications');
                setRoomMenuOpen(true);
              }}
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              {i18n._('Open notification settings')}
            </Button>
          </Stack>
        </CustomModal>
      ) : null}
    </CustomModal>
  );
};
