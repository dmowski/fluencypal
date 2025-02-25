import { ConversationMode } from "@/common/conversation";
import { SupportedLanguage } from "@/common/lang";

export const conversationModeLabel: Record<ConversationMode, string> = {
  beginner: "Beginner",
  talk: "Just talk",
  "talk-and-correct": "Talk & Correct",
  words: "Words",
  rule: "Rule",
};

export const firstAiMessage: Record<SupportedLanguage, string> = {
  en: "Hello... I am here!",
  ru: "Привет... Я здесь!",
  de: "Hallo... Ich bin hier!",
  pl: "Cześć... Jestem tutaj!",
  uk: "Привіт... Я тут!",
  fr: "Bonjour... Je suis là!",
  es: "Hola... Estoy aquí!",
  ar: "مرحبًا... أنا هنا!",
  id: "Halo... Saya di sini!",
  it: "Ciao... Sono qui!",
  ja: "こんにちは... ここにいます！",
  ko: "안녕하세요... 여기 있습니다!",
  ms: "Hello... Saya di sini!",
  pt: "Olá... Estou aqui!",
  th: "สวัสดี... ฉันอยู่ที่นี่!",
  tr: "Merhaba... Buradayım!",
  vi: "Xin chào... Tôi ở đây!",
  zh: "你好... 我在这里！",
  da: "Hej... Jeg er her!",
  nb: "Hei... Jeg er her!",
  sv: "Hej... Jag är här!",
};
