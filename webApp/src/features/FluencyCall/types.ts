export type FluencyCallStatus = 'scheduled' | 'stopped';

export interface FluencyCall {
  id: string;
  startsAtIso: string;
  link: string;
  status: FluencyCallStatus;
  createdAtIso: string;
  updatedAtIso: string;
  stoppedAtIso: string | null;
  /** Practice language. Missing on older calls, which are English. */
  languageCode?: string;
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
  /** Practice language. Missing on older requests, which are English. */
  languageCode?: string;
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
