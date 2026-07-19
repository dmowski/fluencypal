import { UsageEvent } from '@/features/Ai/ai';

/** Sentry scrubs extra keys containing "token"; use *Input* names instead. */
export const REALTIME_AUDIO_INPUT_RESTART_THRESHOLD = 5000;

export type RealtimeUsageSnapshot = {
  audioInputTotal: number;
  audioInputCached: number;
  audioInputNew: number;
  textInputTotal: number;
  textInputCached: number;
  inputTotal: number;
  outputTotal: number;
  restartThreshold: number;
  restartThresholdExceeded: boolean;
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
    restartThreshold: REALTIME_AUDIO_INPUT_RESTART_THRESHOLD,
    restartThresholdExceeded: audioInputNew > REALTIME_AUDIO_INPUT_RESTART_THRESHOLD,
  };
}
