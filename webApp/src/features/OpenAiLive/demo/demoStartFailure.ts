import { OpenAiLiveApiError } from '../api';

export type DemoConnectStage = 'mic' | 'ice' | 'offer' | 'answer';

export type DemoFailureReport = {
  errorCode: string;
  callReason: string;
};

const token = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32) || 'unknown';

const domToken = (name: string): string | null => {
  switch (name) {
    case 'NotAllowedError':
      return 'mic-denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'mic-not-found';
    case 'NotReadableError':
      return 'mic-busy';
    case 'SecurityError':
      return 'mic-blocked';
    case 'AbortError':
      return 'aborted';
    default:
      return null;
  }
};

const causeToken = (cause: unknown): string => {
  if (cause instanceof OpenAiLiveApiError) {
    return token(cause.code || `http-${cause.status}`);
  }
  if (typeof DOMException !== 'undefined' && cause instanceof DOMException) {
    return domToken(cause.name) || token(`dom-${cause.name}`);
  }
  if (cause instanceof Error) {
    if (/timed out while gathering ice/i.test(cause.message)) return 'ice-timeout';
    if (/missing local sdp/i.test(cause.message)) return 'missing-sdp';
    if (/cannot play the teacher/i.test(cause.message)) return 'no-audio';
    if (cause.message === 'Cancelled' || cause.name === 'AbortError') return 'aborted';
    if (cause.name && cause.name !== 'Error') return token(cause.name);
  }
  return 'unknown';
};

/** Short analytics tokens for a demo start or ready failure. The screen stays the same. */
export const describeDemoFailure = (cause: unknown, kind: 'start' | 'ready'): DemoFailureReport => {
  const reason = causeToken(cause);
  const prefix = kind === 'ready' ? 'demo-ready' : 'demo';
  const callPrefix = kind === 'ready' ? 'demo-ready-failed' : 'demo-start-failed';
  return {
    errorCode: `${prefix}-${reason}`.slice(0, 48),
    callReason: `${callPrefix}:${reason}`.slice(0, 80),
  };
};

export const demoTimeoutReason = (stage: DemoConnectStage): string =>
  `demo-timeout-${stage}`.slice(0, 80);
