'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';

export type CallJoinerEmail = {
  userId: string;
  email: string;
};

export async function loadCallJoinerEmails(userIds: string[], token: string) {
  const response = await fetch('/api/fluency-call/joiners', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userIds }),
  });
  if (!response.ok) {
    throw new Error('Could not load joiner emails');
  }
  const data = (await response.json()) as { users: CallJoinerEmail[] };
  return data.users;
}

export function useCallJoinerEmails(userIds: string[]) {
  const auth = useAuth();
  const getTokenRef = useRef(auth.getToken);
  getTokenRef.current = auth.getToken;
  const key = [...userIds].sort().join('\n');
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (!key || !auth.uid) {
      setEmails({});
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    const ids = key.split('\n');

    void (async () => {
      try {
        const token = await getTokenRef.current();
        const users = await loadCallJoinerEmails(ids, token);
        if (cancelled) return;
        setEmails(Object.fromEntries(users.map((user) => [user.userId, user.email])));
        setStatus('ready');
      } catch (error) {
        console.error(error);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, auth.uid]);

  return { emails, status };
}
