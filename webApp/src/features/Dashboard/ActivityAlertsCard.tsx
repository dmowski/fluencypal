'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useLingui } from '@lingui/react';
import MailIcon from '@mui/icons-material/Mail';
import { Badge, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { useChatList } from '../Chat/useChatList';
import { firestore } from '../Firebase/init';
import { GradientCard } from '../uiKit/Card/GradientCard';
import { StoreButton } from '../uiKit/Card/StoreCard/StoreButton';
import { AppNotification, AppNotificationKind, ReviewDecision } from '../Chat/VoiceChat/types';

const asKind = (value: unknown): AppNotificationKind => {
  if (value === 'reviewJoiner' || value === 'newRoom' || value === 'newMessage') return value;
  return 'newMessage';
};

export const ActivityAlertsCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const chatList = useChatList();
  const router = useRouter();
  const [notes, setNotes] = useState<AppNotification[]>([]);
  const unreadCount = chatList.myUnreadCount;

  useEffect(() => {
    if (!auth.uid) return;
    const notesQuery = query(
      collection(firestore, 'users', auth.uid, 'appNotifications'),
      where('read', '==', false),
    );
    return onSnapshot(notesQuery, (snap) => {
      setNotes(
        snap.docs.slice(0, 6).map((item) => {
          const data = item.data();
          const decision =
            data.decision === 'approved' || data.decision === 'rejected'
              ? (data.decision as ReviewDecision)
              : undefined;
          return {
            id: item.id,
            kind: asKind(data.kind),
            roomId: typeof data.roomId === 'string' ? data.roomId : '',
            roomTitle: typeof data.roomTitle === 'string' ? data.roomTitle : '',
            actorName: typeof data.actorName === 'string' ? data.actorName : '',
            decision,
            audience:
              data.audience === 'applicant' || data.audience === 'reviewer'
                ? data.audience
                : 'member',
            createdAtIso: typeof data.createdAtIso === 'string' ? data.createdAtIso : '',
            read: false,
          };
        }),
      );
    });
  }, [auth.uid]);

  if (unreadCount <= 0 && notes.length === 0) return null;

  const openInbox = () => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('inbox', 'true');
    searchParams.set('inboxType', 'messages');
    router.push(`${window.location.pathname}?${searchParams.toString()}`, { scroll: false });
  };

  const openNote = async (note: AppNotification) => {
    if (auth.uid) {
      await updateDoc(doc(firestore, 'users', auth.uid, 'appNotifications', note.id), {
        read: true,
      });
    }
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('voiceChat', 'true');
    if (note.roomId) searchParams.set('voiceRoom', note.roomId);
    if (note.kind === 'reviewJoiner' && note.audience === 'reviewer') {
      searchParams.set('voiceRoomTab', 'members');
    }
    router.push(`${window.location.pathname}?${searchParams.toString()}`, { scroll: false });
  };

  const noteText = (note: AppNotification): string => {
    if (note.kind === 'newRoom')
      return i18n._('A new room is open: {room}', { room: note.roomTitle });
    if (
      note.kind === 'reviewJoiner' &&
      note.audience === 'applicant' &&
      note.decision === 'approved'
    ) {
      return i18n._('You can join {room}', { room: note.roomTitle });
    }
    if (note.kind === 'reviewJoiner' && note.audience === 'applicant') {
      return i18n._('Your introduction to {room} was not accepted this time', {
        room: note.roomTitle,
      });
    }
    if (note.kind === 'reviewJoiner') {
      return i18n._('{name} wants to join {room}', {
        name: note.actorName || i18n._('Someone'),
        room: note.roomTitle,
      });
    }
    return i18n._('New voice message in {room}', { room: note.roomTitle });
  };

  return (
    <Stack data-testid="activity-alerts" sx={{ gap: '10px' }}>
      {unreadCount > 0 ? (
        <Stack data-testid="new-private-message-card">
          <GradientCard
            padding="16px 18px"
            strokeWidth="1px"
            startColor="rgba(85, 141, 219, 0.55)"
            endColor="rgba(5, 172, 255, 0.55)"
            backgroundColor="rgba(28, 37, 49, 0.88)"
          >
            <Stack direction="row" sx={{ width: '100%', alignItems: 'center', gap: '14px' }}>
              <Badge badgeContent={unreadCount} color="error">
                <MailIcon sx={{ color: '#fff', opacity: 0.85 }} />
              </Badge>
              <Typography sx={{ color: '#fff', fontWeight: 600, flex: 1 }}>
                {i18n._('You have a new private message.')}
              </Typography>
              <StoreButton title={i18n._('Open')} onClick={openInbox} />
            </Stack>
          </GradientCard>
        </Stack>
      ) : null}
      {notes.map((note) => (
        <Stack key={note.id} data-testid={`activity-alert-${note.kind}`}>
          <GradientCard
            padding="16px 18px"
            strokeWidth="1px"
            startColor="rgba(85, 141, 219, 0.55)"
            endColor="rgba(5, 172, 255, 0.55)"
            backgroundColor="rgba(28, 37, 49, 0.88)"
          >
            <Stack direction="row" sx={{ width: '100%', alignItems: 'center', gap: '14px' }}>
              <Typography sx={{ color: '#fff', fontWeight: 600, flex: 1 }}>
                {noteText(note)}
              </Typography>
              <StoreButton title={i18n._('Open')} onClick={() => void openNote(note)} />
            </Stack>
          </GradientCard>
        </Stack>
      ))}
    </Stack>
  );
};
