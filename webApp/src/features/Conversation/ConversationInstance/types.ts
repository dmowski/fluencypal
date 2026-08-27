import { AiVoice, RealTimeModel } from '@/features/Ai/ai';
import { ConversationMessage, MessagesOrderMap } from '@/features/Conversation/conversation';
import { UsageLog } from '@/features/Usage/usage';
import { SupportedLanguage } from '@/features/Lang/lang';

export interface ConversationConfig {
  model: RealTimeModel;
  initInstruction: string;
  onOpen: () => void;
  onMessage: (message: ConversationMessage) => void;
  onAddDelta: (id: string, delta: string, isBot: boolean) => void;
  setIsAiSpeaking: (speaking: boolean) => void;
  setIsUserSpeaking: (speaking: boolean) => void;
  onMessageOrder: (orderPart: MessagesOrderMap) => void;
  isMuted: boolean;
  onAddUsage: ({}: UsageLog) => void;
  languageCode: SupportedLanguage;
  voice?: AiVoice;
  isVolumeOn: boolean;

  webCamDescription?: string;

  // used for sendSdpOffer: WebRTC auth
  getAuthToken: (forceRefresh?: boolean) => Promise<string>;

  generateTextWithAi: ({}: { userMessage: string; systemMessage: string }) => Promise<string>;

  playAudio: (textToPlay: string, voice: AiVoice, instruction: string) => Promise<void>;

  conversationId: string;
  userPricePerHourUsd: number;

  /** Custom realtime WebSocket: surface fatal connection/auth errors to the UI. */
  onTransportError?: (message: string) => void;
}

export type ConversationInstance = {
  addThreadsMessage: (message: string) => void;

  // Terminate the conversation and clean up resources
  closeHandler: () => void;

  // add bot message
  triggerAiResponse: () => Promise<void>;
  toggleMute: (mute: boolean) => void;
  toggleVolume: (isVolumeOn: boolean) => void;
  switchMicrophone: (deviceId: string | null) => Promise<void>;
  lockVolume: () => void;
  unlockVolume: () => void;
  sendWebCamDescription: (description: string) => void;
  sendCorrectionInstruction: (correction: string) => void;

  addUserMessageDelta: (delta: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;

  restartConversation: () => Promise<void>;

  /** Custom realtime: call after communicatorRef is assigned if session.ready arrived early. */
  flushSessionReady?: () => void;
};
