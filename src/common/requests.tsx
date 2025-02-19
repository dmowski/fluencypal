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
