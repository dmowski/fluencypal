import { getDB } from '@/app/api/config/firebase';
import { MEMBERS_COLLECTION } from './paths';
import { VOICE_CHAT_REREQUEST_COOLDOWN_DAYS, VoiceChatMember } from '../types';

export const getMember = async (uid: string): Promise<VoiceChatMember | null> => {
  const db = getDB();
  const snap = await db.collection(MEMBERS_COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as VoiceChatMember;
};

export const listPendingMembers = async (): Promise<VoiceChatMember[]> => {
  const db = getDB();
  const snap = await db.collection(MEMBERS_COLLECTION).where('status', '==', 'pending').get();
  return snap.docs.map((d) => d.data() as VoiceChatMember);
};

export const listApprovedMembers = async (): Promise<VoiceChatMember[]> => {
  const db = getDB();
  const snap = await db.collection(MEMBERS_COLLECTION).where('status', '==', 'approved').get();
  return snap.docs.map((d) => d.data() as VoiceChatMember);
};

export const getReRequestAvailableAtIso = (member: VoiceChatMember | null): string | null => {
  if (!member || member.status !== 'rejected' || !member.decidedAtIso) return null;
  const decidedAt = new Date(member.decidedAtIso).getTime();
  const availableAt = decidedAt + VOICE_CHAT_REREQUEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return new Date(availableAt).toISOString();
};

export const canRequestAccessNow = (member: VoiceChatMember | null): boolean => {
  if (!member) return true;
  if (member.status === 'pending' || member.status === 'approved') return false;
  const availableAt = getReRequestAvailableAtIso(member);
  if (!availableAt) return true;
  return Date.now() >= new Date(availableAt).getTime();
};
