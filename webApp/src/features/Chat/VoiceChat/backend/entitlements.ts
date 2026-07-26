import { getDB } from '@/app/api/config/firebase';
import { PaymentLog } from '@/features/Usage/usage';
import { getGameUsersPoints, isUserIsGameWinner } from '@/features/Game/api/statsResources';
import { ENTITLEMENTS_COLLECTION, MEMBERS_COLLECTION } from './paths';
import { hasRealPaidPayment } from './paidDetector';
import {
  VOICE_CHAT_FOUNDER_UID,
  VoiceChatEntitlement,
  VoiceChatValidateGameWinnerResponse,
  VoiceChatValidatePaidCronResponse,
} from '../types';

export const getEntitlement = async (uid: string): Promise<VoiceChatEntitlement | null> => {
  const db = getDB();
  const snap = await db.collection(ENTITLEMENTS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as VoiceChatEntitlement;
};

export const writeEntitlement = async (
  uid: string,
  patch: Partial<VoiceChatEntitlement>,
): Promise<VoiceChatEntitlement> => {
  const db = getDB();
  const existing = (await getEntitlement(uid)) || {
    isPaid: false,
    isGameWinner: false,
    updatedAtIso: new Date().toISOString(),
  };
  const next: VoiceChatEntitlement = {
    ...existing,
    ...patch,
    updatedAtIso: new Date().toISOString(),
  };
  await db.collection(ENTITLEMENTS_COLLECTION).doc(uid).set(next, { merge: true });
  return next;
};

export const computeIsPaidForUser = async (uid: string): Promise<boolean> => {
  if (uid === VOICE_CHAT_FOUNDER_UID) return true;
  const db = getDB();
  const snap = await db.collection('users').doc(uid).collection('payments').get();
  const payments = snap.docs.map((d) => d.data() as PaymentLog);
  return hasRealPaidPayment(payments);
};

export const validatePaidForUser = async (uid: string): Promise<VoiceChatEntitlement> => {
  const isPaid = await computeIsPaidForUser(uid);
  const existing = await getEntitlement(uid);
  return writeEntitlement(uid, {
    isPaid,
    isGameWinner: existing?.isGameWinner ?? false,
  });
};

/** Cron / batch: re-check paid snapshots for known voice-chat users. */
export const validatePaidEntitlements = async (): Promise<VoiceChatValidatePaidCronResponse> => {
  const db = getDB();
  const [entitlementsSnap, membersSnap] = await Promise.all([
    db.collection(ENTITLEMENTS_COLLECTION).get(),
    db.collection(MEMBERS_COLLECTION).get(),
  ]);

  const userIds = new Set<string>([
    VOICE_CHAT_FOUNDER_UID,
    ...entitlementsSnap.docs.map((d) => d.id),
    ...membersSnap.docs.map((d) => d.id),
  ]);

  const results = await Promise.all(
    [...userIds].map(async (uid) => {
      const entitlement = await validatePaidForUser(uid);
      return { uid, isPaid: entitlement.isPaid };
    }),
  );

  return {
    paidUserIds: results.filter((r) => r.isPaid).map((r) => r.uid),
  };
};

export const validateGameWinners = async (): Promise<VoiceChatValidateGameWinnerResponse> => {
  const db = getDB();
  const points = await getGameUsersPoints();
  const sortedUserIds = Object.keys(points).sort((a, b) => (points[b] || 0) - (points[a] || 0));
  const winnerIds = sortedUserIds.slice(0, 5);

  const existingSnap = await db.collection(ENTITLEMENTS_COLLECTION).get();
  const previouslyWinners = existingSnap.docs
    .filter((d) => (d.data() as VoiceChatEntitlement).isGameWinner)
    .map((d) => d.id);

  const toUpdate = new Set([...winnerIds, ...previouslyWinners, VOICE_CHAT_FOUNDER_UID]);

  await Promise.all(
    [...toUpdate].map(async (uid) => {
      const isGameWinner = winnerIds.includes(uid) || uid === VOICE_CHAT_FOUNDER_UID;
      const existing = await getEntitlement(uid);
      await writeEntitlement(uid, {
        isPaid: existing?.isPaid ?? uid === VOICE_CHAT_FOUNDER_UID,
        isGameWinner,
      });
    }),
  );

  return { winnerIds };
};

export const validateGameWinnerForUser = async (uid: string): Promise<VoiceChatEntitlement> => {
  await validateGameWinners();
  const entitlement = await getEntitlement(uid);
  if (entitlement) return entitlement;
  const isGameWinner = await isUserIsGameWinner(uid);
  return writeEntitlement(uid, {
    isPaid: uid === VOICE_CHAT_FOUNDER_UID,
    isGameWinner: isGameWinner || uid === VOICE_CHAT_FOUNDER_UID,
  });
};

export const isUserEntitled = async (uid: string): Promise<boolean> => {
  if (uid === VOICE_CHAT_FOUNDER_UID) return true;
  let entitlement = await getEntitlement(uid);
  if (!entitlement) {
    entitlement = await validatePaidForUser(uid);
    const winner = await isUserIsGameWinner(uid);
    entitlement = await writeEntitlement(uid, {
      isPaid: entitlement.isPaid,
      isGameWinner: winner,
    });
  }
  return entitlement.isPaid || entitlement.isGameWinner;
};
