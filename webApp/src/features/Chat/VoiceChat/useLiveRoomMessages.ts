'use client';

import { useEffect, useRef } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '@/features/Firebase/init';
import { RoomMessage } from './types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const messageFromSnapshot = (
  id: string,
  roomId: string,
  data: Record<string, unknown>,
  viewerId: string,
): RoomMessage => {
  const likes =
    data.likes && typeof data.likes === 'object' ? (data.likes as Record<string, unknown>) : {};
  return {
    id,
    roomId,
    kind: data.kind === 'join' ? 'join' : 'voice',
    senderId: typeof data.senderId === 'string' ? data.senderId : '',
    senderName: typeof data.senderName === 'string' ? data.senderName : 'Learner',
    senderAvatarUrl: typeof data.senderAvatarUrl === 'string' ? data.senderAvatarUrl : '',
    audioPath: typeof data.audioPath === 'string' ? data.audioPath : '',
    durationSec: typeof data.durationSec === 'number' ? data.durationSec : 0,
    transcript: typeof data.transcript === 'string' ? data.transcript : '',
    correctedTranscript:
      typeof data.correctedTranscript === 'string' ? data.correctedTranscript : '',
    createdAtIso: typeof data.createdAtIso === 'string' ? data.createdAtIso : '',
    likeCount:
      typeof data.likeCount === 'number'
        ? data.likeCount
        : Object.values(likes).filter(Boolean).length,
    likedByMe: Boolean(viewerId && likes[viewerId]),
  };
};

export const useLiveRoomMessages = ({
  roomId,
  viewerId,
  enabled,
  onMessages,
}: {
  roomId: string;
  viewerId: string;
  enabled: boolean;
  onMessages: (roomId: string, messages: RoomMessage[]) => void;
}) => {
  const onMessagesRef = useRef(onMessages);
  onMessagesRef.current = onMessages;

  useEffect(() => {
    if (!enabled || !roomId || !viewerId) return;
    const cutoff = new Date(Date.now() - WEEK_MS).toISOString();
    const messagesQuery = query(
      collection(firestore, 'speakingRooms', roomId, 'messages'),
      where('createdAtIso', '>=', cutoff),
      orderBy('createdAtIso', 'asc'),
    );
    return onSnapshot(
      messagesQuery,
      (snap) => {
        const cutoff = Date.now() - WEEK_MS;
        const messages = snap.docs
          .map((item) => messageFromSnapshot(item.id, roomId, item.data(), viewerId))
          .filter((message) => {
            const time = Date.parse(message.createdAtIso);
            return !Number.isFinite(time) || time >= cutoff;
          });
        onMessagesRef.current(roomId, messages);
      },
      (error) => {
        console.error('Live room messages failed', error);
      },
    );
  }, [enabled, roomId, viewerId]);
};
