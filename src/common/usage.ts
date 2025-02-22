import { RealTimeModel, UsageEvent } from "./ai";

export interface TotalUsageInfo {
  lastUpdatedAt: number;
  usedBalance: number; // $
  balance: number; // $
}

export interface UsageLog {
  usageId: string;
  usageEvent: UsageEvent;
  model: RealTimeModel;
  price: number;
  createdAt: number;
  language: string;
}
