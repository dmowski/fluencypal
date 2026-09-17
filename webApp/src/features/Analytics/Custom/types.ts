import { CtaIntent } from './classifyCta';

export const ANALYTICS_EVENT_NAMES = [
  'page_view',
  'identify',
  'click',
  'scroll_depth',
  'page_leave',
  'conversation_start',
  'speech_start',
  'paywall_view',
  'checkout_start',
  'permission',
  'call_state',
  'auth_attempt',
  'ui_error',
  'dead_click',
] as const;
export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export const SPEECH_SURFACES = ['quiz', 'lesson', 'conversation'] as const;
export type SpeechSurface = (typeof SPEECH_SURFACES)[number];

export const PERMISSION_KINDS = ['mic', 'camera'] as const;
export type PermissionKind = (typeof PERMISSION_KINDS)[number];

export const PERMISSION_STATES = ['prompt', 'granted', 'denied', 'dismissed'] as const;
export type PermissionState = (typeof PERMISSION_STATES)[number];

export const CALL_STATES = ['connecting', 'connected', 'failed', 'ended'] as const;
export type CallState = (typeof CALL_STATES)[number];

export const AUTH_PROVIDERS = ['google', 'email'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const AUTH_RESULTS = ['opened', 'cancelled', 'error', 'success'] as const;
export type AuthResult = (typeof AUTH_RESULTS)[number];

export type AnalyticsUiAction = {
  role: string;
  name: string;
  disabled: boolean;
};

export type AnalyticsUiContext = {
  screenId: string;
  heading: string;
  dialog: string;
  alerts: string[];
  primary: string;
  actions: AnalyticsUiAction[];
};

export const ANALYTICS_SOURCE_APPS = ['landing', 'webapp'] as const;
export type AnalyticsSourceApp = (typeof ANALYTICS_SOURCE_APPS)[number];

export type AnalyticsScreen = {
  width: number;
  height: number;
};

export type AnalyticsClientEvent = {
  name: AnalyticsEventName;
  sourceApp: AnalyticsSourceApp;
  path: string;
  href: string;
  title: string;
  referrer: string;
  language: string;
  screen: AnalyticsScreen;
  authUserId?: string;
  buttonId?: string;
  buttonText?: string;
  buttonHref?: string;
  tagName?: string;
  ctaId?: string;
  ctaIntent?: CtaIntent;
  scrollPct?: number;
  durationMs?: number;
  maxScrollPct?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gclid?: string;
  referrerHost?: string;
  conversationId?: string;
  speechSurface?: SpeechSurface;
  uiContext?: AnalyticsUiContext;
  uiContextHash?: string;
  permissionKind?: PermissionKind;
  permissionState?: PermissionState;
  callState?: CallState;
  callReason?: string;
  userMessageCount?: number;
  authProvider?: AuthProvider;
  authResult?: AuthResult;
  errorCode?: string;
};

export type AnalyticsDeviceInfo = {
  userAgent: string;
  os: string;
  browser: string;
};

export type AnalyticsEventDoc = {
  visitorId: string;
  authUserId: string | null;
  name: AnalyticsEventName;
  sourceApp: AnalyticsSourceApp;
  path: string;
  href: string;
  title: string;
  referrer: string;
  host: string;
  createdAtIso: string;
  createdAtMs: number;
  dayKey: string;
  userAgent: string;
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  buttonId: string | null;
  buttonText: string | null;
  buttonHref: string | null;
  tagName: string | null;
  ctaId: string | null;
  ctaIntent: string | null;
  scrollPct: number | null;
  durationMs: number | null;
  maxScrollPct: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid: string | null;
  referrerHost: string | null;
  country: string | null;
  conversationId: string | null;
  speechSurface: string | null;
  uiContext: AnalyticsUiContext | null;
  uiContextHash: string | null;
  permissionKind: string | null;
  permissionState: string | null;
  callState: string | null;
  callReason: string | null;
  userMessageCount: number | null;
  authProvider: string | null;
  authResult: string | null;
  errorCode: string | null;
};

export type AnalyticsVisitorDoc = {
  visitorId: string;
  createdAtIso: string;
  lastSeenAtIso: string;
  firstPath: string;
  lastPath: string;
  lastEventName: AnalyticsEventName;
  lastHost: string;
  firstHost: string;
  firstSourceApp: AnalyticsSourceApp;
  lastSourceApp: AnalyticsSourceApp;
  eventCount: number;
  userAgent: string;
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  authUserId: string | null;
  lastReferrer: string;
  reachedLanding: boolean;
  reachedApp: boolean;
  reachedAuth: boolean;
  reachedQuiz: boolean;
  reachedPractice: boolean;
  reachedConversation?: boolean;
  reachedSpeech?: boolean;
  reachedPaywall?: boolean;
  reachedCheckout?: boolean;
  clickedQuizCta?: boolean;
  clickedSignInCta?: boolean;
  maxScrollPct?: number;
  landingDurationMs?: number;
  country?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrerHost?: string | null;
};

export type JourneyDropOffRow = {
  path: string;
  count: number;
};

export type JourneyFunnel = {
  landing: number;
  app: number;
  auth: number;
  quiz: number;
  practice: number;
  conversation: number;
  speech: number;
  paywall: number;
  checkout: number;
};

export type JourneyOsRow = {
  os: string;
  count: number;
};

export type JourneySummary = {
  dayKey: string;
  visitorCount: number;
  eventCount: number;
  dropOff: JourneyDropOffRow[];
  funnel: JourneyFunnel;
  os: JourneyOsRow[];
  visitors: AnalyticsVisitorDoc[];
};

export type IngestEventRequest = {
  visitorId: string;
  event: AnalyticsClientEvent;
};

export type IngestEventResponse = {
  ok: boolean;
  error?: string;
};

export type JourneySummaryRequest = {
  type: 'summary';
  fromIso: string;
  toIso: string;
  dayKey: string;
};

export type JourneyVisitorRequest = {
  type: 'visitor';
  visitorId: string;
};

export type JourneyRequest = JourneySummaryRequest | JourneyVisitorRequest;

export type JourneySummaryResponse = {
  type: 'summary';
  summary: JourneySummary;
};

export type JourneyVisitorResponse = {
  type: 'visitor';
  visitor: AnalyticsVisitorDoc | null;
  events: AnalyticsEventDoc[];
};

export type JourneyResponse = JourneySummaryResponse | JourneyVisitorResponse;
