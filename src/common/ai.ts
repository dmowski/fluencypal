export type RealTimeModel =
  | "gpt-4o-realtime-preview"
  | "gpt-4o-mini-realtime-preview"
  | "gpt-realtime-mini"
  | "gpt-realtime";

const SMALL_CONVERSATION_MODEL: RealTimeModel = "gpt-realtime-mini";
const MAIN_CONVERSATION_MODEL: RealTimeModel = SMALL_CONVERSATION_MODEL;

export type TextAiModel = "gpt-4o" | "gpt-4o-mini";

export type TranscriptAiModel = "gpt-4o-transcribe" | "gpt-4o-mini-transcribe";

export type AiVoice = "alloy" | "ash" | "ballad" | "coral" | "echo" | "sage" | "shimmer" | "verse";

export type TextToAudioModal = "gpt-4o-mini-tts";

export const MODELS = {
  REALTIME_CONVERSATION: MAIN_CONVERSATION_MODEL,
  gpt_4o_mini: "gpt-4o-mini",
  gpt_4o: "gpt-4o",
} as const;

export const PROJECT_PROFIT_MARGIN = 0.3; //X

export interface UsageEvent {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  input_token_details: {
    text_tokens: number;
    audio_tokens: number;
    cached_tokens: number;
    cached_tokens_details: { text_tokens: number; audio_tokens: number };
  };
  output_token_details: { text_tokens: number; audio_tokens: number };
}

interface TextUsagePrice {
  text_input: number;
  text_cached_input: number;
  text_output: number;
}

const MILLION = 1_000_000;

export const textModalPricePerMillionTokens: Record<TextAiModel, TextUsagePrice> = {
  "gpt-4o": {
    text_input: 2.5,
    text_cached_input: 1.25,
    text_output: 10,
  },
  "gpt-4o-mini": {
    text_input: 0.15,
    text_cached_input: 0.075,
    text_output: 0.6,
  },
};

export interface TextUsageEvent {
  text_input: number;
  text_cached_input: number;
  text_output: number;
}

export const calculateTextUsagePrice = (usageEvent: TextUsageEvent, model: TextAiModel) => {
  const cachedTextInput = usageEvent.text_cached_input;
  const textInput = usageEvent.text_input - cachedTextInput;

  const textOutput = usageEvent.text_output;
  const price = textModalPricePerMillionTokens[model];
  const fullTextPrice = (textInput / MILLION) * price.text_input;
  const cachedTextPrice = (cachedTextInput / MILLION) * price.text_cached_input;
  const textOutputPrice = (textOutput / MILLION) * price.text_output;
  const usagePrice = fullTextPrice + cachedTextPrice + textOutputPrice;
  const profit = usagePrice * PROJECT_PROFIT_MARGIN;
  const priceWithMargin = usagePrice + profit;
  return priceWithMargin;
};

interface RealtimeUsagePrice {
  text_input: number;
  text_cached_input: number;
  text_output: number;
  audio_input: number;
  audio_cached_input: number;
  audio_output: number;
}

// USD
// https://openai.com/api/pricing/
// Realtime API
export const modalPricePerMillionTokens: Record<RealTimeModel, RealtimeUsagePrice> = {
  "gpt-4o-realtime-preview": {
    text_input: 5,
    text_cached_input: 2.5,
    text_output: 20,
    audio_input: 40,
    audio_cached_input: 2.5,
    audio_output: 80,
  },

  "gpt-realtime": {
    text_input: 4,
    text_cached_input: 0.4,
    text_output: 16,
    audio_input: 32,
    audio_cached_input: 0.4,
    audio_output: 64,
  },

  "gpt-4o-mini-realtime-preview": {
    text_input: 0.6,
    text_cached_input: 0.3,
    text_output: 2.4,
    audio_input: 10,
    audio_cached_input: 0.3,
    audio_output: 20,
  },

  "gpt-realtime-mini": {
    text_input: 0.6,
    text_cached_input: 0.06,
    text_output: 2.4,
    audio_input: 10,
    audio_cached_input: 0.3,
    audio_output: 20,
  },
};
// USD
const calculateOutputPrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const textOutput = usageEvent.output_token_details.text_tokens;
  const audioOutput = usageEvent.output_token_details.audio_tokens;
  const price = modalPricePerMillionTokens[model];
  const textPrice = (textOutput / MILLION) * price.text_output;
  const audioPrice = (audioOutput / MILLION) * price.audio_output;
  return textPrice + audioPrice;
};

// USD
const calculateInputPrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const price = modalPricePerMillionTokens[model];
  const cachedTextInput = usageEvent.input_token_details.cached_tokens_details.text_tokens;
  const fullTextInput = usageEvent.input_token_details.text_tokens - cachedTextInput;
  const fullTextPrice = (fullTextInput / MILLION) * price.text_input;
  const cachedTextPrice = (cachedTextInput / MILLION) * price.text_cached_input;

  const cachedAudioInput = usageEvent.input_token_details.cached_tokens_details.audio_tokens;
  const audioInput = usageEvent.input_token_details.audio_tokens - cachedAudioInput;
  const fullAudioPrice = (audioInput / MILLION) * price.audio_input;
  const cachedAudioPrice = (cachedAudioInput / MILLION) * price.audio_cached_input;

  return fullTextPrice + cachedTextPrice + fullAudioPrice + cachedAudioPrice;
};

// USD
export const calculateUsagePrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const inputPrice = calculateInputPrice(usageEvent, model);
  const outputPrice = calculateOutputPrice(usageEvent, model);
  const usagePrice = inputPrice + outputPrice;
  const profit = usagePrice * PROJECT_PROFIT_MARGIN;
  const price = usagePrice + profit;
  return price;
};

export const pricePerHour = 3; // $3 is one hour

export const convertUsdToHours = (money: number) => {
  return money / pricePerHour;
};

const audioTranscriptionPricePerMinute: Record<TranscriptAiModel, number> = {
  "gpt-4o-transcribe": 0.006,
  "gpt-4o-mini-transcribe": 0.003,
};

export const calculateAudioTranscriptionPrice = (
  durationSeconds: number,
  model: TranscriptAiModel
) => {
  const pricePerMinute = audioTranscriptionPricePerMinute[model];
  const durationInMinutes = durationSeconds / 60;
  const basePrice = pricePerMinute * durationInMinutes;

  const profit = basePrice * PROJECT_PROFIT_MARGIN;
  const priceWithMargin = basePrice + profit;

  return priceWithMargin;
};

const audioToTextPricePerMinute: Record<TextToAudioModal, number> = {
  "gpt-4o-mini-tts": 0.015,
};

export const calculateAudioToTextPrice = (durationSeconds: number, model: TextToAudioModal) => {
  const pricePerMinute = audioToTextPricePerMinute[model];
  const durationInMinutes = durationSeconds / 60;
  const basePrice = pricePerMinute * durationInMinutes;

  const profit = basePrice * PROJECT_PROFIT_MARGIN;
  const priceWithMargin = basePrice + profit;

  return priceWithMargin;
};
