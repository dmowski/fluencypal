import { hasGuestReply } from '@/features/Auth/rolePlayGuestReplyStorage';
import { isJustTalkHandoff } from './justTalkHandoff';

export const isRolePlayGuestReady = (rolePlayId: string | null | undefined): boolean =>
  Boolean(rolePlayId && hasGuestReply(rolePlayId));

export const canEnterPracticeAsGuest = ({
  justTalk,
  rolePlayId,
}: {
  justTalk: string | null | undefined;
  rolePlayId: string | null | undefined;
}): boolean => isJustTalkHandoff(justTalk) || isRolePlayGuestReady(rolePlayId);
