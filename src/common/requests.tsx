import { TextAiModel, TextUsageEvent } from "./ai";
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

export interface InitBalanceRequest {
  languageCode: SupportedLanguage;
}

export interface InitBalanceResponse {
  done: boolean;
}

export interface TelegramRequest {
  userEmail: string;
  message: string;
  languageCode: SupportedLanguage;
}

export interface TelegramResponse {
  error: string;
}

export interface GetEphemeralTokenRequest {
  model: string;
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

export interface GetAudioUrlRequest {
  text: string;
  languageCode: SupportedLanguage;
}

export interface GetAudioUrlResponse {
  text: string;
  url: string;
  price: number;
  duration: number;
}

export interface StripeCreateCheckoutRequest {
  languageCode: SupportedLanguage;
  userId: string;
  amount: number;
}

export interface StripeCreateCheckoutResponse {
  sessionUrl: string | null;
  error: string | null;
}
