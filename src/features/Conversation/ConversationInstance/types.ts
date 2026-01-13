import { AiVoice, RealTimeModel } from "@/common/ai";
import { ChatMessage, MessagesOrderMap } from "@/common/conversation";
import { UsageLog } from "@/common/usage";
import { SupportedLanguage } from "@/features/Lang/lang";

export interface ConversationConfig {
  model: RealTimeModel;
  initInstruction: string;
  onOpen: () => void;
  onMessage: (message: ChatMessage) => void;
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
}

export type ConversationInstance = {
  closeHandler: () => void;
  addUserChatMessage: (message: string) => void;
  triggerAiResponse: () => void;
  toggleMute: (mute: boolean) => void;
  toggleVolume: (isVolumeOn: boolean) => void;
  sendWebCamDescription: (description: string) => void;
  sendCorrectionInstruction: (correction: string) => void;
};
