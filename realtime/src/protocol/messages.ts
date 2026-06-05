import { z } from "zod";

export const conversationModeSchema = z.enum(["RealTimeConversation", "PushToTalk"]);
export type ConversationMode = z.infer<typeof conversationModeSchema>;

export const aiVoiceSchema = z.enum(["shimmer", "ash", "marin", "verse"]);
export type AiVoice = z.infer<typeof aiVoiceSchema>;

export const supportedLanguageSchema = z.string().min(2).max(8);
export type SupportedLanguage = z.infer<typeof supportedLanguageSchema>;

export const sessionStartConfigSchema = z.object({
  languageCode: supportedLanguageSchema,
  mode: conversationModeSchema,
  voiceEnabled: z.boolean(),
  micEnabled: z.boolean(),
  systemInstruction: z.string(),
  voice: aiVoiceSchema,
  conversationId: z.string().optional(),
});

export type SessionStartConfig = z.infer<typeof sessionStartConfigSchema>;

export const sessionUpdatePatchSchema = z
  .object({
    systemInstruction: z.string().optional(),
    voiceEnabled: z.boolean().optional(),
    micEnabled: z.boolean().optional(),
  })
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "session.update patch must include at least one field",
  });

export type SessionUpdatePatch = z.infer<typeof sessionUpdatePatchSchema>;

export const sessionStartMessageSchema = z.object({
  type: z.literal("session.start"),
  token: z.string().min(1),
  config: sessionStartConfigSchema,
});

export const sessionUpdateMessageSchema = z.object({
  type: z.literal("session.update"),
  patch: sessionUpdatePatchSchema,
});

export const userTextMessageSchema = z.object({
  type: z.literal("user.text"),
  text: z.string(),
  messageId: z.string().optional(),
});

export const userTurnCommitMessageSchema = z.object({
  type: z.literal("user.turn.commit"),
  messageId: z.string().optional(),
});

export const userTurnCancelMessageSchema = z.object({
  type: z.literal("user.turn.cancel"),
  messageId: z.string().optional(),
});

export const assistantTriggerMessageSchema = z.object({
  type: z.literal("assistant.trigger"),
});

export const assistantInstructionMessageSchema = z.object({
  type: z.literal("assistant.instruction"),
  text: z.string(),
  mode: z.enum(["replace", "append"]),
});

export const visionFrameMessageSchema = z.object({
  type: z.literal("vision.frame"),
  jpegBase64: z.string(),
  capturedAt: z.number(),
});

export const sessionPingMessageSchema = z.object({
  type: z.literal("session.ping"),
});

export const sessionEndMessageSchema = z.object({
  type: z.literal("session.end"),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
  sessionStartMessageSchema,
  sessionUpdateMessageSchema,
  userTextMessageSchema,
  userTurnCommitMessageSchema,
  userTurnCancelMessageSchema,
  assistantTriggerMessageSchema,
  assistantInstructionMessageSchema,
  visionFrameMessageSchema,
  sessionPingMessageSchema,
  sessionEndMessageSchema,
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export const transcriptRoleSchema = z.enum(["user", "assistant"]);
export type TranscriptRole = z.infer<typeof transcriptRoleSchema>;

export const usageStageSchema = z.enum(["stt", "llm", "tts", "vision"]);
export type UsageStage = z.infer<typeof usageStageSchema>;

export const usageEventSchema = z
  .object({
    input_tokens: z.number().nonnegative(),
    output_tokens: z.number().nonnegative(),
    total_tokens: z.number().nonnegative().optional(),
  })
  .passthrough();

export type UsageEventPayload = z.infer<typeof usageEventSchema>;

export const sessionReadyMessageSchema = z.object({
  type: z.literal("session.ready"),
  sessionId: z.string(),
  mode: conversationModeSchema,
  voice: aiVoiceSchema,
  voiceEnabled: z.boolean(),
  micEnabled: z.boolean(),
});

export const transcriptDeltaMessageSchema = z.object({
  type: z.literal("transcript.delta"),
  messageId: z.string(),
  role: transcriptRoleSchema,
  delta: z.string(),
});

export const transcriptDoneMessageSchema = z.object({
  type: z.literal("transcript.done"),
  messageId: z.string(),
  role: transcriptRoleSchema,
  text: z.string(),
});

export const userSpeakingMessageSchema = z.object({
  type: z.literal("user.speaking"),
  active: z.boolean(),
});

export const assistantSpeakingMessageSchema = z.object({
  type: z.literal("assistant.speaking"),
  active: z.boolean(),
});

export const messageOrderMessageSchema = z.object({
  type: z.literal("message.order"),
  previousId: z.string(),
  nextId: z.string(),
});

export const usageMessageSchema = z.object({
  type: z.literal("usage"),
  usageId: z.string(),
  stage: usageStageSchema,
  model: z.string(),
  usageEvent: usageEventSchema,
  priceUsd: z.number().optional(),
  createdAt: z.number(),
});

export const errorMessageSchema = z.object({
  type: z.literal("error"),
  code: z.string(),
  message: z.string(),
  fatal: z.boolean().optional(),
});

export const sessionPongMessageSchema = z.object({
  type: z.literal("session.pong"),
});

export const sessionEndedMessageSchema = z.object({
  type: z.literal("session.ended"),
});

export const assistantInterruptedMessageSchema = z.object({
  type: z.literal("assistant.interrupted"),
});

export const serverMessageSchema = z.discriminatedUnion("type", [
  sessionReadyMessageSchema,
  transcriptDeltaMessageSchema,
  transcriptDoneMessageSchema,
  userSpeakingMessageSchema,
  assistantSpeakingMessageSchema,
  messageOrderMessageSchema,
  usageMessageSchema,
  errorMessageSchema,
  sessionPongMessageSchema,
  sessionEndedMessageSchema,
  assistantInterruptedMessageSchema,
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;

export class ProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtocolError";
  }
}

export const parseClientMessage = (raw: unknown): ClientMessage => {
  const result = clientMessageSchema.safeParse(raw);
  if (!result.success) {
    throw new ProtocolError(result.error.message);
  }
  return result.data;
};

export const parseServerMessage = (raw: unknown): ServerMessage => {
  const result = serverMessageSchema.safeParse(raw);
  if (!result.success) {
    throw new ProtocolError(result.error.message);
  }
  return result.data;
};

export const serializeServerMessage = (message: ServerMessage): string => {
  return JSON.stringify(serverMessageSchema.parse(message));
};
