import { AiVoice } from '@/common/ai';
import { SupportedLanguage } from '@/features/Lang/lang';

export interface TextToAudioRequest {
  input: string;
  instructions: string;
  voice: AiVoice;
  languageCode: SupportedLanguage;
}

export interface TextToAudioResponse {
  audioUrl: string;
  error: string | null;
}
