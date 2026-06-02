import {
  calculateRealtimePipelineStagePrice,
  convertUsageUsdToBalanceHours,
  RealtimePipelineStage,
  TextAiModel,
  TextToAudioModal,
  TranscriptAiModel,
} from '@/features/Ai/ai';
import { SupportedLanguage } from '@/features/Lang/lang';
import { UsageLog } from '@/features/Usage/usage';

export type WsUsagePayload = {
  stage: string;
  model: string;
  usageEvent?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    audioDurationSeconds?: number;
  };
  createdAt?: number;
};

const isPipelineStage = (stage: string): stage is RealtimePipelineStage =>
  stage === 'stt' || stage === 'llm' || stage === 'tts';

export const mapWsUsageToLog = ({
  payload,
  usageId,
  languageCode,
  conversationId,
  userPricePerHourUsd,
}: {
  payload: WsUsagePayload;
  usageId: string;
  languageCode: SupportedLanguage;
  conversationId: string;
  userPricePerHourUsd: number;
}): UsageLog | null => {
  if (!isPipelineStage(payload.stage)) {
    return null;
  }

  const inputTokens = payload.usageEvent?.input_tokens ?? 0;
  const outputTokens = payload.usageEvent?.output_tokens ?? 0;
  const audioDurationSeconds = payload.usageEvent?.audioDurationSeconds;
  const priceUsd = calculateRealtimePipelineStagePrice(payload.stage, payload.model, {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    audioDurationSeconds,
  });

  if (priceUsd <= 0) {
    return null;
  }

  const priceHours = convertUsageUsdToBalanceHours(priceUsd, userPricePerHourUsd);
  const createdAt = payload.createdAt ?? Date.now();

  if (payload.stage === 'llm') {
    return {
      type: 'text',
      usageId,
      priceUsd,
      priceHours,
      createdAt,
      languageCode,
      model: payload.model as TextAiModel,
      usageEvent: {
        text_input: inputTokens,
        text_cached_input: 0,
        text_output: outputTokens,
      },
    };
  }

  if (payload.stage === 'stt' && audioDurationSeconds !== undefined) {
    return {
      type: 'transcript',
      usageId,
      priceUsd,
      priceHours,
      createdAt,
      languageCode,
      model: payload.model as TranscriptAiModel,
      duration: audioDurationSeconds,
      transcriptSize: inputTokens + outputTokens,
    };
  }

  if (payload.stage === 'tts' && audioDurationSeconds !== undefined) {
    return {
      type: 'text_to_audio',
      usageId,
      priceUsd,
      priceHours,
      createdAt,
      languageCode,
      model: payload.model as TextToAudioModal,
      duration: audioDurationSeconds,
      transcriptSize: outputTokens,
    };
  }

  return null;
};
