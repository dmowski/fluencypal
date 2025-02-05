export const INIT_CONVERSATION_INSTRUCTIONS = [
  `Your are English teacher.`,
  `Say hello to your student, ask them how they doing and start a lesson based on anser`,
].join("\n");

type RealTimeModel = "gpt-4o-realtime-preview" | "gpt-4o-mini-realtime-preview";

export const MAIN_CONVERSATION_MODEL: RealTimeModel = "gpt-4o-mini-realtime-preview";
