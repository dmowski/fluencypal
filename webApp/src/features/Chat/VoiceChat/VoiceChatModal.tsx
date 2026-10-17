'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { SubmitRecording } from '@/features/Chat/SubmitForm';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useSettings } from '@/features/Settings/useSettings';
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
import {
  emptyRoomDraft,
  ReviewDecision,
  RoomDraft,
  RoomListItem,
  RoomMember,
  SpeakingRoom,
} from './types';
import { SpeakingNotificationSettings } from './SpeakingNotificationSettings';

type RoomSettingsTab = 'settings' | 'notifications' | 'members';

const isRoomSettingsTab = (value: string): value is RoomSettingsTab =>
  value === 'settings' || value === 'notifications' || value === 'members';

const pendingReviewCount = (members: RoomMember[], canReview: boolean) =>
  canReview ? members.filter((member) => member.status === 'pending').length : 0;

const draftFromRoom = (room: SpeakingRoom): RoomDraft => ({
  ...emptyRoomDraft(),
  title: room.title,
  subtitle: room.subtitle,
  reviewMode: room.reviewMode,
  joinPromptMarkdown: room.joinPromptMarkdown,
  isPublic: room.isPublic,
  rulesMarkdown: room.rulesMarkdown,
  discussMarkdown: room.discussMarkdown,
  languageCode: room.languageCode,
  previewUrls: room.previewImageUrl ? [room.previewImageUrl] : [],
  selectedPreviewUrl: room.previewImageUrl,
});

