export const VOICE_CHAT_MESSAGE_TTL_DAYS = 4;
export const VOICE_CHAT_REREQUEST_COOLDOWN_DAYS = 10;
export const VOICE_CHAT_INTRO_MIN_SECONDS = 5;
export const VOICE_CHAT_INTRO_TARGET_SECONDS = 30;
export const VOICE_CHAT_FOUNDER_UID = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';

export const VOICE_CHAT_PREVIEW_IMAGE_URL =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1785015399032-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export type VoiceChatMemberStatus = 'pending' | 'approved' | 'rejected';
export type VoiceChatDecision = 'approved' | 'rejected';

export interface VoiceChatConfig {
  approverIds: string[];
}

export interface VoiceChatEntitlement {
  isPaid: boolean;
  isGameWinner: boolean;
  updatedAtIso: string;
}

export interface VoiceChatMember {
  userId: string;
  status: VoiceChatMemberStatus;
  introAudioPath: string;
  introDurationSec: number;
  introContentType: string;
  requestedAtIso: string;
  decidedAtIso?: string;
  decidedBy?: string;
  postedIntroMessageId?: string;
}

export interface VoiceChatMessage {
  id: string;
  senderId: string;
  parentMessageId: string;
  audioPath: string;
  durationSec: number;
  contentType: string;
  createdAtIso: string;
  createdAtUtc: number;
  isIntro?: boolean;
}

export type VoiceChatReadMetadata = Record<string, boolean>;

export interface VoiceChatApiError {
  error: string;
}

export interface VoiceChatOkResponse {
  ok: true;
}

/** Route params: DELETE/GET `/messages/[messageId]` (+ `/audio`) */
export interface VoiceChatMessageIdParams {
  messageId: string;
}

/** Route params: GET `/pending/[userId]/intro-audio` */
export interface VoiceChatPendingUserIdParams {
  userId: string;
}

export type VoiceChatMessageIdRouteContext = {
  params: Promise<VoiceChatMessageIdParams>;
};

export type VoiceChatPendingUserIdRouteContext = {
  params: Promise<VoiceChatPendingUserIdParams>;
};

/** POST `/decide` */
export interface VoiceChatDecideRequest {
  targetUserId: string;
  decision: VoiceChatDecision;
}

export interface VoiceChatDecideResponse {
  member: VoiceChatMember;
}

/** POST `/mark-listened` */
export interface VoiceChatMarkListenedRequest {
  messageId: string;
}

export type VoiceChatMarkListenedResponse = VoiceChatOkResponse;

/** POST `/validate-paid` */
export interface VoiceChatValidatePaidRequest {
  userId?: string;
}

export interface VoiceChatValidatePaidResponse {
  entitlement: VoiceChatEntitlement;
}

/** GET `/validate-paid` (cron batch reconcile) */
export interface VoiceChatValidatePaidCronResponse {
  paidUserIds: string[];
}

/** POST|GET `/validate-game-winner` */
export interface VoiceChatValidateGameWinnerResponse {
  winnerIds: string[];
}

/** GET `/status` */
export interface VoiceChatStatusResponse {
  isEntitled: boolean;
  isPaid: boolean;
  isGameWinner: boolean;
  isApprover: boolean;
  member: VoiceChatMember | null;
  canRequestAccess: boolean;
  reRequestAvailableAtIso: string | null;
  unreadCount: number;
  pendingMembers: VoiceChatMember[];
}

/** GET `/messages` */
export interface VoiceChatListMessagesResponse {
  messages: VoiceChatMessage[];
  listenedMessageIds: string[];
  memberUserIds: string[];
}

/** POST `/messages` (multipart: audio, durationSec, parentMessageId) */
export interface VoiceChatSendMessageForm {
  audio: File;
  durationSec: number;
  parentMessageId: string;
}

export interface VoiceChatSendMessageResponse {
  message: VoiceChatMessage;
}

/** POST `/request-access` (multipart: audio, durationSec) */
export interface VoiceChatRequestAccessForm {
  audio: File;
  durationSec: number;
}

export interface VoiceChatRequestAccessResponse {
  member: VoiceChatMember;
}

/** DELETE `/messages/[messageId]` and GET `/cleanup` */
export interface VoiceChatDeletedIdsResponse {
  deletedIds: string[];
}

export type VoiceChatDeleteMessageResponse = VoiceChatDeletedIdsResponse;
export type VoiceChatCleanupResponse = VoiceChatDeletedIdsResponse;
