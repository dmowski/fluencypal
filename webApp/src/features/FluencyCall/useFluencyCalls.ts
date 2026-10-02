'use client';

import { useMemo } from 'react';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { countUnreadChatMessages } from '@/features/Chat/chatListUtils';
import { selectVisibleCall } from './callTime';
import { fluencyCallChatSpaceId } from './fluencyCallChat';
import { FluencyCallRequest } from './types';

export function useFluencyCalls() {
  const auth = useAuth();
  const callsRef = auth.uid ? db.collections.fluencyCalls() : null;
  const [calls, loading] = useCollectionData(callsRef);

  return {
    calls: calls ?? [],
    loading: Boolean(auth.uid) && loading,
  };
}

export function useVisibleFluencyCall(now: Date) {
  const { calls, loading } = useFluencyCalls();
  const call = useMemo(() => selectVisibleCall(calls, now), [calls, now]);
  return { call, loading };
}

export function isPendingCallRequest(
  request: FluencyCallRequest | null | undefined,
): request is FluencyCallRequest {
  if (!request) return false;
  return request.status !== 'accepted' && request.status !== 'rejected';
}

export function useFluencyCallRequests() {
  const auth = useAuth();
  const requestsRef = auth.uid ? db.collections.fluencyCallRequests() : null;
  const [requests, loading] = useCollectionData(requestsRef);
  const pending = (requests ?? [])
    .filter((request) => isPendingCallRequest(request))
    .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));

  return {
    requests: pending,
    loading: Boolean(auth.uid) && loading,
  };
}

export function useFluencyCallUnreadCount(callId: string | null) {
  const auth = useAuth();
  const spaceId = callId ? fluencyCallChatSpaceId(callId) : '';
  const chatRef = auth.uid && spaceId ? db.documents.chat(auth.uid, spaceId) : null;
  const readRef = auth.uid ? db.documents.chatSpaceUserReadMetadata(auth.uid) : null;
  const [chat] = useDocumentData(chatRef);
  const [readStats] = useDocumentData(readRef);

  return useMemo(
    () => countUnreadChatMessages(chat?.allMessagesIds, readStats?.[spaceId]),
    [chat?.allMessagesIds, readStats, spaceId],
  );
}

export function useFluencyCallRequest() {
  const auth = useAuth();
  const requestRef = auth.uid ? db.documents.fluencyCallRequest(auth.uid) : null;
  const [request, loading] = useDocumentData(requestRef);

  return {
    request: request ?? null,
    loading: Boolean(auth.uid) && loading,
  };
}

export function useFluencyCallRsvps(callId: string | null) {
  const auth = useAuth();
  const rsvpsRef = callId && auth.uid ? db.collections.fluencyCallRsvps(callId) : null;
  const [rsvps, loading] = useCollectionData(rsvpsRef);
  const list = rsvps ?? [];

  return {
    rsvps: list,
    joinCount: list.length,
    isJoining: list.some((rsvp) => rsvp.userId === auth.uid),
    loading,
  };
}
