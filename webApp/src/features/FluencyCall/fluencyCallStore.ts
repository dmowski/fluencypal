import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { ensureFluencyCallCommunityChat } from './fluencyCallChat';
import { fluencyCallLanguageCode } from './callLanguage';
import { FluencyCall, FluencyCallRequestStatus } from './types';

export async function createFluencyCall({
  userId,
  startsAtIso,
  link,
  languageCode,
}: {
  userId: string;
  startsAtIso: string;
  link: string;
  languageCode?: string | null;
}) {
  const ref = doc(db.collections.fluencyCalls());
  const nowIso = new Date().toISOString();
  const call: FluencyCall = {
    id: ref.id,
    startsAtIso,
    link,
    languageCode: fluencyCallLanguageCode(languageCode),
    status: 'scheduled',
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    stoppedAtIso: null,
  };
  await setDoc(ref, call);
  await ensureFluencyCallCommunityChat(userId);
  return call;
}

export async function updateFluencyCallSchedule(
  call: FluencyCall,
  {
    startsAtIso,
    link,
    languageCode,
  }: { startsAtIso: string; link: string; languageCode?: string | null },
) {
  const ref = db.documents.fluencyCall(call.id);
  if (!ref) return;
  await setDoc(ref, {
    ...call,
    startsAtIso,
    link,
    languageCode: fluencyCallLanguageCode(languageCode),
    updatedAtIso: new Date().toISOString(),
  });
}

export async function deleteFluencyCall(callId: string) {
  const ref = db.documents.fluencyCall(callId);
  if (!ref) return;
  await deleteDoc(ref);
}

export async function startFluencyCall(call: FluencyCall) {
  const ref = db.documents.fluencyCall(call.id);
  if (!ref) return;
  const nowIso = new Date().toISOString();
  await setDoc(ref, {
    ...call,
    startsAtIso: nowIso,
    status: 'scheduled',
    stoppedAtIso: null,
    updatedAtIso: nowIso,
  });
}

export async function stopFluencyCall(call: FluencyCall) {
  const ref = db.documents.fluencyCall(call.id);
  if (!ref) return;
  const nowIso = new Date().toISOString();
  await setDoc(ref, {
    ...call,
    status: 'stopped',
    stoppedAtIso: nowIso,
    updatedAtIso: nowIso,
  });
}

export async function setFluencyCallRequestStatus(
  userId: string,
  status: Exclude<FluencyCallRequestStatus, 'pending'>,
) {
  const ref = db.documents.fluencyCallRequest(userId);
  if (!ref) return;
  await updateDoc(ref, { status });
}

export async function setFluencyCallRsvp(callId: string, userId: string, joining: boolean) {
  const ref = db.documents.fluencyCallRsvp(callId, userId);
  if (!ref) return;
  if (joining) {
    await setDoc(ref, {
      userId,
      createdAtIso: new Date().toISOString(),
    });
    return;
  }
  await deleteDoc(ref);
}
