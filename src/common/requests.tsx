import { TextAiModel, TextUsageEvent } from "./ai";
import { ChatMessage } from "./conversation";
import { SupportedLanguage } from "./lang";

export interface CorrectAnswerRequest {
  userMessages: ChatMessage;
  botMessages: ChatMessage;
  language: SupportedLanguage;
}

export interface CorrectAnswerResponse {
  correctAnswer: string;
}

export interface AiRequest {
  userMessage: string;
  systemMessage: string;
  language: SupportedLanguage;
  model: TextAiModel;
}

export interface AiResponse {
  aiResponse: string;
  usageEvent: TextUsageEvent;
}
