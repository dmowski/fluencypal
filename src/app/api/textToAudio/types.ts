import { SupportedLanguage } from "@/features/Lang/lang";

export type TextToAudioVoice =
  | "alloy"
  | "ash"
  | "ballad"
  | "coral"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "sage"
  | "shimmer"
  | "verse";

export interface TextToAudioRequest {
  input: string;
  instructions: string;
  voice: TextToAudioVoice;
  languageCode: SupportedLanguage;
}

export interface TextToAudioResponse {
  audioUrl: string;
  error: string | null;
}
