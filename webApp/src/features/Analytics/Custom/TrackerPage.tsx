'use client';

import { useEffect } from 'react';
import { ANALYTICS_VISITOR_STORAGE_KEY } from './constants';
import { isAllowedAnalyticsOrigin } from './allowedOrigins';
import { buildReadyMessage, isAnalyticsMessage } from './protocol';
import { AnalyticsClientEvent, IngestEventRequest, IngestEventResponse } from './types';
import { createVisitorId, isValidVisitorId } from './visitorId';
import { validateClientEvent } from './validateEvent';

const readStoredVisitorId = (): string | null => {
  try {
    const stored = window.localStorage.getItem(ANALYTICS_VISITOR_STORAGE_KEY);
    if (stored && isValidVisitorId(stored)) return stored;
  } catch {
    return null;
  }
  return null;
};

const persistVisitorId = (visitorId: string): void => {
  try {
    window.localStorage.setItem(ANALYTICS_VISITOR_STORAGE_KEY, visitorId);
  } catch {
    // Private mode can block storage; events still send for this tab.
  }
};

const getOrCreateVisitorId = (): string => {
  const existing = readStoredVisitorId();
  if (existing) return existing;
  const created = createVisitorId();
  persistVisitorId(created);
  return created;
};

const notifyParentReady = (parentOrigin: string): void => {
  if (window.parent === window) return;
  window.parent.postMessage(buildReadyMessage(), parentOrigin);
};

const ingestEvent = async (visitorId: string, event: AnalyticsClientEvent): Promise<void> => {
  const body: IngestEventRequest = { visitorId, event };
  const response = await fetch('/api/analytics/ingest', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Analytics': 'tracker',
    },
    body: JSON.stringify(body),
    keepalive: true,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as IngestEventResponse | null;
    console.warn('Custom analytics ingest failed', payload?.error || response.status);
  }
};

export function TrackerPage() {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const knownParents = new Set<string>();

    const replyReady = (origin: string) => {
      if (!isAllowedAnalyticsOrigin(origin)) return;
      knownParents.add(origin);
      notifyParentReady(origin);
    };

    if (document.referrer) {
      try {
        replyReady(new URL(document.referrer).origin);
      } catch {
        // ignore malformed referrer
      }
    }

    const onMessage = (event: MessageEvent) => {
      if (!isAllowedAnalyticsOrigin(event.origin)) return;
      if (!isAnalyticsMessage(event.data)) return;

      replyReady(event.origin);

      if (event.data.type !== 'event') return;
      const validated = validateClientEvent(event.data.event);
      if (!validated) return;
      void ingestEvent(visitorId, validated);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return null;
}
