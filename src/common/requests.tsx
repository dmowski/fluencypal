import { ChatMessage } from "@/features/Conversation/types";
import { SupportedLanguage } from "./lang";

export interface CorrectAnswerRequest {
  userMessages: ChatMessage;
  botMessages: ChatMessage;
  language: SupportedLanguage;
}

export interface CorrectAnswerResponse {
  correctAnswer: string;
}
