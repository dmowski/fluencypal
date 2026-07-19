import { UsageLog } from '@/features/Usage/usage';
import { useUsage } from '@/features/Usage/useUsage';
import { useState } from 'react';
import {
  extractRealtimeUsageSnapshot,
  REALTIME_AUDIO_INPUT_RESTART_THRESHOLD,
} from './extractRealtimeUsageSnapshot';

export const useConversationUsage = (
  requestRestart: (
    trigger: 'usage_cache_threshold',
    usage?: NonNullable<ReturnType<typeof extractRealtimeUsageSnapshot>>,
  ) => void,
) => {
  const [usageInfo, setUsageInfo] = useState<string>('');
  const usage = useUsage();

  const onAddUsage = (usageLog: UsageLog) => {
    if (usageLog.type === 'realtime') {
      const usageSnapshot = extractRealtimeUsageSnapshot(usageLog.usageEvent);

      if (usageSnapshot?.restartThresholdExceeded) {
        requestRestart('usage_cache_threshold', usageSnapshot);
      }

      if (usageSnapshot) {
        setUsageInfo(
          `$${usageLog.priceUsd.toFixed(4)} - audioIn:${usageSnapshot.audioInputTotal} (cached:${usageSnapshot.audioInputCached}) new:${usageSnapshot.audioInputNew} / limit:${REALTIME_AUDIO_INPUT_RESTART_THRESHOLD}`,
        );
      }
    }
    usage.setUsageLogs((prev) => [...prev, usageLog]);
  };

  return {
    onAddUsage,
  };
};
