import { UsageEvent } from '@/features/Ai/ai';

/** Legacy client-side restart threshold (removed); kept for Sentry observation breadcrumbs. */
export const REALTIME_AUDIO_INPUT_LEGACY_THRESHOLD = 5000;

export type RealtimeUsageSnapshot = {
  audioInputTotal: number;
  audioInputCached: number;
  audioInputNew: number;
  textInputTotal: number;
  textInputCached: number;
  inputTotal: number;
  outputTotal: number;
  legacyThreshold: number;
  legacyThresholdExceeded: boolean;
};

export function extractRealtimeUsageSnapshot(
  usageEvent: UsageEvent | undefined,
): RealtimeUsageSnapshot | undefined {
  const details = usageEvent?.input_token_details;
  if (!details) {
    return undefined;
  }

  const audioInputTotal = details.audio_tokens ?? 0;
  const audioInputCached = details.cached_tokens_details?.audio_tokens ?? 0;
  const audioInputNew = audioInputTotal - audioInputCached;

  return {
    audioInputTotal,
    audioInputCached,
    audioInputNew,
    textInputTotal: details.text_tokens ?? 0,
    textInputCached: details.cached_tokens_details?.text_tokens ?? 0,
    inputTotal: usageEvent?.input_tokens ?? 0,
    outputTotal: usageEvent?.output_tokens ?? 0,
    legacyThreshold: REALTIME_AUDIO_INPUT_LEGACY_THRESHOLD,
    legacyThresholdExceeded: audioInputNew > REALTIME_AUDIO_INPUT_LEGACY_THRESHOLD,
  };
}
