import { AiVoice } from '@/features/Ai/ai';
import { BARGE_IN_RMS_THRESHOLD, computeChunkRmsFromBuffer } from './audioCapture';
import { Mp3PlaybackQueue } from './audioPlayback';
import { unlockAudioPlayback } from './audioUnlock';
import { buildRealtimeWsSessionUrl } from './getRealtimeWsUrl';

export type ServerMessage = {
  type: string;
  role?: 'user' | 'assistant';
  messageId?: string;
  delta?: string;
  text?: string;
  sessionId?: string;
  stage?: string;
  model?: string;
  usageEvent?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
    audioDurationSeconds?: number;
  };
  code?: string;
  message?: string;
  active?: boolean;
};

export type SessionStartConfig = {
  languageCode: string;
  mode: 'PushToTalk' | 'RealTimeConversation';
  voiceEnabled: boolean;
  micMuted: boolean;
  systemInstruction: string;
  voice: AiVoice;
  conversationId?: string;
};

export type RealtimeWsSessionHandlers = {
  onSessionReady: () => void;
  onTranscriptDelta: (messageId: string, role: 'user' | 'assistant', delta: string) => void;
  onTranscriptDone: (messageId: string, role: 'user' | 'assistant', text: string) => void;
  onUsage: (payload: {
    stage: string;
    model: string;
    usageEvent?: ServerMessage['usageEvent'];
    createdAt?: number;
  }) => void;
  onUserSpeaking: (active: boolean) => void;
  onAssistantSpeaking: (active: boolean) => void;
  onPlaybackStateChange: () => void;
  onError: (message: string) => void;
};

export class RealtimeWsSessionClient {
  private socket: WebSocket | null = null;
  private readonly playback = new Mp3PlaybackQueue();
  private assistantSpeaking = false;
  private sessionConfig: SessionStartConfig | null = null;
  private messageChain: Promise<void> = Promise.resolve();
  private playCollectedPending = false;
  private ttsBytesReceived = 0;
  private playTask: Promise<void> = Promise.resolve();
  private sessionReady = false;
  private readonly pendingJsonBeforeReady: unknown[] = [];

  constructor(private readonly handlers: RealtimeWsSessionHandlers) {
    this.playback.setOnStateChange(() => {
      this.handlers.onPlaybackStateChange();
    });
  }

  get isMicUploadBlocked(): boolean {
    return this.assistantSpeaking || this.playback.isPlaying;
  }

  get isAssistantOutputActive(): boolean {
    return this.assistantSpeaking || this.playback.isPlaying;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(token: string, config: SessionStartConfig): void {
    this.disconnect();
    this.sessionConfig = config;
    this.sessionReady = false;
    this.pendingJsonBeforeReady.length = 0;

    const socket = new WebSocket(buildRealtimeWsSessionUrl());
    this.socket = socket;

    socket.addEventListener('open', () => {
      socket.send(
        JSON.stringify({
          type: 'session.start',
          token,
          config,
        }),
      );
    });

    socket.addEventListener('message', (event) => {
      void this.enqueueMessage(() => this.handleSocketMessage(event));
    });

    socket.addEventListener('close', (event) => {
      if (event.code !== 1000 && event.reason) {
        this.handlers.onError(`Connection closed: ${event.reason}`);
      }
      this.playback.reset();
      this.socket = null;
    });

    socket.addEventListener('error', () => {
      this.handlers.onError('WebSocket error');
    });
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.sendJson({ type: 'session.end' });
    }

    this.socket?.close();
    this.socket = null;
    this.playback.reset();
    this.sessionConfig = null;
    this.sessionReady = false;
    this.pendingJsonBeforeReady.length = 0;
    this.messageChain = Promise.resolve();
    this.playCollectedPending = false;
    this.assistantSpeaking = false;
    this.playTask = Promise.resolve();
  }

  sendJson(payload: unknown): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    if (!this.sessionReady) {
      this.pendingJsonBeforeReady.push(payload);
      return;
    }

