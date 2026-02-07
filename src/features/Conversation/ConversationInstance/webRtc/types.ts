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

export interface WebRtcState {
  dataChannel: RTCDataChannel | null;
  peerConnection: RTCPeerConnection | null;
  userMedia: MediaStream;
  lastMessages: SeedMsg[];
}
