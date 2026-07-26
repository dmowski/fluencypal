import { isVoiceChatApprover } from './config';
import { isUserEntitled } from './entitlements';
import { getMember } from './membersStore';
import { VoiceChatMember } from '../types';

export class VoiceChatAccessError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

export const assertCanRequestAccess = async (uid: string): Promise<void> => {
  const entitled = await isUserEntitled(uid);
  if (!entitled) {
    throw new VoiceChatAccessError('Voice chat requires a paid membership or top-5 game rank', 403);
  }
};

export const assertVoiceChatParticipant = async (uid: string): Promise<VoiceChatMember> => {
  await assertCanRequestAccess(uid);
  const member = await getMember(uid);
  if (!member || member.status !== 'approved') {
    throw new VoiceChatAccessError('Voice chat approval required', 403);
  }
  return member;
};

export const assertApprover = async (uid: string): Promise<void> => {
  const ok = await isVoiceChatApprover(uid);
  if (!ok) {
    throw new VoiceChatAccessError('Approver access required', 403);
  }
};
