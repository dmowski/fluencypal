import { Mp3PlaybackQueue } from './audioPlayback.js';
import { debugLog } from './debugLog.js';

export type ServerMessage = {
  type: string;
  role?: 'user' | 'assistant';
  messageId?: string;
  delta?: string;
  text?: string;
  sessionId?: string;
  stage?: string;
  model?: string;
  usageEvent?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  code?: string;
  message?: string;
  active?: boolean;
};

export type SessionClientHandlers = {
  onStatus: (status: string) => void;
  onSessionReady: (config: SessionStartConfig) => void;
  onTranscriptDelta: (messageId: string, role: 'user' | 'assistant', delta: string) => void;
  onTranscriptDone: (messageId: string, role: 'user' | 'assistant', text: string) => void;
  onUsage: (entry: string) => void;
  onError: (message: string) => void;
  onMicUploadBlockedChange?: (blocked: boolean) => void;
};

export type SessionStartConfig = {
  languageCode: string;
  mode: 'PushToTalk' | 'RealTimeConversation';
  voiceEnabled: boolean;
  micMuted: boolean;
  systemInstruction: string;
  voice: 'shimmer' | 'ash' | 'marin' | 'verse';
};

export class RealtimeSessionClient {
  private socket: WebSocket | null = null;
  private readonly playback = new Mp3PlaybackQueue();
  private assistantSpeaking = false;
  private sessionConfig: SessionStartConfig | null = null;
  private audioChunksSent = 0;
  private audioChunksSkipped = 0;
  private messageChain: Promise<void> = Promise.resolve();
  private playCollectedPending = false;

  constructor(private readonly handlers: SessionClientHandlers) {
    this.playback.setOnStateChange(() => {
      this.notifyMicUploadBlockedChange();
    });
  }

