import { UsageLog } from '@/features/Usage/usage';
import { useUsage } from '@/features/Usage/useUsage';
import { useRef } from 'react';
import {
  extractRealtimeUsageSnapshot,
} from './extractRealtimeUsageSnapshot';
import { reportLegacyRealtimeAudioInputThreshold } from './reportConversationRestart';
import { getGlobalConversationId } from '@/features/Usage/globalConversationId';

export const useConversationUsage = (conversationLength: number) => {
  const usage = useUsage();
  const conversationLengthRef = useRef(conversationLength);
  conversationLengthRef.current = conversationLength;
  const lastObservedThresholdCrossingRef = useRef<number | null>(null);

  const onAddUsage = (usageLog: UsageLog) => {
    if (usageLog.type === 'realtime') {
      const usageSnapshot = extractRealtimeUsageSnapshot(usageLog.usageEvent);

      if (
        usageSnapshot?.legacyThresholdExceeded &&
        lastObservedThresholdCrossingRef.current !== usageSnapshot.audioInputNew
      ) {
        lastObservedThresholdCrossingRef.current = usageSnapshot.audioInputNew;
        reportLegacyRealtimeAudioInputThreshold({
          conversationId: usageLog.conversationId || getGlobalConversationId() || '',
          conversationLength: conversationLengthRef.current,
          usage: usageSnapshot,
        });
      }
    }
    usage.setUsageLogs((prev) => [...prev, usageLog]);
  };

  return {
    onAddUsage,
  };
};
