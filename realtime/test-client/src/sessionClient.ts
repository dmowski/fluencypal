import { Mp3PlaybackQueue } from './audioPlayback.js';

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
  onTranscriptDelta: (messageId: string, role: 'user' | 'assistant', delta: string) => void;
  onTranscriptDone: (messageId: string, role: 'user' | 'assistant', text: string) => void;
  onUsage: (entry: string) => void;
  onError: (message: string) => void;
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

  constructor(private readonly handlers: SessionClientHandlers) {}

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(token: string, config: SessionStartConfig): void {
    this.disconnect();

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${protocol}://${window.location.host}/v1/session`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.addEventListener('open', () => {
      this.handlers.onStatus('Connected, starting session…');
      socket.send(
        JSON.stringify({
          type: 'session.start',
          token,
          config,
        }),
      );
    });

    socket.addEventListener('message', async (event) => {
      if (typeof event.data === 'string') {
        this.handleJsonMessage(JSON.parse(event.data) as ServerMessage);
        return;
      }

      if (event.data instanceof Blob) {
        const buffer = await event.data.arrayBuffer();
        this.playback.append(buffer);
        return;
      }

      if (event.data instanceof ArrayBuffer) {
        this.playback.append(event.data);
      }
    });

    socket.addEventListener('close', () => {
      this.handlers.onStatus('Disconnected');
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
  }

  sendJson(payload: unknown): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.send(JSON.stringify(payload));
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    if (!this.isConnected || !this.socket) {
      return;
    }

    this.socket.send(chunk);
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
        this.assistantSpeaking = Boolean(message.active);
        if (!this.assistantSpeaking) {
          void this.playback.playCollected();
        }
        return;
      case 'error':
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
