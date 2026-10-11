import { ThreadsMessage } from '@/features/Chat/type';

export const FLUENCY_CALL_CHAT_PAGE = 20;

/** Alex's group-call intro. Same clip as the landing page. */
export const FLUENCY_CALL_WELCOME_VIDEO_SRC = '/group_call/intro2.webm';

export type FluencyCallCardCall = {
  id: string;
  title: string;
  dateLabel: string;
  participantCount: number;
  isJoining: boolean;
  isLive: boolean;
};

export type FluencyCallCardViewProps = {
  messages: ThreadsMessage[];
  onSendMessage: (text: string) => Promise<void>;
  canJoin: boolean;
  paidNotice: boolean;
  /** Opens the shared chat expanded. Used by an old chat link. */
  initialChatExpanded?: boolean;
  /** Real host intro. */
  welcomeVideoSrc: string;
};
