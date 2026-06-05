import type { UsageEntry } from '../../lib/sessionUsage.js';

export type StatusTone = 'idle' | 'ok' | 'active' | 'warning' | 'error';

export type TranscriptMessage = {
  messageId: string;
  role: 'user' | 'assistant';
  text: string;
};

export type SessionMode = 'PushToTalk' | 'RealTimeConversation';
export type VoiceId = 'shimmer' | 'ash' | 'marin' | 'verse';

export const parseUsageStage = (stage: string): UsageEntry['stage'] | null => {
  if (stage === 'stt' || stage === 'llm' || stage === 'tts' || stage === 'vision') {
    return stage;
  }
  return null;
};

export const sessionStatusToneFromMessage = (status: string): StatusTone => {
  if (status.includes('Error')) {
    return 'error';
  }
  if (status.includes('ready') || status.includes('listening')) {
    return 'ok';
  }
  if (status.includes('Connected') || status.includes('Call active')) {
    return 'active';
  }
  return 'idle';
};
