import { AiVoice } from '@/common/ai';
import { SupportedLanguage } from '@/features/Lang/lang';

export type Modalities = 'audio' | 'text';

export interface UpdateSessionProps {
  dataChannel: RTCDataChannel;
  initInstruction?: string;
  voice?: AiVoice;
  languageCode: SupportedLanguage;
  modalities: Modalities[];
}

export type SeedMsg = { isBot: boolean; text: string };
