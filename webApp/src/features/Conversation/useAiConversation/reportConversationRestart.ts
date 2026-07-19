import * as Sentry from '@sentry/nextjs';
import { ConversationType } from '@/features/Conversation/conversation';

export type ConversationRestartTrigger =
  | 'message_count_threshold'
  | 'usage_cache_threshold';

export type ConversationRestartReport = {
  trigger: ConversationRestartTrigger;
  conversationId: string | null;
  conversationLength: number;
  messagesToRestart: number;
  currentMode: ConversationType;
  lastMessagePreview?: string;
  usage?: {
    audioTokens: number;
    cachedAudioTokens: number;
    rawAudioInputs: number;
  };
  seededMessageCount?: number;
};

export function reportConversationRestart(report: ConversationRestartReport): void {
  Sentry.addBreadcrumb({
    category: 'conversation',
    level: 'info',
    message: 'Conversation restart',
    data: {
      trigger: report.trigger,
      conversationLength: report.conversationLength,
      currentMode: report.currentMode,
    },
  });

  Sentry.captureMessage('Conversation restart triggered', {
    level: 'info',
    tags: {
      area: 'conversation',
      trigger: report.trigger,
      mode: report.currentMode,
    },
    extra: report,
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
