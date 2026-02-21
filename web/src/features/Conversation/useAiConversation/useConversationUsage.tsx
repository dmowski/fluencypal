import { UsageLog } from '@/common/usage';
import { useAuth } from '@/features/Auth/useAuth';
import { useUsage } from '@/features/Usage/useUsage';
import { useEffect, useState } from 'react';
import { showDebugInfoBadgeOnTopWindow } from './showDebugInfoBadgeOnTopWindow';

export const useConversationUsage = (setIsNeedToResetNow: (value: boolean) => void) => {
  const [usageInfo, setUsageInfo] = useState<string>('');
  const usage = useUsage();

  const auth = useAuth();

  useEffect(() => {
    if (usageInfo && auth.isFounder) showDebugInfoBadgeOnTopWindow(usageInfo);
  }, [usageInfo, auth.isFounder]);

  const onAddUsage = (usageLog: UsageLog) => {
    // xxx
    if (usageLog.type === 'realtime') {
      const cachedAudioTokens =
        usageLog.usageEvent?.input_token_details?.cached_tokens_details?.audio_tokens || 0;
      const audioTokens = usageLog.usageEvent?.input_token_details?.audio_tokens || 0;
      const rawAudioInputs = audioTokens - cachedAudioTokens;

      if (rawAudioInputs > 5000) {
        // need to reset now
        setIsNeedToResetNow(true);
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
