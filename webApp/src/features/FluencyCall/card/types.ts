import { ReactNode } from 'react';
import { ThreadsMessage } from '@/features/Chat/type';
import { SupportedLanguage } from '@/features/Lang/lang';

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
  /** Featured call first, then the other listed calls, earliest first. */
  calls: FluencyCallCardCall[];
  languageCode: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  timeZoneLabel: string;
  /** Real Meet URL, or null when this language has no saved link. */
  meetUrl: string | null;
  messages: ThreadsMessage[];
  onToggleJoining: (callId: string, joining: boolean) => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
  canJoin: boolean;
  requestedAtLabel: string | null;
  paidNotice: boolean;
  onInitiateCall: () => void;
  /** Opens the shared chat expanded. Used by an old chat link. */
  initialChatExpanded?: boolean;
  notice?: string | null;
  /** Names for one listed call, shown under that time in Upcoming conversations. */
  callPeople?: (call: FluencyCallCardCall) => ReactNode;
  /** Real host intro. Omitted when the app has no video file. */
  welcomeVideoSrc?: string | null;
};
