import {
  RealTimeModel,
  TextAiModel,
  TextToAudioModal,
  TextUsageEvent,
  TranscriptAiModel,
  UsageEvent,
} from "./ai";
import { SupportedLanguage } from "./lang";

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  balanceHours: number; // hours
  usedHours: number; // hours
}

interface BaseUsageLog {
  usageId: string;
  priceUsd: number;
  priceHours: number;
  createdAt: number;
  languageCode: SupportedLanguage;
}
export interface RealtimeUsageLog extends BaseUsageLog {
  type: "realtime";
  usageEvent: UsageEvent;
  model: RealTimeModel;
}

export interface TextUsageLog extends BaseUsageLog {
  type: "text";
  usageEvent: TextUsageEvent;
  model: TextAiModel;
}

export interface AudioUsageLog extends BaseUsageLog {
  type: "audio";
  size: number;
  duration: number;
}

export interface TranscriptUsageLog extends BaseUsageLog {
  type: "transcript";
  duration: number;
  transcriptSize: number;
  model: TranscriptAiModel;
}

export interface TextToAudioUsageLog extends BaseUsageLog {
  type: "text_to_audio";
  duration: number;
  transcriptSize: number;
  model: TextToAudioModal;
}

export type UsageLog =
  | RealtimeUsageLog
  | TextUsageLog
  | AudioUsageLog
  | TranscriptUsageLog
  | TextToAudioUsageLog;

export type PaymentLogType = "welcome" | "user" | "gift";

export const WELCOME_BONUS = 6;
export interface PaymentLog {
  id: string;
  amountAdded: number;
  currency: string;
  createdAt: number;
  type: PaymentLogType;
  amountOfHours: number;
  receiptUrl: string;
}