    this.socket.send(JSON.stringify(payload));
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    if (!this.isConnected || !this.socket || !this.sessionReady) {
      return;
    }

    if (
      (this.playback.isPlaying || this.assistantSpeaking) &&
      computeChunkRmsFromBuffer(chunk) >= BARGE_IN_RMS_THRESHOLD
    ) {
      this.cancelAssistantAudio();
    }

    this.socket.send(chunk);
  }

  private flushPendingJson(): void {
    if (!this.socket || !this.sessionReady) {
      return;
    }

    for (const payload of this.pendingJsonBeforeReady) {
      this.socket.send(JSON.stringify(payload));
    }
    this.pendingJsonBeforeReady.length = 0;
  }

  updateSession(patch: Record<string, unknown>): void {
    this.sendJson({ type: 'session.update', patch });
  }

  setPlaybackVolume(volume: number): void {
    this.playback.setVolume(volume);
  }

  cancelPlayback(): void {
    this.cancelAssistantAudio();
  }

  private cancelAssistantAudio(): void {
    this.playback.cancel();
    this.playCollectedPending = false;
    this.ttsBytesReceived = 0;
    this.playTask = Promise.resolve();
  }

  private enqueueMessage(task: () => void | Promise<void>): Promise<void> {
    this.messageChain = this.messageChain
      .then(() => task())
      .catch((error) => {
        console.error('realtimeWs message handler', error);
      });
    return this.messageChain;
  }

  private async handleSocketMessage(event: MessageEvent): Promise<void> {
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data) as ServerMessage;
      this.handleJsonMessage(message);
      return;
    }

    if (event.data instanceof Blob) {
      const buffer = await event.data.arrayBuffer();
      this.ttsBytesReceived += buffer.byteLength;
      this.playback.append(buffer);
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      this.ttsBytesReceived += event.data.byteLength;
      this.playback.append(event.data);
    }
  }

  private schedulePlayCollected(): void {
    if (!this.playCollectedPending || this.assistantSpeaking || !this.playback.hasPendingChunks) {
      return;
    }

    this.playCollectedPending = false;
    this.ttsBytesReceived = 0;

    this.playTask = this.playTask.then(async () => {
      await unlockAudioPlayback();
      try {
        await this.playback.playCollected();
      } catch (error) {
        this.handlers.onError(
          error instanceof Error ? error.message : 'Assistant audio could not play',
        );
      }
    });
  }

  private handleJsonMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'session.ready':
        this.sessionReady = true;
        this.flushPendingJson();
        if (this.sessionConfig) {
          this.handlers.onSessionReady();
        }
        return;
      case 'transcript.delta':
        if (message.messageId && message.role && message.delta) {
          this.handlers.onTranscriptDelta(message.messageId, message.role, message.delta);
        }
        return;
      case 'transcript.done':
        if (message.messageId && message.role && message.text !== undefined) {
          this.handlers.onTranscriptDone(message.messageId, message.role, message.text);
        }
        return;
      case 'usage':
        this.handlers.onUsage({
          stage: message.stage ?? 'llm',
          model: message.model ?? 'unknown',
          usageEvent: message.usageEvent,
          createdAt: Date.now(),
        });
        return;
      case 'assistant.interrupted':
        this.cancelAssistantAudio();
        this.handlers.onAssistantSpeaking(false);
        return;
      case 'assistant.speaking':
        if (message.active) {
          this.cancelAssistantAudio();
          this.assistantSpeaking = true;
          this.handlers.onAssistantSpeaking(true);
        } else {
          this.assistantSpeaking = false;
          this.handlers.onAssistantSpeaking(false);
          this.playCollectedPending = true;
          this.schedulePlayCollected();
        }
        return;
      case 'user.speaking':
        this.handlers.onUserSpeaking(Boolean(message.active));
        return;
      case 'error':
        this.handlers.onError(`${message.code ?? 'error'}: ${message.message ?? 'Unknown error'}`);
        return;
      default:
        return;
    }
  }
}
