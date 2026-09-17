import { sendAnalyticsEvent } from './sendAnalyticsEvent';
import {
  AuthProvider,
  AuthResult,
  CallState,
  PermissionKind,
  PermissionState,
} from './types';

const grantedKinds = new Set<PermissionKind>();
let lastPromptAt = 0;

export const sendPermission = (input: {
  kind: PermissionKind;
  state: PermissionState;
}): void => {
  if (input.state === 'granted') {
    if (grantedKinds.has(input.kind)) return;
    grantedKinds.add(input.kind);
  }
  if (input.state === 'prompt') {
    const now = Date.now();
    if (now - lastPromptAt < 2000) return;
    lastPromptAt = now;
  }
  sendAnalyticsEvent({
    name: 'permission',
    permissionKind: input.kind,
    permissionState: input.state,
  });
};

export const sendCallState = (input: {
  state: CallState;
  conversationId?: string | null;
  reason?: string;
  userMessageCount?: number;
}): void => {
  sendAnalyticsEvent({
    name: 'call_state',
    callState: input.state,
    conversationId: input.conversationId || undefined,
    callReason: input.reason,
    userMessageCount: input.userMessageCount,
  });
};

export const sendAuthAttempt = (input: {
  provider: AuthProvider;
  result: AuthResult;
}): void => {
  sendAnalyticsEvent({
    name: 'auth_attempt',
    authProvider: input.provider,
    authResult: input.result,
  });
};

const sentUiErrors = new Set<string>();

export const sendUiError = (errorCode: string): void => {
  const code = errorCode.trim().slice(0, 48);
  if (!code || sentUiErrors.has(code)) return;
  sentUiErrors.add(code);
  sendAnalyticsEvent({
    name: 'ui_error',
    errorCode: code,
  });
};

export const resetOutcomeEventsForTests = (): void => {
  grantedKinds.clear();
  lastPromptAt = 0;
  sentUiErrors.clear();
};
