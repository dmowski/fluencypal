import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

const ensureAdminApp = () => {
  if (!getApps().length) {
    initializeApp({ projectId: 'dark-lang' });
  }
};

export const adminAuth = () => {
  ensureAdminApp();
  return getAuth();
};

export const adminFirestore = () => {
  ensureAdminApp();
  return getFirestore();
};

export const seedVoiceChatEntitlement = async (
  uid: string,
  patch: { isPaid?: boolean; isGameWinner?: boolean },
): Promise<void> => {
  const db = adminFirestore();
  await db
    .collection('voiceChatEntitlements')
    .doc(uid)
    .set(
      {
        isPaid: patch.isPaid ?? false,
        isGameWinner: patch.isGameWinner ?? false,
        updatedAtIso: new Date().toISOString(),
      },
      { merge: true },
    );
};

/** Real payment log so validatePaidForUser keeps isPaid=true. */
export const seedRealPayment = async (uid: string): Promise<void> => {
  const db = adminFirestore();
  const paymentId = `e2e-payment-${uid}`;
  await db
    .collection('users')
    .doc(uid)
    .collection('payments')
    .doc(paymentId)
    .set({
      id: paymentId,
      amountAdded: 10,
      currency: 'USD',
      createdAt: Date.now(),
      type: 'user',
      amountOfHours: 0,
      amountOfMonth: 1,
      amountOfDays: 0,
      receiptUrl: '',
    });
};

/** Minimal users/{uid} so practice dashboard renders without onboarding wizard. */
export const seedUserSettings = async (uid: string, email: string): Promise<void> => {
  const db = adminFirestore();
  const nowIso = new Date().toISOString();
  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        createdAt: Date.now(),
        createdAtIso: nowIso,
        currency: 'USD',
        email,
        country: 'us',
        countryName: 'United States',
        userSource: 'e2e',
        languageCode: 'en',
        pageLanguageCode: 'en',
        nativeLanguageCode: 'en',
        lastLoginAtDateTime: nowIso,
        isGameOnboardingCompleted: true,
        photoUrl: null,
        displayName: null,
        isCreditCardConfirmed: null,
        appMode: 'learning',
        conversationMode: 'chat',
        browserInfo: null,
        isParentalConsentNeeded: false,
        teacherVoice: null,
      },
      { merge: true },
    );
};

export const seedVoiceChatMessage = async (message: {
  id: string;
  senderId: string;
  parentMessageId?: string;
  audioPath: string;
  durationSec: number;
  createdAtUtc: number;
  isIntro?: boolean;
}): Promise<void> => {
  const db = adminFirestore();
  await db
    .collection('voiceChatMessages')
    .doc(message.id)
    .set({
      id: message.id,
      senderId: message.senderId,
      parentMessageId: message.parentMessageId ?? '',
      audioPath: message.audioPath,
      durationSec: message.durationSec,
      contentType: 'audio/webm',
      createdAtIso: new Date(message.createdAtUtc).toISOString(),
      createdAtUtc: message.createdAtUtc,
      isIntro: message.isIntro ?? false,
    });
};