  /** Block mic while assistant TTS is streaming or playing — not while chunks are buffered. */
  get isMicUploadBlocked(): boolean {
    return this.assistantSpeaking || this.playback.isPlaying;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(token: string, config: SessionStartConfig): void {
    this.disconnect();
    this.sessionConfig = config;
    this.audioChunksSent = 0;
    this.audioChunksSkipped = 0;

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = import.meta.env.VITE_REALTIME_WS_URL as string | undefined;
    const url = wsBase
      ? `${wsBase.replace(/\/$/, '')}/v1/session`
      : `${protocol}://${window.location.host}/v1/session`;
    debugLog('ws', 'connecting', { url, mode: config.mode, voiceEnabled: config.voiceEnabled, wsBase: wsBase ?? null });
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.addEventListener('open', () => {
      debugLog('ws', 'open');
      this.handlers.onStatus('Connected, starting session…');
      const startPayload = {
        type: 'session.start',
        token,
        config,
      };
      debugLog('ws', 'send', { type: startPayload.type });
      socket.send(JSON.stringify(startPayload));
    });

    socket.addEventListener('message', (event) => {
      void this.enqueueMessage(() => this.handleSocketMessage(event));
    });

    socket.addEventListener('close', (event) => {
      debugLog('ws', 'closed', { code: event.code, reason: event.reason, sent: this.audioChunksSent, skipped: this.audioChunksSkipped });
      this.handlers.onStatus('Disconnected');
      this.playback.reset();
      this.socket = null;
    });

    socket.addEventListener('error', () => {
      debugLog('ws', 'error');
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
    this.messageChain = Promise.resolve();
    this.playCollectedPending = false;
    this.assistantSpeaking = false;
  }

  sendJson(payload: unknown): void {
    if (!this.isConnected || !this.socket) {
      debugLog('ws', 'send_skipped', { reason: 'not_connected', payload });
      return;
    }

    const type = typeof payload === 'object' && payload && 'type' in payload ? String((payload as { type: unknown }).type) : 'unknown';
    debugLog('ws', 'send', { type });
    this.socket.send(JSON.stringify(payload));
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    if (!this.isConnected || !this.socket) {
      this.audioChunksSkipped += 1;
      return;
    }

    if (this.isMicUploadBlocked) {
      this.audioChunksSkipped += 1;
      if (this.audioChunksSkipped === 1 || this.audioChunksSkipped % 100 === 0) {
        debugLog('mic', 'upload_blocked', {
          skipped: this.audioChunksSkipped,
          assistantSpeaking: this.assistantSpeaking,
          playbackPlaying: this.playback.isPlaying,
        });
      }
      return;
    }

    this.audioChunksSent += 1;
    if (this.audioChunksSent === 1 || this.audioChunksSent % 50 === 0) {
      debugLog('mic', 'chunk_sent', {
        bytes: chunk.byteLength,
        sent: this.audioChunksSent,
        skipped: this.audioChunksSkipped,
      });
    }

    this.socket.send(chunk);
  }

  private notifyMicUploadBlockedChange(): void {
    const blocked = this.isMicUploadBlocked;
    debugLog('mic', blocked ? 'upload_blocked_on' : 'upload_blocked_off', {
      assistantSpeaking: this.assistantSpeaking,
      playbackPlaying: this.playback.isPlaying,
    });
    this.handlers.onMicUploadBlockedChange?.(blocked);
  }

  private enqueueMessage(task: () => void | Promise<void>): Promise<void> {
    this.messageChain = this.messageChain
      .then(() => task())
      .catch((error) => {
        debugLog('ws', 'message_handler_error', {
          message: error instanceof Error ? error.message : String(error),
        });
      });
    return this.messageChain;
  }

  private async handleSocketMessage(event: MessageEvent): Promise<void> {
    if (typeof event.data === 'string') {
      const message = JSON.parse(event.data) as ServerMessage;
      debugLog('ws', 'recv', { type: message.type, ...(message.code ? { code: message.code } : {}) });
      this.handleJsonMessage(message);
      return;
    }

    if (event.data instanceof Blob) {
      const buffer = await event.data.arrayBuffer();
      debugLog('audio', 'recv_binary', { bytes: buffer.byteLength, pending: this.playback.hasPendingChunks });
      this.playback.append(buffer);
      this.maybePlayCollected();
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      debugLog('audio', 'recv_binary', { bytes: event.data.byteLength, pending: this.playback.hasPendingChunks });
      this.playback.append(event.data);
      this.maybePlayCollected();
    }
  }

  private maybePlayCollected(): void {
    if (!this.playCollectedPending || this.assistantSpeaking) {
      return;
    }

    this.playCollectedPending = false;
    debugLog('audio', 'play_collected_start', { chunks: this.playback.hasPendingChunks });
    void this.playback.playCollected();
  }

  sendTextTurn(text: string): void {
    this.sendJson({ type: 'user.text', text });
    this.sendJson({ type: 'user.turn.commit' });
  }

  updateSession(patch: Record<string, unknown>): void {
    this.sendJson({ type: 'session.update', patch });
  }

  private handleJsonMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'session.ready':
        this.handlers.onStatus(`Session ready (${message.sessionId ?? 'unknown'})`);
        if (this.sessionConfig) {
          this.handlers.onSessionReady(this.sessionConfig);
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
        this.handlers.onUsage(
          JSON.stringify(
            {
              stage: message.stage,
              model: message.model,
              usage: message.usageEvent,
            },
            null,
            2,
          ),
        );
        return;
      case 'assistant.speaking':
        debugLog('assistant', message.active ? 'speaking_start' : 'speaking_end');
        this.assistantSpeaking = Boolean(message.active);
        this.notifyMicUploadBlockedChange();
        if (!this.assistantSpeaking) {
          this.playCollectedPending = true;
          this.maybePlayCollected();
        } else {
          this.playCollectedPending = false;
        }
        return;
      case 'user.speaking':
        debugLog('user', message.active ? 'speaking_start' : 'speaking_end');
        return;
      case 'error':
        debugLog('ws', 'server_error', { code: message.code, message: message.message });
        this.handlers.onError(`${message.code ?? 'error'}: ${message.message ?? 'Unknown error'}`);
        return;
      case 'session.ended':
        this.handlers.onStatus('Session ended');
        return;
      default:
        return;
    }
  }
}
