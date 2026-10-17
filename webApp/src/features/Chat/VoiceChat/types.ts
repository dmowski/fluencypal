import { SpeakingNotificationSettings } from '@/features/Settings/userSettings';

export const SPEAKING_CLUB_FOUNDER_UID = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
export const SPEAKING_CLUB_ALEX_EMAIL = 'dmowski.alex@gmail.com';

export const ROOM_DRAFT_STORAGE_KEY = 'voice-chat-room-draft';

export type RoomReviewMode = 'allMembers' | 'alexOnly';
export type RoomMembershipStatus = 'pending' | 'approved' | 'rejected';
export type ReviewDecision = 'approved' | 'rejected';

export type SpeakingNotificationKind = 'newMessages' | 'reviewJoiners' | 'newRooms';

export type SpeakingNotificationPrefs = SpeakingNotificationSettings;

/** A room can only turn a global choice off. */
export interface RoomNotificationNarrowing {
  browserEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  newMessages: boolean;
  reviewJoiners: boolean;
}

export interface SpeakingRoom {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  previewImageUrl: string;
  reviewMode: RoomReviewMode;
  joinPromptMarkdown: string;
  isPublic: boolean;
  rulesMarkdown: string;
  discussMarkdown: string;
  creatorId: string;
  createdAtIso: string;
  updatedAtIso: string;
  memberCount: number;
  messagesLast7Days: number;
}

export interface RoomMember {
  userId: string;
  status: RoomMembershipStatus;
  username: string;
  avatarUrl: string;
  description: string;
  introAudioPath: string;
  introTranscript: string;
  introSuggestion: string;
  introDurationSec: number;
  requestedAtIso: string;
  decidedAtIso?: string;
  lastOnlineIso?: string;
  approvals: Record<string, ReviewDecision>;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  audioPath: string;
  durationSec: number;
  transcript: string;
  correctedTranscript: string;
  createdAtIso: string;
}

export type AppNotificationKind = 'newMessage' | 'reviewJoiner' | 'newRoom';

export interface AppNotification {
  id: string;
  kind: AppNotificationKind;
  roomId: string;
  roomTitle: string;
  actorName: string;
  /** Set when a review has been decided. */
  decision?: ReviewDecision;
  /** Who this note is for. */
  audience: 'applicant' | 'reviewer' | 'member';
  createdAtIso: string;
  read: boolean;
}

export interface RoomMemberPreview {
  userId: string;
  username: string;
  avatarUrl: string;
}

export interface RoomListItem {
  room: SpeakingRoom;
  unreadCount: number;
  membershipStatus: RoomMembershipStatus | null;
  isAdmin: boolean;
  memberPreviews: RoomMemberPreview[];
}

export interface PublicSpeakingClub {
  slug: string;
  title: string;
  subtitle: string;
  previewImageUrl: string;
  reviewMode: RoomReviewMode;
  joinPromptMarkdown: string;
  rulesMarkdown: string;
  discussMarkdown: string;
  memberCount: number;
  messagesLast7Days: number;
}

export interface RoomDraft {
  title: string;
  subtitle: string;
  reviewMode: RoomReviewMode;
  joinPromptMarkdown: string;
  isPublic: boolean;
  rulesMarkdown: string;
  discussMarkdown: string;
  previewUrls: string[];
  selectedPreviewUrl: string;
}

export const DEFAULT_JOIN_PROMPT = `Please tell us a little about yourself.

Where are you from, and what do you enjoy about this topic? A recording of about three minutes helps everyone get a real sense of who you are.`;

export const DEFAULT_RULES = `Be kind.

One person speaks at a time. It is fine to listen first. Disagree with ideas, not with people.`;

export const DEFAULT_DISCUSS = `We talk about everyday things connected to this topic.

You do not need perfect English. Come as you are, listen first if you like, and speak when you feel ready.`;

export const emptyRoomDraft = (): RoomDraft => ({
  title: '',
  subtitle: '',
  reviewMode: 'allMembers',
  joinPromptMarkdown: DEFAULT_JOIN_PROMPT,
  isPublic: false,
  rulesMarkdown: DEFAULT_RULES,
  discussMarkdown: DEFAULT_DISCUSS,
  previewUrls: [],
  selectedPreviewUrl: '',
});
