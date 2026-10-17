'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { fetchNotificationSettings, saveNotificationSettings } from './api/speakingClubClient';
import { NotificationSettingsForm } from './components/NotificationSettingsForm';
import { defaultRoomNarrowing, defaultSpeakingNotificationPrefs } from './notificationRules';
import { RoomNotificationNarrowing, SpeakingNotificationPrefs } from './types';

const browserPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
};

export const SpeakingNotificationSettings = ({ roomId }: { roomId?: string }) => {
  const auth = useAuth();
  const [prefs, setPrefs] = useState<SpeakingNotificationPrefs>(defaultSpeakingNotificationPrefs());
  const [narrowing, setNarrowing] = useState<RoomNotificationNarrowing>(defaultRoomNarrowing());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermission(browserPermission());
    let cancelled = false;
    void (async () => {
      const token = await auth.getToken();
      if (!token || cancelled) return;
      const data = await fetchNotificationSettings(token, roomId);
      if (cancelled) return;
      setPrefs(data.prefs);
      if (data.narrowing) setNarrowing(data.narrowing);
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.uid, roomId]);

  const savePrefs = async (next: SpeakingNotificationPrefs) => {
    setPrefs(next);
    const token = await auth.getToken();
    if (!token) return;
    await saveNotificationSettings(token, { prefs: next });
  };

  const saveNarrowing = async (next: RoomNotificationNarrowing) => {
    setNarrowing(next);
    if (!roomId) return;
    const token = await auth.getToken();
    if (!token) return;
    await saveNotificationSettings(token, { roomId, narrowing: next });
  };

  return (
    <NotificationSettingsForm
      prefs={prefs}
      narrowing={roomId ? narrowing : null}
      roomScoped={Boolean(roomId)}
      browserPermission={permission}
      onChangePrefs={(next) => {
        void savePrefs(next);
      }}
      onChangeNarrowing={(next) => {
        void saveNarrowing(next);
      }}
      onEnableBrowser={() => {
        if (typeof Notification === 'undefined') return;
        void Notification.requestPermission().then((result) => {
          setPermission(result);
          if (result === 'granted') void savePrefs({ ...prefs, browserEnabled: true });
        });
      }}
    />
  );
};
