import { RealTimeModel, TextAiModel, TextUsageEvent, UsageEvent } from "./ai";
import { SupportedLanguage } from "./lang";

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  usedBalance: number; // $
  balance: number; // $
}

interface BaseUsageLog {
  usageId: string;
  price: number;
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
  price: number;
  size: number;
  duration: number;
}

export type UsageLog = RealtimeUsageLog | TextUsageLog | AudioUsageLog;

export type PaymentLogType = "welcome" | "user" | "gift";

export const WELCOME_BONUS = 15;
export interface PaymentLog {
  id: string;
  amountAdded: number;
  createdAt: number;
  type: PaymentLogType;
}
