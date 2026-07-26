import { getVoiceChatConfig, isVoiceChatApprover } from './config';
import { getEntitlement, isUserEntitled, validatePaidForUser } from './entitlements';
import {
  canRequestAccessNow,
  getMember,
  getReRequestAvailableAtIso,
  listPendingMembers,
} from './membersStore';
import { countUnread } from './messages';
import { VoiceChatStatusResponse } from '../types';

export const getVoiceChatStatus = async (uid: string): Promise<VoiceChatStatusResponse> => {
  await getVoiceChatConfig();
  await validatePaidForUser(uid);

  const [entitled, entitlement, member, isApprover] = await Promise.all([
    isUserEntitled(uid),
    getEntitlement(uid),
    getMember(uid),
    isVoiceChatApprover(uid),
  ]);

  const pendingMembers = isApprover ? await listPendingMembers() : [];
  const unreadCount =
    member?.status === 'approved' ? await countUnread(uid) : 0;

  return {
    isEntitled: entitled,
    isPaid: entitlement?.isPaid ?? false,
    isGameWinner: entitlement?.isGameWinner ?? false,
    isApprover,
    member,
    canRequestAccess: entitled && canRequestAccessNow(member),
    reRequestAvailableAtIso: getReRequestAvailableAtIso(member),
    unreadCount,
    pendingMembers,
  };
};
