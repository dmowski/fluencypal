'use client';

import { useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { firestore } from '@/features/Firebase/init';
import { allowsSpeakingNotification, parseSpeakingNotificationPrefs } from './notificationRules';
import { AppNotificationKind } from './types';

const kindOf = (value: unknown): 'newMessages' | 'reviewJoiners' | 'newRooms' => {
  if (value === 'reviewJoiner') return 'reviewJoiners';
  if (value === 'newRoom') return 'newRooms';
  return 'newMessages';
};

export const SpeakingBrowserNotifications = () => {
  const auth = useAuth();
  const { i18n } = useLingui();

  useEffect(() => {
    if (!auth.uid || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    const notes = query(
      collection(firestore, 'users', auth.uid, 'appNotifications'),
      where('read', '==', false),
    );
    const seen = new Set<string>();
    let ready = false;
    const unsubscribe = onSnapshot(notes, (snap) => {
      if (!ready) {
        snap.docs.forEach((doc) => seen.add(doc.id));
        ready = true;
        return;
      }
      snap.docChanges().forEach((change) => {
        if (change.type !== 'added' || seen.has(change.doc.id)) return;
        seen.add(change.doc.id);
        const data = change.doc.data();
        void (async () => {
          const { doc, getDoc } = await import('firebase/firestore');
          const userSnap = await getDoc(doc(firestore, 'users', auth.uid));
          const livePrefs = parseSpeakingNotificationPrefs(userSnap.data()?.speakingNotifications);
          const kind = kindOf(data.kind);
          if (
            !allowsSpeakingNotification({
              prefs: livePrefs,
              transport: 'browser',
              kind,
            })
          ) {
            return;
          }
          const title = typeof data.roomTitle === 'string' ? data.roomTitle : i18n._('Voice chat');
          const noteKind = data.kind as AppNotificationKind;
          const body =
            noteKind === 'newRoom'
              ? i18n._('A new room is open: {room}', { room: title })
              : noteKind === 'reviewJoiner'
                ? i18n._('There is an update about {room}', { room: title })
                : i18n._('New voice message in {room}', { room: title });
          new Notification(title, { body });
        })();
      });
    });
    return () => unsubscribe();
  }, [auth.uid, i18n]);

  return null;
};
