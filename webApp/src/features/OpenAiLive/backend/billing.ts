import { getDB } from '@/app/api/config/firebase';
import {
  applyOpenAiLiveUsage,
  applyWelcomeBalance,
  OPEN_AI_LIVE_MAX_BILLING_GAP_MS,
  openAiLiveMinimumStartUsdMicros,
} from '../pricing';
import { OpenAiLiveMode } from '../types';
import { OpenAiLiveNoBalanceError } from './requireUser';
import { openAiLiveAccountRef, openAiLiveSessionRef } from './paths';

type AccountData = {
  balanceUsdMicros?: number;
  welcomeGrantedAt?: string | null;
  activeSessionId?: string | null;
};

type SessionData = {
  status?: 'active' | 'closed';
  lastBilledAtMs?: number;
  billedUsdMicros?: number;
};

const readAccount = (data: AccountData | undefined) => ({
  balanceUsdMicros: data?.balanceUsdMicros ?? 0,
  welcomeGrantedAt: data?.welcomeGrantedAt ?? null,
  activeSessionId: data?.activeSessionId ?? null,
});

export const ensureOpenAiLiveWelcomeBalance = async (userId: string) => {
  const db = getDB();
  const ref = openAiLiveAccountRef(userId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = readAccount(snap.data() as AccountData | undefined);
    const next = applyWelcomeBalance(current);
    if (!next.grant) {
      return { balanceUsdMicros: next.balanceUsdMicros, granted: false };
    }
    const welcomeGrantedAt = new Date().toISOString();
    tx.set(
      ref,
      {
        balanceUsdMicros: next.balanceUsdMicros,
        welcomeGrantedAt,
        updatedAt: welcomeGrantedAt,
      },
      { merge: true },
    );
    return { balanceUsdMicros: next.balanceUsdMicros, granted: true };
  });
};

export const readOpenAiLiveBalance = async (userId: string) => {
  const snap = await openAiLiveAccountRef(userId).get();
  return readAccount(snap.data() as AccountData | undefined).balanceUsdMicros;
};

export const settleOpenAiLiveSession = async (
  userId: string,
  sessionId: string,
  close: boolean,
) => {
  const db = getDB();
  const sessionRef = openAiLiveSessionRef(userId, sessionId);
  const accountRef = openAiLiveAccountRef(userId);

  return db.runTransaction(async (tx) => {
    const [sessionSnap, accountSnap] = await Promise.all([tx.get(sessionRef), tx.get(accountRef)]);
    const account = readAccount(accountSnap.data() as AccountData | undefined);
    const session = sessionSnap.data() as SessionData | undefined;
    if (!sessionSnap.exists || session?.status !== 'active') {
      return {
        balanceUsdMicros: account.balanceUsdMicros,
        chargedUsdMicros: 0,
        shouldStop: account.balanceUsdMicros <= 0,
      };
    }

    const now = Date.now();
    const elapsedMs = Math.min(
      OPEN_AI_LIVE_MAX_BILLING_GAP_MS,
      Math.max(0, now - (session.lastBilledAtMs || now)),
    );
    const applied = applyOpenAiLiveUsage({
      balanceUsdMicros: account.balanceUsdMicros,
      elapsedMs,
    });
    const shouldClose = close || applied.shouldStop;
    tx.set(
      sessionRef,
      {
        status: shouldClose ? 'closed' : 'active',
        lastBilledAtMs: now,
        billedUsdMicros: (session.billedUsdMicros || 0) + applied.chargedUsdMicros,
      },
      { merge: true },
    );
    tx.set(
      accountRef,
      {
        balanceUsdMicros: applied.balanceUsdMicros,
        updatedAt: new Date(now).toISOString(),
        ...(shouldClose && account.activeSessionId === sessionId ? { activeSessionId: null } : {}),
      },
      { merge: true },
    );
    return {
      balanceUsdMicros: applied.balanceUsdMicros,
      chargedUsdMicros: applied.chargedUsdMicros,
      shouldStop: applied.shouldStop,
    };
  });
};

export const closeActiveOpenAiLiveSession = async (userId: string) => {
  const accountSnap = await openAiLiveAccountRef(userId).get();
  const activeSessionId = (accountSnap.data() as AccountData | undefined)?.activeSessionId;
  if (!activeSessionId) return;
  await settleOpenAiLiveSession(userId, activeSessionId, true);
};

export const beginOpenAiLiveBilling = async ({
  userId,
  sessionId,
  mode,
}: {
  userId: string;
  sessionId: string;
  mode: OpenAiLiveMode;
}) => {
  const db = getDB();
  const accountRef = openAiLiveAccountRef(userId);
  const sessionRef = openAiLiveSessionRef(userId, sessionId);
  const now = Date.now();

  await db.runTransaction(async (tx) => {
    const accountSnap = await tx.get(accountRef);
    const account = readAccount(accountSnap.data() as AccountData | undefined);
    if (account.balanceUsdMicros < openAiLiveMinimumStartUsdMicros) {
      throw new OpenAiLiveNoBalanceError();
    }
    tx.set(sessionRef, {
      status: 'active',
      mode,
      startedAtMs: now,
      lastBilledAtMs: now,
      billedUsdMicros: 0,
      openaiSessionId: sessionId,
    });
    tx.set(
      accountRef,
      {
        activeSessionId: sessionId,
        updatedAt: new Date(now).toISOString(),
      },
      { merge: true },
    );
  });
};
