'use client';

import { useEffect, useState } from 'react';
import { SafeGroupCall, toSafeGroupCalls } from './safeGroupCalls';

const SCHEDULE_URL = '/api/group-conversations/schedule';

let pending: Promise<SafeGroupCall[]> | null = null;

export const englishGroupCallsFromPayload = (payload: unknown): SafeGroupCall[] =>
  toSafeGroupCalls(payload)
    .filter((call) => call.languageCode === 'en')
    .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));

export const loadEnglishGroupCalls = (): Promise<SafeGroupCall[]> => {
  if (!pending) {
    pending = fetch(SCHEDULE_URL, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('schedule unavailable');
        return response.json();
      })
      .then(englishGroupCallsFromPayload)
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
};

export const resetEnglishGroupCallsCache = () => {
  pending = null;
};

export const useEnglishGroupCalls = () => {
  const [calls, setCalls] = useState<SafeGroupCall[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadEnglishGroupCalls()
      .then((next) => {
        if (!cancelled) setCalls(next);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { calls, failed, loading: calls === null && !failed };
};
