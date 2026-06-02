/** Pricing logic copied from webApp/src/features/Ai/ai.ts (discrete STT / LLM / TTS pipeline). */

const MILLION = 1_000_000;

export type TextAiModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-5'
  | 'gpt-5-mini'
  | 'gpt-5.4'
  | 'gpt-5.1'
  | 'gpt-5-nano'
  | 'chatgpt-4o-latest';

export type TranscriptAiModel = 'gpt-4o-transcribe' | 'gpt-4o-mini-transcribe';

export type TextToAudioModel = 'gpt-4o-mini-tts';

export type UsageTokens = {
  input_tokens: number;
  output_tokens: number;
  total_tokens?: number;
  audioDurationSeconds?: number;
};

interface TextUsagePrice {
  text_input: number;
  text_cached_input: number;
  text_output: number;
}

export const textModalPricePerMillionTokens: Record<TextAiModel, TextUsagePrice> = {
  'gpt-4o': { text_input: 2.5, text_cached_input: 1.25, text_output: 10 },
  'gpt-4o-mini': { text_input: 0.15, text_cached_input: 0.075, text_output: 0.6 },
  'gpt-5': { text_input: 1.25, text_cached_input: 0.125, text_output: 10 },
  'gpt-5-mini': { text_input: 0.25, text_cached_input: 0.025, text_output: 2 },
  'gpt-5.1': { text_input: 1.25, text_cached_input: 0.125, text_output: 10 },
  'gpt-5-nano': { text_input: 0.05, text_cached_input: 0.005, text_output: 0.4 },
  'chatgpt-4o-latest': { text_input: 5, text_cached_input: 5, text_output: 15 },
  'gpt-5.4': { text_input: 2.5, text_cached_input: 0.25, text_output: 15 },
};

export const calculateTextUsagePrice = (
  usageEvent: { text_input: number; text_cached_input: number; text_output: number },
  model: TextAiModel,
): number => {
  const cachedTextInput = usageEvent.text_cached_input;
  const textInput = usageEvent.text_input - cachedTextInput;
  const textOutput = usageEvent.text_output;
  const price = textModalPricePerMillionTokens[model];
  const fullTextPrice = (textInput / MILLION) * price.text_input;
  const cachedTextPrice = (cachedTextInput / MILLION) * price.text_cached_input;
  const textOutputPrice = (textOutput / MILLION) * price.text_output;
  return fullTextPrice + cachedTextPrice + textOutputPrice;
};

const audioTranscriptionPricePerMinute: Record<TranscriptAiModel, number> = {
  'gpt-4o-transcribe': 0.006,
  'gpt-4o-mini-transcribe': 0.003,
};

export const calculateAudioTranscriptionPrice = (
  durationSeconds: number,
  model: TranscriptAiModel,
): number => {
  const pricePerMinute = audioTranscriptionPricePerMinute[model];
  return pricePerMinute * (durationSeconds / 60);
};

const textToAudioPricePerMinute: Record<TextToAudioModel, number> = {
  'gpt-4o-mini-tts': 0.015,
};

export const calculateTextToAudioPrice = (durationSeconds: number, model: TextToAudioModel): number => {
  const pricePerMinute = textToAudioPricePerMinute[model];
  return pricePerMinute * (durationSeconds / 60);
};

const isTextAiModel = (model: string): model is TextAiModel => model in textModalPricePerMillionTokens;

const isTranscriptModel = (model: string): model is TranscriptAiModel =>
  model in audioTranscriptionPricePerMinute;

const isTtsModel = (model: string): model is TextToAudioModel => model in textToAudioPricePerMinute;

export const calculateStagePriceUsd = (
  stage: 'stt' | 'llm' | 'tts',
  model: string,
  usage: UsageTokens,
): number => {
  if (stage === 'llm' && isTextAiModel(model)) {
    return calculateTextUsagePrice(
      {
        text_input: usage.input_tokens,
        text_cached_input: 0,
        text_output: usage.output_tokens,
      },
      model,
    );
  }

  if (stage === 'stt' && isTranscriptModel(model) && usage.audioDurationSeconds !== undefined) {
    return calculateAudioTranscriptionPrice(usage.audioDurationSeconds, model);
  }

  if (stage === 'tts' && isTtsModel(model) && usage.audioDurationSeconds !== undefined) {
    return calculateTextToAudioPrice(usage.audioDurationSeconds, model);
  }

  return 0;
};

export const formatUsd = (amount: number): string => `$${amount.toFixed(4)}`;
