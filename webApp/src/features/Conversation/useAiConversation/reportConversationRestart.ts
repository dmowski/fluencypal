import * as Sentry from '@sentry/nextjs';
import { ConversationType } from '@/features/Conversation/conversation';
import { RealtimeUsageSnapshot } from './extractRealtimeUsageSnapshot';

export type ConversationRestartTrigger =
  | 'message_count_threshold'
  | 'usage_cache_threshold';

export type ConversationRestartReport = {
  trigger: ConversationRestartTrigger;
  conversationId: string | null;
  conversationLength: number;
  messagesToRestart: number;
  messagesUntilCountRestart: number;
  currentMode: ConversationType;
  lastMessagePreview?: string;
  usage?: RealtimeUsageSnapshot;
  seededMessageCount?: number;
};

export function reportConversationRestart(report: ConversationRestartReport): void {
  const isOnMessageCountBoundary = report.conversationLength % report.messagesToRestart === 0;

  Sentry.addBreadcrumb({
    category: 'conversation',
    level: 'info',
    message: 'Conversation restart',
    data: {
      trigger: report.trigger,
      conversationLength: report.conversationLength,
      messagesUntilCountRestart: report.messagesUntilCountRestart,
      currentMode: report.currentMode,
      usage: report.usage,
    },
  });

  Sentry.captureMessage('Conversation restart triggered', {
    level: 'info',
    tags: {
      area: 'conversation',
      trigger: report.trigger,
      mode: report.currentMode,
      belowMessageCountThreshold: String(!isOnMessageCountBoundary),
    },
    extra: {
      ...report,
      // Flatten usage for Sentry discover (nested objects are harder to filter).
      ...(report.usage ?? {}),
    },
  });
}

export function reportLegacyRealtimeAudioInputThreshold(params: {
  conversationId: string;
  conversationLength: number;
  usage: RealtimeUsageSnapshot;
}): void {
  Sentry.addBreadcrumb({
    category: 'conversation',
    level: 'info',
    message: 'Realtime audio input exceeded legacy client threshold (no restart)',
    data: params,
  });
}

export function reportConversationRestartSeed(params: {
  conversationId: string;
  seededMessageCount: number;
  conversationLengthHint?: number;
}): void {
  Sentry.addBreadcrumb({
    category: 'conversation',
    level: 'info',
    message: 'Conversation context seeded after restart',
    data: params,
  });
}
