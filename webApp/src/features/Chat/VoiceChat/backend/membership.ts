import { getDB } from '@/app/api/config/firebase';
import { sentSupportTelegramMessage } from '@/app/api/telegram/sendTelegramMessage';
import { MEMBERS_COLLECTION } from './paths';
import { assertApprover, assertCanRequestAccess, VoiceChatAccessError } from './access';
import { createIntroMessageFromMember } from './messages';
import {
  canRequestAccessNow,
  getMember,
  getReRequestAvailableAtIso,
  listPendingMembers,
} from './membersStore';
import { VoiceChatDecision, VoiceChatMember } from '../types';

export {
  getMember,
  listPendingMembers,
  getReRequestAvailableAtIso,
  canRequestAccessNow,
} from './membersStore';

export const requestVoiceChatAccess = async (params: {
  uid: string;
  introAudioPath: string;
  introDurationSec: number;
  introContentType: string;
}): Promise<VoiceChatMember> => {
  await assertCanRequestAccess(params.uid);
  const existing = await getMember(params.uid);
  if (!canRequestAccessNow(existing)) {
    if (existing?.status === 'pending') {
      throw new VoiceChatAccessError('Access request already pending', 409);
    }
    if (existing?.status === 'approved') {
      throw new VoiceChatAccessError('Already approved', 409);
    }
    throw new VoiceChatAccessError('Please wait before requesting again', 429);
  }

  const member: VoiceChatMember = {
    userId: params.uid,
    status: 'pending',
    introAudioPath: params.introAudioPath,
    introDurationSec: params.introDurationSec,
    introContentType: params.introContentType,
    requestedAtIso: new Date().toISOString(),
  };

  const db = getDB();
  await db.collection(MEMBERS_COLLECTION).doc(params.uid).set(member);

  try {
    await sentSupportTelegramMessage({
      message: `Voice Chat access requested by ${params.uid} (intro ~${params.introDurationSec}s)`,
      userId: params.uid,
    });
  } catch (error) {
    console.error('Telegram notify failed for voice chat request', error);
  }

  return member;
};

export const decideMembership = async (params: {
  approverId: string;
  targetUserId: string;
  decision: VoiceChatDecision;
}): Promise<VoiceChatMember> => {
  await assertApprover(params.approverId);
  const member = await getMember(params.targetUserId);
  if (!member || member.status !== 'pending') {
    throw new VoiceChatAccessError('No pending request for this user', 404);
  }

  const decidedAtIso = new Date().toISOString();
  let next: VoiceChatMember = {
    ...member,
    status: params.decision,
    decidedAtIso,
    decidedBy: params.approverId,
  };

  if (params.decision === 'approved') {
    const message = await createIntroMessageFromMember(next);
    next = {
      ...next,
      postedIntroMessageId: message.id,
    };
  }

  const db = getDB();
  await db.collection(MEMBERS_COLLECTION).doc(params.targetUserId).set(next);
  return next;
};
