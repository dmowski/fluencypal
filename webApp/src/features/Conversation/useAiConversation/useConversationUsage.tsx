import { UsageLog } from '@/features/Usage/usage';
import { useUsage } from '@/features/Usage/useUsage';
import { useState } from 'react';
import { ConversationRestartReport } from './reportConversationRestart';

export const useConversationUsage = (
  requestRestart: (
    trigger: 'usage_cache_threshold',
    usage?: ConversationRestartReport['usage'],
  ) => void,
) => {
  const [usageInfo, setUsageInfo] = useState<string>('');
  const usage = useUsage();

  const onAddUsage = (usageLog: UsageLog) => {
    // xxx
    if (usageLog.type === 'realtime') {
      const cachedAudioTokens =
        usageLog.usageEvent?.input_token_details?.cached_tokens_details?.audio_tokens || 0;
      const audioTokens = usageLog.usageEvent?.input_token_details?.audio_tokens || 0;
      const rawAudioInputs = audioTokens - cachedAudioTokens;

      if (rawAudioInputs > 5000) {
        requestRestart('usage_cache_threshold', {
          audioTokens,
          cachedAudioTokens,
          rawAudioInputs,
        });
      }

      setUsageInfo(
        `$${usageLog.priceUsd.toFixed(4)} - I:${audioTokens} (C:${cachedAudioTokens}) New:${rawAudioInputs}`,
      );
    }
    usage.setUsageLogs((prev) => [...prev, usageLog]);
  };

  return {
    onAddUsage,
  };
};
