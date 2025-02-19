export type RealTimeModel = "gpt-4o-realtime-preview" | "gpt-4o-mini-realtime-preview";

const MAIN_CONVERSATION_MODEL: RealTimeModel = "gpt-4o-realtime-preview";
const SMALL_CONVERSATION_MODEL: RealTimeModel = "gpt-4o-mini-realtime-preview";

export const MODELS = {
  REALTIME_CONVERSATION: MAIN_CONVERSATION_MODEL,
  SMALL_CONVERSATION: SMALL_CONVERSATION_MODEL,
  gpt_4o_mini: "gpt-4o-mini",
  gpt_4o: "gpt-4o",
};

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

interface UsagePrice {
  text_input: number;
  text_cached_input: number;
  text_output: number;
  audio_input: number;
  audio_cached_input: number;
  audio_output: number;
}

// https://openai.com/api/pricing/
// Realtime API
export const modalPricePerMillionTokens: Record<RealTimeModel, UsagePrice> = {
  "gpt-4o-realtime-preview": {
    text_input: 5,
    text_cached_input: 2.5,
    text_output: 20,
    audio_input: 40,
    audio_cached_input: 2.5,
    audio_output: 80,
  },
  "gpt-4o-mini-realtime-preview": {
    text_input: 0.6,
    text_cached_input: 0.3,
    text_output: 2.4,
    audio_input: 10,
    audio_cached_input: 0.3,
    audio_output: 20,
  },
};

const calculateOutputPrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const textOutput = usageEvent.output_token_details.text_tokens;
  const audioOutput = usageEvent.output_token_details.audio_tokens;
  const price = modalPricePerMillionTokens[model];
  const textPrice = (textOutput / 1_000_000) * price.text_output;
  const audioPrice = (audioOutput / 1_000_000) * price.audio_output;
  return textPrice + audioPrice;
};

const calculateInputPrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const price = modalPricePerMillionTokens[model];
  const cachedTextInput = usageEvent.input_token_details.cached_tokens_details.text_tokens;
  const fullTextInput = usageEvent.input_token_details.text_tokens - cachedTextInput;
  const fullTextPrice = (fullTextInput / 1_000_000) * price.text_input;
  const cachedTextPrice = (cachedTextInput / 1_000_000) * price.text_cached_input;

  const cachedAudioInput = usageEvent.input_token_details.cached_tokens_details.audio_tokens;
  const audioInput = usageEvent.input_token_details.audio_tokens - cachedAudioInput;
  const fullAudioPrice = (audioInput / 1_000_000) * price.audio_input;
  const cachedAudioPrice = (cachedAudioInput / 1_000_000) * price.audio_cached_input;

  return fullTextPrice + cachedTextPrice + fullAudioPrice + cachedAudioPrice;
};

export const PROJECT_PROFIT_MARGIN = 500; // 500%

export const calculateUsagePrice = (usageEvent: UsageEvent, model: RealTimeModel) => {
  const inputPrice = calculateInputPrice(usageEvent, model);
  const outputPrice = calculateOutputPrice(usageEvent, model);
  const usagePrice = inputPrice + outputPrice;
  const priceWithMargin = usagePrice * (PROJECT_PROFIT_MARGIN / 100);
  return priceWithMargin;
};