export const VoiceChatModal = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const [chosenLanguage, setChosenLanguage] = useState<SupportedLanguage | null>(null);
  const selectedLanguage = chosenLanguage || settings.languageCode || 'en';
  const [voiceRoom, setVoiceRoom] = useUrlState('voiceRoom', '', false);
  const [voiceNotifications, setVoiceNotifications] = useUrlState(
    'voiceNotifications',
    false,
    false,
  );
  const [voiceRoomTab, setVoiceRoomTab] = useUrlState('voiceRoomTab', '', false);
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
  const [joinSent, setJoinSent] = useState(false);
  const notificationsOpen = String(voiceNotifications) === 'true';
  const rawRoomTab = String(voiceRoomTab);
  const roomMenuTab: RoomSettingsTab | '' = isRoomSettingsTab(rawRoomTab) ? rawRoomTab : '';

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
        const params = new URLSearchParams(window.location.search);
        const roomFromUrl = params.get('voiceRoom');
        if (roomFromUrl) await openRoom(roomFromUrl);
        else if (params.get('voiceRoomTab')) void setVoiceRoomTab('');
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
    void setVoiceRoomTab('');
    void loadList().catch(showError);
  };

  const roomMenuOpen = roomMenuTab !== '' && Boolean(detail);
  const nestedOpen =
    screen === 'create' || screen === 'room' || notificationsOpen || roomMenuOpen || joinSent;
  const reviewCount = detail ? pendingReviewCount(detail.members, detail.canReview) : 0;
  const visibleRoomTab: RoomSettingsTab =
    roomMenuTab === 'settings' && detail && !detail.isAdmin
      ? 'notifications'
      : roomMenuTab || 'notifications';
  const visibleRooms = rooms.filter((item) => item.room.languageCode === selectedLanguage);

  const startCreatingRoom = () => {
    setError('');
    setDraft((current) =>
      current.title.trim() ? current : { ...current, languageCode: selectedLanguage },
    );
    setScreen('create');
  };

  const openRoomSettings = () => {
    if (!detail) return;
    void setVoiceRoomTab(
      reviewCount > 0 ? 'members' : detail.isAdmin ? 'settings' : 'notifications',
    );
  };

  const removeMessage = (messageId: string) => {
    if (!detail) return;
    void (async () => {
      const token = await auth.getToken();
      if (!token) return;
      await deleteRoomMessage(token, detail.room.id, messageId);
      setDetail({
        ...detail,
        messages: detail.messages.filter((message) => message.id !== messageId),
      });
    })().catch(showError);
  };

  const sendVoiceMessage = async (params: {
    blob: Blob;
    durationSec: number;
    transcript: string;
    correctedTranscript: string;
  }) => {
    if (!detail) return;
    setIsSaving(true);
    try {
      const token = await auth.getToken();
      if (!token) return;
      const { message } = await sendRoomVoiceMessage(token, detail.room.id, params);
      const url = await fetchSpeakingAudio(token, messageAudioPath(detail.room.id, message.id));
      setAudioUrls((current) => ({ ...current, [message.id]: url }));
      setDetail({ ...detail, messages: [...detail.messages, message] });
    } finally {
      setIsSaving(false);
    }
  };

  const submitJoinRecording = async (recording: SubmitRecording) => {
    if (!detail) return;
    setIsSaving(true);
    try {
      const token = await auth.getToken();
      if (!token) return;
      const { member } = await submitRoomJoin(token, detail.room.id, {
        blob: recording.blob,
        durationSec: recording.durationSec,
        transcript: recording.transcript,
        suggestion: recording.suggestion,
      });
      setDetail({ ...detail, membership: member });
      setJoinSent(true);
    } catch (reason) {
      showError(reason);
    } finally {
      setIsSaving(false);
    }
  };

  const createRoom = () => {
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
  };

  const saveRoomSettings = () => {
    if (!detail || !editDraft) return;
    setIsSaving(true);
    void (async () => {
      try {
        const token = await auth.getToken();
        if (!token) return;
        const { room } = await updateSpeakingRoom(token, detail.room.id, editDraft);
        setDetail({ ...detail, room });
        void setVoiceRoomTab('');
      } catch (reason) {
        showError(reason);
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const playMemberIntro = async (userId: string) => {
    if (!detail) return '';
    const token = await auth.getToken();
    if (!token) return '';
    return fetchSpeakingAudio(token, introAudioPath(detail.room.id, userId));
  };

  const decideMember = async (userId: string, decision: ReviewDecision) => {
    if (!detail) return;
    try {
      const token = await auth.getToken();
      if (!token) return;
      await reviewRoomMember(token, detail.room.id, userId, decision);
      await openRoom(detail.room.id);
    } catch (reason) {
      showError(reason);
    }
  };

  return (
    <CustomModal
      isOpen
      onClose={() => {
        if (nestedOpen) return;
        onClose();
      }}
      data-testid="voice-chat-modal-shell"
      zIndex={1200}
    >
      <Stack sx={{ width: '100%', alignItems: 'center', gap: '12px' }}>
        <RoomListView
          rooms={visibleRooms}
          isLoading={isLoading}
          error={screen === 'list' ? error : ''}
          language={selectedLanguage}
          onLanguageChange={setChosenLanguage}
          onOpenRoom={(roomId) => {
            void openRoom(roomId).catch(showError);
          }}
          onCreate={startCreatingRoom}
          onOpenSettings={() => {
            void setVoiceNotifications(true);
          }}
        />
        {screen === 'room' ? (
          <CustomModal
            isOpen
            onClose={() => {
              if (roomMenuOpen || joinSent) return;
              backToList();
            }}
            zIndex={1250}
            data-testid="voice-room-modal"
          >
            <Stack
              sx={{
                width: '100%',
                maxWidth: 700,
                alignSelf: 'center',
                alignItems: 'stretch',
                gap: '12px',
              }}
            >
              {!detail ? <Typography>{i18n._('Loading room...')}</Typography> : null}
              {detail?.membership?.status === 'approved' ? (
                <RoomThread
                  room={detail.room}
                  messages={detail.messages}
                  audioUrls={audioUrls}
                  currentUserId={auth.uid || ''}
                  reviewCount={reviewCount}
                  onOpenSettings={openRoomSettings}
                  onRemove={removeMessage}
                  composer={<VoiceComposer isSending={isSaving} onSend={sendVoiceMessage} />}
                />
              ) : null}
              {detail && detail.membership?.status !== 'approved' ? (
                <JoinRoomView
                  room={detail.room}
                  isPending={detail.membership?.status === 'pending'}
                  isSending={isSaving}
                  onSubmitRecording={submitJoinRecording}
                />
              ) : null}
              {error ? <Typography color="error">{error}</Typography> : null}
            </Stack>
          </CustomModal>
        ) : null}
      </Stack>
      {screen === 'create' ? (
        <CustomModal
          isOpen
          onClose={() => {
            setScreen('list');
            setError('');
          }}
          zIndex={1300}
          data-testid="voice-room-create-modal"
        >
          <RoomForm
            draft={draft}
            error={error}
            isSaving={isSaving}
            isCreatingPictures={isCreatingPictures}
            title={i18n._('Create room')}
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
            onSubmit={createRoom}
          />
        </CustomModal>
      ) : null}
      {notificationsOpen ? (
        <CustomModal
          isOpen
          onClose={() => {
            void setVoiceNotifications(false);
          }}
          zIndex={1300}
          data-testid="voice-notification-modal"
        >
          <SpeakingNotificationSettings />
        </CustomModal>
      ) : null}
      {roomMenuOpen && detail ? (
        <CustomModal
          isOpen
          onClose={() => {
            void setVoiceRoomTab('');
          }}
          zIndex={1300}
          data-testid="voice-room-settings"
        >
          <Stack sx={{ width: '100%', maxWidth: 760, gap: '12px' }}>
            <Tabs
              value={visibleRoomTab}
              onChange={(_event, value: RoomSettingsTab) => {
                void setVoiceRoomTab(value);
              }}
            >
              {detail.isAdmin ? <Tab value="settings" label={i18n._('Settings')} /> : null}
              <Tab value="notifications" label={i18n._('Notifications')} />
              <Tab
                value="members"
                label={
                  reviewCount > 0 ? (
                    <Badge color="error" badgeContent={reviewCount} sx={{ paddingRight: '10px' }}>
                      {i18n._('People')}
                    </Badge>
                  ) : (
                    i18n._('People')
                  )
                }
              />
            </Tabs>
            {visibleRoomTab === 'settings' && detail.isAdmin && editDraft ? (
              <RoomForm
                draft={editDraft}
                error={error}
                isSaving={isSaving}
                isCreatingPictures={isCreatingPictures}
                submitLabel={i18n._('Save')}
                onChange={setEditDraft}
                onCreatePictures={() => void addPictures(editDraft, setEditDraft)}
                onShowMore={() => void addPictures(editDraft, setEditDraft)}
                onSubmit={saveRoomSettings}
              />
            ) : null}
            {visibleRoomTab === 'notifications' ? (
              <SpeakingNotificationSettings roomId={detail.room.id} />
            ) : null}
            {visibleRoomTab === 'members' ? (
              <>
                {error ? <Typography color="error">{error}</Typography> : null}
                <MembersPanel
                  members={detail.members}
                  canReview={detail.canReview}
                  currentUserId={auth.uid || ''}
                  onPlayIntro={playMemberIntro}
                  onDecide={decideMember}
                />
              </>
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
                void setVoiceRoomTab('notifications');
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
