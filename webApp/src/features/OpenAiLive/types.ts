export type OpenAiLiveMode = 'talk' | 'grammar';

export type OpenAiLiveAccount = {
  balanceUsdMicros: number;
  welcomeGrantedAt: string | null;
  activeSessionId?: string | null;
  updatedAt?: string;
};

export type OpenAiLiveSessionResponse = {
  sessionId: string;
  sdp: string;
};

export type OpenAiLiveUsageResponse = {
  balanceUsdMicros: number;
  chargedUsdMicros: number;
  shouldStop: boolean;
};

export type OpenAiLiveWelcomeResponse = {
  balanceUsdMicros: number;
  granted: boolean;
};

export type OpenAiLiveCheckoutResponse = {
  sessionUrl: string | null;
  error: string | null;
};

export const isOpenAiLiveMode = (value: unknown): value is OpenAiLiveMode =>
  value === 'talk' || value === 'grammar';
