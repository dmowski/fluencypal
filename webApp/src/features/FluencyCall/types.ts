export type FluencyCallStatus = 'scheduled' | 'stopped';

export interface FluencyCall {
  id: string;
  startsAtIso: string;
  link: string;
  status: FluencyCallStatus;
  createdAtIso: string;
  updatedAtIso: string;
  stoppedAtIso: string | null;
}

export interface FluencyCallRsvp {
  userId: string;
  createdAtIso: string;
}

export type FluencyCallRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FluencyCallRequest {
  id: string;
  userId: string;
  email?: string;
  startsAtIso: string;
  createdAtIso: string;
  status: FluencyCallRequestStatus;
}

export interface CallCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

/** One month of group calls, bought separately from practice hours. */
export interface FluencyCallAccount {
  activeUntilIso: string | null;
  updatedAt?: string;
}

export type CallClockRelative = 'today' | 'tomorrow' | 'weekday';

export interface CallClockLabel {
  month: string;
  day: string;
  time: string;
  relative: CallClockRelative;
  weekday: string;
}
