export type RealTimeModel = "gpt-4o-realtime-preview" | "gpt-4o-mini-realtime-preview";

const MAIN_CONVERSATION_MODEL: RealTimeModel = "gpt-4o-realtime-preview";

export const MODELS = {
  REALTIME_CONVERSATION: MAIN_CONVERSATION_MODEL,
  gpt_4o_mini: "gpt-4o-mini",
  gpt_4o: "gpt-4o",
};

// https://openai.com/api/pricing/
// Realtime API
export const pricePerMillionOutputAudioTokens = 80;
