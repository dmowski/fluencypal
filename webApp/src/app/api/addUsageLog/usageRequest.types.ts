import { UsageLog } from '../../../features/Usage/usage';

export interface AddUsageLogRequest {
  usageLog: UsageLog;
}

export interface AddUsageLogResponse {
  done: boolean;
  message?: string;
}

export interface InitBalanceRequest {}

export interface InitBalanceResponse {
  done: boolean;
}
