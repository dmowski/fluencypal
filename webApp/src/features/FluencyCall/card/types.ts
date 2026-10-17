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
  canJoin: boolean;
  paidNotice: boolean;
  welcomeVideoSrc: string;
  onOpenVoiceChat: () => void;
};
