import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { SupportedLanguage } from '../Lang/lang';

export type TranscriptMode = 'ai' | 'native';

export type StartRealtimeTranscriptParams = {
  mode: TranscriptMode;
  language?: SupportedLanguage;
};

export type TranscriptSdpResponse = {
  sdpResponse: string;
};

export type PartialTranscriptMap = Record<string, string>;

export type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

export type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: BrowserSpeechRecognitionAlternative;
};

export type BrowserSpeechRecognitionResultList = {
  [index: number]: BrowserSpeechRecognitionResult;
  length: number;
};

export type BrowserSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: BrowserSpeechRecognitionResultList;
};

export type BrowserSpeechRecognitionErrorEvent = Event & {
  error: string;
};

export type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: BrowserSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: BrowserSpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: BrowserSpeechRecognition, ev: BrowserSpeechRecognitionErrorEvent) => void)
    | null;
  onresult: ((this: BrowserSpeechRecognition, ev: BrowserSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type TranscriptStateHandlers = {
  setCompletedTranscripts: SetState<string[]>;
  setPartialTranscriptMap: SetState<PartialTranscriptMap>;
  setIsActive: SetState<boolean>;
  setIsActivating: SetState<boolean>;
  setActiveMode: SetState<TranscriptMode | null>;
};

export type TranscriptRefs = {
  pcRef: MutableRefObject<RTCPeerConnection | null>;
  dcRef: MutableRefObject<RTCDataChannel | null>;
  recognitionRef: MutableRefObject<BrowserSpeechRecognition | null>;
  stopRequestedRef: MutableRefObject<boolean>;
};

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}
