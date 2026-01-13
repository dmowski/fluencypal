"use client";
import { ConversationConfig, ConversationInstance } from "./types";

export const initTextConversation = async ({
  model,
  initInstruction,
  onMessage,
  onOpen,
  setIsAiSpeaking,
  setIsUserSpeaking,
  isMuted,
  onAddDelta,
  onAddUsage,
  languageCode,
  voice,
  isVolumeOn,
  getAuthToken,
  onMessageOrder,
  webCamDescription,
  generateTextWithAi,
}: ConversationConfig): Promise<ConversationInstance> => {
  const closeEvent = () => {};
  const errorEvent = (e: any) => console.error("Data channel error", e);

  return {
    closeHandler: () => {
      closeEvent();
    },

    addUserChatMessage: async (message: string) => {},
    triggerAiResponse: async () => {},

    toggleMute: () => {},
    toggleVolume: () => {},

    sendWebCamDescription: async (description: string) => {},

    sendCorrectionInstruction: async (instruction: string) => {},
  };
};
