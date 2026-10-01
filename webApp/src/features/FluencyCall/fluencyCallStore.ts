import { deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/features/Firebase/firebaseDb';
import { ensureFluencyCallChat } from './fluencyCallChat';
import { FluencyCall, FluencyCallRequestStatus } from './types';

export async function createFluencyCall({
  userId,
  startsAtIso,
  link,
}: {
  userId: string;
  startsAtIso: string;
  link: string;
}) {
  const ref = doc(db.collections.fluencyCalls());
  const nowIso = new Date().toISOString();
  const call: FluencyCall = {
    id: ref.id,
    startsAtIso,
    link,
    status: 'scheduled',
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    stoppedAtIso: null,
  };
  await setDoc(ref, call);
  await ensureFluencyCallChat(userId, ref.id);
  return call;
}

export async function updateFluencyCallSchedule(
  call: FluencyCall,
  { startsAtIso, link }: { startsAtIso: string; link: string },
) {
  const ref = db.documents.fluencyCall(call.id);
  if (!ref) return;
  await setDoc(ref, {
    ...call,
    startsAtIso,
    link,
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
