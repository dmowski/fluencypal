import { TextAiModel, TextUsageEvent } from "./ai";
import { ChatMessage } from "./conversation";
import { SupportedLanguage } from "./lang";

export interface AiRequest {
  userMessage: string;
  systemMessage: string;
  languageCode: SupportedLanguage;
  model: TextAiModel;
}

export interface AiResponse {
  aiResponse: string;
  usageEvent: TextUsageEvent;
}

export interface GetEphemeralTokenResponse {
  ephemeralKey: string;
}

export interface SendSdpOfferRequest {
  model: string;
  sdp: string;
}

export interface SendSdpOfferResponse {
  sdpResponse: string;
}
