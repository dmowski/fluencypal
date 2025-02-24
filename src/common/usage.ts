import { RealTimeModel, TextAiModel, TextUsageEvent, UsageEvent } from "./ai";

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  usedBalance: number; // $
  balance: number; // $
}

interface BaseUsageLog {
  usageId: string;
  price: number;
  createdAt: number;
  language: string;
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

export type UsageLog = RealtimeUsageLog | TextUsageLog;
