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

export interface InstructionState {
  baseInitInstruction: string;
  webCamDescription: string;
  correction: string;
}

export type SeedMsg = { isBot: boolean; text: string };

export interface WebRtcState {
  dataChannel: RTCDataChannel | null;
  peerConnection: RTCPeerConnection;
  userMedia: MediaStream;
  lastMessages: SeedMsg[];
  instructionState: InstructionState;
  currentMuted: boolean;
  currentVolumeOn: boolean;
  audioEl: HTMLAudioElement;
}
