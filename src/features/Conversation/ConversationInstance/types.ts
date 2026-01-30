import { AiVoice, RealTimeModel } from '@/common/ai';
import { ConversationMessage, MessagesOrderMap } from '@/common/conversation';
import { UsageLog } from '@/common/usage';
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
  getAuthToken: () => Promise<string>;

  generateTextWithAi: ({}: { userMessage: string; systemMessage: string }) => Promise<string>;

  playAudio: (textToPlay: string, voice: AiVoice, instruction: string) => Promise<void>;

  conversationId: string;
}

export type ConversationInstance = {
  addThreadsMessage: (message: string) => void;

  // Terminate the conversation and clean up resources
  closeHandler: () => void;

  // add bot message
  triggerAiResponse: () => Promise<void>;
  toggleMute: (mute: boolean) => void;
  toggleVolume: (isVolumeOn: boolean) => void;
  lockVolume: () => void;
  unlockVolume: () => void;
  sendWebCamDescription: (description: string) => void;
  sendCorrectionInstruction: (correction: string) => void;

  addUserMessageDelta: (delta: string) => void;
  completeUserMessageDelta: ({ removeMessage }: { removeMessage?: boolean }) => void;
};
