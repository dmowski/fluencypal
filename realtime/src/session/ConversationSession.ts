import { randomUUID } from 'node:crypto';
import type { AuthUserInfo } from '../auth/types.js';
import { defaultProviderRegistry } from '../providers/registry.js';
import type { ProviderRegistry } from '../providers/types.js';
import { parseBinaryFrame } from '../protocol/audioCodec.js';
import type {
  ClientMessage,
  ServerMessage,
  SessionStartConfig,
  SessionUpdatePatch,
} from '../protocol/messages.js';
import { ConversationHistory } from './history.js';
import { TurnPipeline } from './TurnPipeline.js';

export type SessionRuntimeConfig = SessionStartConfig & {
  correctionInstruction: string;
};

export type SendServerMessage = (message: ServerMessage) => void;
export type SendBinary = (chunk: Buffer) => void;

export class ConversationSession {
  readonly sessionId: string;
  readonly user: AuthUserInfo;
  readonly history = new ConversationHistory();
  readonly createdAt = Date.now();

  private config: SessionRuntimeConfig;
  private readonly send: SendServerMessage;
  private readonly sendBinary: SendBinary;
  private readonly pipeline: TurnPipeline;
  private readonly abortController = new AbortController();
  private disposed = false;
  private pendingUserAudio: Buffer[] = [];
  private pendingUserText = '';

  constructor({
    sessionId,
    user,
    config,
    send,
    sendBinary = () => {},
    providers = defaultProviderRegistry,
  }: {
    sessionId: string;
    user: AuthUserInfo;
    config: SessionStartConfig;
    send: SendServerMessage;
    sendBinary?: SendBinary;
    providers?: ProviderRegistry;
  }) {
    this.sessionId = sessionId;
    this.user = user;
    this.config = {
      ...config,
      correctionInstruction: '',
    };
    this.send = send;
    this.sendBinary = sendBinary;
    this.pipeline = new TurnPipeline(
      providers,
      { send, sendBinary },
      () => this.config,
      this.history,
      this.abortController.signal,
    );
  }

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  get isDisposed(): boolean {
    return this.disposed;
  }

  get runtimeConfig(): Readonly<SessionRuntimeConfig> {
    return this.config;
  }

  async handleClientMessage(message: ClientMessage): Promise<void> {
    this.assertActive();

    switch (message.type) {
      case 'session.start':
        throw new Error('session.start is handled by the connection layer');
      case 'session.ping':
        this.send({ type: 'session.pong' });
        return;
      case 'session.end':
        this.dispose('client_end');
        this.send({ type: 'session.ended' });
        return;
      case 'session.update':
        this.applyConfigPatch(message.patch);
        if (message.patch.voiceEnabled === false) {
          this.pipeline.abortInFlight();
        }
        return;
      case 'assistant.instruction':
        this.applyInstruction(message.text, message.mode);
        return;
      case 'user.text':
        this.pendingUserText = message.text;
        return;
      case 'user.turn.commit':
        await this.commitUserTurn(message.messageId);
        return;
      case 'user.turn.cancel':
        this.cancelUserTurn();
        return;
      case 'assistant.trigger':
        await this.pipeline.generateAssistantResponse();
        return;
      case 'vision.frame':
        return;
      default: {
        const _exhaustive: never = message;
        return _exhaustive;
      }
    }
  }

  handleBinaryAudio(chunk: Buffer): void {
    this.assertActive();

    if (this.config.micMuted) {
      return;
    }

    const frame = parseBinaryFrame(chunk);
    this.pendingUserAudio.push(frame.payload);
  }

  dispose(_reason?: string): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;
    this.pipeline.abortInFlight();
    this.pendingUserAudio = [];
    this.pendingUserText = '';
    this.abortController.abort();
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Session is closed');
    }
  }

  private applyConfigPatch(patch: SessionUpdatePatch): void {
    this.config = {
      ...this.config,
      ...patch,
    };
  }

  private applyInstruction(text: string, mode: 'replace' | 'append'): void {
    if (mode === 'replace') {
      this.config.correctionInstruction = text;
      return;
    }

    this.config.correctionInstruction = [this.config.correctionInstruction, text]
      .filter(Boolean)
      .join('\n');
  }

  private async commitUserTurn(messageId?: string): Promise<void> {
    const id = messageId ?? randomUUID();
    const audioChunks = this.pendingUserAudio;
    this.pendingUserAudio = [];

    let text = this.pendingUserText;
    this.pendingUserText = '';

    if (!text && audioChunks.length > 0) {
      text = await this.pipeline.transcribeAudio(audioChunks);
    }

    if (!text) {
      return;
    }

    this.history.append({
      id,
      role: 'user',
      text,
      createdAt: Date.now(),
    });

    this.send({
      type: 'transcript.done',
      messageId: id,
      role: 'user',
      text,
    });

    await this.pipeline.generateAssistantResponse();
  }

  private cancelUserTurn(): void {
    this.pipeline.abortInFlight();
    this.pendingUserAudio = [];
    this.pendingUserText = '';
  }
}
